import React, { PureComponent } from 'react';
import { PROP_TYPES } from 'constants';

import './styles.scss';

class Snippet extends PureComponent {
  render() {
    return (
      <div className="push-snippet">
        <b className="push-snippet-title">
          { this.props.message.get('title') }
        </b>
        <div className="push-snippet-details">
          <a href={this.props.message.get('link')} target={this.props.message.get('target')} className="push-link">
            { this.props.message.get('content') }
          </a>
        </div>
      </div>
    );
  }
}

Snippet.propTypes = {
  message: PROP_TYPES.SNIPPET
};

export default Snippet;
