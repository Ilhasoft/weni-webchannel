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

  handleOpenModal() {
    const message = this.props.message.toJS();
    if (message.src.endsWith('.pdf')) {
      this.setState({ openedModal: true });
      return;
    }
    window.open(message.src, '_blank');
  }

  handleCloseModal() {
    this.setState({ openedModal: false, iFrameLoading: true });
  }

  // TODO: Handle only PDF preview
  render() {
    const message = this.props.message.toJS();
    const iframeSrc = getIframeLink(message.src);
    return (
      <div className="push-document">
        <b className="push-document-title">
          {message.title}
        </b>
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
      </div>
    );
  }
}

DocViewer.propTypes = {
  message: PROP_TYPES.DOCREPLY
};

export default DocViewer;
