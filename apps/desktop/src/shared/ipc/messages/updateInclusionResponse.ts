import type { Message } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Messages update inclusion operation response type
 *
 * Returns the updated message data
 */
export interface MessagesUpdateInclusionResponse extends IPCResponse<Message> {}
