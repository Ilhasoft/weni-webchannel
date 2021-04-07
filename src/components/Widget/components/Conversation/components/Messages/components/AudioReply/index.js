import React, { PureComponent } from 'react';
import { PROP_TYPES } from 'constants';

import './styles.scss';

class AudioReply extends PureComponent {
  render() {
    const { title, audio } = this.props.message.toJS();

    return (
      <div className="push-audio" >
        <b className="push-audio-title">
          {title}
        </b>
        <audio controls>
          <source src={audio} />
        </audio>
      </div >
    );
  }
}

AudioReply.propTypes = {
  message: PROP_TYPES.AUDIOREPLY
};

export default AudioReply;
