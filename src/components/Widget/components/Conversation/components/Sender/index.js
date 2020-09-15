import './style.scss';

import { getSuggestions, setUserInput } from 'actions';
import send from 'assets/send_button.svg';
import send2 from 'assets/send_button2.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import SuggestionsList from './components/Suggestions';

const Sender = ({ sendMessage, inputTextFieldHint, disabledInput, suggestionsUrl, suggestionsRepos, userInput, suggestions, setUserInput, getSuggestions, selectedSuggestion }) => {
  const inputEl = useRef()
  const [last, setLast] = useState('');
  let typingTimer = null;
  const doneTypingInterval = 3000;

  useEffect(() => {
    if (inputEl.current.value && inputEl.current.value !== last) {
      typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
    return () => {
      clearTimeout(typingTimer);
    };
  })

  const doneTyping = () => {
    if (inputEl.current.value === selectedSuggestion) {
      return;
    }
    getSuggestions(inputEl.current.value, suggestionsRepos, suggestionsUrl);
    setLast(inputEl.current.value)
  }

  return (userInput === 'hide' ? <div /> : (
    <div>
      {(suggestions && suggestions.length > 0) ? <SuggestionsList suggestions={suggestions}></SuggestionsList> : <div></div>}
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
    </div>
))};

const mapStateToProps = state => ({
  userInput: state.metadata.get('userInput'),
  suggestions: state.behavior.get('suggestions'),
  selectedSuggestion: state.metadata.get('selectedSuggestion'),
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
