import { Map, fromJS } from 'immutable';
import { SESSION_NAME } from 'constants';
import * as actionTypes from '../actions/actionTypes';
import { getLocalSession, storeParamsTo, sendInitPayload, storeLocalSession } from './helper';

export default function (
  inputTextFieldHint,
  connectingText,
  storage,
  docViewer = false,
  onWidgetEvent
) {
  const initialState = Map({
    connected: false,
    initialized: false,
    isChatVisible: true,
    isChatOpen: false,
    disabledInput: true,
    docViewer,
    inputTextFieldHint,
    connectingText,
    unreadCount: 0,
    messageDelayed: false,
    oldUrl: '',
    suggestions: [],
    pageChangeCallbacks: Map(),
    openSessionMessage: false,
    token: '',
    initPayloadText: null,
    initPayloadSent: false,
    sessionIdTransaction: false,
    messagesScroll: true
  });

  return function reducer(state = initialState, action) {
    const storeParams = storeParamsTo(storage);
    switch (action.type) {
      // Each change to the redux store's behavior Map gets recorded to storage
      case actionTypes.SHOW_CHAT: {
        if (onWidgetEvent.onChatVisible) onWidgetEvent.onChatVisible();
        return storeParams(state.update('isChatVisible', () => true));
      }
      case actionTypes.HIDE_CHAT: {
        if (onWidgetEvent.onChatHidden) onWidgetEvent.onChatHidden();
        return storeParams(state.update('isChatVisible', () => false));
      }
      case actionTypes.TOGGLE_CHAT: {
        if (state.get('isChatOpen', false) && onWidgetEvent.onChatClose) {
          window.parent.postMessage({ type: 'chat-close' }, '*');
          onWidgetEvent.onChatClose();
        } else if (onWidgetEvent.onChatOpen) {
          window.parent.postMessage({ type: 'chat-open' }, '*');
          onWidgetEvent.onChatOpen();
        }

        const initPayload = state.get('initPayloadText', null);
        if (!state.get('initPayloadSent', false) && initPayload) {
          sendInitPayload(action, initPayload);
        }

        return storeParams(
          state
            .update('isChatOpen', isChatOpen => !isChatOpen)
            .set('unreadCount', 0)
            .set('initPayloadSent', true)
        );
      }
      case actionTypes.OPEN_SESSION_MESSAGE: {
        return storeParams(state.update('openSessionMessage', () => true));
      }
      case actionTypes.CLOSE_SESSION_MESSAGE: {
        return storeParams(state.update('openSessionMessage', () => false));
      }
      case actionTypes.OPEN_CHAT: {
        if (onWidgetEvent.onChatOpen) onWidgetEvent.onChatOpen();

        if (action.customPayload) {
          sendInitPayload(action, action.customPayload);
        } else {
          const initPayload = state.get('initPayloadText', null);
          if (!state.get('initPayloadSent', false) && initPayload) {
            sendInitPayload(action, initPayload);
          }
        }

        return storeParams(
          state
            .update('isChatOpen', () => true)
            .set('unreadCount', 0)
            .set('initPayloadSent', true)
        );
      }
      case actionTypes.CLOSE_CHAT: {
        if (onWidgetEvent.onChatClose) onWidgetEvent.onChatClose();
        return storeParams(state.update('isChatOpen', () => false));
      }
      case actionTypes.SEND_INITIAL_PAYLOAD: {
        const initPayload = state.get('initPayloadText', null);
        if (initPayload) {
          sendInitPayload(action, initPayload);
          return storeParams(state.set('initPayloadSent', true));
        }

        return storeParams(state.set('initPayloadSent', state.get('initPayloadSent', false)));
      }
      case actionTypes.TOGGLE_FULLSCREEN: {
        if (onWidgetEvent.onChatFullScreen) onWidgetEvent.onChatFullScreen();
        return storeParams(state.update('fullScreenMode', fullScreenMode => !fullScreenMode));
      }
      case actionTypes.TOGGLE_INPUT_DISABLED: {
        return storeParams(state.update('disabledInput', disabledInput => !disabledInput));
      }
      case actionTypes.CHANGE_INPUT_FIELD_HINT: {
        return storeParams(state.set('inputTextFieldHint', action.hint));
      }
      case actionTypes.CONNECT: {
        return storeParams(state.set('connected', true).set('disabledInput', false));
      }
      case actionTypes.DISCONNECT: {
        return storeParams(state.set('connected', false).set('disabledInput', true));
      }
      case actionTypes.TERMINATE: {
        return storeParams(state.set('initialized', false));
      }
      case actionTypes.INITIALIZE: {
        return storeParams(state.set('initialized', true));
      }
      case actionTypes.RELOAD: {
        return storeParams(state.update('initialized', initialized => !initialized));
      }
      case actionTypes.NEW_UNREAD_MESSAGE: {
        return storeParams(state.set('unreadCount', state.get('unreadCount', 0) + 1));
      }
      case actionTypes.TRIGGER_MESSAGE_DELAY: {
        return storeParams(state.set('messageDelayed', action.messageDelayed));
      }
      case actionTypes.SET_OLD_URL: {
        return storeParams(state.set('oldUrl', action.url));
      }
      case actionTypes.SET_PAGECHANGE_CALLBACKS: {
        return storeParams(state.set('pageChangeCallbacks', fromJS(action.pageChangeCallbacks)));
      }
      case actionTypes.SET_SUGGESTIONS: {
        return storeParams(state.set('suggestions', action.suggestions));
      }
      case actionTypes.SET_INIT_PAYLOAD: {
        return storeParams(state.set('initPayloadText', action.initPayload));
      }
      case actionTypes.SET_SESSION_ID_TRANSACTION: {
        return storeParams(state.set('sessionIdTransactionStatus', action.transactionStatus));
      }
      case actionTypes.SET_MESSAGES_SCROLL: {
        return storeParams(state.set('messagesScroll', action.value));
      }
      case actionTypes.SET_SESSION_ID: {
        storeLocalSession(storage, SESSION_NAME, action.sessionId);
        action.asyncDispatch({
          type: actionTypes.SET_SESSION_ID_TRANSACTION,
          transactionStatus: true
        });
        action.asyncDispatch({ type: actionTypes.TERMINATE });
        action.asyncDispatch({ type: actionTypes.INITIALIZE });
        action.asyncDispatch({
          type: actionTypes.SET_SESSION_ID_TRANSACTION,
          transactionStatus: false
        });
        return state;
      }
      case actionTypes.EVAL_URL: {
        const newUrl = action.url;
        const pageCallbacks = state.get('pageChangeCallbacks');
        const pageCallbacksJs = pageCallbacks ? pageCallbacks.toJS() : {};
        if (!pageCallbacksJs.pageChanges) return state;
        if (state.get('oldUrl') !== newUrl) {
          return storeParams(state.set('oldUrl', newUrl).set('pageChangeCallbacks', Map()));
        }
        return state;
      }

      // Pull params from storage to redux store
      case actionTypes.PULL_SESSION: {
        const localSession = getLocalSession(storage, SESSION_NAME);

        // Do not persist connected state
        const connected = state.get('connected');
        const messageDelayed = state.get('messageDelayed');
        if (localSession && localSession.params) {
          return fromJS({ ...localSession.params, connected, messageDelayed });
        }
        return state;
      }
      default:
        return state;
    }
  };
}
