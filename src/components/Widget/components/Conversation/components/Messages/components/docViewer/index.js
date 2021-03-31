import React, { Component } from 'react';

import Portal from 'utils/portal';
import './style.scss';
import { PROP_TYPES } from '../../../../../../../../constants';

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

  // TODO: Handle only PDF preview
  render() {
    const message = this.props.message.toJS();
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
                <object className="push-doc-viewer-modal-iframe" data={message.src} type="application/pdf">
                  <iframe
                    title="viewer"
                    onLoad={this.iframeLoaded}
                    onError={this.updateIframeSrc}
                    ref={(iframe) => {
                      this.iframe = iframe;
                    }}
                  />
                </object>
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
