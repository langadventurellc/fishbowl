/**
 * Unit tests for useElectronIPC hook.
 *
 * Tests IPC integration with settings modal store, including proper cleanup,
 * error handling, and graceful degradation in non-Electron environments.
 *
 * @module hooks/__tests__/useElectronIPC.test
 */

import { useSettingsModal } from "@fishbowl-ai/ui-shared";
import { renderHook } from "@testing-library/react";
import { useElectronIPC } from "../useElectronIPC";

// Mock the shared package hook
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useSettingsModal: jest.fn(),
}));

const mockUseSettingsModal = useSettingsModal as jest.MockedFunction<
  typeof useSettingsModal
>;

// Mock electron API
const mockOnOpenSettings = jest.fn();
const mockCleanup = jest.fn();

beforeEach(() => {
  // Reset mocks
  mockOnOpenSettings.mockClear();
  mockCleanup.mockClear();

  // Mock useSettingsModal return value
  mockUseSettingsModal.mockReturnValue({
    isOpen: false,
    openModal: jest.fn(),
    closeModal: jest.fn(),
  });

  // Mock window.electronAPI
  Object.defineProperty(window, "electronAPI", {
    value: {
      onOpenSettings: mockOnOpenSettings.mockReturnValue(mockCleanup),
    },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  delete (window as any).electronAPI;
});

describe("useElectronIPC", () => {
  describe("Electron Environment", () => {
    it("should render without errors", () => {
      expect(() => {
        renderHook(() => useElectronIPC());
      }).not.toThrow();
    });

    it("should register IPC listener on mount", () => {
      renderHook(() => useElectronIPC());

      expect(mockOnOpenSettings).toHaveBeenCalledTimes(1);
      expect(mockOnOpenSettings).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should call cleanup function on unmount", () => {
      const { unmount } = renderHook(() => useElectronIPC());

      expect(mockCleanup).not.toHaveBeenCalled();

      unmount();

      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });

    it("should trigger openModal when IPC callback is called", () => {
      const mockOpenModal = jest.fn();
      mockUseSettingsModal.mockReturnValue({
        isOpen: false,
        openModal: mockOpenModal,
        closeModal: jest.fn(),
      });

      renderHook(() => useElectronIPC());

      // Get the callback function passed to onOpenSettings
      const callback = mockOnOpenSettings.mock.calls[0][0];
      callback();

      expect(mockOpenModal).toHaveBeenCalledTimes(1);
      expect(mockOpenModal).toHaveBeenCalledWith();
    });

    it("should handle errors in openModal gracefully", () => {
      const mockOpenModal = jest.fn(() => {
        throw new Error("Test error");
      });
      mockUseSettingsModal.mockReturnValue({
        isOpen: false,
        openModal: mockOpenModal,
        closeModal: jest.fn(),
      });

      renderHook(() => useElectronIPC());

      // Get the callback function passed to onOpenSettings
      const callback = mockOnOpenSettings.mock.calls[0][0];

      expect(() => callback()).not.toThrow();
    });

    it("should handle errors during IPC setup gracefully", () => {
      mockOnOpenSettings.mockImplementation(() => {
        throw new Error("IPC setup error");
      });

      expect(() => {
        renderHook(() => useElectronIPC());
      }).not.toThrow();
    });

    it("should handle errors during cleanup gracefully", () => {
      mockCleanup.mockImplementation(() => {
        throw new Error("Cleanup error");
      });

      const { unmount } = renderHook(() => useElectronIPC());

      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Non-Electron Environment", () => {
    beforeEach(() => {
      delete (window as any).electronAPI;
    });

    it("should handle missing electronAPI gracefully", () => {
      expect(() => {
        renderHook(() => useElectronIPC());
      }).not.toThrow();

      expect(mockOnOpenSettings).not.toHaveBeenCalled();
    });

    it("should not register IPC listeners when electronAPI is undefined", () => {
      renderHook(() => useElectronIPC());

      expect(mockOnOpenSettings).not.toHaveBeenCalled();
    });

    it("should handle unmount gracefully in non-Electron environment", () => {
      const { unmount } = renderHook(() => useElectronIPC());

      expect(() => unmount()).not.toThrow();
      expect(mockCleanup).not.toHaveBeenCalled();
    });
  });

  describe("Window Object Edge Cases", () => {
    it("should handle electronAPI without onOpenSettings method", () => {
      Object.defineProperty(window, "electronAPI", {
        value: {}, // Empty object without onOpenSettings
        writable: true,
        configurable: true,
      });

      expect(() => {
        renderHook(() => useElectronIPC());
      }).not.toThrow();
    });

    it("should handle electronAPI with onOpenSettings but not a function", () => {
      Object.defineProperty(window, "electronAPI", {
        value: { onOpenSettings: "not a function" },
        writable: true,
        configurable: true,
      });

      expect(() => {
        renderHook(() => useElectronIPC());
      }).not.toThrow();
    });
  });

  describe("Memory Management", () => {
    it("should properly manage cleanup function reference", () => {
      const { unmount } = renderHook(() => useElectronIPC());

      expect(mockCleanup).not.toHaveBeenCalled();

      unmount();

      expect(mockCleanup).toHaveBeenCalledTimes(1);

      // Second unmount should not call cleanup again
      unmount();

      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });

    it("should handle null cleanup function gracefully", () => {
      mockOnOpenSettings.mockReturnValue(null as any);

      const { unmount } = renderHook(() => useElectronIPC());

      expect(() => unmount()).not.toThrow();
    });

    it("should handle undefined cleanup function gracefully", () => {
      mockOnOpenSettings.mockReturnValue(undefined as any);

      const { unmount } = renderHook(() => useElectronIPC());

      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Hook Dependencies", () => {
    it("should re-register IPC listener when openModal reference changes", () => {
      const mockOpenModal1 = jest.fn();
      const mockOpenModal2 = jest.fn();

      mockUseSettingsModal.mockReturnValue({
        isOpen: false,
        openModal: mockOpenModal1,
        closeModal: jest.fn(),
      });

      const { rerender } = renderHook(() => useElectronIPC());

      expect(mockOnOpenSettings).toHaveBeenCalledTimes(1);
      expect(mockCleanup).not.toHaveBeenCalled();

      // Change openModal reference
      mockUseSettingsModal.mockReturnValue({
        isOpen: false,
        openModal: mockOpenModal2,
        closeModal: jest.fn(),
      });

      rerender();

      // Should cleanup old listener and register new one
      expect(mockCleanup).toHaveBeenCalledTimes(1);
      expect(mockOnOpenSettings).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Boundaries", () => {
    it("should not throw errors that could crash the application", () => {
      // Test various error scenarios
      const errorScenarios = [
        () => {
          mockOnOpenSettings.mockImplementation(() => {
            throw new Error("Setup error");
          });
        },
        () => {
          mockCleanup.mockImplementation(() => {
            throw new Error("Cleanup error");
          });
        },
        () => {
          const mockOpenModal = jest.fn(() => {
            throw new Error("OpenModal error");
          });
          mockUseSettingsModal.mockReturnValue({
            isOpen: false,
            openModal: mockOpenModal,
            closeModal: jest.fn(),
          });
        },
      ];

      errorScenarios.forEach((setupError, index) => {
        setupError();

        expect(() => {
          const { unmount } = renderHook(() => useElectronIPC());

          if (index === 2) {
            // Test openModal error
            const callback = mockOnOpenSettings.mock.calls[0]?.[0];
            if (callback) callback();
          }

          unmount();
        }).not.toThrow();

        // Reset for next scenario
        jest.clearAllMocks();
        mockOnOpenSettings.mockReturnValue(mockCleanup);
      });
    });
  });
});
