import { CHAT_EVENTS } from "./chatEvents";

/**
 * Type representing valid chat event names
 */
export type ChatEvent = (typeof CHAT_EVENTS)[keyof typeof CHAT_EVENTS];
