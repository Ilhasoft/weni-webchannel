import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import Widget from './components/Widget';
import { initStore } from '../src/store/store';

// eslint-disable-next-line import/no-mutable-exports
export let store = null;

const ConnectedWidget = forwardRef((props, ref) => {
  class Socket {
    constructor(
      url,
      customData,
      protocolOptions,
      channelUuid,
      host,
      onSocketEvent,
      socketUrl,
      transformURLsIntoImages
    ) {
      this.url = url;
      this.customData = customData;
      this.protocolOptions = protocolOptions;
      this.channelUuid = channelUuid;
      this.host = host;
      this.onSocketEvent = onSocketEvent;
      this.socket = null;
      this.subscribed = null;
      this.onEvents = [];
      this.marker = Math.random();
      this.socketUrl = socketUrl;
      this.transformURLsIntoImages = transformURLsIntoImages;
    }

    isInitialized() {
      return this.socket ? this.socket.readyState === 1 : false;
    }

    on(event, callback) {
      if (!this.socket) {
        this.onEvents.push({ event, callback });
      } else {
        this.socket.on(event, callback);
      }
    }

    subscribe(sessionId, callback) {
      if (!this.socket.isSubscribed(sessionId) && !this.subscribed) {
        this.subscribed = sessionId;
        this.socket.subscribe(sessionId).watch(callback);
      }
    }

    emit(message, data, callback) {
      if (this.socket) {
        this.socket.emit(message, data, callback);
      }
    }

    close() {
      if (this.socket) {
        if (this.socket.readyState === 0) {
          const closeRetryDelayMs = 100;
          setTimeout(() => {
            this.close();
          }, closeRetryDelayMs);
        } else {
          this.socket.close();
        }
      }
    }

    createSocket() {
      const socketHost = this.socketUrl.replace(/^(https?:|)\/\//, '');
      this.socket = new WebSocket(`wss://${socketHost}/ws`);
    }
  }

  const sock = new Socket(
    props.socketUrl,
    props.customData,
    props.protocolOptions,
    props.channelUuid,
    props.host,
    props.onSocketEvent,
    props.socketUrl
  );

  const storage =
    props.params.storage === 'session' ? sessionStorage : localStorage;
  if (!store || sock.marker !== store.socketRef) {
    store = initStore(
      props.inputTextFieldHint,
      props.connectingText,
      sock,
      storage,
      props.docViewer,
      props.onWidgetEvent
    );
    store.socketRef = sock.marker;
  }
  return (
    <Provider store={store}>
      <Widget
        ref={ref}
        initPayload={props.initPayload}
        title={props.title}
        subtitle={props.subtitle}
        customData={props.customData}
        handleNewUserMessage={props.handleNewUserMessage}
        profileAvatar={props.profileAvatar}
        showCloseButton={props.showCloseButton}
        showFullScreenButton={props.showFullScreenButton}
        hideWhenNotConnected={props.hideWhenNotConnected}
        connectOn={props.connectOn}
        autoClearCache={props.autoClearCache}
        fullScreenMode={props.fullScreenMode}
        badge={props.badge}
        embedded={props.embedded}
        params={props.params}
        storage={storage}
        openLauncherImage={props.openLauncherImage}
        closeImage={props.closeImage}
        customComponent={props.customComponent}
        displayUnreadCount={props.displayUnreadCount}
        socket={sock}
        showMessageDate={props.showMessageDate}
        customMessageDelay={props.customMessageDelay}
        customAutoComplete={props.customAutoComplete}
        tooltipMessage={props.tooltipMessage}
        tooltipDelay={props.tooltipDelay}
        disableTooltips={props.disableTooltips}
        defaultHighlightCss={props.defaultHighlightCss}
        defaultHighlightAnimation={props.defaultHighlightAnimation}
        defaultHighlightClassname={props.defaultHighlightClassname}
        customizeWidget={props.customizeWidget}
        inputTextFieldHint={props.inputTextFieldHint}
        showHeaderAvatar={props.showHeaderAvatar}
        sessionId={props.sessionId}
        sessionToken={props.sessionToken}
        headerImage={props.headerImage}
        startFullScreen={props.startFullScreen}
        suggestionsConfig={props.suggestionsConfig}
        host={props.host}
        channelUuid={props.channelUuid}
        disableSoundNotification={props.disableSoundNotification}
        customSoundNotification={props.customSoundNotification}
        clientId={props.clientId}
        transformURLsIntoImages={props.transformURLsIntoImages}
      />
    </Provider>
  );
});

ConnectedWidget.propTypes = {
  initPayload: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  socketUrl: PropTypes.string.isRequired,
  protocolOptions: PropTypes.shape({}),
  channelUuid: PropTypes.string,
  host: PropTypes.string,
  customData: PropTypes.shape({}),
  handleNewUserMessage: PropTypes.func,
  profileAvatar: PropTypes.string,
  inputTextFieldHint: PropTypes.string,
  connectingText: PropTypes.string,
  showCloseButton: PropTypes.bool,
  showFullScreenButton: PropTypes.bool,
  hideWhenNotConnected: PropTypes.bool,
  connectOn: PropTypes.oneOf(['mount', 'open']),
  autoClearCache: PropTypes.bool,
  onSocketEvent: PropTypes.objectOf(PropTypes.func),
  fullScreenMode: PropTypes.bool,
  badge: PropTypes.number,
  embedded: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  params: PropTypes.object,
  openLauncherImage: PropTypes.string,
  closeImage: PropTypes.string,
  docViewer: PropTypes.bool,
  customComponent: PropTypes.func,
  displayUnreadCount: PropTypes.bool,
  showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  customMessageDelay: PropTypes.func,
  customAutoComplete: PropTypes.func,
  tooltipMessage: PropTypes.string,
  tooltipDelay: PropTypes.number,
  onWidgetEvent: PropTypes.shape({
    onChatOpen: PropTypes.func,
    onChatClose: PropTypes.func,
    onChatVisible: PropTypes.func,
    onChatHidden: PropTypes.func
  }),
  disableTooltips: PropTypes.bool,
  defaultHighlightCss: PropTypes.string,
  defaultHighlightAnimation: PropTypes.string,
  showHeaderAvatar: PropTypes.bool,
  sessionId: PropTypes.string,
  sessionToken: PropTypes.string,
  headerImage: PropTypes.string,
  startFullScreen: PropTypes.bool,
  suggestionsConfig: PropTypes.shape({}),
  disableSoundNotification: PropTypes.bool,
  customSoundNotification: PropTypes.string,
  clientId: PropTypes.string
};

ConnectedWidget.defaultProps = {
  title: 'Welcome',
  customData: {},
  inputTextFieldHint: 'Type a message...',
  connectingText: 'Waiting for server...',
  fullScreenMode: false,
  hideWhenNotConnected: true,
  autoClearCache: false,
  connectOn: 'mount',
  onSocketEvent: {},
  socketUrl: 'https://socket.push.al',
  protocolOptions: { secure: true, port: 8081 },
  channelUuid: null,
  host: 'https://new.push.al',
  badge: 0,
  embedded: false,
  params: {
    storage: 'local'
  },
  docViewer: false,
  showCloseButton: true,
  showFullScreenButton: false,
  displayUnreadCount: false,
  showMessageDate: true,
  customMessageDelay: (message) => {
    let delay = message.length * 30;
    if (delay > 3 * 1000) delay = 3 * 1000;
    if (delay < 800) delay = 800;
    return delay;
  },
  customAutoComplete: null,
  tooltipMessage: null,
  tooltipDelay: 500,
  onWidgetEvent: {
    onChatOpen: () => {},
    onChatClose: () => {},
    onChatVisible: () => {},
    onChatHidden: () => {}
  },
  disableTooltips: false,
  showHeaderAvatar: true,
  sessionId: null,
  sessionToken: null,
  startFullScreen: false,
  suggestionsConfig: {
    url: 'https://api.bothub.it/v2/repository/examples/search_repositories_examples/',
    datasets: [],
    language: 'pt_br',
    excludeIntents: [],
    automaticSend: false
  },
  disableSoundNotification: false,
  customSoundNotification:
    'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3',
  clientId: window.location.hostname
};

export default ConnectedWidget;
