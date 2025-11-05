const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

const channelUuids = new Set();

const isChannelUuidOptimized = (channelUuid) => {
  return channelUuids.has(channelUuid);
};

export const connectionOptimization = {
  isWidgetVisible: ({ props }) => {
    if (isChannelUuidOptimized(props.channelUuid)) {
      return props.isChatVisible;
    }
    
    return props.isChatVisible && !(props.hideWhenNotConnected && !props.connected);
  },

  shouldConnectSocketWhenWidgetIsInitialized: ({ props }) => {
    if (!isChannelUuidOptimized(props.channelUuid)) {
      return true;
    }

    if (props.initPayload) {
      return true;
    }

    try {
      const chatSession = JSON.parse(sessionStorage.getItem('chat_session') || localStorage.getItem('chat_session'));

      const lastMessageTimestampInSeconds = chatSession.conversation.at(-1).timestamp;
      const nowInSeconds = new Date().getTime() / 1e3;

      const diff = nowInSeconds - lastMessageTimestampInSeconds;

      return diff < TWENTY_FOUR_HOURS_IN_SECONDS;
    } catch (error) {
      return false;
    }
  },
};
