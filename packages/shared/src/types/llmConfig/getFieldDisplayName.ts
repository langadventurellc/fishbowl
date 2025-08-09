/**
 * Converts technical field names to user-friendly names
 */
export function getFieldDisplayName(field: string): string {
  const displayNames: Record<string, string> = {
    customName: "Configuration Name",
    provider: "Provider",
    apiKey: "API Key",
    baseUrl: "Base URL",
    useAuthHeader: "Use Auth Header",
    root: "Configuration",
  };

  // Handle empty field names
  if (!field) {
    return "Configuration";
  }

  // Handle nested paths
  const parts = field.split(".");
  const baseName = parts[0];

  if (baseName && displayNames[baseName]) {
    if (parts.length > 1) {
      return `${displayNames[baseName]} (${parts.slice(1).join(".")})`;
    }
    return displayNames[baseName];
  }

  return field;
}
