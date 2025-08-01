
import * as actions from './actionTypes';

export function initialize() {
  return {
    type: actions.INITIALIZE
  };
}

export function connectServer() {
  return {
    type: actions.CONNECT
  };
}

export function disconnectServer() {
  return {
    type: actions.DISCONNECT
  };
}

export function getOpenState() {
  return {
    type: actions.GET_OPEN_STATE
  };
}

export function getVisibleState() {
  return {
    type: actions.GET_VISIBLE_STATE
  };
}

export function showChat() {
  return {
    type: actions.SHOW_CHAT
  };
}

export function hideChat() {
  return {
    type: actions.HIDE_CHAT
  };
}

export function toggleChat() {
  return {
    type: actions.TOGGLE_CHAT
  };
}

export function openChat(customPayload) {
  return {
    type: actions.OPEN_CHAT,
    customPayload
  };
}

export function closeChat() {
  return {
    type: actions.CLOSE_CHAT
  };
}

export function toggleFullScreen() {
  return {
    type: actions.TOGGLE_FULLSCREEN
  };
}

export function toggleInputDisabled() {
  return {
    type: actions.TOGGLE_INPUT_DISABLED
  };
}

export function changeInputFieldHint(hint) {
  return {
    type: actions.CHANGE_INPUT_FIELD_HINT,
    hint
  };
}

export function addUserMessage(text, id, timestamp) {
  return {
    type: actions.ADD_NEW_USER_MESSAGE,
    text,
    id,
    timestamp
  };
}

export function addUserImage(file, id, timestamp) {
  return {
    type: actions.ADD_NEW_USER_IMAGE,
    image: {
      title: file.name,
      image: file.url
    },
    id,
    timestamp
  };
}

export function addUserVideo(file, id, timestamp) {
  return {
    type: actions.ADD_NEW_USER_VIDEO,
    video: {
      title: file.name,
      video: file.url
    },
    id,
    timestamp
  };
}

export function addUserAudio(file, id, timestamp) {
  return {
    type: actions.ADD_NEW_USER_AUDIO,
    audio: {
      title: file.name,
      audio: file.url
    },
    id,
    timestamp
  };
}

export function addUserDocument(file, id, timestamp) {
  return {
    type: actions.ADD_NEW_USER_DOCUMENT,
    document: {
      title: file.name,
      src: file.url
    },
    id,
    timestamp
  };
}

export function emitUserMessage(message) {
  return {
    type: actions.EMIT_NEW_USER_MESSAGE,
    message
  };
}

export function emitMessageIfFirst(payload, text = null) {
  return {
    type: actions.EMIT_MESSAGE_IF_FIRST,
    payload,
    text
  };
}

export function addResponseMessage(text, id, timestamp) {
  return {
    type: actions.ADD_NEW_RESPONSE_MESSAGE,
    text,
    id,
    timestamp
  };
}

export function addLinkSnippet(link, id, timestamp) {
  return {
    type: actions.ADD_NEW_LINK_SNIPPET,
    link,
    id,
    timestamp
  };
}

export function addVideoSnippet(video, id, timestamp) {
  return {
    type: actions.ADD_NEW_VIDEO_VIDREPLY,
    video,
    id,
    timestamp
  };
}

export function addAudioSnippet(audio, id, timestamp) {
  return {
    type: actions.ADD_NEW_AUDIO_AUDIOREPLY,
    audio,
    id,
    timestamp
  };
}

export function addImageSnippet(image, id, timestamp) {
  return {
    type: actions.ADD_NEW_IMAGE_IMGREPLY,
    image,
    id,
    timestamp
  };
}

export function addDocumentSnippet(document, id, timestamp) {
  return {
    type: actions.ADD_NEW_DOCUMENT_DOCREPLY,
    document,
    id,
    timestamp
  };
}

export function addQuickReply(quickReply, id, timestamp) {
  return {
    type: actions.ADD_QUICK_REPLY,
    quickReply,
    id,
    timestamp
  };
}

export function setQuickReply(id, title, timestamp) {
  return {
    type: actions.SET_QUICK_REPLY,
    id,
    title,
    timestamp
  };
}

export function insertUserMessage(index, text, id, timestamp) {
  return {
    type: actions.INSERT_NEW_USER_MESSAGE,
    index,
    text,
    id,
    timestamp
  };
}

export function insertUserImage(index, file, id, timestamp) {
  return {
    type: actions.INSERT_NEW_USER_IMAGE,
    index,
    image: {
      title: file.name,
      image: file.url
    },
    id,
    timestamp
  };
}

export function insertUserVideo(index, file, id, timestamp) {
  return {
    type: actions.INSERT_NEW_USER_VIDEO,
    index,
    video: {
      title: file.name,
      video: file.url
    },
    id,
    timestamp
  };
}

export function insertUserAudio(index, file, id, timestamp) {
  return {
    type: actions.INSERT_NEW_USER_AUDIO,
    index,
    audio: {
      title: file.name,
      audio: file.url
    },
    id,
    timestamp
  };
}

export function insertUserDocument(index, file, id, timestamp) {
  return {
    type: actions.INSERT_NEW_USER_DOCUMENT,
    index,
    document: {
      title: file.name,
      src: file.url
    },
    id,
    timestamp
  };
}

export function insertResponseMessage(index, text, id, timestamp) {
  return {
    type: actions.INSERT_NEW_RESPONSE_MESSAGE,
    index,
    text,
    id,
    timestamp
  };
}

export function insertResponseImage(index, file, id, timestamp) {
  return {
    type: actions.INSERT_NEW_IMAGE_IMGREPLY,
    index,
    image: {
      title: file.name,
      image: file.url
    },
    id,
    timestamp
  };
}

export function insertResponseVideo(index, file, id, timestamp) {
  return {
    type: actions.INSERT_NEW_VIDEO_VIDREPLY,
    index,
    video: {
      title: file.name,
      video: file.url
    },
    id,
    timestamp
  };
}

export function insertResponseAudio(index, file, id, timestamp) {
  return {
    type: actions.INSERT_NEW_AUDIO_AUDIOREPLY,
    index,
    audio: {
      title: file.name,
      audio: file.url
    },
    id,
    timestamp
  };
}

export function insertResponseDocument(index, file, id, timestamp) {
  return {
    type: actions.INSERT_NEW_DOCUMENT_DOCREPLY,
    index,
    document: {
      title: file.name,
      src: file.url
    },
    id,
    timestamp
  };
}

export function renderCustomComponent(component, props, showAvatar) {
  return {
    type: actions.ADD_COMPONENT_MESSAGE,
    component,
    props,
    showAvatar
  };
}

export function dropMessages() {
  return {
    type: actions.DROP_MESSAGES
  };
}

export function deleteMessage(index) {
  return {
    type: actions.DELETE_MESSAGE,
    index
  };
}

export function pullSession(sessionType) {
  return {
    type: actions.PULL_SESSION,
    sessionType
  };
}

export function newUnreadMessage() {
  return {
    type: actions.NEW_UNREAD_MESSAGE
  };
}

export function triggerMessageDelayed(messageDelayed) {
  return {
    type: actions.TRIGGER_MESSAGE_DELAY,
    messageDelayed
  };
}

export function showTooltip(visible) {
  return {
    type: actions.SHOW_TOOLTIP,
    visible
  };
}

export function triggerTooltipSent(payloadSent) {
  return {
    type: actions.TRIGGER_TOOLTIP_SENT,
    payloadSent
  };
}

export function clearMetadata() {
  return {
    type: actions.CLEAR_METADATA
  };
}

export function setLinkTarget(target) {
  return {
    type: actions.SET_LINK_TARGET,
    target
  };
}

export function getSuggestions(
  userInputState,
  repos,
  suggestionsUrl,
  suggestionsLanguage,
  excluded
) {
  return {
    type: actions.GET_SUGGESTIONS,
    userInputState,
    repos,
    suggestionsUrl,
    suggestionsLanguage,
    excluded
  };
}

export function setSuggestions(suggestions) {
  return {
    type: actions.SET_SUGGESTIONS,
    suggestions
  };
}

export function setSelectedSuggestion(selectedSuggestion) {
  return {
    type: actions.SET_SELECTED_SUGGESTION,
    selectedSuggestion
  };
}

export function setUserInput(userInputState) {
  return {
    type: actions.SET_USER_INPUT,
    userInputState
  };
}

export function setPageChangeCallbacks(pageChangeCallbacks) {
  return {
    type: actions.SET_PAGECHANGE_CALLBACKS,
    pageChangeCallbacks
  };
}

export function setDomHighlight(domHighlight) {
  return {
    type: actions.SET_DOM_HIGHLIGHT,
    domHighlight
  };
}

export function hintText(hint) {
  return {
    type: actions.SET_HINT_TEXT,
    hint
  };
}

export function changeOldUrl(url) {
  return {
    type: actions.SET_OLD_URL,
    url
  };
}

export function evalUrl(url) {
  return {
    type: actions.EVAL_URL,
    url
  };
}

export function setCustomCss(customCss) {
  return {
    type: actions.SET_CUSTOM_CSS,
    customCss
  };
}

export function reload() {
  return {
    type: actions.RELOAD
  };
}

export function clear() {
  return {
    type: actions.CLEAR
  };
}

export function openSessionMessage() {
  return {
    type: actions.OPEN_SESSION_MESSAGE
  };
}

export function closeSessionMessage() {
  return {
    type: actions.CLOSE_SESSION_MESSAGE
  };
}

export function setInitPayload(initPayload) {
  return {
    type: actions.SET_INIT_PAYLOAD,
    initPayload
  };
}

export function sendInitialPayload() {
  return {
    type: actions.SEND_INITIAL_PAYLOAD
  };
}

export function setSessionId(sessionId) {
  return {
    type: actions.SET_SESSION_ID,
    sessionId
  };
}

export function setSessionIdTransaction(transactionStatus) {
  return {
    type: actions.SET_SESSION_ID_TRANSACTION,
    transactionStatus
  };
}

export function getHistory(limit, page) {
  return {
    type: actions.GET_HISTORY,
    limit,
    page
  };
}

export function setMessagesScroll(value) {
  return {
    type: actions.SET_MESSAGES_SCROLL,
    value
  };
}

export function setContext(context) {
  return {
    type: actions.SET_CONTEXT,
    context
  };
}

export function startTyping() {
  return {
    type: actions.START_TYPING
  };
}

export function stopTyping() {
  return {
    type: actions.STOP_TYPING
  };
}
