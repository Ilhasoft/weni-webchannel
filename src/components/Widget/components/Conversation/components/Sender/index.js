import React,{useRef} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setUserInput } from 'actions';
import send from 'assets/send_button.svg';
import send2 from 'assets/send_button2.svg';
import './style.scss';


const Sender = ({ sendMessage, inputTextFieldHint, disabledInput, userInput, setUserInput }) => {
  const inputEl = useRef()
  const focusInput = () => {
    setTimeout(()=> {
        inputEl.current.focus()
    }, 100)
  }
  
  return (userInput === 'hide' ? <div /> : (
  <form className="sender" onSubmit={sendMessage}>
    <input type="text" className="new-message" ref={inputEl} name="message" onBlur={() => focusInput()} value={userInput} onChange={(value) => setUserInput(value.target.value)} placeholder={inputTextFieldHint} disabled={disabledInput || userInput === 'disable'} autoFocus autoComplete="off" />
    {(userInput === '' || userInput === null) &&
        <button type="submit" className="send">
          <img src={send} className="send-icon" alt="send message" />
        </button>}
        {userInput !== '' &&
            <button type="submit" className="send">
              <img src={send2} className="send-icon" alt="send message" />
            </button>}
    {React.createElement('a', {href:"https://push.al", className:"poweredby-container"}, "Powered by push.al")}
  </form>
))};
const mapStateToProps = state => ({
  inputTextFieldHint: state.behavior.get('inputTextFieldHint'),
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
