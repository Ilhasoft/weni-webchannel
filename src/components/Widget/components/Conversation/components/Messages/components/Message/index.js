import React, { PureComponent } from 'react';
import ReactMarkdown from 'react-markdown';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { xml2js } from 'xml-js';

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

const xmlNotation = '<?xml version="1.0" encoding="UTF-8" ?>';

function getCarouselHTML(rawText) {
  let finalHTML = '';

  const [text, xml] = String(rawText).split(xmlNotation);

  const xmlObject = xml2js(`<root>${xml}</root>`);

  if (text.trim() !== '') {
    finalHTML += `${text}<br />`;
  }

  const elements = xmlObject.elements.find(element => element.name === 'root').elements.filter(element => element.name === 'carousel-item').map(element => element.elements).map(elements => elements.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.elements.find(element => element.type === 'text').text }), {}));

  finalHTML += `
    <section class="push-markdown-carousel">
      ${elements.map(element => `
        <section class="push-markdown-carousel__item">
          <a class="push-markdown-carousel__item__link" href="${element.product_link}" target="_blank">
            <img class="push-markdown-carousel__item__image" src="${element.image.match(/\(.+\)/)[0].slice(1, -1)}" />
          </a>

          <a class="push-markdown-carousel__item__link" href="${element.product_link}" target="_blank">
            <h3 class="push-markdown-carousel__item__name" title="${element.name}">${element.name}</h3>
          </a>

          <a class="push-markdown-carousel__item__link" href="${element.product_link}" target="_blank">
            <p class="push-markdown-carousel__item__description" title="${element.description}">${element.description}</p>
          </a>

          <p class="push-markdown-carousel__item__price">${element.price.replace(/(\(.+\))/, '<s>$1</s>')}</p>
        </section>`
      ).join('\n')}
    </section>
  `;

  return finalHTML;
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
            text.includes('```html') ? (
              <div className={'push-markdown-carousel-container'} dangerouslySetInnerHTML={{ __html: text.slice(('```html').length) }} />
            ) : text.includes(xmlNotation) ? (
              <div className={'push-markdown-carousel-container'} dangerouslySetInnerHTML={{ __html: getCarouselHTML(text) }} />
            ) : (
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
          )) : (
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
