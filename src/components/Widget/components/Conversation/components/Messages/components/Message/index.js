import React, { PureComponent } from 'react';
import ReactMarkdown from 'react-markdown';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { PROP_TYPES } from 'constants';
import DocViewer from '../docViewer';
import './styles.scss';
import { getAttachmentType } from '../../../../../../../../utils/messages';

function transformImages(text) {
  const anyURLRegEx = /(?<!\]\()\bhttps?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)\b/g;
  
  return text.replace(anyURLRegEx, (url) => {
    try {
      const { pathname } = new URL(url);

      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
      const isImage = imageExtensions.some(extension => pathname.endsWith(extension));

      if (isImage) {
        return `![${pathname}](${url})`;
      }

      return url;
    } catch (error) {
      return url;
    }
  });
}

class Message extends PureComponent {
  render() {
    const { docViewer, linkTarget } = this.props;
    const sender = this.props.message.get('sender');
    const text = this.props.message.get('text');
    const customCss = this.props.message.get('customCss') && this.props.message.get('customCss').toJS();

    if (customCss && customCss.style === 'class') {
      customCss.css = customCss.css.replace(/^\./, '');
    }
    return (
      <div
        className={
          sender === 'response' && customCss && customCss.style === 'class'
            ? `push-response ${customCss.css}`
            : `push-${sender}`
        }
        style={{
          cssText:
            sender === 'response' && customCss && customCss.style === 'custom'
              ? customCss.css
              : undefined
        }}
      >
        <div className="push-message-text">
          {sender === 'response' ? (
            <ReactMarkdown
              className={'push-markdown'}
              source={this.props.transformURLsIntoImages ? transformImages(text) : text}
              linkTarget={(url) => {
                if (!url.startsWith('mailto') && !url.startsWith('javascript')) return '_blank';
                return undefined;
              }}
              transformLinkUri={null}
              renderers={{
                link: props => docViewer && getAttachmentType(props.href) === 'file' ? (
                  <DocViewer message={this.props.message}>{props.children}</DocViewer>
                ) : (
                  <a href={props.href} target={linkTarget || '_blank'} rel="noopener noreferrer">
                    {props.children}
                  </a>
                ),
                image: props => (
                  <img
                    {...props}
                    className="push-markdown-image"
                    style={{
                      cursor: 'pointer',
                    }}
                    onClick={() => window.open(props.src, '_blank')}
                  />
                )
              }}
            />
          ) : (
            text
          )}
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  message: PROP_TYPES.MESSAGE,
  docViewer: PropTypes.bool,
  linkTarget: PropTypes.string,
  transformURLsIntoImages: PropTypes.bool
};

Message.defaultTypes = {
  docViewer: false,
  linkTarget: '_blank'
};

const mapStateToProps = state => ({
  linkTarget: state.metadata.get('linkTarget'),
  docViewer: state.behavior.get('docViewer')
});

export default connect(mapStateToProps)(Message);
