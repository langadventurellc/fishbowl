/**
 * Chat IPC types and constants
 *
 * Constants, types, and interface definitions for chat operations
 */

// Channel constants
export { CHAT_CHANNELS } from "./chatConstants";

// Event constants
export { CHAT_EVENTS } from "./chatEvents";

// Types
export type { ChatChannel } from "./chatChannelType";
export type { ChatEvent } from "./chatEventType";

// Event payload interfaces
export type { AgentUpdateEvent } from "./agentUpdateEvent";
export type { AllCompleteEvent } from "./allCompleteEvent";

// Request payload interfaces
export type { SendToAgentsRequest } from "./sendToAgentsRequest";
