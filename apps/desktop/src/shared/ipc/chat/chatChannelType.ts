import { CHAT_CHANNELS } from "./chatConstants";

/**
 * Type representing valid chat channel names
 */
export type ChatChannel = (typeof CHAT_CHANNELS)[keyof typeof CHAT_CHANNELS];
