/**
 * Combined store interface including both state and actions.
 *
 * This type represents the complete Zustand store API that components
 * will interact with. Combines all state properties with all action methods.
 *
 * @module stores/settings/settingsModalStore
 */

import type { SettingsModalState } from "./settingsModalState";
import type { SettingsModalActions } from "./settingsModalActions";

export type SettingsModalStore = SettingsModalState & SettingsModalActions;
