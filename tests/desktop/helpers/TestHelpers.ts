/**
 * Test helpers interface for type safety in settings modal tests
 */
export interface TestHelpers {
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  isSettingsModalOpen: () => boolean;
}
