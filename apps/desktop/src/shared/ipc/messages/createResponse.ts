import type { Message } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Messages create operation response type
 *
 * Returns the created message data
 */
export interface MessagesCreateResponse extends IPCResponse<Message> {}
