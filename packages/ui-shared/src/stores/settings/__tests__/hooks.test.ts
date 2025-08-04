/**
 * Unit tests for custom React hooks for settings store integration.
 *
 * Tests hook rendering, state subscriptions, selector optimization,
 * TypeScript type compatibility, and re-rendering behavior for efficiency.
 *
 * @module stores/settings/__tests__/hooks.test
 */

import { renderHook, act } from "@testing-library/react";
import { useSettingsModalStore } from "../settingsStore";
import {
  useSettingsModal,
  useSettingsNavigation,
  useSettingsActions,
  useActiveSection,
  useActiveSubTab,
  useUnsavedChanges,
  useSettingsSelector,
  useNavigationState,
  useModalState,
} from "../index";
import type { SettingsSection, SettingsSubTab } from "../index";

// Mock console methods to test validation warnings
const mockConsoleWarn = jest.fn();
const mockConsoleInfo = jest.fn();

beforeEach(() => {
  // Reset store to defaults before each test
  useSettingsModalStore.getState().resetToDefaults();

  // Reset console mocks
  mockConsoleWarn.mockClear();
  mockConsoleInfo.mockClear();
  jest.spyOn(console, "warn").mockImplementation(mockConsoleWarn);
  jest.spyOn(console, "info").mockImplementation(mockConsoleInfo);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Settings Store React Hooks", () => {
  describe("useSettingsModal", () => {
    it("should render without errors", () => {
      const { result } = renderHook(() => useSettingsModal());
      expect(result.current).toBeDefined();
    });

    it("should provide modal state and actions", () => {
      const { result } = renderHook(() => useSettingsModal());

      expect(result.current).toHaveProperty("isOpen");
      expect(result.current).toHaveProperty("openModal");
      expect(result.current).toHaveProperty("closeModal");
      expect(typeof result.current.isOpen).toBe("boolean");
      expect(typeof result.current.openModal).toBe("function");
      expect(typeof result.current.closeModal).toBe("function");
    });

    it("should update when modal state changes", () => {
      const { result } = renderHook(() => useSettingsModal());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.openModal("llm-setup");
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("should have correct TypeScript types", () => {
      const { result } = renderHook(() => useSettingsModal());

      // These should compile without TypeScript errors
      const isOpen: boolean = result.current.isOpen;
      const openModal: (section?: SettingsSection) => void =
        result.current.openModal;
      const closeModal: () => void = result.current.closeModal;

      expect(typeof isOpen).toBe("boolean");
      expect(typeof openModal).toBe("function");
      expect(typeof closeModal).toBe("function");
    });
  });

  describe("useSettingsNavigation", () => {
    it("should render without errors", () => {
      const { result } = renderHook(() => useSettingsNavigation());
      expect(result.current).toBeDefined();
    });

    it("should provide navigation state and actions", () => {
      const { result } = renderHook(() => useSettingsNavigation());

      expect(result.current).toHaveProperty("activeSection");
      expect(result.current).toHaveProperty("activeSubTab");
      expect(result.current).toHaveProperty("setActiveSection");
      expect(result.current).toHaveProperty("setActiveSubTab");
      expect(result.current).toHaveProperty("navigateBack");
      expect(result.current).toHaveProperty("navigationHistory");
      expect(result.current).toHaveProperty("canNavigateBack");
    });

    it("should update when navigation state changes", () => {
      const { result } = renderHook(() => useSettingsNavigation());

      expect(result.current.activeSection).toBe("general");
      expect(result.current.canNavigateBack).toBe(false);

      act(() => {
        result.current.setActiveSection("llm-setup");
      });

      expect(result.current.activeSection).toBe("llm-setup");
      // After one navigation, history should be ["llm-setup"], length = 1, so canNavigateBack is false
      expect(result.current.canNavigateBack).toBe(false);

      act(() => {
        result.current.setActiveSection("appearance");
      });

      expect(result.current.activeSection).toBe("appearance");
      // After two navigations, history should be ["llm-setup", "appearance"], length = 2, so canNavigateBack is true
      expect(result.current.canNavigateBack).toBe(true);

      act(() => {
        result.current.navigateBack();
      });

      expect(result.current.activeSection).toBe("llm-setup");
    });

    it("should handle sub-tab navigation", () => {
      const { result } = renderHook(() => useSettingsNavigation());

      expect(result.current.activeSubTab).toBe(null);

      act(() => {
        result.current.setActiveSubTab("templates");
      });

      expect(result.current.activeSubTab).toBe("templates");
    });
  });

  describe("useSettingsActions", () => {
    it("should render without errors", () => {
      const { result } = renderHook(() => useSettingsActions());
      expect(result.current).toBeDefined();
    });

    it("should provide all store actions", () => {
      const { result } = renderHook(() => useSettingsActions());

      expect(result.current).toHaveProperty("openModal");
      expect(result.current).toHaveProperty("closeModal");
      expect(result.current).toHaveProperty("setActiveSection");
      expect(result.current).toHaveProperty("setActiveSubTab");
      expect(result.current).toHaveProperty("setUnsavedChanges");
      expect(result.current).toHaveProperty("resetToDefaults");
      expect(result.current).toHaveProperty("navigateBack");

      // All should be functions
      Object.values(result.current).forEach((action) => {
        expect(typeof action).toBe("function");
      });
    });

    it("should not re-render when state changes", () => {
      const { result, rerender } = renderHook(() => useSettingsActions());
      const initialActions = result.current;

      // Change store state
      act(() => {
        useSettingsModalStore.getState().openModal("llm-setup");
      });

      rerender();

      // Actions should be the same reference (no re-render)
      expect(result.current).toBe(initialActions);
    });
  });

  describe("useActiveSection", () => {
    it("should render without errors", () => {
      const { result } = renderHook(() => useActiveSection());
      expect(result.current).toBeDefined();
    });

    it("should return current active section", () => {
      const { result } = renderHook(() => useActiveSection());

      expect(result.current).toBe("general");

      act(() => {
        useSettingsModalStore.getState().setActiveSection("llm-setup");
      });

      expect(result.current).toBe("llm-setup");
    });

    it("should have correct TypeScript type", () => {
      const { result } = renderHook(() => useActiveSection());
      const section: SettingsSection = result.current;
      expect(typeof section).toBe("string");
    });
  });

  describe("useActiveSubTab", () => {
    it("should render without errors", () => {
      const { result } = renderHook(() => useActiveSubTab());
      expect(result.current).toBeDefined();
    });

    it("should return current active sub-tab", () => {
      const { result } = renderHook(() => useActiveSubTab());

      expect(result.current).toBe(null);

      act(() => {
        useSettingsModalStore.getState().setActiveSubTab("templates");
      });

      expect(result.current).toBe("templates");
    });

    it("should have correct TypeScript type", () => {
      const { result } = renderHook(() => useActiveSubTab());
      const subTab: SettingsSubTab = result.current;
      expect(subTab === null || typeof subTab === "string").toBe(true);
    });
  });

  describe("useUnsavedChanges", () => {
    it("should render without errors", () => {
      const { result } = renderHook(() => useUnsavedChanges());
      expect(result.current).toBeDefined();
    });

    it("should provide unsaved changes state and setter", () => {
      const { result } = renderHook(() => useUnsavedChanges());

      expect(result.current).toHaveProperty("hasUnsavedChanges");
      expect(result.current).toHaveProperty("setUnsavedChanges");
      expect(typeof result.current.hasUnsavedChanges).toBe("boolean");
      expect(typeof result.current.setUnsavedChanges).toBe("function");
    });

    it("should update when unsaved changes state changes", () => {
      const { result } = renderHook(() => useUnsavedChanges());

      expect(result.current.hasUnsavedChanges).toBe(false);

      act(() => {
        result.current.setUnsavedChanges(true);
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => {
        result.current.setUnsavedChanges(false);
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe("useSettingsSelector", () => {
    it("should render without errors", () => {
      const { result } = renderHook(() =>
        useSettingsSelector((state) => state.isOpen),
      );
      expect(result.current).toBeDefined();
    });

    it("should allow custom state selection for primitives", () => {
      const { result } = renderHook(() =>
        useSettingsSelector((state) => state.activeSection),
      );

      expect(result.current).toBe("general");

      act(() => {
        useSettingsModalStore.getState().setActiveSection("llm-setup");
      });

      expect(result.current).toBe("llm-setup");
    });

    it("should work with computed selectors", () => {
      const { result } = renderHook(() =>
        useSettingsSelector((state) => state.activeSection === "general"),
      );

      expect(result.current).toBe(true);

      act(() => {
        useSettingsModalStore.getState().setActiveSection("llm-setup");
      });

      expect(result.current).toBe(false);
    });

    it("should preserve TypeScript generics", () => {
      const { result: stringResult } = renderHook(() =>
        useSettingsSelector((state) => state.activeSection),
      );
      const { result: booleanResult } = renderHook(() =>
        useSettingsSelector((state) => state.isOpen),
      );
      const { result: numberResult } = renderHook(() =>
        useSettingsSelector((state) => state.navigationHistory.length),
      );

      const section: string = stringResult.current;
      const isOpen: boolean = booleanResult.current;
      const historyLength: number = numberResult.current;

      expect(typeof section).toBe("string");
      expect(typeof isOpen).toBe("boolean");
      expect(typeof historyLength).toBe("number");
    });
  });

  describe("useNavigationState", () => {
    it("should render without errors", () => {
      const { result } = renderHook(() => useNavigationState());
      expect(result.current).toBeDefined();
    });

    it("should provide computed navigation state", () => {
      const { result } = renderHook(() => useNavigationState());

      expect(result.current).toHaveProperty("activeSection");
      expect(result.current).toHaveProperty("activeSubTab");
      expect(result.current).toHaveProperty("canNavigateBack");
      expect(result.current).toHaveProperty("isOnDefaultSection");
      expect(result.current).toHaveProperty("navigationHistory");
    });

    it("should compute isOnDefaultSection correctly", () => {
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.isOnDefaultSection).toBe(true);

      act(() => {
        useSettingsModalStore.getState().setActiveSection("llm-setup");
      });

      expect(result.current.isOnDefaultSection).toBe(false);

      act(() => {
        useSettingsModalStore.getState().setActiveSection("general");
      });

      expect(result.current.isOnDefaultSection).toBe(true);
    });

    it("should compute canNavigateBack correctly", () => {
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canNavigateBack).toBe(false);

      act(() => {
        useSettingsModalStore.getState().setActiveSection("llm-setup");
      });

      // After one navigation, history length = 1, so canNavigateBack is false
      expect(result.current.canNavigateBack).toBe(false);

      act(() => {
        useSettingsModalStore.getState().setActiveSection("appearance");
      });

      // After two navigations, history length = 2, so canNavigateBack is true
      expect(result.current.canNavigateBack).toBe(true);
    });
  });

  describe("useModalState", () => {
    it("should render without errors", () => {
      const { result } = renderHook(() => useModalState());
      expect(result.current).toBeDefined();
    });

    it("should provide computed modal state", () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current).toHaveProperty("isOpen");
      expect(result.current).toHaveProperty("hasUnsavedChanges");
      expect(result.current).toHaveProperty("lastOpenedSection");
      expect(result.current).toHaveProperty("shouldWarnOnClose");
    });

    it("should compute shouldWarnOnClose correctly", () => {
      const { result } = renderHook(() => useModalState());

      expect(result.current.shouldWarnOnClose).toBe(false);

      // Open modal but no unsaved changes
      act(() => {
        useSettingsModalStore.getState().openModal("llm-setup");
      });

      expect(result.current.shouldWarnOnClose).toBe(false);

      // Add unsaved changes
      act(() => {
        useSettingsModalStore.getState().setUnsavedChanges(true);
      });

      expect(result.current.shouldWarnOnClose).toBe(true);

      // Close modal
      act(() => {
        useSettingsModalStore.getState().closeModal();
      });

      expect(result.current.shouldWarnOnClose).toBe(false);
    });
  });

  describe("Hook Performance and Re-rendering", () => {
    it("useActiveSection should only re-render when activeSection changes", () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useActiveSection();
      });

      expect(renderCount).toBe(1);

      // Change activeSection - should re-render
      act(() => {
        useSettingsModalStore.getState().setActiveSection("llm-setup");
      });

      expect(renderCount).toBe(2);
      expect(result.current).toBe("llm-setup");

      // Change unrelated state - should NOT re-render
      act(() => {
        useSettingsModalStore.getState().setUnsavedChanges(true);
      });

      expect(renderCount).toBe(2); // Should not increment
    });

    it("useActiveSubTab should only re-render when activeSubTab changes", () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useActiveSubTab();
      });

      expect(renderCount).toBe(1);

      // Change activeSubTab - should re-render
      act(() => {
        useSettingsModalStore.getState().setActiveSubTab("templates");
      });

      expect(renderCount).toBe(2);
      expect(result.current).toBe("templates");

      // Change unrelated state - should NOT re-render
      act(() => {
        useSettingsModalStore.getState().setUnsavedChanges(true);
      });

      expect(renderCount).toBe(2); // Should not increment
    });

    it("should demonstrate efficient state subscription patterns", () => {
      // Test that hooks with focused selectors minimize re-renders
      let modalRenderCount = 0;
      let sectionRenderCount = 0;

      const { result: modalResult } = renderHook(() => {
        modalRenderCount++;
        return useSettingsModal();
      });

      const { result: sectionResult } = renderHook(() => {
        sectionRenderCount++;
        return useActiveSection();
      });

      expect(modalRenderCount).toBe(1);
      expect(sectionRenderCount).toBe(1);

      // Change section - only section hook should re-render
      act(() => {
        useSettingsModalStore.getState().setActiveSection("llm-setup");
      });

      expect(modalRenderCount).toBe(1); // Should not re-render
      expect(sectionRenderCount).toBe(2); // Should re-render
      expect(sectionResult.current).toBe("llm-setup");

      // Open modal - only modal hook should re-render
      act(() => {
        useSettingsModalStore.getState().openModal();
      });

      expect(modalRenderCount).toBe(2); // Should re-render
      expect(sectionRenderCount).toBe(2); // Should not re-render
      expect(modalResult.current.isOpen).toBe(true);
    });
  });

  describe("Hook State Subscriptions", () => {
    it("should properly subscribe to store state changes", () => {
      const { result } = renderHook(() => useSettingsModal());

      // Verify initial subscription
      expect(result.current.isOpen).toBe(false);

      // Test subscription to state changes
      act(() => {
        useSettingsModalStore.getState().openModal("llm-setup");
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        useSettingsModalStore.getState().closeModal();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("should clean up subscriptions on unmount", () => {
      // This test ensures no memory leaks
      const { unmount } = renderHook(() => useSettingsModal());

      // Hook should be properly cleaned up without errors
      expect(() => unmount()).not.toThrow();
    });

    it("should handle rapid state changes correctly", () => {
      const { result } = renderHook(() => useNavigationState());

      // Rapidly change state multiple times
      act(() => {
        useSettingsModalStore.getState().setActiveSection("llm-setup");
        useSettingsModalStore.getState().setActiveSection("appearance");
        useSettingsModalStore.getState().setActiveSection("agents");
        useSettingsModalStore.getState().setActiveSubTab("templates");
      });

      // Should reflect final state
      expect(result.current.activeSection).toBe("agents");
      expect(result.current.activeSubTab).toBe("templates");
      expect(result.current.canNavigateBack).toBe(true);
    });
  });
});
