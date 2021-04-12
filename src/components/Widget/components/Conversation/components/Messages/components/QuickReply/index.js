/* eslint-disable no-shadow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { PROP_TYPES } from 'constants';
import { addUserMessage, emitUserMessage, setQuickReply, setUserInput, toggleInputDisabled, changeInputFieldHint } from 'actions';
import Message from '../Message/index';

import './styles.scss';

class QuickReply extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(reply) {
    const {
      chooseReply,
      id,
      userInput,
      setUserInput
    } = this.props;
    const payload = reply.get('payload');
    const title = reply.get('title');
    const verify = this.verifyType(title);
    if (verify === 'regular') {
      chooseReply(payload, title, id);
    } else if (verify === 'checkbox') {
      let value = userInput;
      if (value !== '') {
        value = value.concat(', ', title.replace('[] ', ''));
        setUserInput(value);
      } else {
        value = value.concat(title.replace('[] ', ''));
        setUserInput(value);
      }
    } else if (verify === 'location') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const value = `Minha localização é: [${position.coords.latitude},${position.coords.longitude}]`;
          chooseReply(value, value, id);
        }, (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              chooseReply('Você bloqueou a sua localização.', 'Você bloqueou a sua localização.', id);
              break;
            case error.POSITION_UNAVAILABLE:
              chooseReply('A sua localização não foi validada.', 'A sua localização não foi validada.', id);
              break;
            case error.TIMEOUT:
              chooseReply('Não conseguimos recuperar sua localização.', 'Não conseguimos recuperar sua localização.', id);
              break;
            case error.UNKNOWN_ERROR:
              chooseReply('Ocorreu um erro desconhecido.', 'Ocorreu um erro desconhecido.', id);
              break;
            default:
              break;
          }
        });
      } else {
        chooseReply('Ocorreu um erro desconhecido.', 'Ocorreu um erro desconhecido.', id);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  verifyType(title) {
    let response = title.indexOf('[]');
    if (response !== -1) {
      return 'checkbox';
    }
    response = title.indexOf('[Loc]');
    if (response !== -1) {
      return 'location';
    }
    return 'regular';
  }

  render() {
    const {
      message,
      getChosenReply,
      // isLast,
      id,
      linkTarget
    } = this.props;
    const chosenReply = getChosenReply(id);
    if (chosenReply) {
      return <div />;
    }
    return (
      <div className="push-quickReplies-container">
        {/* <Message message={message} /> */}
        {/* {isLast && ( */}
        <div className="push-replies">
          {message.get('quick_replies').map((reply, index) => {
            if (reply.get('type') === 'web_url') {
              return (
                <a
                  key={index}
                  href={reply.get('url')}
                  target={linkTarget || '_blank'}
                  rel="noopener noreferrer"
                  className={'push-reply'}
                >
                  {reply.get('title').replace('[] ', '').replace('[Loc] ', '')}
                </a>
              );
            }
            return (
              // eslint-disable-next-line jsx-a11y/no-static-element-interactions
              <div
                key={index}
                className={'push-reply'}
                onClick={() => this.handleClick(reply)}
              >
                {reply.get('title').replace('[] ', '').replace('[Loc] ', '')}
              </div>
            );
          })}
        </div>
        {/* )} */}
      </div>
    );
  }
}


const mapStateToProps = state => ({
  getChosenReply: id => state.messages.get(id).get('chosenReply'),
  inputState: state.behavior.get('disabledInput'),
  linkTarget: state.metadata.get('linkTarget'),
  userInput: state.metadata.get('userInput')
});

const mapDispatchToProps = dispatch => ({
  toggleInputDisabled: () => dispatch(toggleInputDisabled()),
  changeInputFieldHint: hint => dispatch(changeInputFieldHint(hint)),
  setUserInput: value => dispatch(setUserInput(value)),
  chooseReply: (payload, title, id) => {
    const message = {
      type: 'message',
      message: {
        type: 'text',
        text: payload
      }
    };

    dispatch(setQuickReply(id, title));
    dispatch(addUserMessage(title));
    dispatch(emitUserMessage(message));
    // dispatch(toggleInputDisabled());
  }
});

QuickReply.propTypes = {
  getChosenReply: PropTypes.func,
  chooseReply: PropTypes.func,
  id: PropTypes.number,
  isLast: PropTypes.bool,
  message: PROP_TYPES.QUICK_REPLY,
  linkTarget: PropTypes.string,
  setUserInput: PropTypes.func,
  userInput: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(QuickReply);
