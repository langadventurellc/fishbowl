import type { Agent } from '../../../shared/types';

/**
 * Filtering utilities
 */

export const filterAgentsByName = (agents: Agent[], searchTerm: string): Agent[] => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return agents;

  return agents.filter(
    agent => agent.name.toLowerCase().includes(term) || agent.role.toLowerCase().includes(term),
  );
};
