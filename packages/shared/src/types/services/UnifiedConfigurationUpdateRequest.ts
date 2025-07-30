/**
 * @fileoverview Unified Configuration Update Request Type
 *
 * Type definition for partial configuration updates that span multiple services.
 */

import type { AgentCreateRequest } from "../agent";
import type { PersonalityConfiguration } from "../personality";
import type { CustomRole } from "../role";

/**
 * Unified Configuration Update Request
 * Partial update data that spans multiple services
 */
export interface UnifiedConfigurationUpdateRequest {
  personality?: Partial<PersonalityConfiguration>;
  role?: Partial<CustomRole>;
  agent?: Partial<AgentCreateRequest>;
}
