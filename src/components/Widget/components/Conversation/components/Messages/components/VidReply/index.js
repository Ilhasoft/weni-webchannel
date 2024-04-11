import React, { PureComponent } from 'react';
import { PROP_TYPES } from 'constants';

import './styles.scss';

class VidReply extends PureComponent {
  renderVideo = (videoUrl) => {
    const isYoutube = videoUrl.startsWith('https://www.youtube.com/') || videoUrl.startsWith('https://youtu.be/');

    if (isYoutube) {
      let videoId;

      if (videoUrl.includes('/embed/')) {
        // handles "https://www.youtube.com/embed/dQw4w9WgXcQ?si=lw8zv2Gc7W5mpF8f"
        videoId = videoUrl.split('/embed/')[1].split('?')[0];
      } else if (videoUrl.includes('/watch?v=')) {
        // handles "https://www.youtube.com/watch?v=dQw4w9WgXcQ" even with extra parameters
        videoId = videoUrl.split('v=')[1].split('&')[0];
      } else {
        // handles "https://youtu.be/dQw4w9WgXcQ?si=lw8zv2Gc7W5mpF8f"
        videoId = videoUrl.split('/')[3].split('?')[0];
      }

      return (
        <iframe
          title="video"
          width="300"
          height="200"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <video controls className="push-videoFrame" >
        <source src={this.props.message.get('video')} />
      </video>
    );
  }

  render() {
    return (
      <div className="push-video">
        <b className="push-video-title">
          {this.props.message.get('title')}
        </b>
        <div className="push-video-details">
          {this.renderVideo(this.props.message.get('video'))}
        </div>
      </div>
    );
  }
}

VidReply.propTypes = {
  message: PROP_TYPES.VIDREPLY
};

export default VidReply;
