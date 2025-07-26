/**
 * Valid sub-tab identifiers for sections that support sub-navigation.
 *
 * Currently used by the Agents, Personalities, and Roles sections which
 * have multiple tabs within each main section.
 *
 * @module stores/settings/settingsSubTab
 */
export type SettingsSubTab =
  | "library"
  | "templates"
  | "defaults"
  | "saved"
  | "create-new"
  | "predefined"
  | "custom"
  | null;
