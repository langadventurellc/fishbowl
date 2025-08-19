/**
 * Integration test suite for selection components (ModelSelect, RoleSelect, PersonalitySelect)
 *
 * Tests verify:
 * - All components follow identical prop interfaces
 * - Consistent behavior patterns across all three components
 * - Components can be imported and used together cleanly
 * - Shared type interfaces work correctly
 * - Consistent accessibility implementation
 * - Error, loading, and empty state patterns are identical
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ModelSelect, PersonalitySelect, RoleSelect } from "../index";

// Mock hooks
jest.mock("../../../../hooks/useLlmModels", () => ({
  useLlmModels: jest.fn(),
}));

jest.mock("@fishbowl-ai/ui-shared", () => ({
  ...jest.requireActual("@fishbowl-ai/ui-shared"),
  useRolesStore: jest.fn(),
  usePersonalitiesStore: jest.fn(),
}));

const { useLlmModels } = require("../../../../hooks/useLlmModels");
const {
  useRolesStore,
  usePersonalitiesStore,
} = require("@fishbowl-ai/ui-shared");

describe("Selection Components Integration", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Shared Interface Consistency", () => {
    test("all selection components accept identical base props", () => {
      // Mock data for each component
      useLlmModels.mockReturnValue({
        models: [],
        loading: false,
        error: null,
      });

      useRolesStore.mockReturnValue({
        roles: [],
        isLoading: false,
        error: null,
        retryLastOperation: jest.fn(),
      });

      usePersonalitiesStore.mockReturnValue({
        personalities: [],
        isLoading: false,
        error: null,
        retryLastOperation: jest.fn(),
      });

      const sharedProps = {
        value: "test-value",
        onChange: mockOnChange,
        disabled: false,
        placeholder: "Select an option",
      };

      // All components should accept the same props without TypeScript errors
      expect(() => {
        render(<ModelSelect {...sharedProps} />);
      }).not.toThrow();

      expect(() => {
        render(<RoleSelect {...sharedProps} />);
      }).not.toThrow();

      expect(() => {
        render(<PersonalitySelect {...sharedProps} />);
      }).not.toThrow();
    });
  });

  describe("Loading State Consistency", () => {
    test("all components display identical loading state patterns", () => {
      useLlmModels.mockReturnValue({
        models: [],
        loading: true,
        error: null,
      });

      useRolesStore.mockReturnValue({
        roles: [],
        isLoading: true,
        error: null,
      });

      usePersonalitiesStore.mockReturnValue({
        personalities: [],
        isLoading: true,
        error: null,
      });

      const props = {
        value: "",
        onChange: mockOnChange,
      };

      const { unmount: unmountModel } = render(<ModelSelect {...props} />);
      const modelLoadingText = screen.getByText("Loading models...");
      expect(modelLoadingText).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
      unmountModel();

      const { unmount: unmountRole } = render(<RoleSelect {...props} />);
      const roleLoadingText = screen.getByText("Loading roles...");
      expect(roleLoadingText).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
      unmountRole();

      const { unmount: unmountPersonality } = render(
        <PersonalitySelect {...props} />,
      );
      const personalityLoadingText = screen.getByText(
        "Loading personalities...",
      );
      expect(personalityLoadingText).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
      unmountPersonality();
    });
  });

  describe("Empty State Consistency", () => {
    test("all components display appropriate empty state messages", () => {
      useLlmModels.mockReturnValue({
        models: [],
        loading: false,
        error: null,
      });

      useRolesStore.mockReturnValue({
        roles: [],
        isLoading: false,
        error: null,
      });

      usePersonalitiesStore.mockReturnValue({
        personalities: [],
        isLoading: false,
        error: null,
      });

      const props = {
        value: "",
        onChange: mockOnChange,
      };

      const { unmount: unmountModel } = render(<ModelSelect {...props} />);
      expect(
        screen.getByText("No LLM configurations available"),
      ).toBeInTheDocument();
      unmountModel();

      const { unmount: unmountRole } = render(<RoleSelect {...props} />);
      expect(screen.getByText("No roles available")).toBeInTheDocument();
      unmountRole();

      const { unmount: unmountPersonality } = render(
        <PersonalitySelect {...props} />,
      );
      expect(
        screen.getByText("No personalities available"),
      ).toBeInTheDocument();
      unmountPersonality();
    });
  });

  describe("Error State Consistency", () => {
    test("all components display consistent error state patterns", () => {
      const testError = new Error("Test error message");

      useLlmModels.mockReturnValue({
        models: [],
        loading: false,
        error: testError,
      });

      useRolesStore.mockReturnValue({
        roles: [],
        isLoading: false,
        error: { message: "Test error message", isRetryable: false },
      });

      usePersonalitiesStore.mockReturnValue({
        personalities: [],
        isLoading: false,
        error: { message: "Test error message", isRetryable: false },
      });

      const props = {
        value: "",
        onChange: mockOnChange,
      };

      const { unmount: unmountModel } = render(<ModelSelect {...props} />);
      expect(
        screen.getByText(/Failed to load models: Test error message/),
      ).toBeInTheDocument();
      unmountModel();

      const { unmount: unmountRole } = render(<RoleSelect {...props} />);
      expect(
        screen.getByText(/Failed to load roles: Test error message/),
      ).toBeInTheDocument();
      unmountRole();

      const { unmount: unmountPersonality } = render(
        <PersonalitySelect {...props} />,
      );
      expect(
        screen.getByText(/Failed to load personalities: Test error message/),
      ).toBeInTheDocument();
      unmountPersonality();
    });
  });

  describe("Accessibility Consistency", () => {
    test("all components implement consistent accessibility patterns", () => {
      useLlmModels.mockReturnValue({
        models: [
          {
            id: "test-model",
            name: "Test Model",
            provider: "test",
            providerName: "Test",
            configId: "test",
          },
        ],
        loading: false,
        error: null,
      });

      useRolesStore.mockReturnValue({
        roles: [
          {
            id: "test-role",
            name: "Test Role",
            description: "Test Description",
          },
        ],
        isLoading: false,
        error: null,
      });

      usePersonalitiesStore.mockReturnValue({
        personalities: [{ id: "test-personality", name: "Test Personality" }],
        isLoading: false,
        error: null,
      });

      const props = {
        value: "",
        onChange: mockOnChange,
      };

      // All components should have proper ARIA labels on their select triggers
      const { unmount: unmountModel } = render(<ModelSelect {...props} />);
      expect(screen.getByLabelText("Select model")).toBeInTheDocument();
      unmountModel();

      const { unmount: unmountRole } = render(<RoleSelect {...props} />);
      expect(screen.getByLabelText("Select role")).toBeInTheDocument();
      unmountRole();

      const { unmount: unmountPersonality } = render(
        <PersonalitySelect {...props} />,
      );
      expect(screen.getByLabelText("Select personality")).toBeInTheDocument();
      unmountPersonality();
    });
  });

  describe("Barrel Export Integration", () => {
    test("all selection components can be imported from barrel export", () => {
      // This test verifies that the barrel export in index.ts works correctly
      expect(ModelSelect).toBeDefined();
      expect(RoleSelect).toBeDefined();
      expect(PersonalitySelect).toBeDefined();

      // Verify they are React functional components
      expect(typeof ModelSelect).toBe("function");
      expect(typeof RoleSelect).toBe("function");
      expect(typeof PersonalitySelect).toBe("function");
    });
  });
});
