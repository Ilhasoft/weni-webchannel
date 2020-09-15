import './styles.scss';

import { setUserInput } from 'actions';
import leftImage from 'assets/arrow-left.svg';
import rightImage from 'assets/arrow-right.svg';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { setSelectedSuggestion } from '../../../../../../../../store/actions';


class SuggestionsList extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { hasOverflow: false, endScroll: false, startScroll: true };
    this.suggestionsListRef = React.createRef();
    this.scrollDistance = 250;
  }

  componentDidMount() {
    const element = this.suggestionsListRef.current;
    let hasOverflow = element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth;
    this.setState({ hasOverflow })
  }

  left = () => {
    this.suggestionsListRef.current.scrollLeft -= this.scrollDistance;
  };
  right = () => {
    this.suggestionsListRef.current.scrollLeft += this.scrollDistance;
  };

  handleScroll = () => {
    const element = this.suggestionsListRef.current;
    if (element.scrollWidth - element.scrollLeft === element.offsetWidth) {
      this.setState({ endScroll: true })
    } else {
      this.setState({ endScroll: false })
    }

    if (element.scrollLeft > 0) {
      this.setState({ startScroll: false })
    } else {
      this.setState({ startScroll: true })
    }
  }

  handleClick = (suggestion) => {
    const { setUserInput, setSelectedSuggestion } = this.props;
    setUserInput(suggestion)
    setSelectedSuggestion(suggestion)
  }

  componentDidUpdate(prevProps) {
    if (this.props.suggestions !== prevProps.suggestions) {
      const element = this.suggestionsListRef.current;
      element.scrollLeft = 0;
      let hasOverflow = element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth;
      this.setState({ hasOverflow })
    }
  }

  render() {
    const suggestions = this.props.suggestions;

    return (
      <div className={`push-suggestions-container ${this.state.hasOverflow ? 'push-suggestions-overflow' : ''}`}>
        <button className={`push-suggestions-button left ${((this.state.startScroll && this.state.hasOverflow) || !this.state.hasOverflow) ? 'push-hide' : ''}`} onClick={this.left} type="button">
          <img src={leftImage} className="push-next-icon" alt="send message" />
        </button>
        <div className={`push-suggestions-list ${this.state.hasOverflow ? 'push-suggestions-overflow' : ''}`} onScroll={this.handleScroll} ref={this.suggestionsListRef}>
          {suggestions.map(suggestion => {
            return <div className='push-suggestion' onClick={() => this.handleClick(suggestion)}>{suggestion}</div>
          })}
        </div>
        <button className={`push-suggestions-button right ${((this.state.endScroll && this.state.hasOverflow) || !this.state.hasOverflow) ? 'push-hide' : ''}`} onClick={this.right} type="button">
          <img src={rightImage} className="push-next-icon" alt="send message" />
        </button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userInput: state.metadata.get('userInput'),
});

const mapDispatchToProps = dispatch => ({
  setUserInput: (value) => dispatch(setUserInput(value)),
  setSelectedSuggestion: (value) => dispatch(setSelectedSuggestion(value)),
});

SuggestionsList.propTypes = {
  suggestions: PropTypes.array
};

export default connect(mapStateToProps, mapDispatchToProps)(SuggestionsList);
