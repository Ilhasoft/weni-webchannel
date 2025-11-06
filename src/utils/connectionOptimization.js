import { getLocalSession } from "../store/reducers/helper";
import { SESSION_NAME } from "../constants";

const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

const channelUuids = new Set();

channelUuids.add('8f88bef2-c9ec-45da-a027-b9007f856485');

const isChannelUuidOptimized = (channelUuid) => {
  return channelUuids.has(channelUuid);
};

export const connectionOptimization = {
  isWidgetVisible: ({ props }) => {
    const useConnectionOptimization = props.useConnectionOptimization || isChannelUuidOptimized(props.channelUuid);

    if (useConnectionOptimization) {
      return props.isChatVisible;
    }
    
    return props.isChatVisible && !(props.hideWhenNotConnected && !props.connected);
  },

  shouldConnectSocketWhenWidgetIsInitialized: ({ props }) => {    
    if (!isChannelUuidOptimized(props.channelUuid) && !props.useConnectionOptimization) {
      return true;
    }

    try {
      const storage = props.params.storage === 'session' ? sessionStorage : localStorage;
      const chatSession = getLocalSession(storage, SESSION_NAME);

      const lastMessage = chatSession && chatSession.conversation && chatSession.conversation.at(-1);

      if (!lastMessage && props.initPayload) {
        return true;
      }
      
      const lastMessageTimestampInSeconds = lastMessage.timestamp;
      const nowInSeconds = new Date().getTime() / 1e3;

      const diff = nowInSeconds - lastMessageTimestampInSeconds;

      return diff < TWENTY_FOUR_HOURS_IN_SECONDS;
    } catch (error) {
      return false;
    }
  },
};
