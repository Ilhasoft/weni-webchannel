import React from 'react';
import PropTypes from 'prop-types';

import close from 'assets/clear-button.svg';
import fullscreen from 'assets/fullscreen_button.svg';
import fullscreenExit from 'assets/fullscreen_exit_button.svg';
import './style.scss';

const Header = ({
  title,
  subtitle,
  fullScreenMode,
  embedded,
  toggleFullScreen,
  toggleChat,
  showCloseButton,
  showFullScreenButton,
  connected,
  connectingText,
  closeImage,
  profileAvatar,
  showHeaderAvatar,
  headerImage
}) => (
  <div className="push-header-and-loading">
    <div className={`push-header ${subtitle ? 'push-with-subtitle' : ''} ${(showHeaderAvatar && profileAvatar) ? '' : 'push-without-header-avatar'}`}>
      {
        headerImage ?
          <img src={headerImage} className="push-header-image" alt="chat header image" />
          :
          showHeaderAvatar && profileAvatar && (
            <img src={profileAvatar} className="push-avatar" alt="chat avatar" />
          )
      }
      <div className="push-header-buttons">
        {
          showFullScreenButton &&
          <button className="push-toggle-fullscreen-button" onClick={toggleFullScreen}>
            <img
              className={`push-toggle-fullscreen ${fullScreenMode ? 'push-fullScreenExitImage' : 'push-fullScreenImage'}`}
              src={fullScreenMode ? fullscreenExit : fullscreen}
              alt="toggle fullscreen"
            />
          </button>
        }
        {
          (fullScreenMode ? true : showCloseButton) &&
          <button className="push-close-button" onClick={toggleChat}>
            <img
              className={`push-close ${closeImage ? '' : 'push-default'}`}
              src={closeImage || close}
              alt="close"
            />
          </button>
        }
      </div>
      {
        !headerImage &&
        <div className={'push-title-and-subtitle'}>
          <h4 className={`push-title ${profileAvatar && 'push-with-avatar'}`}>{title}</h4>
          {subtitle && <span className={`push-subtitle ${profileAvatar && 'push-with-avatar'}`}>{subtitle}</span>}
        </div>
      }
    </div>
    {
      !connected &&
      <span className="push-loading">
        {connectingText}
      </span>
    }
  </div>
);

Header.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  fullScreenMode: PropTypes.bool,
  toggleFullScreen: PropTypes.func,
  toggleChat: PropTypes.func,
  showCloseButton: PropTypes.bool,
  showFullScreenButton: PropTypes.bool,
  connected: PropTypes.bool,
  connectingText: PropTypes.string,
  closeImage: PropTypes.string,
  profileAvatar: PropTypes.string,
  showHeaderAvatar: PropTypes.bool,
  headerImage: PropTypes.string
};

export default Header;
