import { Map } from 'immutable';
import { MESSAGES_TYPES, MESSAGE_SENDER } from 'constants';
import { URL_REGEX } from '../constants';

export function createComponentMessage(component, props, showAvatar) {
  return Map({
    type: MESSAGES_TYPES.CUSTOM_COMPONENT,
    component,
    props,
    sender: MESSAGE_SENDER.RESPONSE,
    showAvatar
  });
}

export function buildQuickReplies(quickReplies) {
  if (!quickReplies) {
    return undefined;
  }

  return quickReplies.map(reply => ({
    title: reply,
    payload: reply
  }));
}

export function getUrlExtension(url) {
  return url.split(/[#?]/)[0].split('.').pop().trim();
}

export function formatMessage(message) {
  const urls = message.text.match(URL_REGEX);

  const messages = [];

  if (urls) {
    const attachments = urls.map((url) => {
      message.text = message.text.replace(url, '');

      const attachmentType = getUrlExtension(url);
      return {
        attachmentType,
        url
      };
    });

    attachments.forEach((attachment) => {
      messages.push(attachment);
    });
  }

  messages.unshift(message);

  return messages;
}
