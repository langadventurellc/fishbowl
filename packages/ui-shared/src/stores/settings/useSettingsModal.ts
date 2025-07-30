/**
 * Hook for modal lifecycle state and actions.
 *
 * Provides convenient access to modal open/close state and actions.
 * Uses focused selector to minimize re-renders when only modal state changes.
 *
 * @returns Object containing modal state and lifecycle actions
 *
 * @example
 * ```typescript
 * function SettingsButton() {
 *   const { isOpen, openModal, closeModal } = useSettingsModal();
 *
 *   return (
 *     <button onClick={() => openModal('api-keys')}>
 *       {isOpen ? 'Close' : 'Open'} Settings
 *     </button>
 *   );
 * }
 * ```
 *
 * @module stores/settings/useSettingsModal
 */

import { useSettingsModalStore } from "./settingsStore";
import { useShallow } from "zustand/react/shallow";

export function useSettingsModal() {
  return useSettingsModalStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      openModal: state.openModal,
      closeModal: state.closeModal,
    })),
  );
}
