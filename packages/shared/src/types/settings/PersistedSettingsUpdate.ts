import type { PersistedSettings } from "./PersistedSettings";

/**
 * Settings update type excluding metadata fields
 */
export type PersistedSettingsUpdate = Partial<
  Omit<PersistedSettings, "schemaVersion" | "lastUpdated">
>;
