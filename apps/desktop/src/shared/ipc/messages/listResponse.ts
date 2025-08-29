import type { Message } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Messages list operation response type
 *
 * Returns the list of messages for the requested conversation
 */
export interface MessagesListResponse extends IPCResponse<Message[]> {}
