import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import thinkingArticle from 'assets/thinking-article.svg';
import thinkingLightbulb from 'assets/thinking-lightbulb-2.svg';
import thinkingWandStars from 'assets/thinking-wand-stars.svg';
import thinkingTooltip from 'assets/thinking-tooltip.svg';
import thinkingRocketLaunch from 'assets/thinking-rocket-launch.svg';

class Thinking extends PureComponent {
  constructor(props) {
    super(props);

    this.thinkingTimeoutId = null;
    this.step = 'waitingToStart';

    this.state = {
      currentMessageIndex: null,
      icon: '',
      message: '',
    };

    this.messages = [
      {
        text: 'Processando informações',
        icon: thinkingArticle,
      },
      {
        text: 'Conectando ideias',
        icon: thinkingLightbulb,
      },
      {
        text: 'Refinando detalhes',
        icon: thinkingWandStars,
      },
      {
        text: 'Estruturando resposta',
        icon: thinkingTooltip,
      },
      {
        text: 'Quase pronto, só mais um instante',
        icon: thinkingRocketLaunch,
      }
    ];

    this.eventListener = { element: null, event: null, callback: null };
  }

  nextMessageIndex() {
    let nextMessageIndex = null;

    if (this.state.currentMessageIndex === null) {
      nextMessageIndex = 0;
    } else if (this.state.currentMessageIndex < this.messages.length - 1) {
      nextMessageIndex = this.state.currentMessageIndex + 1;
    } else {
      return null;
    }

    return nextMessageIndex;
  }

  setEventListener(element, event, callback) {
    this.eventListener = { element, event, callback };

    element.addEventListener(event, callback, { once: true });
  }

  removeEventListener() {
    const { element, event, callback } = this.eventListener;

    if (element) {
      element.removeEventListener(event, callback);
    }
  }

  loadNextMessage() {
    const nextMessageIndex = this.nextMessageIndex();

    if (nextMessageIndex === null) {
      return;
    }

    const pushThinkingText = document.getElementById('push-thinking-text');

    this.setState({
      currentMessageIndex: nextMessageIndex,
    });

    pushThinkingText.style.animation = 'push-thinking-text-in 0.5s';

    this.thinkingTimeoutId = setTimeout(() => {
      if (this.nextMessageIndex() === null) {
        return;
      }

      pushThinkingText.style.animation = 'push-thinking-text-out 0.5s';

      this.setEventListener(pushThinkingText, 'animationend', () => {
        this.loadNextMessage();
      });
    }, (5 + Math.random() * 4.5) * 1000); // 5 to 9.5 seconds
  }

  componentDidMount() {
    this.thinkingTimeoutId = setTimeout(() => {
      this.loadNextMessage();
    }, (1 + Math.random() * 1) * 1000); // 1 to 2 seconds
  }

  componentWillUnmount() {
    if (this.thinkingTimeoutId) {
      clearTimeout(this.thinkingTimeoutId);
    }

    this.removeEventListener();
  }

  render() {
    return (
      <div
        className={`push-group-message push-from-response`}
      >
        <div className={`push-message push-thinking ${this.props.profileAvatar
          && 'push-with-avatar'}`}>
          {this.props.profileAvatar && (
            <img src={this.props.profileAvatar} className="push-avatar" alt="profile" />
          )}

          <div className="push-response push-response-thinking">
            {this.state.currentMessageIndex !== null && (
              <img className="push-thinking-icon" src={this.messages[this.state.currentMessageIndex].icon} alt="thinking" />
            )}

            <p className="push-message-text" id="push-thinking-text">
              {this.state.currentMessageIndex !== null && (
                this.messages[this.state.currentMessageIndex].text
              )}
            </p>

            <div id="push-wave">
              <p className="push-customText">Typing...</p>
              <span className="push-dot" />
              <span className="push-dot" />
              <span className="push-dot" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Thinking.propTypes = {
  profileAvatar: PropTypes.string,
};

export default Thinking;
