/* eslint-disable no-shadow */
/* eslint-disable indent */
import { getSuggestions, setUserInput, setSuggestions } from 'actions';
import iconAttachFile from 'assets/attach_file.svg';
import iconPhotoCamera from 'assets/photo_camera.svg';
import iconPhotoCameraLight from 'assets/photo_camera_light.svg';
import iconCameraSwitch from 'assets/cameraswitch.svg';
import iconMic from 'assets/mic.svg';
import iconSend from 'assets/send.svg';
import iconCancel from 'assets/cancel.svg';
import iconIndicator from 'assets/indicator.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { audioToMp3Blob } from 'utils/audioToMp3Blob';

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
  customAutoComplete,
  isConnected
}) {
  const formEl = useRef();
  const inputEl = useRef();
  const [last, setLast] = useState('');
  let typingTimer = null;
  const doneTypingInterval = 500;

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isSwitchingVideo, setIsSwitchingVideo] = useState(false);
  const [hasMoreThanOneVideo, setHasMoreThanOneVideo] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioTimer, setAudioTimer] = useState('');

  const isScreenHeightSmall = window.innerHeight < 720;

  function switchCamera() {
    if (!isSwitchingVideo) {
      document.querySelector('#wwc-video').dispatchEvent(new Event('switch'));
    }
  }

  function startVideoRecording() {
    const video = document.createElement('video');
    video.setAttribute('id', 'wwc-video');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    document.querySelector('.push-camera__container').appendChild(video);


    let cameras = [];
    let currentCamera = null;

    function nextCamera() {
      currentCamera = cameras[(cameras.indexOf(currentCamera) + 1) % cameras.length];
      return currentCamera;
    }

    function getAllCameras() {
      return new Promise((resolve) => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((videoStream) => {
          videoStream.getTracks().forEach((track) => {
            track.stop();
          });

          navigator.mediaDevices.enumerateDevices().then((devices) => {
            resolve(devices.filter(device => device.kind === 'videoinput'));
          });
        });
      });
    }

    function selectCamera(camera) {
      setIsVideoPaused(false);

      navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: camera.deviceId } }
      }).then((videoStream) => {
        setIsSwitchingVideo(false);
        video.srcObject = videoStream;
      });
    }

    setIsVideoRecording(true);

    getAllCameras().then((items) => {
      cameras = items;

      video.addEventListener('switch', () => {
        setIsSwitchingVideo(true);

        video.srcObject.getTracks().forEach((track) => {
          track.stop();
        });

        selectCamera(nextCamera());
      });

      selectCamera(nextCamera());

      setHasMoreThanOneVideo(items.length > 1);
    }).catch(() => {
      setIsVideoRecording(false);
    });
  }

  function stopVideoRecording(send) {
    const video = document.querySelector('#wwc-video');

    setIsVideoRecording(false);

    if (send) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);

      fetch(canvas.toDataURL('image/png')).then(res => res.blob()).then((blob) => {
        const file = new File([blob], 'camera.png', blob);

        setSelectedFiles([file]);
      });
    }

    video.srcObject.getTracks().forEach((track) => {
      track.stop();
    });


    video.parentNode.removeChild(video);
  }

  function startRecording() {
    setIsAudioRecording(true);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
    }).catch(() => {
      setIsAudioRecording(false);
    });
  }

  function stopRecording(send) {
    clearTimeout(updateAudioTimer);

    setIsAudioRecording(false);

    mediaRecorder.addEventListener('stop', () => {
      if (send) {
        audioToMp3Blob(audioChunks, (mp3Blob) => {
          const file = new File([mp3Blob], 'recording.mp3', { type: 'audio/mp3' });
          setSelectedFiles([file]);
        });
      }
    });

    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }

  function sendMessageInterceptor(...args) {
    if (isAudioRecording) {
      event.preventDefault();
      stopRecording(true);
    } else if (isVideoRecording) {
      event.preventDefault();

      if (!isVideoPaused) {
        document.querySelector('#wwc-video').pause();
        setIsVideoPaused(true);
      } else {
        stopVideoRecording(true);
      }
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

      <section className="push-camera__container" style={{ display: isVideoRecording ? null : 'none' }} />

      <form ref={formEl} className="push-sender" onSubmit={sendMessageInterceptor}>
        {isAudioRecording ? (
          <section className="audio-recording">
            <img src={iconCancel} alt="Cancel" className="audio-recording__cancel-button" onClick={() => stopRecording(false)} />

            {audioTimer}

            <img src={iconIndicator} alt="Indicator" className="audio-recording__indicator-icon" />
          </section>
        ) : null}

        {isVideoRecording ? (
          <section className="audio-recording">
            <img src={iconCancel} alt="Cancel" className="audio-recording__cancel-button" onClick={() => stopVideoRecording(false)} />
          </section>
        ) : null}

        {isAudioRecording || isVideoRecording ? null : (
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
          disabled={disabledInput || userInput === 'disable' || !isConnected}
          autoFocus={!isScreenHeightSmall}
          autoComplete="off"
          onKeyDown={event => handlePressed(event)}
          style={{ display: isAudioRecording || isVideoRecording ? 'none' : null }}
        />

        {isVideoRecording && hasMoreThanOneVideo ? (
          <img src={iconCameraSwitch} alt="Camera Switch" className="push-camera-switch" onClick={switchCamera} />
        ) : null}

        {(userInput === '' || userInput === null || userInput === undefined) && (!isAudioRecording && !isVideoRecording) ? (
          <section className="camera-and-microphone__container">
            <img src={iconPhotoCamera} alt="Camera" className="camera-and-microphone__camera" onClick={startVideoRecording} />

            <img src={iconMic} alt="Microphone" className="camera-and-microphone__microphone" onClick={startRecording} />
          </section>
        ) : suggestionsConfig.automaticSend && !isAudioRecording && !isVideoRecording ? null : (
          <button type="submit" className="push-send" disabled={!isConnected}>
            <img src={isVideoRecording && !isVideoPaused ? iconPhotoCameraLight : iconSend} className="push-send-icon" alt="send message" />
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
  selectedSuggestion: PropTypes.string,
  isConnected: PropTypes.bool
};

export default connect(mapStateToProps, mapDispatchToProps)(Sender);
