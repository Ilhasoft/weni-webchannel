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

export function addUserMessage(text, id, timestamp) {
  store.dispatch(actions.addUserMessage(text, id, timestamp));
}

export function addUserImage(file, id, timestamp) {
  store.dispatch(actions.addUserImage(file, id, timestamp));
}

export function addUserVideo(file, id, timestamp) {
  store.dispatch(actions.addUserVideo(file, id, timestamp));
}

export function addUserAudio(file, id, timestamp) {
  store.dispatch(actions.addUserAudio(file, id, timestamp));
}

export function addUserDocument(file, id, timestamp) {
  store.dispatch(actions.addUserDocument(file, id, timestamp));
}

export function emitUserMessage(message, id, timestamp) {
  store.dispatch(actions.emitUserMessage(message, id, timestamp));
}

export function addResponseMessage(text, id, timestamp) {
  store.dispatch(actions.addResponseMessage(text, id, timestamp));
}

export function addLinkSnippet(link, id, timestamp) {
  store.dispatch(actions.addLinkSnippet(link, id, timestamp));
}

export function addVideoSnippet(video, id, timestamp) {
  store.dispatch(actions.addVideoSnippet(video, id, timestamp));
}

export function addAudioSnippet(audio, id, timestamp) {
  store.dispatch(actions.addAudioSnippet(audio, id, timestamp));
}

export function addImageSnippet(image, id, timestamp) {
  store.dispatch(actions.addImageSnippet(image, id, timestamp));
}

export function addDocumentSnippet(image, id, timestamp) {
  store.dispatch(actions.addDocumentSnippet(image, id, timestamp));
}

export function addQuickReply(quickReply, id, timestamp) {
  store.dispatch(actions.addQuickReply(quickReply, id, timestamp));
}

export function setQuickReply(id, title, timestamp) {
  store.dispatch(actions.setQuickReply(id, title, timestamp));
}

export function insertUserMessage(idx, text, id, timestamp) {
  store.dispatch(actions.insertUserMessage(idx, text, id, timestamp));
}

export function insertUserImage(idx, text, id, timestamp) {
  store.dispatch(actions.insertUserImage(idx, text, id, timestamp));
}

export function insertUserVideo(idx, text, id, timestamp) {
  store.dispatch(actions.insertUserVideo(idx, text, id, timestamp));
}

export function insertUserAudio(idx, text, id, timestamp) {
  store.dispatch(actions.insertUserAudio(idx, text, id, timestamp));
}

export function insertUserDocument(idx, text, id, timestamp) {
  store.dispatch(actions.insertUserDocument(idx, text, id, timestamp));
}

export function insertResponseMessage(idx, text, id, timestamp) {
  store.dispatch(actions.insertResponseMessage(idx, text, id, timestamp));
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

export function deleteMessage(index) {
  store.dispatch(actions.deleteMessage(index));
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

export function scheduleContactTimeout(contactTimeout) {
  store.dispatch(actions.scheduleContactTimeout(contactTimeout));
}

export function clearScheduledContactTimeout() {
  store.dispatch(actions.clearScheduledContactTimeout());
}
