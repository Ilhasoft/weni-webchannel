/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { PureComponent } from 'react';
import { PROP_TYPES } from 'constants';
import PropTypes from 'prop-types';

import './styles.scss';

class ImgReply extends PureComponent {
  render() {
    const { params: { images: { dims = {} } = {} } } = this.props;
    const { width, height } = dims;
    // Convert map to object
    const message = this.props.message.toJS();
    const { title, image } = message;
    const customCss = this.props.message.get('customCss') && this.props.message.get('customCss').toJS();

    if (customCss && customCss.style === 'class') {
      customCss.css = customCss.css.replace(/^\./, '');
    }

    return (

      <div
        className={customCss && customCss.style === 'class' ?
          `push-image ${customCss.css}` :
          'push-image'}
        style={{ cssText: customCss && customCss.style === 'custom' ?
          customCss.css :
          undefined }}
      >
        <b className="push-image-title">
          { title }
        </b>
        <div className="push-image-details">
          <img
            alt=""
            className="push-image-frame"
            style={{ maxHeight: height, maxWidth: width }}
            src={image}
            onClick={() => window.open(image, '_blank')}
          />
        </div>
      </div>
    );
  }
}

ImgReply.propTypes = {
  message: PROP_TYPES.IMGREPLY,
  params: PropTypes.shape({})
};

ImgReply.defaultProps = {
  params: {}
};

export default ImgReply;
