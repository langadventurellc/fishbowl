/**
 * @fileoverview Unified Configuration Request Type
 *
 * Type definition for complete configuration data that spans multiple services.
 */

import type { AgentCreateRequest } from "../agent";
import type { PersonalityConfiguration } from "../personality";
import type { CustomRole } from "../role";

/**
 * Unified Configuration Request
 * Complete configuration data that spans multiple services
 */
export interface UnifiedConfigurationRequest {
  personality: PersonalityConfiguration;
  role: CustomRole;
  agent: AgentCreateRequest;
}
