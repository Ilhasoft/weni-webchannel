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

export function emitUserMessage(text) {
  store.dispatch(actions.emitUserMessage(text));
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
  store.dispatch(actions.openChat());
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

export function send(playload, text = '', customStore) {
  if (customStore) {
    customStore.dispatch(actions.emitUserMessage(playload));
    if (text !== '') customStore.dispatch(actions.addUserMessage(text));
    return;
  }
  store.dispatch(actions.emitUserMessage(playload));
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
