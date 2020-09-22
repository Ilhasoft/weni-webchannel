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
    this.state = { hasOverflow: false, endScroll: false, startScroll: true, scrollDistance: 300 };
    this.suggestionsListRef = React.createRef();
  }

  hasOverflow = (element) => {
    return element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth
  }

  componentDidMount() {
    const element = this.suggestionsListRef.current;
    let hasOverflow = this.hasOverflow(element);
    this.setState({ hasOverflow })
    // the + 10 is to add the margin from the prev and next buttons since offsetWidth doesn't include that
    this.setState({ scrollDistance: element.offsetWidth + 10 })
  }

  // direction is +1/-1 and represents right or left
  scroll = (direction) => {
    const element = this.suggestionsListRef.current;
    // the + 10 is to add the margin from the prev and next buttons since offsetWidth doesn't include that
    element.scrollLeft += (direction * this.state.scrollDistance) + 10;
    this.setState({ scrollDistance: element.offsetWidth + 10 })
  }

  handleScroll = () => {
    const element = this.suggestionsListRef.current;

    // if the right arrow should be displayed
    if (element.scrollWidth - element.scrollLeft === element.offsetWidth) {
      this.setState({ endScroll: true })
    } else {
      this.setState({ endScroll: false })
    }

    // if the left arrow should be displayed
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
      let hasOverflow = this.hasOverflow(element);
      this.setState({ hasOverflow })
    }
  }

  render() {
    const suggestions = this.props.suggestions;

    return (
      <div className={`push-suggestions-container ${this.state.hasOverflow ? 'push-suggestions-overflow' : ''}`}>
        <button className={`push-suggestions-button left ${((this.state.startScroll && this.state.hasOverflow) || !this.state.hasOverflow) ? 'push-hide' : ''}`} onClick={() => this.scroll(-1)} type="button">
          <img src={leftImage} className="push-next-icon" alt="send message" />
        </button>
        <div className={`push-suggestions-list ${this.state.hasOverflow ? 'push-suggestions-overflow' : ''}`} onScroll={this.handleScroll} ref={this.suggestionsListRef}>
          {suggestions.map((suggestion, index) => {
            const highLighted = suggestion.replaceAll(this.props.userInput, `<b>${this.props.userInput}</b>`)
            return <div
              key={index}
              className='push-suggestion'
              onClick={() => this.handleClick(suggestion)}
              dangerouslySetInnerHTML={{ __html: highLighted }}>
            </div>
          })}
        </div>
        <button className={`push-suggestions-button right ${((this.state.endScroll && this.state.hasOverflow) || !this.state.hasOverflow) ? 'push-hide' : ''}`} onClick={() => this.scroll(+1)} type="button">
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
