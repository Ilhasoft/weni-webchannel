import { closeSessionMessage } from 'actions';

export function socketOnClose() {
  console.log('%cSOCKET ONCLOSE', 'color: #F71963; font-weight: bold;', new Date());

  this.setState({ isConnected: false });

  if (!this.canReconnect) {
    return;
  }

  if (this.reconnectionTimeout) {
    clearTimeout(this.reconnectionTimeout);
  }

  this.reconnectionTimeout = setTimeout(() => {
    this.attemptingReconnection = true;
    clearInterval(this.pingIntervalId);
    this.props.dispatch(closeSessionMessage());
    this.initializeWidget(true);
  }, this.reconnectImmediate ? 1000 : 5000);

  this.reconnectImmediate = false;
}
