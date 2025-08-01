import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Conversation from './components/Conversation';
import Launcher from './components/Launcher';
import './style.scss';

const WidgetLayout = (props) => {
  useEffect(() => {
    Object.keys(props.customizeWidget).forEach((key) => {
      document.body.style.setProperty(`--${key}`, props.customizeWidget[key]);
    });
  });

  const classes = ['push-widget-container'];
  if (props.fullScreenMode || props.embedded) {
    classes.push('push-full-screen');
  }
  const showCloseButton =
    props.showCloseButton !== undefined ? props.showCloseButton : !props.embedded;
  const isVisible = props.isChatVisible && !(props.hideWhenNotConnected && !props.connected);
  const chatShowing = props.isChatOpen || props.embedded;

  if (chatShowing) {
    classes.push('push-chat-open');
  }

  return isVisible ? (
    <div className={classes.join(' ')}>
      {chatShowing && (
        <Conversation
          title={props.title}
          subtitle={props.subtitle}
          sendMessage={props.onSendMessage}
          profileAvatar={props.profileAvatar}
          toggleChat={props.toggleChat}
          isChatOpen={props.isChatOpen}
          toggleFullScreen={props.toggleFullScreen}
          fullScreenMode={props.fullScreenMode}
          disabledInput={props.disabledInput}
          params={props.params}
          showFullScreenButton={props.showFullScreenButton}
          inputTextFieldHint={props.inputTextFieldHint}
          {...{ showCloseButton }}
          connected={props.connected}
          connectingText={props.connectingText}
          closeImage={props.closeImage}
          customComponent={props.customComponent}
          showMessageDate={props.showMessageDate}
          showHeaderAvatar={props.showHeaderAvatar}
          headerImage={props.headerImage}
          suggestionsConfig={props.suggestionsConfig}
          customAutoComplete={props.customAutoComplete}
          closeAndDisconnect={props.closeAndDisconnect}
          forceChatConnection={props.forceChatConnection}
          transformURLsIntoImages={props.transformURLsIntoImages}
        />
      )}
      {!props.embedded && (
        <Launcher
          toggle={props.toggleChat}
          isChatOpen={props.isChatOpen}
          badge={props.badge}
          fullScreenMode={props.fullScreenMode}
          openLauncherImage={props.openLauncherImage}
          closeImage={props.closeImage}
          displayUnreadCount={props.displayUnreadCount}
          tooltipMessage={props.tooltipMessage}
          showTooltip={props.showTooltip}
        />
      )}
    </div>
  ) : null;
};

const mapStateToProps = state => ({
  isChatVisible: state.behavior.get('isChatVisible'),
  isChatOpen: state.behavior.get('isChatOpen'),
  disabledInput: state.behavior.get('disabledInput'),
  connected: state.behavior.get('connected'),
  connectingText: state.behavior.get('connectingText')
});

WidgetLayout.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  onSendMessage: PropTypes.func,
  toggleChat: PropTypes.func,
  toggleFullScreen: PropTypes.func,
  closeAndDisconnect: PropTypes.func,
  forceChatConnection: PropTypes.func,
  isChatOpen: PropTypes.bool,
  isChatVisible: PropTypes.bool,
  profileAvatar: PropTypes.string,
  showCloseButton: PropTypes.bool,
  showFullScreenButton: PropTypes.bool,
  hideWhenNotConnected: PropTypes.bool,
  disabledInput: PropTypes.bool,
  fullScreenMode: PropTypes.bool,
  badge: PropTypes.number,
  embedded: PropTypes.bool,
  params: PropTypes.shape({}),
  connected: PropTypes.bool,
  connectingText: PropTypes.string,
  openLauncherImage: PropTypes.string,
  closeImage: PropTypes.string,
  customComponent: PropTypes.func,
  displayUnreadCount: PropTypes.bool,
  showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  tooltipMessage: PropTypes.string,
  inputTextFieldHint: PropTypes.string,
  showHeaderAvatar: PropTypes.bool,
  headerImage: PropTypes.string,
  suggestionsConfig: PropTypes.shape({}),
  customAutoComplete: PropTypes.func,
  showTooltip: PropTypes.bool,
  customizeWidget: PropTypes.shape({}),
  transformURLsIntoImages: PropTypes.bool
};

export default connect(mapStateToProps)(WidgetLayout);
