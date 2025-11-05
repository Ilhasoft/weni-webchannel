import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Sound from 'react-sound';
import {
  toggleFullScreen,
  toggleChat,
  openChat,
  disconnectServer,
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
  openSessionMessage,
  closeSessionMessage,
  setInitPayload,
  sendInitialPayload,
  getHistory,
  setMessagesScroll,
  insertUserMessage,
  insertUserImage,
  insertUserAudio,
  insertUserVideo,
  insertUserDocument,
  insertResponseMessage,
  insertResponseImage,
  insertResponseAudio,
  insertResponseVideo,
  insertResponseDocument,
  deleteMessage,
  startTyping,
  stopTyping,
  startThinking,
  stopThinking,
  scheduleContactTimeout,
  clearScheduledContactTimeout
} from 'actions';

import { SESSION_NAME, NEXT_MESSAGE } from 'constants';

import { store } from '../../index';
import WidgetLayout from './layout';
import { storeLocalSession, getLocalSession } from '../../store/reducers/helper';

import { connectionOptimization } from '../../utils/connectionOptimization';
import { buildQuickReplies, toBase64, getAttachmentType } from '../../utils/messages';
import { socketOnClose } from './socketEvents';

const MAX_PING_LIMIT = 216;
let currentInitialization = null;

let socketOnCloseListener = null;
let afterOnOpen = null;

class Widget extends Component {
  constructor(props) {
    super(props);
    this.messages = [];
    this.onGoingMessageDelay = false;
    this.skipNextMessageDelay = false;
    this.isShowingThinking = false;
    this.sendMessage = this.sendMessage.bind(this);
    this.intervalId = null;
    this.contactTimeoutIntervalId = null;
    this.eventListenerCleaner = () => {};
    this.pingLimit = MAX_PING_LIMIT;
    this.pingIntervalId = null;
    this.connected = false;
    this.attemptingReconnection = false;
    this.inactivityTimerId = null;
    this.inactivityTimerInterval = 120000; // 2 minutes in ms
    this.checkedHistory = false;
    this.reconnectWithDelay = false;
    this.canReconnect = true;
    this.historyLimit = 20;
    this.historyPage = 1;
    this.typingTimeoutId = null;
    this.hasUserOpenedChat = false;
    this.reconnectImmediate = false;
    this.clientMessageMap = {
      text: insertUserMessage,
      image: insertUserImage,
      video: insertUserVideo,
      audio: insertUserAudio,
      file: insertUserDocument
    };
    this.clientNewMessage = {
      text: addUserMessage,
      image: addUserImage,
      video: addUserVideo,
      audio: addUserAudio,
      file: addUserDocument
    };
    this.responseMessageMap = {
      text: insertResponseMessage,
      image: insertResponseImage,
      audio: insertResponseAudio,
      video: insertResponseVideo,
      file: insertResponseDocument
    };
    this.directionMap = {
      response: this.responseMessageMap,
      client: this.clientMessageMap
    };
    this.isReadyToSendMessage = false;
    this.messagesWaitingToBeSent = [];
  }

  state = {
    playNotification: Sound.status.STOPPED,
    attemptReconnection: 0,
    isConnected: false
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
      initPayload,
      params
    } = this.props;

    dispatch(pullSession(params.storage));

    this.startContactTimeoutCheck();

    const styleNode = document.createElement('style');
    styleNode.innerHTML = defaultHighlightAnimation;
    document.body.appendChild(styleNode);

    if (startFullScreen) {
      this.toggleFullScreen();
      dispatch(showChat());
      dispatch(openChat());
      this.hasUserOpenedChat = true;
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
      dispatch(pullSession(params.storage));
      if (lastUpdate) this.initializeWidget();
    }

    dispatch(setInitPayload(initPayload));
  }

  componentDidUpdate() {
    const { dispatch, embedded, initialized } = this.props;

    if (embedded && initialized) {
      dispatch(showChat());
      dispatch(openChat());
      this.hasUserOpenedChat = true;
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;

    this.unsubscribe();

    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = null;
    }

    if (socket) {
      socket.close();
    }
    clearTimeout(this.tooltipTimeout);
    clearTimeout(this.typingTimeoutId);
    clearInterval(this.intervalId);
    clearInterval(this.contactTimeoutIntervalId);
    clearInterval(this.pingIntervalId);
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

  forceNewChatSession() {
    const { socket } = this.props;
    this.forceNewSession = true;
    socket.socket.close();
  }

  timeoutContactIfAllowed() {
    if (this.waitingForTimeoutConfirmation) return;

    // send a verifyContactTimeout message to server to check if the contact can be timed out
    const { socket } = this.props;
    this.waitingForTimeoutConfirmation = true;
    socket.socket.send(JSON.stringify({ type: 'verify_contact_timeout' }));
  }

  startContactTimeoutCheck() {
    this.contactTimeoutIntervalId = setInterval(() => {
      const scheduledContactTimeout = store.getState().behavior.get('scheduledContactTimeout');
      if (scheduledContactTimeout) {
        if (Date.now() > scheduledContactTimeout) {
          this.timeoutContactIfAllowed();
        }
      }
    }, 1000);
  }

  scheduleContactTimeout() {
    const { dispatch, contactTimeout } = this.props;
    if (contactTimeout) {
      dispatch(scheduleContactTimeout(contactTimeout));
    }
  }

  finishTyping() {
    this.props.dispatch(stopTyping());
  }

  handleMessageReceived(message) {
    const { dispatch, initPayload } = this.props;

    if (this.typingTimeoutId) {
      clearTimeout(this.typingTimeoutId);
      this.typingTimeoutId = null;
    }

    this.finishTyping();

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
    const { dispatch, isChatOpen, customMessageDelay, disableTooltips, disableMessageTooltips } = this.props;
    const fromCustomMessageDelay = customMessageDelay(message.text || '');
    let delay = this.skipNextMessageDelay ? 0 : fromCustomMessageDelay;
    this.skipNextMessageDelay = false;

    if (this.isShowingThinking) {
      dispatch(startTyping());

      delay = 1000 + Math.random() * 1000; // 1 to 2 seconds
    }

    this.isShowingThinking = false;
    dispatch(stopThinking());

    setTimeout(() => {
      this.dispatchMessage(message);
      if (!isChatOpen) {
        dispatch(newUnreadMessage());
        const shouldShowTooltip = !this.hasUserOpenedChat || !disableMessageTooltips;

        if (!disableTooltips && shouldShowTooltip) {
          dispatch(showTooltip(true));
        }
      }
      dispatch(triggerMessageDelayed(false));
      this.onGoingMessageDelay = false;
      this.popLastMessage();
    }, delay);
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

    if (receivedMessage.type === 'ready_for_message') {
      this.isReadyToSendMessage = true;

      this.messagesWaitingToBeSent.forEach((sendMessage) => {
        sendMessage();
      });

      this.messagesWaitingToBeSent = [];
    }

    if (receivedMessage.type === 'history') {
      dispatch(setMessagesScroll(false));
      if (receivedMessage.history) {
        this.buildHistory(receivedMessage.history);
      }
    }

    if (receivedMessage.type === 'message') {
      dispatch(setMessagesScroll(true));
      const newMessage = {
        ...receivedMessage.message,
        quick_replies: buildQuickReplies(receivedMessage.message.quick_replies)
      };

      this.handleMessageReceived(newMessage);
      this.emitSocketEvent('incomingMessage', newMessage);
    } else if (receivedMessage.type === 'typing_start') {
      if (this.typingTimeoutId) {
        clearTimeout(this.typingTimeoutId);
      }
      this.skipNextMessageDelay = true;

      const channelUuidsToSkipThinking = [
        '3672b72a-146b-4b69-9294-49e024397fdc',
        'eeab299f-be17-40da-a07c-9eb861f7c669',
        '52fd7490-175f-4a22-ab11-7d8ef2730888',
        'aa072a23-bc5f-4c64-b24b-2e1b1b55ec12', // arsonyb2c 01
        'fdbe25ab-e734-4c22-b14a-ece4fbaac6f4', // puppis
        '886f7c15-c4e8-4198-a3c0-014b68937cd6' // puppis - reviewed
      ];

      const shouldSkipThinking = channelUuidsToSkipThinking.includes(this.props.channelUuid);

      if (receivedMessage.from === 'ai-assistant' && !shouldSkipThinking) {
        this.isShowingThinking = true;
        dispatch(startThinking());
      } else {
        dispatch(startTyping());

        const delayInSeconds = 50;
        const delay = delayInSeconds * 1000;

        // set a timeout to automatically stop typing after the delay
        this.typingTimeoutId = setTimeout(() => {
          this.finishTyping();
          this.typingTimeoutId = null;
        }, delay);
      }
    } else if (receivedMessage.type === 'ack') {
      dispatch(setMessagesScroll(true));
      this.dispatchAckAttachment(receivedMessage.message);
    } else if (receivedMessage.type === 'error') {
      if (receivedMessage.error === 'unable to register: client from already exists') {
        console.log('%cSOCKET RECEIVED ERROR - already exists', 'color: #F71963; font-weight: bold;', new Date());

        this.props.socket.socket.removeEventListener('close', socketOnCloseListener);
        this.forceChatConnection();
      }
    } else if (receivedMessage.type === 'warning') {
      if (receivedMessage.warning === 'Connection closed by request') {
        this.isReadyToSendMessage = false;

        console.log('%cSOCKET RECEIVED WARNING - closed by request', 'color: #F71963; font-weight: bold;', new Date());

        this.props.dispatch(openSessionMessage());
        this.props.socket.socket.removeEventListener('close', socketOnCloseListener);
        this.props.socket.socket.close();
      }
    } else if (receivedMessage.type === 'forbidden') {
      this.canReconnect = false;
      // eslint-disable-next-line react/prop-types
      this.props.socket.close();
      store.dispatch(disconnectServer());
    } else if (receivedMessage.type === 'allow_contact_timeout') {
      console.log('%cSOCKET RECEIVED allow_contact_timeout', 'color: #F71963; font-weight: bold;', new Date());
      dispatch(clearScheduledContactTimeout());
      this.forceNewChatSession();
      this.waitingForTimeoutConfirmation = false;
    }
  }

  buildHistory(history) {
    const { dispatch } = this.props;
    const teste = this.getPositionsWithoutId();
    const sortedHistory = (history || []).slice().sort((a, b) => {
      const aTs = parseInt(a && a.timestamp, 10) || 0;
      const bTs = parseInt(b && b.timestamp, 10) || 0;
      return aTs - bTs;
    });

    for (const historyMessage of sortedHistory) {
      const position = this.findInsertionPosition(historyMessage);
      const newItem = this.getUniqueNewItems(historyMessage);
      const sender = historyMessage.direction === 'in' ? 'response' : 'client';
      const showAvatar = historyMessage.direction === 'in';
      const newMessage = { ...historyMessage.message, sender, showAvatar };
      const messageHandler = this.directionMap[newMessage.sender][newMessage.type];
      const timestamp = historyMessage.timestamp || new Date().getTime();

      teste.forEach((item) => {
        this.handleDeleteMessage(item, historyMessage);
      });

      if (!newItem) {
        if (newMessage.type === 'text') {
          dispatch(messageHandler(position, newMessage.text, historyMessage.ID, timestamp));
        } else {
          dispatch(messageHandler(position, { name: newMessage.caption || '', url: newMessage.media_url }, historyMessage.ID, timestamp));
        }
      }
    }
  }

  handleDeleteMessage = (item, historyMessage) => {
    const { messagesJS, dispatch } = this.props;
    if (!historyMessage || !messagesJS[item]) return;

    const isPlaceholder = messagesJS[item].id === undefined;
    const isTextMessage = Boolean(messagesJS[item].text);
    const historyIsText = historyMessage.message && historyMessage.message.type === 'text';
    const textsMatch = historyIsText && isTextMessage && messagesJS[item].text === historyMessage.message.text;

    if (isPlaceholder && textsMatch) {
      dispatch(deleteMessage(item));
    }
  }

  findInsertionPosition = (newObj) => {
    const { messagesJS } = this.props;
    let position = messagesJS.length; // Posição padrão para o final da lista
    const newTs = parseInt(newObj && newObj.timestamp, 10) || 0;
    for (let i = 0; i < messagesJS.length; i++) {
      const currentTs = parseInt(messagesJS[i].timestamp, 10) || 0;
      if (currentTs > newTs) {
        position = i;
        break;
      }
    }
    return position;
  }

  getPositionsWithoutId = () => {
    const { messagesJS } = this.props;
    const positions = [];
    for (let i = 0; i < messagesJS.length; i++) {
      if (messagesJS[i].id === undefined) {
        positions.push(i);
      }
    }
    return positions;
  }

  getUniqueNewItems = (newItem) => {
    const { messagesJS } = this.props;

    return messagesJS.some(item => String(item.id) === String(newItem.ID));
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
    const sessionIdTransactionStatus = currentBehaviorStore.sessionIdTransactionStatus;

    if (
      currentInitialization &&
      previousInitialization !== currentInitialization &&
      sessionIdTransactionStatus
    ) {
      // eslint-disable-next-line react/prop-types
      this.props.socket.close();
    }
  };

  generateNewUniqueFrom() {
    const { clientId } = this.props;
    let validClientId;
    if (clientId === null || clientId.trim() === '') {
      validClientId = window.location.hostname;
    } else {
      validClientId = clientId;
    }
    return `${Math.floor(Math.random() * Date.now())}@${validClientId}`;
  }

  connectSocket({ sendInitPayload }) {
    const {
      socket,
      dispatch,
      sessionId,
      host,
      channelUuid,
      params,
      sessionToken
    } = this.props;

    if (!socket.isInitialized() || this.attemptingReconnection) {
      socket.createSocket();

      dispatch(pullSession(params.storage));

      // Request a session from server
      let localId = this.getSessionId();

      if (sessionId) {
        localId = sessionId;
      }

      const uniqueFrom = (this.forceNewSession || !localId) ? this.generateNewUniqueFrom() : localId;

      const options = {
        type: 'register',
        from: uniqueFrom,
        callback: `${host}/c/wwc/${channelUuid}/receive`,
        session_type: params.storage
      };

      if (sessionToken) {
        options.token = sessionToken;
      }

      const that = this;
      // eslint-disable-next-line func-names
      socket.socket.onopen = function () {
        console.log('%cSOCKET ONOPEN', 'color: #F71963; font-weight: bold;', new Date());

        if (!that.connected || that.attemptingReconnection) {
          that.startConnection(
            this,
            that.forceNewSession || (!that.attemptingReconnection && sendInitPayload),
            options,
            localId,
            uniqueFrom
          );
          that.pingIntervalId = setInterval(() => {
            that.pingSocket();
          }, 50000);
          that.setState({ isConnected: true });
          that.connected = true;
          that.attemptingReconnection = false;
          this.reconnectWithDelay = false;
          that.props.dispatch(closeSessionMessage());

          if (afterOnOpen) {
            afterOnOpen();
            afterOnOpen = null;
          }
        }
      };

      socket.socket.onmessage = (msg) => {
        this.handleBotUtterance(msg);
      };

      socketOnCloseListener = socketOnClose.bind(this);
      socket.socket.addEventListener('close', socketOnCloseListener);
      socket.socket.addEventListener('close', () => {
        this.isReadyToSendMessage = false;
      });

      socket.socket.onerror = (err) => {
        // eslint-disable-next-line no-console
        console.log('SOCKET_ONERROR: Socket error:', err);
      };
    }
  }

  initializeWidget(sendInitPayload = true) {
    const {
      dispatch,
      embedded,
      initialized,
    } = this.props;

    if (connectionOptimization.shouldConnectSocketWhenWidgetIsInitialized({ props: this.props })) {
      this.connectSocket({ sendInitPayload });
    }

    if (embedded && initialized) {
      dispatch(sendInitialPayload());
      dispatch(showChat());
      dispatch(openChat());
    }
  }

  startConnection(websocket, sendInitPayload, options, localId, remoteId) {
    const { storage, dispatch, connectOn, tooltipMessage, tooltipDelay, params } = this.props;

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
      dispatch(pullSession(params.storage));
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

      if (params.storage === 'local') {
        dispatch(getHistory(this.historyLimit, this.historyPage));
      }

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
    if (this.props.isChatOpen) {
      this.hasUserOpenedChat = true;
    }
    this.props.dispatch(toggleChat());
  }

  toggleFullScreen() {
    this.props.dispatch(toggleFullScreen());
  }

  dispatchMessage(message) {
    if (this.typingTimeoutId) {
      clearTimeout(this.typingTimeoutId);
      this.typingTimeoutId = null;
    }
    this.finishTyping();

    // TODO: add location type
    let shouldPlay = true;
    if (message.type === 'text') {
      this.props.dispatch(addResponseMessage(message.text, message.id, Number(message.timestamp)));
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
    if (this.props.socket.socket === null) {
      this.connectSocket({ sendInitPayload: true });
    }

    if (this.inactivityTimerId) {
      clearTimeout(this.inactivityTimerId);
      this.inactivityTimerId = null;
    }

    // we need to reset the chat if the user is not responding
    this.scheduleContactTimeout();

    this.pingLimit = MAX_PING_LIMIT;
    if (event.type === 'submit') {
      event.preventDefault();
      const userMessage = event.target.message.value.trim();
      if (userMessage) {
        const textMessage = {
          type: 'message',
          message: {
            type: 'text',
            text: userMessage
          }
        };

        this.props.dispatch(addUserMessage(textMessage.message.text));

        const sendMessage = () => {
          this.props.dispatch(emitUserMessage(textMessage));
          this.emitSocketEvent('outgoingMessage', textMessage);
        }

        if (this.isReadyToSendMessage) {
          sendMessage();
        } else {
          this.messagesWaitingToBeSent.push(sendMessage);
        }
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

            const sendMessage = () => {
              this.props.dispatch(emitUserMessage(attachmentMessage));
              this.emitSocketEvent('outgoingMessage', attachmentMessage);
            }

            if (this.isReadyToSendMessage) {
              sendMessage();
            } else {
              this.messagesWaitingToBeSent.push(sendMessage);
            }
          });
        }
      });
    }
  }

  emitSocketEvent(eventFunction, data) {
    // eslint-disable-next-line react/prop-types
    const onEvent = this.props.socket.onSocketEvent;
    if (onEvent[eventFunction]) {
      onEvent[eventFunction](data);
    }
  }

  closeAndDisconnect() {
    const { dispatch, socket } = this.props;

    dispatch(closeChat());
    socket.socket.close();
  }

  forceChatConnection() {
    afterOnOpen = () => {
      const { sessionToken, socket } = this.props;

      const options = {
        type: 'close_session',
        from: this.getUniqueFrom()
      };

      if (sessionToken) {
        options.token = sessionToken;
      }

      socket.socket.send(JSON.stringify(options));
      this.reconnectImmediate = true;
      socket.socket.close();
    };

    this.attemptingReconnection = true;
    this.initializeWidget();
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
          transformURLsIntoImages={this.props.transformURLsIntoImages}
          isConnected={this.state.isConnected}
          forceThinkingAfterSendingMessage={this.props.forceThinkingAfterSendingMessage}
          channelUuid={this.props.channelUuid}
        />
        <Sound url={this.props.customSoundNotification} playStatus={this.state.playNotification} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  messages: state.messages,
  messagesJS: state.messages.toJS(),
  initialized: state.behavior.get('initialized'),
  connected: state.behavior.get('connected'),
  isChatOpen: state.behavior.get('isChatOpen'),
  isChatVisible: state.behavior.get('isChatVisible'),
  fullScreenMode: state.behavior.get('fullScreenMode'),
  tooltipSent: state.metadata.get('tooltipSent'),
  oldUrl: state.behavior.get('oldUrl'),
  pageChangeCallbacks: state.behavior.get('pageChangeCallbacks'),
  domHighlight: state.metadata.get('domHighlight'),
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
  sessionToken: PropTypes.string,
  transformURLsIntoImages: PropTypes.bool,
  disableMessageTooltips: PropTypes.bool,
  contactTimeout: PropTypes.number,
  forceThinkingAfterSendingMessage: PropTypes.bool,
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
  sessionToken: null,
  startFullScreen: false,
  showTooltip: false,
  disableMessageTooltips: false,
  contactTimeout: 0,
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(Widget);
