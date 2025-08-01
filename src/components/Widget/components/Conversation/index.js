import React from 'react';
import PropTypes from 'prop-types';

import Header from './components/Header';
import Messages from './components/Messages';
import Sender from './components/Sender';
import './style.scss';

const Conversation = props => (
  <div className="push-conversation-container">
    <Header
      title={props.title}
      subtitle={props.subtitle}
      toggleChat={props.toggleChat}
      toggleFullScreen={props.toggleFullScreen}
      fullScreenMode={props.fullScreenMode}
      showCloseButton={props.showCloseButton}
      showFullScreenButton={props.showFullScreenButton}
      connected={props.connected}
      connectingText={props.connectingText}
      closeImage={props.closeImage}
      profileAvatar={props.profileAvatar}
      showHeaderAvatar={props.showHeaderAvatar}
      headerImage={props.headerImage}
    />
    <Messages
      profileAvatar={props.profileAvatar}
      params={props.params}
      customComponent={props.customComponent}
      showMessageDate={props.showMessageDate}
      sendMessage={props.sendMessage}
      closeAndDisconnect={props.closeAndDisconnect}
      forceChatConnection={props.forceChatConnection}
      transformURLsIntoImages={props.transformURLsIntoImages}
    />
    <Sender
      sendMessage={props.sendMessage}
      disabledInput={props.disabledInput}
      inputTextFieldHint={props.inputTextFieldHint}
      suggestionsConfig={props.suggestionsConfig}
      customAutoComplete={props.customAutoComplete}
    />
    {React.createElement(
      'a',
      { href: 'https://weni.ai', className: 'push-poweredby-container', target: '_blank' },
      'Powered by Weni Platform'
    )}
  </div>
);

Conversation.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  sendMessage: PropTypes.func,
  profileAvatar: PropTypes.string,
  toggleFullScreen: PropTypes.func,
  closeAndDisconnect: PropTypes.func,
  forceChatConnection: PropTypes.func,
  fullScreenMode: PropTypes.bool,
  toggleChat: PropTypes.func,
  showCloseButton: PropTypes.bool,
  showFullScreenButton: PropTypes.bool,
  disabledInput: PropTypes.bool,
  params: PropTypes.shape({}),
  connected: PropTypes.bool,
  connectingText: PropTypes.string,
  closeImage: PropTypes.string,
  customComponent: PropTypes.func,
  showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  inputTextFieldHint: PropTypes.string,
  showHeaderAvatar: PropTypes.bool,
  headerImage: PropTypes.string,
  suggestionsConfig: PropTypes.shape({}),
  customAutoComplete: PropTypes.func,
  transformURLsIntoImages: PropTypes.bool
};

export default Conversation;
