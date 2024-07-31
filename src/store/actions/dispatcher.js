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

export function addUserMessage(text, id) {
  store.dispatch(actions.addUserMessage(text, id));
}

export function addUserImage(file, id) {
  store.dispatch(actions.addUserImage(file, id));
}

export function addUserVideo(file, id) {
  store.dispatch(actions.addUserVideo(file, id));
}

export function addUserAudio(file, id) {
  store.dispatch(actions.addUserAudio(file, id));
}

export function addUserDocument(file, id) {
  store.dispatch(actions.addUserDocument(file, id));
}

export function emitUserMessage(message, id) {
  store.dispatch(actions.emitUserMessage(message, id));
}

export function addResponseMessage(text, id) {
  store.dispatch(actions.addResponseMessage(text, id));
}

export function addLinkSnippet(link, id) {
  store.dispatch(actions.addLinkSnippet(link, id));
}

export function addVideoSnippet(video, id) {
  store.dispatch(actions.addVideoSnippet(video, id));
}

export function addAudioSnippet(audio, id) {
  store.dispatch(actions.addAudioSnippet(audio, id));
}

export function addImageSnippet(image, id) {
  store.dispatch(actions.addImageSnippet(image, id));
}

export function addDocumentSnippet(image) {
  store.dispatch(actions.addDocumentSnippet(image));
}

export function addQuickReply(quickReply, id) {
  store.dispatch(actions.addQuickReply(quickReply, id));
}

export function setQuickReply(id, title) {
  store.dispatch(actions.setQuickReply(id, title));
}

export function insertUserMessage(idx, text, id) {
  console.log('AQUI', id);
  store.dispatch(actions.insertUserMessage(idx, text, id));
}

export function insertUserImage(idx, text, id) {
  store.dispatch(actions.insertUserImage(idx, text, id));
}

export function insertUserVideo(idx, text, id) {
  store.dispatch(actions.insertUserVideo(idx, text, id));
}

export function insertUserAudio(idx, text, id) {
  store.dispatch(actions.insertUserAudio(idx, text, id));
}

export function insertUserDocument(idx, text, id) {
  store.dispatch(actions.insertUserDocument(idx, text, id));
}

export function insertResponseMessage(idx, text, id) {
  store.dispatch(actions.insertResponseMessage(idx, text, id));
}

export function renderCustomComponent(component, props, showAvatar = false) {
  store.dispatch(actions.renderCustomComponent(component, props, showAvatar));
}

export function openChat(customPayload) {
  const connectedListener = () => {
    const behaviorState = store.getState().behavior;
    if (behaviorState.get('connected', false)) {
      store.dispatch(actions.openChat(customPayload));
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

export function pullSession(sessionType) {
  store.dispatch(actions.pullSession(sessionType));
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

export function getHistory(limit, page) {
  store.dispatch(actions.getHistory(limit, page));
}

export function setMessagesScroll(value) {
  store.dispatch(actions.setMessagesScroll(value));
}
