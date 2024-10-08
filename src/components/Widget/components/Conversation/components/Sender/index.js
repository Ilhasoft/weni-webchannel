/* eslint-disable no-shadow */
/* eslint-disable indent */
import { getSuggestions, setUserInput, setSuggestions } from 'actions';
import iconAttachFile from 'assets/attach_file.svg';
import iconPhotoCamera from 'assets/photo_camera.svg';
import iconMic from 'assets/mic.svg';
import iconSend from 'assets/send.svg';
import iconCancel from 'assets/cancel.svg';
import iconIndicator from 'assets/indicator.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import './style.scss';
import SuggestionsList from './components/Suggestions';
import { VALID_FILE_TYPE } from '../../../../../../constants';

let audioChunks = [];
let updateAudioTimer = null;

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
  const formEl = useRef();
  const inputEl = useRef();
  const [last, setLast] = useState('');
  let typingTimer = null;
  const doneTypingInterval = 500;

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioTimer, setAudioTimer] = useState('');

  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setIsAudioRecording(true);

      const audioRecordingStart = new Date().getTime();

      function updateTimer() {
        const seconds = Math.floor((new Date().getTime() - audioRecordingStart) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        setAudioTimer(
          `${
            String(hours % 60).padStart(2, '0')
          }:${
            String(minutes % 60).padStart(2, '0')
          }:${
            String(seconds % 60).padStart(2, '0')
          }`
        );

        updateAudioTimer = setTimeout(updateTimer, 100);
      }

      updateTimer();

      audioChunks = [];

      const mediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorder);

      mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.start();
    });
  }

  function stopRecording(send) {
    clearTimeout(updateAudioTimer);

    setIsAudioRecording(false);

    mediaRecorder.addEventListener('stop', () => {
      if (send) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });

        setSelectedFiles([file]);
      }
    });

    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }

  function sendMessageInterceptor(...args) {
    if (isAudioRecording) {
      event.preventDefault();
      stopRecording(true);
    } else {
      sendMessage(...args);
    }
  }

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

  const handlePressed = (e) => {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      formEl.current.dispatchEvent(new Event('submit', { cancelable: true }));
    }
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
      const maxFileSize = 33554432;
      const exceeded = Array.from(selectedFiles).some(file => file.size >= maxFileSize);
      if (!exceeded) {
        sendMessage(event);
        setSelectedFiles([]);
      }
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

      <form ref={formEl} className="push-sender" onSubmit={sendMessageInterceptor}>
        {isAudioRecording ? (
          <section className="audio-recording">
            <img src={iconCancel} alt="Cancel" className="audio-recording__cancel-button" onClick={() => stopRecording(false)} />

            {audioTimer}

            <img src={iconIndicator} alt="Indicator" className="audio-recording__indicator-icon" />
          </section>
        ) : null}

        {isAudioRecording ? null : (
          <label htmlFor="push-file-upload">
            <input
              multiple
              style={{ display: 'none' }}
              id="push-file-upload"
              type="file"
              onChange={e => setSelectedFiles(e.target.files)}
              accept={VALID_FILE_TYPE}
            />

            <img src={iconAttachFile} alt="Attach File" className="push-file-upload" />
          </label>
        )}

        <textarea
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
          onKeyDown={event => handlePressed(event)}
          style={{ display: isAudioRecording ? 'none' : null }}
        />

        {(userInput === '' || userInput === null) && !isAudioRecording ? (
          <section className="camera-and-microphone__container">
            <img src={iconPhotoCamera} alt="Camera" />

            <img src={iconMic} alt="Microphone" className="camera-and-microphone__microphone" onClick={startRecording} />
          </section>
        ) : suggestionsConfig.automaticSend && !isAudioRecording ? null : (
          <button type="submit" className="push-send">
            <img src={iconSend} className="push-send-icon" alt="send message" />
          </button>
        )}


        {' '}
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
