import React, { Component } from 'react';

import Portal from 'utils/portal';
import './style.scss';
import { PROP_TYPES } from '../../../../../../../../constants';


function getIframeLink(src) {
  return `https://docs.google.com/viewer?url=${src}&embedded=true`;
}

class DocViewer extends Component {
  constructor() {
    super();
    this.state = {
      openedModal: false,
      iFrameLoading: true
    };
    this.iframeLoaded = this.iframeLoaded.bind(this);
    this.updateIframeSrc = this.updateIframeSrc.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  iframeLoaded() {
    clearInterval(this.iframeTimeoutId);
    this.setState({ iFrameLoading: false });
  }

  bindActions() {
    this.iframeLoaded = this.iframeLoaded.bind(this);
  }

  updateIframeSrc() {
    if (this.iframe) this.iframe.src = this.getIframeLink();
    else clearInterval(this.iframeTimeoutId);
  }

  handleOpenModal() {
    this.setState({ openedModal: true });
    this.iframeTimeoutId = setInterval(this.updateIframeSrc, 1000 * 4);
  }

  handleCloseModal() {
    this.setState({ openedModal: false, iFrameLoading: true });
  }

  render() {
    const message = this.props.message.toJS();
    const iframeSrc = getIframeLink(message.src);
    return (
      <span>
        <button onClick={this.handleOpenModal} className="push-doc-viewer-open-modal-link">
          View Document
        </button>
        {this.state.openedModal && (
          <Portal>
            <div className="push-doc-viewer-modal-fade" aria-hidden="true" onClick={this.handleCloseModal} />
            <div className="push-doc-viewer-modal">
              <div className="push-doc-viewer-modal-body">
                {this.state.iFrameLoading && <div className="push-doc-viewer-spinner" />}
                <iframe
                  src={iframeSrc}
                  title="viewer"
                  className="push-doc-viewer-modal-iframe"
                  onLoad={this.iframeLoaded}
                  onError={this.updateIframeSrc}
                  ref={(iframe) => {
                    this.iframe = iframe;
                  }}
                />
              </div>
              <div className="push-doc-viewer-modal-footer">
                <button type="button" className="push-doc-viewer-close-modal" onClick={this.handleCloseModal}>
                  X
                </button>
              </div>
            </div>
          </Portal>
        )}
      </span>
    );
  }
}

DocViewer.propTypes = {
  message: PROP_TYPES.DOCREPLY
};

export default DocViewer;
