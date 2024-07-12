import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import { debounce } from 'lodash';
import { withTranslation } from 'react-i18next';

import alertCircle from 'assets/alert-circle-1-1.svg';
import { MESSAGES_TYPES, VALID_FILE_TYPE } from 'constants';
import { Video, Image, Message, Snippet, QuickReply, DocViewer, Audio } from 'messagesComponents';

import { getHistory, setMessagesScroll } from 'actions';

import './styles.scss';

const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const formatDate = (date) => {
  const dateToFormat = new Date(date);
  const showDate = isToday(dateToFormat) ? '' : `${dateToFormat.toLocaleDateString()} `;
  return `${showDate}${dateToFormat.toLocaleTimeString('en-US', { timeStyle: 'short' })}`;
};

const scrollToBottom = () => {
  const messagesDiv = document.getElementById('push-messages');
  if (messagesDiv) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
};

class Messages extends Component {
  constructor(props) {
    super(props);
    this.historyLimit = 20;
    this.state = {
      historyPage: 1
    };
    this.intervalId = null;
  }

  componentDidMount() {
    scrollToBottom();
    const messagesDiv = document.getElementById('push-messages');

    if (messagesDiv) {
      messagesDiv.addEventListener('scroll', debounce(this.handleScroll, 1000));
    }

    this.intervalId = setInterval(this.getHistory, 60000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.getHistory();
      }
    });
  }

  componentDidUpdate() {
    const { messagesScroll } = this.props;

    if (messagesScroll || this.state.historyPage === 1) {
      scrollToBottom();
    }
  }

  componentWillUnmount() {
    const messagesDiv = document.getElementById('push-messages');
    if (messagesDiv) {
      messagesDiv.removeEventListener('scroll', this.handleScroll);
    }
  }

  getComponentToRender = (message, index, isLast) => {
    const { params } = this.props;
    const ComponentToRender = (() => {
      switch (message.get('type')) {
        case MESSAGES_TYPES.TEXT: {
          return Message;
        }
        case MESSAGES_TYPES.SNIPPET.LINK: {
          return Snippet;
        }
        case MESSAGES_TYPES.VIDREPLY.VIDEO: {
          return Video;
        }
        case MESSAGES_TYPES.AUDIOREPLY.AUDIO: {
          return Audio;
        }
        case MESSAGES_TYPES.IMGREPLY.IMAGE: {
          return Image;
        }
        case MESSAGES_TYPES.DOCREPLY.DOCUMENT: {
          return DocViewer;
        }
        case MESSAGES_TYPES.QUICK_REPLY: {
          return QuickReply;
        }
        case MESSAGES_TYPES.CUSTOM_COMPONENT:
          return connect(
            store => ({ store }),
            dispatch => ({ dispatch })
          )(this.props.customComponent);
        default:
          return null;
      }
    })();
    if (message.get('type') === 'component') {
      return <ComponentToRender id={index} {...message.get('props')} isLast={isLast} />;
    }
    return <ComponentToRender id={index} params={params} message={message} isLast={isLast} />;
  };


  getHistory = () => {
    const { dispatch, messages } = this.props;

    dispatch(getHistory(this.historyLimit, 1));
    this.setState({ historyPage: this.state.historyPage + 1 });
    console.log('histórico atualizado', messages);
  }

  handleScroll = (event) => {
    const { params, dispatch } = this.props;
    const scrollTop = event.srcElement.scrollTop;

    if (scrollTop === 0 && params.storage === 'local') {
      dispatch(setMessagesScroll(false));
      this.getHistory();
    }
  };

  render() {
    const {
      displayTypingIndication,
      profileAvatar,
      sendMessage,
      openSessionMessage,
      closeAndDisconnect,
      forceChatConnection,
      t
    } = this.props;

    const renderMessages = () => {
      const { messages, showMessageDate } = this.props;

      if (messages.isEmpty()) return null;

      const groups = [];
      let group = null;

      const dateRenderer =
        typeof showMessageDate === 'function'
          ? showMessageDate
          : showMessageDate === true
            ? formatDate
            : null;

      const renderMessageDate = (message) => {
        const timestamp = message.get('timestamp');

        if (!dateRenderer || !timestamp) return null;
        const dateToRender = dateRenderer(message.get('timestamp', message));
        return dateToRender ? (
          <span className="push-message-date">
            {dateRenderer(message.get('timestamp'), message)}
          </span>
        ) : null;
      };

      const renderMessage = (message, index) => (
        <div
          className={`push-message ${profileAvatar && 'push-with-avatar'} ${
            message.get('sender') === 'client' ? 'push-from-client' : ''
          }`}
          key={index}
        >
          {profileAvatar && message.get('showAvatar') && message.get('sender') === 'response' && (
            <img src={profileAvatar} className="push-avatar" alt="profile" />
          )}
          {this.getComponentToRender(message, index, index === messages.size - 1)}
          {renderMessageDate(message)}
        </div>
      );

      messages.forEach((msg, index) => {
        if (group === null || group.from !== msg.get('sender')) {
          if (group !== null) groups.push(group);

          group = {
            from: msg.get('sender'),
            messages: []
          };
        }

        group.messages.push(renderMessage(msg, index));
      });

      groups.push(group); // finally push last group of messages.

      return groups.map((g, index) => (
        <div className={`push-group-message push-from-${g.from}`} key={`group_${index}`}>
          {g.messages}
        </div>
      ));
    };

    return openSessionMessage ? (
      <div className="push-open-session">
        <div className="push-open-session__icon">
          <img src={alertCircle} alt="used session info" />
        </div>
        <div className="push-open-session__title">{t('OpenSessionTitle')}</div>
        <div className="push-open-session__subtitle">{t('OpenSessionSubtitle')}</div>
        <div className="push-open-session__buttons">
          <button className="push-open-session__buttons-close" onClick={closeAndDisconnect}>
            {t('OpenSessionCloseText')}
          </button>
          <button className="push-open-session__buttons-use" onClick={forceChatConnection}>
            {t('OpenSessionUseText')}
          </button>
        </div>
      </div>
    ) : (
      <Dropzone
        onDropAccepted={acceptedFiles =>
          sendMessage({
            type: 'attachment',
            files: acceptedFiles
          })
        }
        multiple
        maxSize={33554432}
        accept={VALID_FILE_TYPE}
        noClick
      >
        {({ getRootProps, getInputProps }) => (
          <div id="push-messages" className="push-messages-container" {...getRootProps()}>
            <input className="push-dropzone" {...getInputProps()} />
            <section>
              {renderMessages()}
              {displayTypingIndication && (
                <div
                  className={`push-message push-typing-indication ${profileAvatar &&
                    'push-with-avatar'}`}
                >
                  {profileAvatar && (
                    <img src={profileAvatar} className="push-avatar" alt="profile" />
                  )}
                  <div className="push-response">
                    <div id="push-wave">
                      <p className="push-customText">Typing...</p>
                      <span className="push-dot" />
                      <span className="push-dot" />
                      <span className="push-dot" />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </Dropzone>
    );
  }
}

Messages.propTypes = {
  messages: ImmutablePropTypes.listOf(ImmutablePropTypes.map),
  profileAvatar: PropTypes.string,
  customComponent: PropTypes.func,
  showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  displayTypingIndication: PropTypes.bool,
  params: PropTypes.shape({}),
  sendMessage: PropTypes.func,
  openSessionMessage: PropTypes.bool,
  closeAndDisconnect: PropTypes.func,
  forceChatConnection: PropTypes.func,
  messagesScroll: PropTypes.bool,
  t: PropTypes.func
};

Message.defaultTypes = {
  displayTypingIndication: false
};

export default connect(store => ({
  messages: store.messages,
  displayTypingIndication: store.behavior.get('messageDelayed'),
  openSessionMessage: store.behavior.get('openSessionMessage'),
  messagesScroll: store.behavior.get('messagesScroll')
}))(withTranslation()(Messages));
