import type { IPCResponse } from "../base";

/**
 * LLM config refresh cache operation response type
 * Returns success status without data payload
 */
export interface LlmConfigRefreshCacheResponse extends IPCResponse<void> {}
