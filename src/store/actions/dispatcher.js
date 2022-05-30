import { store } from '../../index';
import * as actions from './index';

export function isOpen() {
  return store.dispatch(actions.getOpenState());
}

export function isVisible() {
  return store.dispatch(actions.getVisibleState());
}

export function initialize() {
  store.dispatch(actions.initialize());
}

export function reload() {
  store.dispatch(actions.reload());
}

export function connect() {
  store.dispatch(actions.connectServer());
}

export function disconnect() {
  store.dispatch(actions.disconnectServer());
}

export function addUserMessage(text) {
  store.dispatch(actions.addUserMessage(text));
}

export function addUserImage(file) {
  store.dispatch(actions.addUserImage(file));
}

export function addUserVideo(file) {
  store.dispatch(actions.addUserVideo(file));
}

export function addUserAudio(file) {
  store.dispatch(actions.addUserAudio(file));
}

export function addUserDocument(file) {
  store.dispatch(actions.addUserDocument(file));
}

export function emitUserMessage(message) {
  store.dispatch(actions.emitUserMessage(message));
}

export function addResponseMessage(text) {
  store.dispatch(actions.addResponseMessage(text));
}

export function addLinkSnippet(link) {
  store.dispatch(actions.addLinkSnippet(link));
}

export function addVideoSnippet(video) {
  store.dispatch(actions.addVideoSnippet(video));
}

export function addAudioSnippet(audio) {
  store.dispatch(actions.addAudioSnippet(audio));
}

export function addImageSnippet(image) {
  store.dispatch(actions.addImageSnippet(image));
}

export function addDocumentSnippet(image) {
  store.dispatch(actions.addDocumentSnippet(image));
}

export function addQuickReply(quickReply) {
  store.dispatch(actions.addQuickReply(quickReply));
}

export function setQuickReply(id, title) {
  store.dispatch(actions.setQuickReply(id, title));
}

export function insertUserMessage(id, text) {
  store.dispatch(actions.insertUserMessage(id, text));
}

export function renderCustomComponent(component, props, showAvatar = false) {
  store.dispatch(actions.renderCustomComponent(component, props, showAvatar));
}

export function openChat() {
  const connectedListener = () => {
    const behaviorState = store.getState().behavior;
    if (behaviorState.get('connected', false)) {
      store.dispatch(actions.openChat());
      return;
    }

    setTimeout(connectedListener, 100);
  };

  connectedListener();
}

export function closeChat() {
  store.dispatch(actions.closeChat());
}

export function toggleChat() {
  store.dispatch(actions.toggleChat());
}

export function showChat() {
  store.dispatch(actions.showChat());
}

export function hideChat() {
  store.dispatch(actions.hideChat());
}

export function toggleFullScreen() {
  store.dispatch(actions.toggleFullScreen());
}

export function toggleInputDisabled() {
  store.dispatch(actions.toggleInputDisabled());
}

export function changeInputFieldHint(hint) {
  store.dispatch(actions.changeInputFieldHint(hint));
}

export function dropMessages() {
  store.dispatch(actions.dropMessages());
}

export function pullSession() {
  store.dispatch(actions.pullSession());
}

export function newUnreadMessage() {
  store.dispatch(actions.newUnreadMessage());
}

export function send(payload, text = '', customStore) {
  const message = {
    type: 'message',
    message: {
      type: 'text',
      text: payload
    }
  };

  if (customStore) {
    customStore.dispatch(actions.emitUserMessage(message));
    if (text !== '') customStore.dispatch(actions.addUserMessage(text));
    return;
  }
  store.dispatch(actions.emitUserMessage(message));
  if (text !== '') store.dispatch(actions.addUserMessage(text));
}

export function clear() {
  store.dispatch(actions.clear());
}

export function getSuggestions(input, repos, suggestionsUrl, suggestionsLanguage, excluded) {
  store.dispatch(
    actions.getSuggestions(input, repos, suggestionsUrl, suggestionsLanguage, excluded)
  );
}

export function setSuggestions(suggestions) {
  store.dispatch(actions.setSuggestions(suggestions));
}

export function setSelectedSuggestion(suggestion) {
  store.dispatch(actions.setSelectedSuggestion(suggestion));
}

export function saveSessionToken(token) {
  if (token) {
    store.dispatch(actions.saveSessionToken(token));
  }
}

export function setOpenSessionMessage(state) {
  if (state === true) {
    store.dispatch(actions.openSessionMessage());
  } else {
    store.dispatch(actions.closeSessionMessage());
  }
}

export function setInitPayload(initPayload) {
  store.dispatch(actions.setInitPayload(initPayload));
}

export function sendInitialPayload() {
  store.dispatch(actions.sendInitialPayload());
}

export function setSessionId(sessionId) {
  store.dispatch(actions.setSessionId(sessionId));
}
