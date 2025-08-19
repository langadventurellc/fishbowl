/**
 * Test suite for RoleSelect component
 *
 * Tests verify:
 * - Component rendering with different states (loading, error, empty, success)
 * - Role selection functionality
 * - Error handling and retry functionality
 * - Accessibility features (keyboard navigation, ARIA labels)
 * - Props interface functionality
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import type { RoleViewModel } from "@fishbowl-ai/ui-shared";
import { RoleSelect } from "../RoleSelect";

// Mock the store hook
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useRolesStore: jest.fn(),
}));

const { useRolesStore } = require("@fishbowl-ai/ui-shared");

const mockRoles: RoleViewModel[] = [
  {
    id: "role-1",
    name: "Technical Writer",
    description: "Specializes in creating clear technical documentation",
    systemPrompt:
      "You are a technical writer focused on clarity and precision.",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-2",
    name: "Data Analyst",
    description:
      "Expert in data analysis and statistical interpretation with detailed insights",
    systemPrompt:
      "You are a data analyst who provides thorough statistical analysis and data-driven recommendations.",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "role-3",
    name: "Creative Designer",
    description: "",
    systemPrompt:
      "You are a creative designer focused on innovative solutions.",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
];

const defaultProps = {
  value: "",
  onChange: jest.fn(),
  disabled: false,
  placeholder: "Select a role",
};

describe("RoleSelect Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    beforeEach(() => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: [],
          isLoading: true,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("displays loading spinner with descriptive text", () => {
      render(<RoleSelect {...defaultProps} />);

      expect(screen.getByText("Loading roles...")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();

      // Check that the status div has proper aria attributes
      const statusDiv = screen.getByRole("status");
      expect(statusDiv).toHaveAttribute("aria-live", "polite");
    });

    it("does not render select dropdown when loading", () => {
      render(<RoleSelect {...defaultProps} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    const mockRetry = jest.fn();

    beforeEach(() => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: [],
          isLoading: false,
          error: {
            message: "Failed to load roles from storage",
            isRetryable: true,
          },
          retryLastOperation: mockRetry,
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("displays error message with retry button when error is retryable", () => {
      render(<RoleSelect {...defaultProps} />);

      expect(screen.getByText(/Failed to load roles/)).toBeInTheDocument();
      expect(
        screen.getByText(/Failed to load roles from storage/),
      ).toBeInTheDocument();

      const retryButton = screen.getByRole("button");
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveAttribute("aria-label", "Retry loading roles");
    });

    it("calls retryLastOperation when retry button is clicked", () => {
      render(<RoleSelect {...defaultProps} />);

      const retryButton = screen.getByRole("button");
      fireEvent.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it("does not show retry button when error is not retryable", () => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: [],
          isLoading: false,
          error: {
            message: "Validation error",
            isRetryable: false,
          },
          retryLastOperation: mockRetry,
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });

      render(<RoleSelect {...defaultProps} />);

      expect(screen.getByText(/Failed to load roles/)).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("does not render select dropdown when in error state", () => {
      render(<RoleSelect {...defaultProps} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    beforeEach(() => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: [],
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("displays appropriate message when no roles available", () => {
      render(<RoleSelect {...defaultProps} />);

      expect(screen.getByText("No roles available")).toBeInTheDocument();
    });

    it("does not render select dropdown when empty", () => {
      render(<RoleSelect {...defaultProps} />);

      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("Success State with Roles", () => {
    beforeEach(() => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: mockRoles,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("renders select dropdown with placeholder", () => {
      render(<RoleSelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toBeInTheDocument();
      expect(selectTrigger).toHaveAttribute("aria-label", "Select role");
      expect(screen.getByText("Select a role")).toBeInTheDocument();
    });

    it("displays custom placeholder when provided", () => {
      render(<RoleSelect {...defaultProps} placeholder="Choose role..." />);

      expect(screen.getByText("Choose role...")).toBeInTheDocument();
    });

    it("shows role options when opened", () => {
      render(<RoleSelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      expect(screen.getByText("Technical Writer")).toBeInTheDocument();
      expect(screen.getByText("Data Analyst")).toBeInTheDocument();
      expect(screen.getByText("Creative Designer")).toBeInTheDocument();
    });

    it("displays description preview for roles with descriptions", () => {
      render(<RoleSelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // Check truncated descriptions
      expect(
        screen.getByText(
          "Specializes in creating clear technical documentat...",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Expert in data analysis and statistical interpreta...",
        ),
      ).toBeInTheDocument();
    });

    it("truncates long descriptions with ellipsis", () => {
      render(<RoleSelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // The second role has description longer than 50 chars
      expect(
        screen.getByText(
          "Expert in data analysis and statistical interpreta...",
        ),
      ).toBeInTheDocument();
    });

    it("does not show description when empty", () => {
      render(<RoleSelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      // Creative Designer has empty description
      const creativeOption =
        screen.getByText("Creative Designer").parentElement;
      expect(creativeOption?.textContent).toBe("Creative Designer");
    });

    it("calls onChange with role ID when option is selected", () => {
      const mockOnChange = jest.fn();
      render(<RoleSelect {...defaultProps} onChange={mockOnChange} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      const technicalWriterOption = screen.getByText("Technical Writer");
      fireEvent.click(technicalWriterOption);

      expect(mockOnChange).toHaveBeenCalledWith("role-1");
    });

    it("displays selected role when value is provided", () => {
      render(<RoleSelect {...defaultProps} value="role-2" />);

      expect(screen.getByText("Data Analyst")).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    beforeEach(() => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: mockRoles,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("disables select when disabled prop is true", () => {
      render(<RoleSelect {...defaultProps} disabled={true} />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toBeDisabled();
    });

    it("allows interaction when disabled prop is false", () => {
      render(<RoleSelect {...defaultProps} disabled={false} />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).not.toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: mockRoles,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });
    });

    it("has proper ARIA attributes", () => {
      render(<RoleSelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
      expect(selectTrigger).toHaveAttribute("aria-label", "Select role");
    });

    it("supports keyboard navigation", () => {
      const mockOnChange = jest.fn();
      render(<RoleSelect {...defaultProps} onChange={mockOnChange} />);

      const selectTrigger = screen.getByRole("combobox");

      // Open with Enter key
      selectTrigger.focus();
      fireEvent.keyDown(selectTrigger, { key: "Enter", code: "Enter" });

      expect(selectTrigger).toHaveAttribute("aria-expanded", "true");
    });

    it("announces loading state to screen readers", () => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: [],
          isLoading: true,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });

      render(<RoleSelect {...defaultProps} />);

      expect(screen.getByText("Loading roles...")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles null roles array", () => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: null,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });

      render(<RoleSelect {...defaultProps} />);

      expect(screen.getByText("No roles available")).toBeInTheDocument();
    });

    it("handles roles with missing description gracefully", () => {
      const rolesWithMissingDescription = [
        {
          ...mockRoles[0],
          description: undefined,
        },
      ];

      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: rolesWithMissingDescription,
          isLoading: false,
          error: null,
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });

      render(<RoleSelect {...defaultProps} />);

      const selectTrigger = screen.getByRole("combobox");
      fireEvent.click(selectTrigger);

      expect(screen.getByText("Technical Writer")).toBeInTheDocument();
    });

    it("validates that selected role exists in available options", () => {
      render(<RoleSelect {...defaultProps} value="nonexistent-role" />);

      // Component should render without errors even with invalid value
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("handles error state without error message", () => {
      useRolesStore.mockImplementation((selector: any) => {
        const mockStore = {
          roles: [],
          isLoading: false,
          error: { message: null },
          retryLastOperation: jest.fn(),
        };
        return typeof selector === "function" ? selector(mockStore) : mockStore;
      });

      render(<RoleSelect {...defaultProps} />);

      // Should fall through to empty state when error has no message
      expect(screen.getByText("No roles available")).toBeInTheDocument();
    });
  });
});
