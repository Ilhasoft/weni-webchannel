import React,{useRef} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setUserInput } from 'actions';
import send from 'assets/send_button.svg';
import send2 from 'assets/send_button2.svg';
import './style.scss';


const Sender = ({ sendMessage, inputTextFieldHint, disabledInput, userInput, setUserInput }) => {
  const inputEl = useRef()
  
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
});

const mapDispatchToProps = dispatch => ({
  setUserInput: (value) => dispatch(setUserInput(value)),
});

Sender.propTypes = {
  sendMessage: PropTypes.func,
  inputTextFieldHint: PropTypes.string,
  disabledInput: PropTypes.bool,
  userInput: PropTypes.string,
  setUserInput: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sender);
