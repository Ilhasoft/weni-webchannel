import { Map, fromJS, List } from 'immutable';
import { MESSAGES_TYPES, MESSAGE_SENDER, SESSION_NAME } from 'constants';

import { Audio, Video, Image, Message, Snippet, QuickReply, DocViewer } from 'messagesComponents';
import * as actionTypes from '../actions/actionTypes';

export function createNewMessage(text, sender, id, timestamp) {
  return Map({
    type: MESSAGES_TYPES.TEXT,
    component: Message,
    text,
    sender,
    showAvatar: sender === MESSAGE_SENDER.RESPONSE,
    timestamp,
    id
  });
}

export function createLinkSnippet(link, sender, id) {
  return Map({
    type: MESSAGES_TYPES.SNIPPET.LINK,
    component: Snippet,
    title: link.title,
    link: link.link,
    content: link.content,
    target: link.target || '_blank',
    sender,
    showAvatar: true,
    timestamp: new Date().getTime(),
    id
  });
}

export function createVideoSnippet(video, sender, id, timestamp) {
  return Map({
    type: MESSAGES_TYPES.VIDREPLY.VIDEO,
    component: Video,
    title: video.title,
    video: video.video,
    sender,
    showAvatar: true,
    timestamp,
    id
  });
}

export function createAudioSnippet(audio, sender, id) {
  return Map({
    type: MESSAGES_TYPES.AUDIOREPLY.AUDIO,
    component: Audio,
    title: audio.title,
    audio: audio.audio,
    sender,
    showAvatar: true,
    timestamp: new Date().getTime(),
    id
  });
}

export function createImageSnippet(image, sender, id) {
  return Map({
    type: MESSAGES_TYPES.IMGREPLY.IMAGE,
    component: Image,
    title: image.title,
    image: image.image,
    sender,
    showAvatar: true,
    timestamp: new Date().getTime(),
    id
  });
}

export function createDocumentSnippet(document, sender, id) {
  return Map({
    type: MESSAGES_TYPES.DOCREPLY.DOCUMENT,
    component: DocViewer,
    title: document.title,
    src: document.src,
    sender,
    showAvatar: true,
    timestamp: new Date().getTime(),
    id
  });
}

export function createQuickReply(quickReply, sender, id) {
  return Map({
    type: MESSAGES_TYPES.QUICK_REPLY,
    component: QuickReply,
    quick_replies: fromJS(quickReply.quick_replies),
    sender,
    showAvatar: true,
    chosenReply: null,
    timestamp: new Date().getTime(),
    id
  });
}

export function createComponentMessage(component, props, showAvatar, id) {
  return Map({
    type: MESSAGES_TYPES.CUSTOM_COMPONENT,
    component,
    props,
    sender: MESSAGE_SENDER.RESPONSE,
    showAvatar,
    timestamp: new Date().getTime(),
    id
  });
}

export function getLocalSession(storage, key) {
  // Attempt to get local session from storage
  const cachedSession = storage.getItem(key);
  let session = null;
  if (cachedSession) {
    // Found existing session in storage
    const parsedSession = JSON.parse(cachedSession);
    // Format conversation from array of object to immutable Map for use by messages components
    const formattedConversation = parsedSession.conversation
      ? parsedSession.conversation
      : [];
    // Check if params is undefined
    const formattedParams = parsedSession.params
      ? parsedSession.params
      : {};
    const formattedMetadata = parsedSession.metadata
      ? parsedSession.metadata
      : {};
    // Create a new session to return
    session = {
      ...parsedSession,
      conversation: formattedConversation,
      params: formattedParams,
      metadata: formattedMetadata
    };
  }
  // Returns a formatted session object if any found, otherwise return undefined
  return session;
}

export function storeLocalSession(storage, key, sid) {
  // Attempt to store session id to local storage
  const cachedSession = storage.getItem(key);
  let session;
  if (cachedSession) {
    // Found exisiting session in storage
    const parsedSession = JSON.parse(cachedSession);
    session = {
      ...parsedSession,
      session_id: sid
    };
  } else {
    // No existing local session, create a new empty session with only session_id
    session = {
      session_id: sid
    };
  }
  // Store updated session to storage
  storage.setItem(key, JSON.stringify(session));
}

export const clearMessages = storage => () => {
  const localSession = getLocalSession(storage, SESSION_NAME);
  const newSession = {
    // Since immutable List is not a native JS object, store conversation as array
    ...localSession,
    conversation: [],
    lastUpdate: Date.now()
  };
  storage.setItem(SESSION_NAME, JSON.stringify(newSession));
  return new List([]);
};

export const storeMessageTo = storage => (conversation) => {
  // Store a conversation List to storage
  const localSession = getLocalSession(storage, SESSION_NAME);
  const newSession = {
    // Since immutable List is not a native JS object, store conversation as array
    ...localSession,
    conversation: conversation.toJS(),
    lastUpdate: Date.now()
  };
  storage.setItem(SESSION_NAME, JSON.stringify(newSession));
  return conversation;
};

export const storeParamsTo = storage => (params) => {
  // Store a params List to storage
  const localSession = getLocalSession(storage, SESSION_NAME);
  const newSession = {
    // Since immutable Map is not a native JS object, store conversation as array
    ...localSession,
    params: params.toJS(),
    lastUpdate: Date.now()
  };
  storage.setItem(SESSION_NAME, JSON.stringify(newSession));
  return params;
};


export const storeMetadataTo = storage => (metadata) => {
  // Store a params List to storage
  const localSession = getLocalSession(storage, SESSION_NAME);
  const newSession = {
    // Since immutable Map is not a native JS object, store conversation as array
    ...localSession,
    metadata: metadata.toJS(),
    lastUpdate: Date.now()
  };
  storage.setItem(SESSION_NAME, JSON.stringify(newSession));
  return metadata;
};

export function sendInitPayload(action, initPayload) {
  const message = {
    type: 'message',
    message: {
      type: 'text',
      text: initPayload
    }
  };
  action.asyncDispatch({ type: actionTypes.EMIT_NEW_USER_MESSAGE, message });
}
