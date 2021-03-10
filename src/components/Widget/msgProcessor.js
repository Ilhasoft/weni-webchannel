/* eslint-disable no-use-before-define */

export function isSnippet(message) {
  return Object.keys(message).includes('attachment')
    && Object.keys(message.attachment).includes('type')
    && message.attachment.type === 'template'
    && Object.keys(message.attachment).includes('payload')
    && Object.keys(message.attachment.payload).indexOf('template_type') >= 0
    && message.attachment.payload.template_type === 'generic'
    && Object.keys(message.attachment.payload).indexOf('elements') >= 0
    && message.attachment.payload.elements.length > 0;
}

export function isVideo(message) {
  return Object.keys(message).includes('attachmentType')
    && ['mp4', 'flv', 'ogv', 'ogg', 'avi', 'mov', 'wmv', 'mpg', 'mpeg', 'm4v']
      .includes(message.attachmentType);
}

export function isImage(message) {
  return Object.keys(message).includes('attachmentType')
    && ['gif', 'jpg', 'jpeg', 'png', 'svg'].includes(message.attachmentType);
}

export function isDocument(message) {
  return Object.keys(message).includes('attachmentType')
    && ['pdf'].includes(message.attachmentType);
}

export function isText(message) {
  return Object.keys(message).length === 2
    && Object.keys(message).includes('text')
    && Object.keys(message).includes('quick_replies')
    && message.quick_replies === undefined;
}

export function isQR(message) {
  return Object.keys(message).length === 2
    && Object.keys(message).includes('text')
    && Object.keys(message).includes('quick_replies')
    && message.quick_replies !== undefined;
}
