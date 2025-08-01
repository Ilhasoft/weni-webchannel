import React from 'react';
import ReactDOM from 'react-dom';
import {
  Widget,
  toggleChat,
  openChat,
  closeChat,
  showChat,
  hideChat,
  isOpen,
  isVisible,
  send,
  reload,
  clear,
  setSessionId,
  setContext,
  getContext
} from './index_for_react_app';

import './src/utils/i18n';

const plugin = {
  init: (args) => {
    ReactDOM.render(
      <Widget
        protocol={args.protocol}
        socketUrl={args.socketUrl}
        protocolOptions={args.protocolOptions}
        channelUuid={args.channelUuid}
        host={args.host}
        initPayload={args.initPayload}
        title={args.title}
        subtitle={args.subtitle}
        customData={args.customData}
        inputTextFieldHint={args.inputTextFieldHint}
        connectingText={args.connectingText}
        profileAvatar={args.profileAvatar}
        showCloseButton={args.showCloseButton}
        showFullScreenButton={args.showFullScreenButton}
        hideWhenNotConnected={args.hideWhenNotConnected}
        autoClearCache={args.autoClearCache}
        connectOn={args.connectOn}
        onSocketEvent={args.onSocketEvent}
        fullScreenMode={args.fullScreenMode}
        badge={args.badge}
        params={args.params}
        embedded={args.embedded}
        openLauncherImage={args.openLauncherImage}
        closeImage={args.closeImage}
        docViewer={args.docViewer}
        displayUnreadCount={args.displayUnreadCount}
        showMessageDate={args.showMessageDate}
        customMessageDelay={args.customMessageDelay}
        customAutoComplete={args.customAutoComplete}
        tooltipMessage={args.tooltipMessage}
        tooltipDelay={args.tooltipDelay}
        onWidgetEvent={args.onWidgetEvent}
        disableTooltips={args.disableTooltips}
        defaultHighlightCss={args.defaultHighlightCss}
        defaultHighlightAnimation={args.defaultHighlightAnimation}
        defaultHighlightClassname={args.defaultHighlightClassname}
        customizeWidget={args.customizeWidget}
        showHeaderAvatar={args.showHeaderAvatar}
        sessionId={args.sessionId}
        sessionToken={args.sessionToken}
        headerImage={args.headerImage}
        startFullScreen={args.startFullScreen}
        suggestionsConfig={args.suggestionsConfig}
        disableSoundNotification={args.disableSoundNotification}
        customSoundNotification={args.customSoundNotification}
        clientId={args.clientId}
        transformURLsIntoImages={args.transformURLsIntoImages}
        disableMessageTooltips={args.disableMessageTooltips}
      />,
      document.querySelector(args.selector)
    );
  }
};

export {
  plugin as default,
  Widget,
  toggleChat as toggle,
  openChat as open,
  closeChat as close,
  showChat as show,
  hideChat as hide,
  isOpen,
  isVisible,
  send,
  reload,
  clear,
  setSessionId,
  setContext,
  getContext
};
