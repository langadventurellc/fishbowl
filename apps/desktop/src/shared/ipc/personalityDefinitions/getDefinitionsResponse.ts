import type { PersonalityDefinitions } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * Get personality definitions operation response type
 *
 * Returns the loaded personality definitions or error
 */
export interface GetDefinitionsResponse
  extends IPCResponse<PersonalityDefinitions> {}
