import type { AgentConfiguration } from "./AgentConfiguration";

/**
 * Agent template interface for Templates tab.
 * Pre-configured agent templates that users can instantiate.
 *
 * @module types/settings/AgentTemplate
 */
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  configuration: AgentConfiguration;
}
