import './styles.scss';

import { setUserInput } from 'actions';
import arrowUp from 'assets/chevrons-up.svg';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { setSelectedSuggestion } from '../../../../../../../../store/actions';

class SuggestionsList extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { isExpanded: false, interval: [0, 1] };
    this.suggestionsListRef = React.createRef();
  }

  expandSuggestions = () => {
    this.setState({isExpanded: true, interval: [1, 5]})
  }

  handleClick = (suggestion) => {
    const { setUserInput, setSelectedSuggestion } = this.props;
    setUserInput(suggestion)
    setSelectedSuggestion(suggestion)
    this.setState({isExpanded: false, interval: [0, 1]})
  }

  componentDidUpdate(prevProps) {
    if (this.props.suggestions !== prevProps.suggestions) {
      this.setState({ interval: [0, 1], isExpanded: false })
    }
  }

  render() {
    const suggestions = this.props.suggestions;

    return (
      <div className={`push-suggestions-container ${this.state.isExpanded ? 'no-border' : ''}`}>
        <div className={`push-suggestions-list`} ref={this.suggestionsListRef}>
          {suggestions.map((suggestion, index) => {
            const highLighted = suggestion.replaceAll(this.props.userInput, `<b>${this.props.userInput}</b>`)
            if (index >= this.state.interval[0] && index < this.state.interval[1]) {
              return <div
                key={index}
                className={`push-suggestion ${this.state.isExpanded ? '' : 'no-border'}`}
                onClick={() => this.handleClick(suggestion)}
                dangerouslySetInnerHTML={{ __html: highLighted }}>
              </div>
            }
          })}
        </div>
        {(this.state.isExpanded || (suggestions.length <= 1)) ? '' : 
          <button className={`push-suggestions-button right`} onClick={() => this.expandSuggestions()} type="button">
            <img src={arrowUp} className="push-expand-icon" alt="send message" />
          </button>
        }
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
