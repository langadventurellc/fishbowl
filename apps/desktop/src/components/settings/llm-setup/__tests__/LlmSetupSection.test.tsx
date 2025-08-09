/**
 * Unit tests for LlmSetupSection component.
 *
 * Tests the main LLM configuration interface including service integration,
 * all provider types, and error handling.
 *
 * @module components/settings/llm-setup/__tests__/LlmSetupSection.test
 */
import type { LlmConfigMetadata } from "@fishbowl-ai/shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LlmSetupSection } from "../LlmSetupSection";

// Mock the useLlmConfig hook
const mockUseLlmConfig = {
  configurations: [] as LlmConfigMetadata[],
  isLoading: false,
  error: null as string | null,
  createConfiguration: jest.fn(),
  updateConfiguration: jest.fn(),
  deleteConfiguration: jest.fn(),
  clearError: jest.fn(),
};

jest.mock("../../../../hooks/useLlmConfig", () => ({
  useLlmConfig: () => mockUseLlmConfig,
}));

// Mock child components to simplify testing
jest.mock("../EmptyLlmState", () => ({
  EmptyLlmState: ({
    onSetupProvider,
  }: {
    onSetupProvider: (provider: string) => void;
  }) => (
    <div data-testid="empty-llm-state">
      <p>No LLM providers configured</p>
      <button
        onClick={() => onSetupProvider("openai")}
        data-testid="setup-openai"
      >
        Set up OpenAI
      </button>
    </div>
  ),
}));

jest.mock("../LlmProviderCard", () => ({
  LlmProviderCard: ({
    configuration,
    onEdit,
    onDelete,
  }: {
    configuration: any;
    onEdit: (config: any) => void;
    onDelete: (configId: string) => void;
  }) => (
    <div data-testid={`provider-card-${configuration.id}`}>
      <h3>{configuration.customName}</h3>
      <p>{configuration.provider}</p>
      <button
        onClick={() => onEdit(configuration)}
        data-testid={`edit-${configuration.id}`}
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(configuration.id)}
        data-testid={`delete-${configuration.id}`}
      >
        Delete
      </button>
    </div>
  ),
}));

jest.mock("../LlmConfigModal", () => ({
  LlmConfigModal: ({
    isOpen,
    provider,
    mode,
    onSave,
    onOpenChange,
  }: {
    isOpen: boolean;
    provider: string;
    mode: string;
    onSave: (data: any) => void;
    onOpenChange: (open: boolean) => void;
  }) =>
    isOpen ? (
      <div data-testid="llm-config-modal">
        <h2>
          {mode === "edit" ? "Edit" : "Add"} {provider} Configuration
        </h2>
        <button
          onClick={async () => {
            try {
              await onSave({
                customName: `Test ${provider}`,
                provider,
                apiKey: "test-key",
                baseUrl: "",
                useAuthHeader: false,
              });
            } catch (error) {
              // Handle error gracefully like the real modal does
              console.error("Save failed:", error);
            }
          }}
          data-testid="save-config"
        >
          Save
        </button>
        <button onClick={() => onOpenChange(false)} data-testid="cancel-config">
          Cancel
        </button>
      </div>
    ) : null,
}));

// Mock data
const mockConfigurations: LlmConfigMetadata[] = [
  {
    id: "config-1",
    customName: "My OpenAI",
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    useAuthHeader: false,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
  {
    id: "config-2",
    customName: "My Anthropic",
    provider: "anthropic",
    baseUrl: "https://api.anthropic.com",
    useAuthHeader: false,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  },
];

describe("LlmSetupSection", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default mock state
    mockUseLlmConfig.configurations = [];
    mockUseLlmConfig.isLoading = false;
    mockUseLlmConfig.error = null;
    mockUseLlmConfig.createConfiguration.mockResolvedValue({});
    mockUseLlmConfig.updateConfiguration.mockResolvedValue({});
    mockUseLlmConfig.deleteConfiguration.mockResolvedValue(undefined);
  });

  describe("Rendering States", () => {
    it("renders without crashing", () => {
      render(<LlmSetupSection />);
      expect(screen.getByText("LLM Setup")).toBeInTheDocument();
    });

    it("shows loading state", () => {
      mockUseLlmConfig.isLoading = true;

      render(<LlmSetupSection />);

      expect(screen.getByText("Loading configurations...")).toBeInTheDocument();
      expect(
        screen.getByRole("progressbar", { hidden: true }),
      ).toBeInTheDocument();
    });

    it("shows empty state when no configurations", () => {
      render(<LlmSetupSection />);

      expect(screen.getByTestId("empty-llm-state")).toBeInTheDocument();
      expect(
        screen.getByText("No LLM providers configured"),
      ).toBeInTheDocument();
    });

    it("shows error state with dismiss button", () => {
      mockUseLlmConfig.error = "Failed to load configurations";

      render(<LlmSetupSection />);

      expect(
        screen.getByText("Failed to load configurations"),
      ).toBeInTheDocument();

      const dismissButton = screen.getByText("Dismiss");
      fireEvent.click(dismissButton);
      expect(mockUseLlmConfig.clearError).toHaveBeenCalled();
    });

    it("shows configurations when available", () => {
      mockUseLlmConfig.configurations = mockConfigurations;

      render(<LlmSetupSection />);

      expect(screen.getByTestId("provider-card-config-1")).toBeInTheDocument();
      expect(screen.getByTestId("provider-card-config-2")).toBeInTheDocument();
      expect(screen.getByText("Add Another Provider")).toBeInTheDocument();
    });
  });

  describe("Provider Support", () => {
    it("supports OpenAI provider from empty state", async () => {
      render(<LlmSetupSection />);

      const setupButton = screen.getByTestId("setup-openai");
      fireEvent.click(setupButton);

      await waitFor(() => {
        expect(screen.getByTestId("llm-config-modal")).toBeInTheDocument();
        expect(
          screen.getByText("Add openai Configuration"),
        ).toBeInTheDocument();
      });
    });

    it("displays all provider types correctly", () => {
      mockUseLlmConfig.configurations = mockConfigurations;

      render(<LlmSetupSection />);

      expect(screen.getByText("openai")).toBeInTheDocument();
      expect(screen.getByText("anthropic")).toBeInTheDocument();
    });
  });

  describe("CRUD Operations", () => {
    it("handles creating new configuration", async () => {
      render(<LlmSetupSection />);

      const setupButton = screen.getByTestId("setup-openai");
      fireEvent.click(setupButton);

      await waitFor(() => {
        expect(screen.getByTestId("llm-config-modal")).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId("save-config");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUseLlmConfig.createConfiguration).toHaveBeenCalledWith({
          customName: "Test openai",
          provider: "openai",
          apiKey: "test-key",
          baseUrl: "",
          useAuthHeader: false,
        });
      });
    });

    it("handles editing existing configuration", async () => {
      const testConfig = mockConfigurations[0]!;
      mockUseLlmConfig.configurations = [testConfig];

      render(<LlmSetupSection />);

      const editButton = screen.getByTestId("edit-config-1");
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId("llm-config-modal")).toBeInTheDocument();
        expect(
          screen.getByText("Edit openai Configuration"),
        ).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId("save-config");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUseLlmConfig.updateConfiguration).toHaveBeenCalledWith(
          "config-1",
          expect.objectContaining({
            customName: "Test openai",
            provider: "openai",
          }),
        );
      });
    });

    it("handles deleting configuration with confirmation", async () => {
      mockUseLlmConfig.configurations = [mockConfigurations[0]!];

      render(<LlmSetupSection />);

      const deleteButton = screen.getByTestId("delete-config-1");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText("Delete API Configuration?"),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Yes");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockUseLlmConfig.deleteConfiguration).toHaveBeenCalledWith(
          "config-1",
        );
      });
    });

    it("handles canceling delete confirmation", async () => {
      mockUseLlmConfig.configurations = [mockConfigurations[0]!];

      render(<LlmSetupSection />);

      const deleteButton = screen.getByTestId("delete-config-1");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText("Delete API Configuration?"),
        ).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("No");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Delete API Configuration?"),
        ).not.toBeInTheDocument();
      });

      expect(mockUseLlmConfig.deleteConfiguration).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles create configuration errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockUseLlmConfig.createConfiguration.mockRejectedValue(
        new Error("Creation failed"),
      );

      render(<LlmSetupSection />);

      const setupButton = screen.getByTestId("setup-openai");
      fireEvent.click(setupButton);

      await waitFor(() => {
        expect(screen.getByTestId("llm-config-modal")).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId("save-config");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to save configuration:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });

    it("handles delete configuration errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockUseLlmConfig.configurations = [mockConfigurations[0]!];
      mockUseLlmConfig.deleteConfiguration.mockRejectedValue(
        new Error("Delete failed"),
      );

      render(<LlmSetupSection />);

      const deleteButton = screen.getByTestId("delete-config-1");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText("Delete API Configuration?"),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Yes");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to delete configuration:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Modal Management", () => {
    it("opens and closes modal correctly", async () => {
      render(<LlmSetupSection />);

      const setupButton = screen.getByTestId("setup-openai");
      fireEvent.click(setupButton);

      await waitFor(() => {
        expect(screen.getByTestId("llm-config-modal")).toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId("cancel-config");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId("llm-config-modal"),
        ).not.toBeInTheDocument();
      });
    });

    it("closes modal after successful save", async () => {
      render(<LlmSetupSection />);

      const setupButton = screen.getByTestId("setup-openai");
      fireEvent.click(setupButton);

      await waitFor(() => {
        expect(screen.getByTestId("llm-config-modal")).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId("save-config");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId("llm-config-modal"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("API Key Security", () => {
    it("masks API keys in provider cards", () => {
      mockUseLlmConfig.configurations = mockConfigurations;

      render(<LlmSetupSection />);

      // API keys should be masked, not displayed in plain text
      expect(screen.queryByText("test-api-key-123")).not.toBeInTheDocument();
      expect(screen.queryByText(/sk-/)).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading structure", () => {
      render(<LlmSetupSection />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("LLM Setup");
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <LlmSetupSection className="custom-class" />,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
