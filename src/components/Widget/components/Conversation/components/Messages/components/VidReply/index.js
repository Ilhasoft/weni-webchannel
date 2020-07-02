import React, { PureComponent } from 'react';
import { PROP_TYPES } from 'constants';

import './styles.scss';

class VidReply extends PureComponent {
  render() {
    return (
      <div className="push-video">
        <b className="push-video-title">
          { this.props.message.get('title') }
        </b>
        <div className="push-video-details">
          <iframe src={this.props.message.get('video')} className="push-videoFrame"></iframe>
        </div>
      </div>
    );
  }
}

VidReply.propTypes = {
  message: PROP_TYPES.VIDREPLY
};

export default VidReply;
