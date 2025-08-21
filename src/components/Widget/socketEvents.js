import { closeSessionMessage } from 'actions';

export function socketOnClose(event) {
  this.setState({ isConnected: false });

  // eslint-disable-next-line no-console
  console.log('SOCKET_ONCLOSE: Socket closed connection:', event);

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
  }, this.reconnectImmediate ? 0 : 10000);

  this.reconnectImmediate = false;
}
