/* eslint-disable no-shadow */
/* eslint-disable indent */
import { getSuggestions, setUserInput, setSuggestions } from 'actions';
import send from 'assets/send_button.svg';
import send2 from 'assets/send_button2.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import AttachFileIcon from '@material-ui/icons/AttachFile';

import './style.scss';
import SuggestionsList from './components/Suggestions';

function Sender({
  sendMessage,
  inputTextFieldHint,
  disabledInput,
  suggestions,
  userInput,
  suggestionsConfig,
  setUserInput,
  getSuggestions,
  setSuggestions,
  selectedSuggestion,
  customAutoComplete
}) {
  const inputEl = useRef();
  const [last, setLast] = useState('');
  let typingTimer = null;
  const doneTypingInterval = 500;

  const [selectedFiles, setSelectedFiles] = useState([]);

  function validateInput(customSuggestions) {
    return (
      Array.isArray(customSuggestions) &&
      customSuggestions.every(e => typeof e === 'string' || e instanceof String)
    );
  }

  const doneTyping = () => {
    if (inputEl.current.value === selectedSuggestion) {
      return;
    }
    if (customAutoComplete) {
      const customSuggestions = customAutoComplete(inputEl.current.value);
      const isValid = validateInput(customSuggestions);
      isValid && setSuggestions(customSuggestions);
    } else {
      getSuggestions(
        inputEl.current.value,
        suggestionsConfig.datasets,
        suggestionsConfig.url,
        suggestionsConfig.language,
        suggestionsConfig.excludeIntents
      );
    }
    setLast(inputEl.current.value);
  };

  useEffect(() => {
    if (
      inputEl.current.value &&
      inputEl.current.value !== last &&
      suggestionsConfig.url &&
      suggestionsConfig.datasets &&
      suggestionsConfig.language
    ) {
      typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }

    if (selectedFiles.length) {
      const event = {
        type: 'attachment',
        files: selectedFiles
      };
      sendMessage(event);
      setSelectedFiles([]);
    }

    return () => {
      clearTimeout(typingTimer);
    };
  });

  return userInput === 'hide' ? (
    <div />
  ) : (
    <div>
      {suggestions && suggestions.length > 0 ? (
        <SuggestionsList
          suggestions={suggestions}
          automaticSend={suggestionsConfig.automaticSend}
        />
      ) : (
        <div />
      )}
      <form className="push-sender" onSubmit={sendMessage}>
        <label htmlFor="push-file-upload">
          <input
            multiple
            style={{ display: 'none' }}
            id="push-file-upload"
            type="file"
            onChange={e => setSelectedFiles(e.target.files)}
          />
          <AttachFileIcon />
        </label>
        <input
          type="text"
          className="push-new-message"
          ref={inputEl}
          name="message"
          value={userInput}
          onChange={value => setUserInput(value.target.value)}
          placeholder={inputTextFieldHint}
          disabled={disabledInput || userInput === 'disable'}
          autoFocus
          autoComplete="off"
        />
        {suggestionsConfig.automaticSend ? null : (
          <button type="submit" className="push-send">
            <img
              src={userInput === '' || userInput === null ? send : send2}
              className="push-send-icon"
              alt="send message"
            />
          </button>
        )}{' '}
      </form>{' '}
    </div>
  );
}

const mapStateToProps = state => ({
  userInput: state.metadata.get('userInput'),
  suggestions: state.behavior.get('suggestions'),
  selectedSuggestion: state.metadata.get('selectedSuggestion')
});

const mapDispatchToProps = dispatch => ({
  setUserInput: value => dispatch(setUserInput(value)),
  getSuggestions: (value, repos, suggestionsUrl, suggestionsLanguage, excluded) =>
    dispatch(getSuggestions(value, repos, suggestionsUrl, suggestionsLanguage, excluded)),
  setSuggestions: suggestions => dispatch(setSuggestions(suggestions))
});

Sender.propTypes = {
  sendMessage: PropTypes.func,
  inputTextFieldHint: PropTypes.string,
  disabledInput: PropTypes.bool,
  userInput: PropTypes.string,
  setUserInput: PropTypes.func,
  getSuggestions: PropTypes.func,
  customAutoComplete: PropTypes.func,
  suggestions: PropTypes.shape({}),
  suggestionsConfig: PropTypes.shape({}),
  setSuggestions: PropTypes.func,
  selectedSuggestion: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(Sender);
