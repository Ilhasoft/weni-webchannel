import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

export const VALID_FILE_TYPE = '.jpeg,.jpg,.png,.svg,.pdf,.docx,.xls,.xlsx,.mp3,.wav,.mp4,.mov';

export const SESSION_NAME = 'chat_session';

// eslint-disable-next-line no-useless-escape
export const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/g;

export const MESSAGE_SENDER = {
  CLIENT: 'client',
  RESPONSE: 'response'
};

export const MESSAGES_TYPES = {
  TEXT: 'text',
  SNIPPET: {
    LINK: 'snippet'
  },
  VIDREPLY: {
    VIDEO: 'vidreply'
  },
  AUDIOREPLY: {
    AUDIO: 'audioreply'
  },
  IMGREPLY: {
    IMAGE: 'imgreply'
  },
  DOCREPLY: {
    DOCUMENT: 'docreply'
  },
  QUICK_REPLY: 'quickreply',
  CUSTOM_COMPONENT: 'component'
};

export const NEXT_MESSAGE = 'mrbot_next_message';

export const PROP_TYPES = {

  MESSAGE: ImmutablePropTypes.contains({
    type: PropTypes.oneOf([
      MESSAGES_TYPES.TEXT,
      MESSAGES_TYPES.QUICK_REPLY,
      MESSAGES_TYPES.SNIPPET.LINK,
      MESSAGES_TYPES.IMGREPLY.IMAGE,
      MESSAGES_TYPES.VIDREPLY.VIDEO,
      MESSAGES_TYPES.DOCREPLY.DOCUMENT
    ]),
    id: PropTypes.string,
    text: PropTypes.string,
    sender: PropTypes.oneOf([
      MESSAGE_SENDER.CLIENT,
      MESSAGE_SENDER.RESPONSE
    ])
  }),

  SNIPPET: ImmutablePropTypes.contains({
    type: PropTypes.oneOf([
      MESSAGES_TYPES.TEXT,
      MESSAGES_TYPES.SNIPPET.LINK
    ]),
    id: PropTypes.number,
    title: PropTypes.string,
    link: PropTypes.string,
    content: PropTypes.string,
    target: PropTypes.string,
    sender: PropTypes.oneOf([
      MESSAGE_SENDER.CLIENT,
      MESSAGE_SENDER.RESPONSE
    ])
  }),

  VIDREPLY: ImmutablePropTypes.contains({
    type: PropTypes.oneOf([
      MESSAGES_TYPES.TEXT,
      MESSAGES_TYPES.VIDREPLY.VIDEO
    ]),
    id: PropTypes.number,
    title: PropTypes.string,
    src: PropTypes.string,
    sender: PropTypes.oneOf([
      MESSAGE_SENDER.CLIENT,
      MESSAGE_SENDER.RESPONSE
    ])
  }),

  AUDIOREPLY: ImmutablePropTypes.contains({
    type: PropTypes.oneOf([
      MESSAGES_TYPES.TEXT,
      MESSAGES_TYPES.AUDIOREPLY.AUDIO
    ]),
    id: PropTypes.number,
    src: PropTypes.string,
    sender: PropTypes.oneOf([
      MESSAGE_SENDER.CLIENT,
      MESSAGE_SENDER.RESPONSE
    ])
  }),

  IMGREPLY: ImmutablePropTypes.contains({
    type: PropTypes.oneOf([
      MESSAGES_TYPES.TEXT,
      MESSAGES_TYPES.IMGREPLY.IMAGE
    ]),
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    title: PropTypes.string,
    src: PropTypes.string,
    sender: PropTypes.oneOf([
      MESSAGE_SENDER.CLIENT,
      MESSAGE_SENDER.RESPONSE
    ])
  }),

  DOCREPLY: ImmutablePropTypes.contains({
    type: PropTypes.oneOf([
      MESSAGES_TYPES.TEXT,
      MESSAGES_TYPES.DOCREPLY.DOCUMENT
    ]),
    id: PropTypes.number,
    src: PropTypes.string,
    sender: PropTypes.oneOf([
      MESSAGE_SENDER.CLIENT,
      MESSAGE_SENDER.RESPONSE
    ])
  }),

  QUICK_REPLY: ImmutablePropTypes.contains({
    type: PropTypes.oneOf([
      MESSAGES_TYPES.QUICK_REPLY
    ]),
    id: PropTypes.number,
    text: PropTypes.string,
    hint: PropTypes.string,
    quick_replies: ImmutablePropTypes.listOf(
      PropTypes.shape({
        title: PropTypes.string,
        payload: PropTypes.string
      })),
    sender: PropTypes.oneOf([
      MESSAGE_SENDER.CLIENT,
      MESSAGE_SENDER.RESPONSE
    ]),
    chooseReply: PropTypes.func,
    getChosenReply: PropTypes.func,
    toggleInputDisabled: PropTypes.func,
    inputState: PropTypes.bool,
    chosenReply: PropTypes.string
  })

};
