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
          <video controls className="push-videoFrame" >
            <source src={this.props.message.get('video')} />
          </video>
        </div>
      </div>
    );
  }
}

VidReply.propTypes = {
  message: PROP_TYPES.VIDREPLY
};

export default VidReply;
