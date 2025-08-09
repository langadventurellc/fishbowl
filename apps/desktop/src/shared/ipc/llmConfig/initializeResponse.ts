import type { IPCResponse } from "../base";

/**
 * LLM config initialize operation response type
 * Returns success status without data payload
 */
export interface LlmConfigInitializeResponse extends IPCResponse<void> {}
