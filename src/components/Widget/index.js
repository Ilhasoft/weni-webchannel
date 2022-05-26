import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Sound from 'react-sound';
import {
  toggleFullScreen,
  toggleChat,
  openChat,
  closeChat,
  showChat,
  addUserMessage,
  addUserAudio,
  addUserDocument,
  addUserImage,
  addUserVideo,
  emitUserMessage,
  addResponseMessage,
  addVideoSnippet,
  addAudioSnippet,
  addImageSnippet,
  addDocumentSnippet,
  addQuickReply,
  initialize,
  connectServer,
  pullSession,
  newUnreadMessage,
  triggerMessageDelayed,
  triggerTooltipSent,
  showTooltip,
  emitMessageIfFirst,
  clearMetadata,
  setUserInput,
  setLinkTarget,
  setPageChangeCallbacks,
  changeOldUrl,
  setDomHighlight,
  evalUrl,
  saveSessionToken,
  openSessionMessage,
  closeSessionMessage,
  setInitPayload,
  sendInitialPayload
} from 'actions';

import { SESSION_NAME, NEXT_MESSAGE } from 'constants';

import { store } from '../../index';
import WidgetLayout from './layout';
import { storeLocalSession, getLocalSession } from '../../store/reducers/helper';

import { buildQuickReplies, toBase64, getAttachmentType } from '../../utils/messages';

const MAX_PING_LIMIT = 216;
let currentInitialization = null;

class Widget extends Component {
  constructor(props) {
    super(props);
    this.messages = [];
    this.onGoingMessageDelay = false;
    this.sendMessage = this.sendMessage.bind(this);
    this.intervalId = null;
    this.eventListenerCleaner = () => {};
    this.pingLimit = MAX_PING_LIMIT;
    this.pingIntervalId = null;
    this.connected = false;
    this.attemptingReconnection = false;
    this.inactivityTimerId = null;
    this.inactivityTimerInterval = 120000; // 2 minutes in ms
    this.checkedHistory = false;
    this.reconnectWithDelay = false;
  }

  state = {
    playNotification: Sound.status.STOPPED
  };

  componentWillMount() {
    this.unsubscribe = store.subscribe(this.handleStoreChange);
  }

  componentDidMount() {
    const {
      connectOn,
      autoClearCache,
      storage,
      dispatch,
      defaultHighlightAnimation,
      startFullScreen,
      initPayload
    } = this.props;

    const styleNode = document.createElement('style');
    styleNode.innerHTML = defaultHighlightAnimation;
    document.body.appendChild(styleNode);

    if (startFullScreen) {
      this.toggleFullScreen();
    }

    this.intervalId = setInterval(() => dispatch(evalUrl(window.location.href)), 500);
    if (connectOn === 'mount') {
      this.initializeWidget();

      dispatch(setInitPayload(initPayload));
      return;
    }

    const localSession = getLocalSession(storage, SESSION_NAME);
    const lastUpdate = localSession ? localSession.lastUpdate : 0;

    if (autoClearCache) {
      if (Date.now() - lastUpdate < 30 * 60 * 1000) {
        this.initializeWidget();
      } else {
        localStorage.removeItem(SESSION_NAME);
      }
    } else {
      dispatch(pullSession());
      if (lastUpdate) this.initializeWidget();
    }

    dispatch(setInitPayload(initPayload));
  }

  componentDidUpdate() {
    const { dispatch, embedded, initialized } = this.props;

    if (embedded && initialized) {
      dispatch(showChat());
      dispatch(openChat());
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;

    this.unsubscribe();

    if (socket) {
      socket.close();
    }
    clearTimeout(this.tooltipTimeout);
    clearInterval(this.intervalId);
  }

  getSessionId() {
    const { storage } = this.props;
    // Get the local session, check if there is an existing session_id
    const localSession = getLocalSession(storage, SESSION_NAME);
    const localId = localSession ? localSession.session_id : null;
    return localId;
  }

  // eslint-disable-next-line react/sort-comp
  sendMessage(payload, text = '', when = 'always') {
    const { dispatch, initialized } = this.props;
    if (!initialized) {
      this.initializeWidget(false);
      dispatch(initialize());
    }
    if (when === 'always') {
      dispatch(emitUserMessage(payload));
      if (text !== '') dispatch(addUserMessage(text));
    } else if (when === 'init') {
      dispatch(emitMessageIfFirst(payload, text));
    }
    dispatch(setUserInput(''));
  }

  handleMessageReceived(message) {
    const { dispatch, initPayload } = this.props;

    // if greater than 15 minutes in sec
    if (!this.checkedHistory && new Date().getTime() / 1000 - message.timestamp > 900) {
      this.inactivityTimerId = setTimeout(() => {
        const textMessage = {
          type: 'message',
          message: {
            type: 'text',
            text: initPayload
          }
        };

        this.props.dispatch(emitUserMessage(textMessage));
      }, this.inactivityTimerInterval);
    }
    this.checkedHistory = true;

    if (!this.onGoingMessageDelay) {
      this.onGoingMessageDelay = true;
      dispatch(triggerMessageDelayed(true));
      this.newMessageTimeout(message);
    } else {
      this.messages.push(message);
    }
  }

  popLastMessage() {
    const { dispatch } = this.props;
    if (this.messages.length) {
      this.onGoingMessageDelay = true;
      dispatch(triggerMessageDelayed(true));
      this.newMessageTimeout(this.messages.shift());
    }
  }

  newMessageTimeout(message) {
    const { dispatch, isChatOpen, customMessageDelay, disableTooltips } = this.props;
    setTimeout(() => {
      this.dispatchMessage(message);
      if (!isChatOpen) {
        dispatch(newUnreadMessage());
        if (!disableTooltips) dispatch(showTooltip(true));
      }
      dispatch(triggerMessageDelayed(false));
      this.onGoingMessageDelay = false;
      this.popLastMessage();
    }, customMessageDelay(message.text || ''));
  }

  propagateMetadata(metadata) {
    const { dispatch } = this.props;
    const {
      linkTarget,
      userInput,
      pageChangeCallbacks,
      domHighlight,
      forceOpen,
      forceClose,
      pageEventCallbacks
    } = metadata;
    if (linkTarget) {
      dispatch(setLinkTarget(linkTarget));
    }
    if (userInput) {
      dispatch(setUserInput(userInput));
    }
    if (pageChangeCallbacks) {
      dispatch(changeOldUrl(window.location.href));
      dispatch(setPageChangeCallbacks(pageChangeCallbacks));
    }
    if (domHighlight) {
      dispatch(setDomHighlight(domHighlight));
    }
    if (forceOpen) {
      dispatch(openChat());
    }
    if (forceClose) {
      dispatch(closeChat());
    }
    if (pageEventCallbacks) {
      this.eventListenerCleaner = this.addCustomsEventListeners(pageEventCallbacks.pageEvents);
    }
  }

  handleBotUtterance(botUtterance) {
    const { dispatch } = this.props;
    this.clearCustomStyle();
    this.eventListenerCleaner();
    dispatch(clearMetadata());
    const receivedMessage = JSON.parse(botUtterance.data);

    if (receivedMessage.type !== 'pong') {
      this.pingLimit = MAX_PING_LIMIT;
    }

    if (receivedMessage.type === 'message' || receivedMessage.type === 'ack') {
      this.props.dispatch(closeSessionMessage());
    }

    if (receivedMessage.type === 'token') {
      this.props.dispatch(saveSessionToken(receivedMessage.token));
      return;
    }

    if (receivedMessage.type === 'message') {
      const newMessage = {
        ...receivedMessage.message,
        quick_replies: buildQuickReplies(receivedMessage.message.quick_replies)
      };
      this.handleMessageReceived(newMessage);
    } else if (receivedMessage.type === 'ack') {
      this.dispatchAckAttachment(receivedMessage.message);
    } else if (receivedMessage.type === 'error') {
      if (receivedMessage.error === 'unable to register: client from already exists') {
        this.props.dispatch(openSessionMessage());
      }
    } else if (receivedMessage.type === 'warning') {
      if (receivedMessage.warning === 'Connection closed by request') {
        this.reconnectWithDelay = true;
        // eslint-disable-next-line react/prop-types
        this.props.socket.close();
      }
    }
  }

  dispatchAckAttachment(message) {
    const attachment = {
      name: message.caption || '',
      url: message.media_url
    };
    if (message.type === 'video') {
      this.props.dispatch(addUserVideo(attachment));
    } else if (message.type === 'audio') {
      this.props.dispatch(addUserAudio(attachment));
    } else if (message.type === 'image') {
      this.props.dispatch(addUserImage(attachment));
    } else if (message.type === 'file') {
      this.props.dispatch(addUserDocument(attachment));
    }
  }

  addCustomsEventListeners(pageEventCallbacks) {
    const eventsListeners = [];

    pageEventCallbacks.forEach((pageEvent) => {
      const { event, payload, selector } = pageEvent;
      const sendPayload = () => {
        this.sendMessage(payload);
      };

      if (event && payload && selector) {
        const elemList = document.querySelectorAll(selector);
        if (elemList.length > 0) {
          elemList.forEach((elem) => {
            eventsListeners.push({ elem, event, sendPayload });
            elem.addEventListener(event, sendPayload);
          });
        }
      }
    });

    const cleaner = () => {
      eventsListeners.forEach((eventsListener) => {
        eventsListener.elem.removeEventListener(eventsListener.event, eventsListener.sendPayload);
      });
    };

    return cleaner;
  }

  clearCustomStyle() {
    const { domHighlight, defaultHighlightClassname } = this.props;
    const domHighlightJS = domHighlight.toJS() || {};
    if (domHighlightJS.selector) {
      const elements = document.querySelectorAll(domHighlightJS.selector);
      elements.forEach((element) => {
        switch (domHighlightJS.style) {
          case 'custom':
            element.setAttribute('style', '');
            break;
          case 'class':
            element.classList.remove(domHighlightJS.css);
            break;
          default:
            if (defaultHighlightClassname !== '') {
              element.classList.remove(defaultHighlightClassname);
            } else {
              element.setAttribute('style', '');
            }
        }
      });
    }
  }

  applyCustomStyle() {
    const { domHighlight, defaultHighlightCss, defaultHighlightClassname } = this.props;
    const domHighlightJS = domHighlight.toJS() || {};
    if (domHighlightJS.selector) {
      const elements = document.querySelectorAll(domHighlightJS.selector);
      elements.forEach((element) => {
        switch (domHighlightJS.style) {
          case 'custom':
            element.setAttribute('style', domHighlightJS.css);
            break;
          case 'class':
            element.classList.add(domHighlightJS.css);
            break;
          default:
            if (defaultHighlightClassname !== '') {
              element.classList.add(defaultHighlightClassname);
            } else {
              element.setAttribute('style', defaultHighlightCss);
            }
        }
      });
    }
  }

  pingSocket() {
    this.pingLimit -= 1;
    if (this.pingLimit < 0) {
      return;
    }
    const payload = {
      type: 'ping',
      message: {}
    };
    this.props.dispatch(emitUserMessage(payload));
  }

  getUniqueFrom() {
    const { clientId, sessionId } = this.props;

    let localId = this.getSessionId();

    if (sessionId) {
      localId = sessionId;
    }

    let validClientId;
    if (clientId === null || clientId.trim() === '') {
      validClientId = window.location.hostname;
    } else {
      validClientId = clientId;
    }

    return localId || `${Math.floor(Math.random() * Date.now())}@${validClientId}`;
  }

  handleStoreChange = () => {
    const previousInitialization = currentInitialization;
    const currentBehaviorStore = Object.fromEntries(store.getState().behavior);
    currentInitialization = currentBehaviorStore.initialized;

    if (
      currentInitialization &&
      previousInitialization !== currentInitialization
    ) {
      // eslint-disable-next-line react/prop-types
      this.props.socket.close();
    }
  }

  initializeWidget(sendInitPayload = true) {
    const {
      socket,
      dispatch,
      embedded,
      initialized,
      clientId,
      sessionId,
      host,
      channelUuid
    } = this.props;

    if (!socket.isInitialized() || this.attemptingReconnection) {
      socket.createSocket();

      dispatch(pullSession());

      // Request a session from server
      let localId = this.getSessionId();

      if (sessionId) {
        localId = sessionId;
      }

      let validClientId;
      if (clientId === null || clientId.trim() === '') {
        validClientId = window.location.hostname;
      } else {
        validClientId = clientId;
      }

      const uniqueFrom = localId || `${Math.floor(Math.random() * Date.now())}@${validClientId}`;

      const options = {
        type: 'register',
        from: localId || uniqueFrom,
        callback: `${host}/c/wwc/${channelUuid}/receive`
      };

      const that = this;
      // eslint-disable-next-line func-names
      socket.socket.onopen = function () {
        if (!that.connected || that.attemptingReconnection) {
          that.startConnection(
            this,
            !that.attemptingReconnection && sendInitPayload,
            options,
            localId,
            uniqueFrom
          );
          that.pingIntervalId = setInterval(() => {
            that.pingSocket();
          }, 50000);
          that.connected = true;
          that.attemptingReconnection = false;
          this.reconnectWithDelay = false;
          that.props.dispatch(closeSessionMessage());
        }
      };

      socket.socket.onmessage = (msg) => {
        this.handleBotUtterance(msg);
      };

      socket.socket.onclose = (event) => {
        // eslint-disable-next-line no-console
        console.log('SOCKET_ONCLOSE: Socket closed connection:', event);
        let delayInterval = 0;
        if (this.reconnectWithDelay) {
          delayInterval = 1000;
        }
        setTimeout(() => {
          this.attemptingReconnection = true;
          this.reconnectWithDelay = false;
          clearInterval(this.pingIntervalId);
          this.props.dispatch(closeSessionMessage());
          this.initializeWidget(sendInitPayload);
        }, delayInterval);
      };

      socket.socket.onerror = (err) => {
        // eslint-disable-next-line no-console
        console.log('SOCKET_ONERROR: Socket error:', err);
      };
    }

    if (embedded && initialized) {
      dispatch(sendInitialPayload());
      dispatch(showChat());
      dispatch(openChat());
    }
  }

  startConnection(websocket, sendInitPayload, options, localId, remoteId) {
    const { storage, dispatch, connectOn, tooltipMessage, tooltipDelay } = this.props;

    dispatch(connectServer());
    /*
    Check if the session_id is consistent with the server
    If the localId is null or different from the remote_id,
    start a new session.
    */
    if (localId !== remoteId) {
      // storage.clear();
      // Store the received session_id to storage

      storeLocalSession(storage, SESSION_NAME, remoteId);
      dispatch(pullSession());
      if (sendInitPayload) {
        websocket.send(JSON.stringify(options));
        dispatch(initialize());
      }
    } else {
      if (!sendInitPayload) {
        delete options.trigger;
      }
      websocket.send(JSON.stringify(options));
      dispatch(initialize());
      // If this is an existing session, it's possible we changed pages and want to send a
      // user message when we land.
      const nextMessage = window.localStorage.getItem(NEXT_MESSAGE);

      if (nextMessage !== null) {
        const { message, expiry } = JSON.parse(nextMessage);
        window.localStorage.removeItem(NEXT_MESSAGE);

        if (expiry === 0 || expiry > Date.now()) {
          dispatch(addUserMessage(message));
          dispatch(emitUserMessage(message));
        }
      }
    }
    if (connectOn === 'mount' && tooltipMessage) {
      this.tooltipTimeout = setTimeout(() => {
        this.displayTooltipMessage();
      }, parseInt(tooltipDelay, 10));
    }
  }

  displayTooltipMessage() {
    const {
      tooltipMessage,
      connected,
      isChatOpen,
      dispatch,
      tooltipSent,
      disableTooltips
    } = this.props;
    if (connected && !isChatOpen && !tooltipSent.get(tooltipMessage)) {
      const sessionId = this.getSessionId();

      if (!sessionId || disableTooltips) return;

      this.dispatchMessage({ type: 'text', text: tooltipMessage });
      if (!isChatOpen) {
        dispatch(newUnreadMessage());
        dispatch(showTooltip(true));
      }
      dispatch(triggerMessageDelayed(false));
      this.popLastMessage();

      dispatch(triggerTooltipSent(tooltipMessage));
    }
  }

  toggleConversation() {
    this.props.dispatch(showTooltip(false));
    clearTimeout(this.tooltipTimeout);
    this.props.dispatch(toggleChat());
  }

  toggleFullScreen() {
    this.props.dispatch(toggleFullScreen());
  }

  dispatchMessage(message) {
    // TODO: add location type
    let shouldPlay = true;
    if (message.type === 'text') {
      this.props.dispatch(addResponseMessage(message.text));
    } else if (message.type === 'video') {
      this.props.dispatch(
        addVideoSnippet({
          title: message.caption || '',
          video: message.media_url
        })
      );
    } else if (message.type === 'audio') {
      this.props.dispatch(
        addAudioSnippet({
          title: message.caption || '',
          audio: message.media_url
        })
      );
    } else if (message.type === 'image') {
      this.props.dispatch(
        addImageSnippet({
          title: message.caption || '',
          image: message.media_url
        })
      );
    } else if (message.type === 'file') {
      this.props.dispatch(
        addDocumentSnippet({
          title: message.caption || '',
          src: message.media_url
        })
      );
    } else {
      shouldPlay = false;
    }

    if (document.visibilityState === 'visible' && this.props.isChatOpen) {
      shouldPlay = false;
    }

    if (this.props.disableSoundNotification === true) {
      shouldPlay = false;
    }

    if (shouldPlay) {
      this.setState({ playNotification: Sound.status.PLAYING });
      setTimeout(() => {
        this.setState({ playNotification: Sound.status.STOPPED });
      }, 2000);
    }

    if (message.quick_replies) {
      this.props.dispatch(addQuickReply(message));
    }
  }

  handleMessageSubmit(event) {
    if (this.inactivityTimerId) {
      clearTimeout(this.inactivityTimerId);
      this.inactivityTimerId = null;
    }

    this.pingLimit = MAX_PING_LIMIT;
    if (event.type === 'submit') {
      event.preventDefault();
      const userMessage = event.target.message.value;
      if (userMessage) {
        const textMessage = {
          type: 'message',
          message: {
            type: 'text',
            text: userMessage
          }
        };

        this.props.dispatch(addUserMessage(textMessage.message.text));
        this.props.dispatch(emitUserMessage(textMessage));
      }
      event.target.message.value = '';
      this.props.dispatch(setUserInput(''));
    } else if (event.type === 'attachment') {
      Array.from(event.files).forEach((file) => {
        const fileType = getAttachmentType(file.name);
        if (fileType) {
          Promise.resolve(toBase64(file)).then((media) => {
            const attachmentMessage = {
              type: 'message',
              message: {
                type: fileType,
                media
              }
            };
            this.props.dispatch(emitUserMessage(attachmentMessage));
          });
        }
      });
    }
  }

  closeAndDisconnect() {
    const { dispatch, socket } = this.props;

    dispatch(closeChat());
    socket.socket.close();
  }

  forceChatConnection() {
    const { sessionToken, socket } = this.props;
    const websocket = socket.socket;

    const options = {
      type: 'close_session',
      from: this.getUniqueFrom(),
      token: sessionToken
    };

    websocket.send(JSON.stringify(options));

    setTimeout(websocket.close(), 1000);
  }

  render() {
    return (
      <div>
        <WidgetLayout
          toggleChat={() => this.toggleConversation()}
          toggleFullScreen={() => this.toggleFullScreen()}
          onSendMessage={event => this.handleMessageSubmit(event)}
          closeAndDisconnect={() => this.closeAndDisconnect()}
          forceChatConnection={() => this.forceChatConnection()}
          title={this.props.title}
          subtitle={this.props.subtitle}
          customData={this.props.customData}
          profileAvatar={this.props.profileAvatar}
          showCloseButton={this.props.showCloseButton}
          showFullScreenButton={this.props.showFullScreenButton}
          hideWhenNotConnected={this.props.hideWhenNotConnected}
          fullScreenMode={this.props.fullScreenMode}
          isChatOpen={this.props.isChatOpen}
          isChatVisible={this.props.isChatVisible}
          badge={this.props.badge}
          embedded={this.props.embedded}
          params={this.props.params}
          openLauncherImage={this.props.openLauncherImage}
          closeImage={this.props.closeImage}
          customComponent={this.props.customComponent}
          displayUnreadCount={this.props.displayUnreadCount}
          showMessageDate={this.props.showMessageDate}
          tooltipMessage={this.props.tooltipMessage}
          customizeWidget={this.props.customizeWidget}
          inputTextFieldHint={this.props.inputTextFieldHint}
          showHeaderAvatar={this.props.showHeaderAvatar}
          headerImage={this.props.headerImage}
          suggestionsConfig={this.props.suggestionsConfig}
          customAutoComplete={this.props.customAutoComplete}
          showTooltip={this.props.showTooltip}
          openSessionMessageFields={this.props.openSessionMessageFields}
        />
        <Sound url={this.props.customSoundNotification} playStatus={this.state.playNotification} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  initialized: state.behavior.get('initialized'),
  connected: state.behavior.get('connected'),
  isChatOpen: state.behavior.get('isChatOpen'),
  isChatVisible: state.behavior.get('isChatVisible'),
  fullScreenMode: state.behavior.get('fullScreenMode'),
  tooltipSent: state.metadata.get('tooltipSent'),
  oldUrl: state.behavior.get('oldUrl'),
  pageChangeCallbacks: state.behavior.get('pageChangeCallbacks'),
  domHighlight: state.metadata.get('domHighlight'),
  sessionToken: state.behavior.get('token'),
  initPayloadSent: state.behavior.get('initPayloadSent')
});

Widget.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  customData: PropTypes.shape({}),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  initPayload: PropTypes.string,
  profileAvatar: PropTypes.string,
  showCloseButton: PropTypes.bool,
  showFullScreenButton: PropTypes.bool,
  hideWhenNotConnected: PropTypes.bool,
  connectOn: PropTypes.oneOf(['mount', 'open']),
  autoClearCache: PropTypes.bool,
  fullScreenMode: PropTypes.bool,
  isChatVisible: PropTypes.bool,
  isChatOpen: PropTypes.bool,
  badge: PropTypes.number,
  socket: PropTypes.shape({}),
  embedded: PropTypes.bool,
  params: PropTypes.shape({}),
  connected: PropTypes.bool,
  initialized: PropTypes.bool,
  openLauncherImage: PropTypes.string,
  closeImage: PropTypes.string,
  customComponent: PropTypes.func,
  displayUnreadCount: PropTypes.bool,
  showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  customMessageDelay: PropTypes.func.isRequired,
  customAutoComplete: PropTypes.func,
  tooltipMessage: PropTypes.string,
  tooltipSent: PropTypes.shape({}),
  tooltipDelay: PropTypes.number.isRequired,
  domHighlight: PropTypes.shape({}),
  storage: PropTypes.shape({}),
  disableTooltips: PropTypes.bool,
  defaultHighlightAnimation: PropTypes.string,
  defaultHighlightCss: PropTypes.string,
  defaultHighlightClassname: PropTypes.string,
  inputTextFieldHint: PropTypes.string,
  customizeWidget: PropTypes.shape({}),
  showHeaderAvatar: PropTypes.bool,
  sessionId: PropTypes.string,
  headerImage: PropTypes.string,
  startFullScreen: PropTypes.bool,
  suggestionsConfig: PropTypes.shape({}),
  host: PropTypes.string,
  channelUuid: PropTypes.string,
  showTooltip: PropTypes.bool,
  disableSoundNotification: PropTypes.bool,
  customSoundNotification: PropTypes.string,
  clientId: PropTypes.string,
  openSessionMessageFields: PropTypes.shape({}),
  sessionToken: PropTypes.string
};

Widget.defaultProps = {
  isChatOpen: false,
  isChatVisible: true,
  fullScreenMode: false,
  connectOn: 'mount',
  autoClearCache: false,
  displayUnreadCount: false,
  tooltipMessage: null,
  oldUrl: '',
  disableTooltips: false,
  defaultHighlightClassname: '',
  defaultHighlightCss:
    'push-animation: 0.5s linear infinite alternate default-botfront-blinker-animation;',
  defaultHighlightAnimation: `@keyframes default-botfront-blinker-animation {
    from {
      outline-color: green;
      outline-style: none;
    }
    to {
      outline-style: solid;
      outline-color: green;
    }
  }`,
  customizeWidget: {},
  showHeaderAvatar: true,
  sessionId: null,
  startFullScreen: false,
  showTooltip: false
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(Widget);
