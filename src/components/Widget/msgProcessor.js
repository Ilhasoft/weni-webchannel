const IMAGES_REGEX = /(https?:\/\/\S+(?:png|jpe?g|gif)\S*)/;
const YOUTUBE_REGEX = /(http:|https:)?\/\/(www\.)?(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/;
const GENERIC_URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function isSnippet(message) {
  return Object.keys(message).includes('attachment')
    && Object.keys(message.attachment).includes('type')
    && message.attachment.type === 'template'
    && Object.keys(message.attachment).includes('payload')
    && Object.keys(message.attachment.payload).indexOf('template_type') >= 0
    && message.attachment.payload.template_type === 'generic'
    && Object.keys(message.attachment.payload).indexOf('elements') >= 0
    && message.attachment.payload.elements.length > 0
}

export function isVideo(message) {
  return Object.keys(message).includes('attachment')
  && Object.keys(message.attachment).includes('type')
  && message.attachment.type === 'video'
}

export function isImage(message) {
  return Object.keys(message).includes('attachment')
  && Object.keys(message.attachment).includes('type')
  && message.attachment.type === 'image'
}

export function isText(message) {
  return Object.keys(message).length === 1 && Object.keys(message).includes('text');
}

export function isQR(message) {
  return Object.keys(message).length === 2
    && Object.keys(message).includes('text')
    && Object.keys(message).includes('quick_replies');
}

export function getAttachmentFromText(message) {
  if (isText(message)) {
    let imageUrl = findRegex(IMAGES_REGEX, message.text);
    if (imageUrl) {
      let title = message.text.replace(IMAGES_REGEX, '');
      return { type: 'image', payload: { title: title, src: imageUrl } }
    }

    let youtubeUrl = findRegex(YOUTUBE_REGEX, message.text);
    if (youtubeUrl) {
      let title = message.text.replace(YOUTUBE_REGEX, '');
      return { type: 'video', payload: { title: title, src: youtubeUrl } }
    }

    let genericUrl = findRegex(GENERIC_URL_REGEX, message.text);
    if (genericUrl) {
      let title = message.text.replace(GENERIC_URL_REGEX, '');
      return createTemplate(title, genericUrl);
    }
  }
  return undefined;
}

function createTemplate (title, url) {
  return { 
    type: 'template', 
    payload: { 
      template_type: 'generic', 
      elements: [ 
        { title: title, buttons: [ { title: title, url: url } ] } 
      ]
    }
  }
}

function findRegex (regex, content) {
  const source = (content).toString();
  if (source) {
      const match = regex.exec(source);
      if (match !== null) {
          return match[0];
      }
  }
  return undefined;
}