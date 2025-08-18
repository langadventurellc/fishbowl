/**
 * @file Tests for error handling in RolesSection component
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRolesStore } from "@fishbowl-ai/ui-shared";
import type { StructuredLogger } from "@fishbowl-ai/shared";
import { RolesSection } from "../RolesSection";

// Mock the useRolesStore hook
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useRolesStore: jest.fn(),
  useUnsavedChanges: jest.fn(() => ({
    hasUnsavedChanges: false,
    setUnsavedChanges: jest.fn(),
  })),
  useConfirmationDialog: jest.fn(() => ({
    showConfirmation: jest.fn(),
  })),
  useRoles: jest.fn(() => ({
    roles: [],
  })),
}));

// Mock useServices hook
jest.mock("../../../../contexts", () => ({
  useServices: jest.fn(() => ({
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  })),
}));

// Mock child components to avoid complex dependencies
jest.mock("../RolesList", () => ({
  RolesList: jest.fn(() => <div data-testid="roles-list">Roles List</div>),
}));

jest.mock("../RoleFormModal", () => ({
  RoleFormModal: jest.fn(() => (
    <div data-testid="role-form-modal">Role Form Modal</div>
  )),
}));

jest.mock("../RoleDeleteDialog", () => ({
  RoleDeleteDialog: jest.fn(() => (
    <div data-testid="role-delete-dialog">Role Delete Dialog</div>
  )),
}));

const mockUseRolesStore = useRolesStore as jest.MockedFunction<
  typeof useRolesStore
>;

describe("RolesSection Error Handling", () => {
  const mockClearError = jest.fn();
  const mockRetryLastOperation = jest.fn();
  const mockCreateRole = jest.fn();
  const mockUpdateRole = jest.fn();
  const mockDeleteRole = jest.fn();

  const createMockLogger = (): StructuredLogger =>
    ({
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
      setLevel: jest.fn(),
      getLevel: jest.fn().mockReturnValue("info"),
      child: jest.fn().mockReturnThis(),
      addTransport: jest.fn(),
      removeTransport: jest.fn(),
      setFormatter: jest.fn(),
    }) as unknown as StructuredLogger;

  const defaultStoreState = {
    roles: [],
    isLoading: false,
    error: null,
    isSaving: false,
    adapter: null,
    isInitialized: true,
    lastSyncTime: null,
    pendingOperations: [],
    retryTimers: new Map(),
    logger: createMockLogger(),
    createRole: mockCreateRole,
    updateRole: mockUpdateRole,
    deleteRole: mockDeleteRole,
    clearError: mockClearError,
    retryLastOperation: mockRetryLastOperation,
    getRoleById: jest.fn(),
    isRoleNameUnique: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    setAdapter: jest.fn(),
    initialize: jest.fn(),
    persistChanges: jest.fn(),
    syncWithStorage: jest.fn(),
    exportRoles: jest.fn(),
    importRoles: jest.fn(),
    resetRoles: jest.fn(),
    clearErrorState: jest.fn(),
    getErrorDetails: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRolesStore.mockImplementation((selector) =>
      selector(defaultStoreState),
    );
  });

  describe("Error Display", () => {
    it("does not display error when no error exists", () => {
      render(<RolesSection />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("displays error alert when error exists", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Failed to save role",
          operation: "save" as const,
          isRetryable: true,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Save Failed")).toBeInTheDocument();
      expect(screen.getByText("Failed to save role")).toBeInTheDocument();
    });

    it("displays contextual error titles based on operation type", () => {
      const operations = [
        { operation: "save", expected: "Save Failed" },
        { operation: "load", expected: "Load Failed" },
        { operation: "sync", expected: "Sync Failed" },
        { operation: "import", expected: "Import Failed" },
        { operation: "reset", expected: "Reset Failed" },
      ] as const;

      operations.forEach(({ operation, expected }) => {
        const errorState = {
          ...defaultStoreState,
          error: {
            message: "Test error",
            operation,
            isRetryable: false,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        };

        mockUseRolesStore.mockImplementation((selector) =>
          selector(errorState),
        );

        const { unmount } = render(<RolesSection />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });

    it("displays generic error title when no operation specified", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Generic error",
          operation: null,
          isRetryable: false,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("displays retry count when greater than 0", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Failed to save",
          operation: "save" as const,
          isRetryable: true,
          retryCount: 2,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);
      expect(screen.getByText("Retry attempt 2")).toBeInTheDocument();
    });
  });

  describe("Error Actions", () => {
    it("calls clearError when dismiss button is clicked", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Test error",
          operation: "save" as const,
          isRetryable: false,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      const dismissButton = screen.getByLabelText("Dismiss error");
      fireEvent.click(dismissButton);

      expect(mockClearError).toHaveBeenCalledTimes(1);
    });

    it("displays retry button for retryable errors", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Network error",
          operation: "save" as const,
          isRetryable: true,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("does not display retry button for non-retryable errors", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Validation error",
          operation: "save" as const,
          isRetryable: false,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      expect(screen.queryByText("Retry")).not.toBeInTheDocument();
    });

    it("calls retryLastOperation when retry button is clicked", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Network error",
          operation: "save" as const,
          isRetryable: true,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      const retryButton = screen.getByText("Retry");
      fireEvent.click(retryButton);

      expect(mockRetryLastOperation).toHaveBeenCalledTimes(1);
    });

    it("shows loading state when loading and hides error", () => {
      const errorState = {
        ...defaultStoreState,
        isLoading: true,
        error: {
          message: "Network error",
          operation: "save" as const,
          isRetryable: true,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      // Loading state should be shown instead of error
      expect(screen.getByText("Loading roles...")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("disables retry button when saving", () => {
      const errorState = {
        ...defaultStoreState,
        isSaving: true,
        error: {
          message: "Network error",
          operation: "save" as const,
          isRetryable: true,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      const retryButton = screen.getByText("Retry");
      expect(retryButton).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes for error alerts", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Test error",
          operation: "save" as const,
          isRetryable: true,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "polite");
      expect(alert).toHaveAttribute("aria-atomic", "true");
    });

    it("has accessible labels for action buttons", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Test error",
          operation: "save" as const,
          isRetryable: true,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      expect(screen.getByLabelText("Dismiss error")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("has proper icon accessibility attributes", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Test error",
          operation: "save" as const,
          isRetryable: false,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      // The AlertCircle icon should have aria-hidden="true"
      const alertIcon = screen.getByRole("alert").querySelector("svg");
      expect(alertIcon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Error State Integration", () => {
    it("maintains error display during component interactions", async () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Persistent error",
          operation: "save" as const,
          isRetryable: false,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      render(<RolesSection />);

      // Error should be visible
      expect(screen.getByText("Persistent error")).toBeInTheDocument();

      // Other UI interactions should not affect error display
      expect(screen.getByText("Create First Role")).toBeInTheDocument();
    });

    it("hides error when error state is cleared", () => {
      const errorState = {
        ...defaultStoreState,
        error: {
          message: "Test error",
          operation: "save" as const,
          isRetryable: false,
          retryCount: 0,
          timestamp: new Date().toISOString(),
        },
      };

      mockUseRolesStore.mockImplementation((selector) => selector(errorState));

      const { rerender } = render(<RolesSection />);

      // Error should be visible initially
      expect(screen.getByText("Test error")).toBeInTheDocument();

      // Update state to clear error
      const clearedErrorState = {
        ...defaultStoreState,
        error: null,
      };

      mockUseRolesStore.mockImplementation((selector) =>
        selector(clearedErrorState),
      );

      rerender(<RolesSection />);

      // Error should no longer be visible
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
