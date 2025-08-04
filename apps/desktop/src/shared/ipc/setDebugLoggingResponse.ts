import type { IPCResponse } from "./base";

/**
 * Response type for SET_DEBUG_LOGGING operation
 *
 * Represents the response returned after attempting to set the debug logging level.
 * Contains only success/error status as no data payload is needed.
 */
export type SettingsSetDebugLoggingResponse = IPCResponse<void>;
