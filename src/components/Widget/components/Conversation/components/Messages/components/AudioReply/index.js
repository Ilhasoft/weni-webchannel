import React, { PureComponent } from 'react';
import { PROP_TYPES } from 'constants';

import './styles.scss';

class AudioReply extends PureComponent {
  render() {
    console.log('dentro do component: ', this.props);
    return (
      <div className="push-audio" >
        <audio controls>
          <source src={this.props.message.get('audio')} />
        </audio>
      </div >
    );
  }
}

AudioReply.propTypes = {
  message: PROP_TYPES.AUDIOREPLY
};

export default AudioReply;
