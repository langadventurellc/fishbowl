/**
 * Hook for navigation state and actions.
 *
 * Provides convenient access to active section/sub-tab state and navigation actions.
 * Includes computed property for back navigation capability.
 *
 * @returns Object containing navigation state and actions
 *
 * @example
 * ```typescript
 * function NavigationPanel() {
 *   const {
 *     activeSection,
 *     setActiveSection,
 *     canNavigateBack,
 *     navigateBack
 *   } = useSettingsNavigation();
 *
 *   return (
 *     <div>
 *       <span>Current: {activeSection}</span>
 *       {canNavigateBack && (
 *         <button onClick={navigateBack}>Back</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @module stores/settings/useSettingsNavigation
 */

import { useSettingsModalStore } from "./settingsStore";
import { useShallow } from "zustand/react/shallow";

export function useSettingsNavigation() {
  return useSettingsModalStore(
    useShallow((state) => ({
      activeSection: state.activeSection,
      activeSubTab: state.activeSubTab,
      setActiveSection: state.setActiveSection,
      setActiveSubTab: state.setActiveSubTab,
      navigateBack: state.navigateBack,
      navigationHistory: state.navigationHistory,
      canNavigateBack: state.navigationHistory.length > 1,
    })),
  );
}
