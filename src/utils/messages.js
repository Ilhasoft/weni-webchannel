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

export function getAttachmentType(fileName) {
  const ext = fileName.split('.').pop();
  if (ext) {
    // switch statement to check multiple types
    switch (ext) {
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'svg':
        return 'image';
      case 'pdf':
      case 'docx':
      case 'xls':
      case 'xlsx':
        return 'file';
      case 'mp3':
      case 'wav':
      case 'aac':
        return 'audio';
      case 'mp4':
      case 'mov':
        return 'video';
      default:
        return undefined;
    }
  }

  return undefined;
}

export function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
