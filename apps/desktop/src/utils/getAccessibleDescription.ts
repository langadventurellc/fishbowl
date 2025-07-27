/**
 * Gets accessible description for settings sections
 * Provides contextual descriptions for screen reader users
 */
export function getAccessibleDescription(
  section: string,
  subTab?: string,
): string {
  const descriptions: Record<string, string> = {
    general: "Configure general application preferences and basic settings",
    "api-keys": "Manage API keys for AI model providers and external services",
    appearance: "Customize visual appearance, themes, and display preferences",
    agents: "Configure AI agents, their roles, and behavior settings",
    personalities:
      "Define and manage AI agent personality traits and characteristics",
    roles: "Set up agent roles and their specific responsibilities",
    advanced: "Access advanced configuration options and developer settings",
  };

  const baseDescription =
    descriptions[section] || `Configure ${section} settings`;

  if (subTab) {
    return `${baseDescription}, ${subTab} subsection`;
  }

  return baseDescription;
}
