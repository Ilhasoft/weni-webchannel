import React,{useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setUserInput, getSuggestions } from 'actions';
import send from 'assets/send_button.svg';
import send2 from 'assets/send_button2.svg';
import './style.scss';


const Sender = ({ sendMessage, inputTextFieldHint, disabledInput, suggestionsUrl, suggestionsRepos, userInput, suggestions, setUserInput, getSuggestions }) => {
  const inputEl = useRef()
  const [last, setLast] = useState('');
  let typingTimer = null;
  const doneTypingInterval = 5000;

  useEffect(() => {
    console.log('len:', suggestions.length)
    if (inputEl.current.value && inputEl.current.value !== last) {
      typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
    return () => {
      clearTimeout(typingTimer);
    };
  })

  const doneTyping = () => {
    getSuggestions(inputEl.current.value, suggestionsRepos, suggestionsUrl);
    setLast(inputEl.current.value)
  }

  return (userInput === 'hide' ? <div /> : (
  <form className="push-sender" onSubmit={sendMessage}>
    <input type="text" className="push-new-message" ref={inputEl} name="message" value={userInput} onChange={(value) => setUserInput(value.target.value)} placeholder={inputTextFieldHint} disabled={disabledInput || userInput === 'disable'} autoFocus autoComplete="off" />
    {(userInput === '' || userInput === null) &&
        <button type="submit" className="push-send">
          <img src={send} className="push-send-icon" alt="send message" />
        </button>}
        {userInput !== '' &&
            <button type="submit" className="push-send">
              <img src={send2} className="push-send-icon" alt="send message" />
            </button>}
  </form>
))};

const mapStateToProps = state => ({
  userInput: state.metadata.get('userInput'),
  suggestions: state.behavior.get('suggestions')
});

const mapDispatchToProps = dispatch => ({
  setUserInput: (value) => dispatch(setUserInput(value)),
  getSuggestions: (value, repos, suggestionsUrl) => dispatch(getSuggestions(value, repos, suggestionsUrl)),
});

Sender.propTypes = {
  sendMessage: PropTypes.func,
  inputTextFieldHint: PropTypes.string,
  disabledInput: PropTypes.bool,
  userInput: PropTypes.string,
  setUserInput: PropTypes.func,
  getSuggestions: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(Sender);
