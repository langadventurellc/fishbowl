import type { IPCResponse } from "../base";

/**
 * LLM models save operation response type
 *
 * Returns success status without data payload
 */
export interface LlmModelsSaveResponse extends IPCResponse<void> {}
