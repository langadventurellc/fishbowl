import type { PersistedSettingsData } from "./PersistedSettingsData";

/**
 * Settings update type excluding metadata fields
 */
export type PersistedSettingsUpdate = Partial<
  Omit<PersistedSettingsData, "schemaVersion" | "lastUpdated">
>;
