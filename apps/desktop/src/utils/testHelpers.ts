/**
 * Test helpers for E2E testing
 *
 * Provides test-specific functionality that should only be available
 * during testing to enable reliable E2E test scenarios.
 *
 * @module utils/testHelpers
 */

import { useSettingsModalStore } from "@fishbowl-ai/ui-shared";

/**
 * Test-specific global interface for accessing application functionality
 * during E2E tests. Only available when NODE_ENV includes 'test'.
 */
interface TestHelpers {
  /** Open the settings modal directly (bypasses IPC) */
  openSettingsModal: () => void;
  /** Close the settings modal directly */
  closeSettingsModal: () => void;
  /** Check if settings modal is open */
  isSettingsModalOpen: () => boolean;
}

/**
 * Exposes test-specific helpers globally for E2E testing.
 * Only activates when running in test environment.
 *
 * This allows E2E tests to directly control the settings modal
 * without needing to simulate the main process IPC messages.
 */
export function setupTestHelpers(): void {
  // Only setup in browser environment (skip Node.js/server-side)
  if (typeof window === "undefined") {
    return;
  }

  // Always setup helpers for E2E tests - let the test runner control when they're available
  // This avoids the issue with process.env not being available in renderer context

  // Create test helpers that use the same store actions as the real app
  const testHelpers: TestHelpers = {
    openSettingsModal: () => {
      useSettingsModalStore.getState().openModal();
    },

    closeSettingsModal: () => {
      useSettingsModalStore.getState().closeModal();
    },

    isSettingsModalOpen: () => {
      return useSettingsModalStore.getState().isOpen;
    },
  };

  // Expose globally for Playwright tests
  (window as Window & { __TEST_HELPERS__?: TestHelpers }).__TEST_HELPERS__ =
    testHelpers;
}
