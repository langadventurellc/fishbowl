import type { AgentSettingsViewModel } from "@fishbowl-ai/ui-shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { LibraryTab } from "../LibraryTab";

// Mock the announceToScreenReader utility
jest.mock("../../../../utils/announceToScreenReader", () => ({
  announceToScreenReader: jest.fn(),
}));

// Mock the services context
jest.mock("../../../../contexts", () => ({
  useServices: jest.fn(() => ({
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
  })),
}));

// Mock the useLlmModels hook
jest.mock("../../../../hooks/useLlmModels", () => ({
  useLlmModels: jest.fn(() => ({
    models: [
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "openai",
        configId: "openai-config-1",
        configLabel: "OpenAI",
        contextLength: 128000,
      },
      {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        provider: "anthropic",
        configId: "anthropic-config-1",
        configLabel: "Anthropic",
        contextLength: 200000,
      },
    ],
    loading: false,
    error: null,
    refresh: jest.fn(),
  })),
}));

// Mock the useAgentsStore hook
const mockDeleteAgent = jest.fn();
const mockUseAgentsStore = jest.fn();
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useAgentsStore: () => mockUseAgentsStore(),
  getRoleById: jest.fn((id: string) => {
    const roles: Record<string, { id: string; name: string }> = {
      analyst: { id: "analyst", name: "Analyst" },
      "technical-advisor": {
        id: "technical-advisor",
        name: "Technical Advisor",
      },
      "project-manager": { id: "project-manager", name: "Project Manager" },
    };
    return roles[id];
  }),
  type: jest.fn(),
}));

// Mock the useConfirmationDialog hook
const mockShowConfirmation = jest.fn();
const mockConfirmationDialogProps = null;
jest.mock("../../../../hooks/useConfirmationDialog", () => ({
  useConfirmationDialog: () => ({
    showConfirmation: mockShowConfirmation,
    confirmationDialogProps: mockConfirmationDialogProps,
  }),
}));

// Mock the ConfirmationDialog component
jest.mock("../../../../components/ui/confirmation-dialog", () => ({
  ConfirmationDialog: ({ title, message, onConfirm, onCancel }: any) => (
    <div data-testid="confirmation-dialog">
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onConfirm} data-testid="confirm-button">
        Delete
      </button>
      <button onClick={onCancel} data-testid="cancel-button">
        Cancel
      </button>
    </div>
  ),
}));

// Mock agent data with IDs instead of display names
const mockAgents: AgentSettingsViewModel[] = [
  {
    id: "agent-1",
    name: "Research Assistant",
    model: "claude-3-sonnet", // ID instead of display name
    role: "analyst", // ID instead of display name
    personality: "Analytical and thorough",
    systemPrompt: "You are a research assistant",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    llmConfigId: "anthropic-config-1",
  },
  {
    id: "agent-2",
    name: "Code Reviewer",
    model: "gpt-4-turbo", // ID instead of display name
    role: "technical-advisor", // ID instead of display name
    personality: "Detail-oriented and constructive",
    systemPrompt: "You are a code reviewer",
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
    llmConfigId: "openai-config-1",
  },
];

const defaultProps = {
  openCreateModal: jest.fn(),
  openEditModal: jest.fn(),
};

const defaultStoreState = {
  agents: mockAgents,
  isLoading: false,
  error: { message: null },
  isInitialized: true,
  retryLastOperation: jest.fn(),
  clearErrorState: jest.fn(),
  deleteAgent: mockDeleteAgent,
};

describe("LibraryTab Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAgentsStore.mockReturnValue(defaultStoreState);
  });

  describe("Rendering with Agent Data", () => {
    it("renders agent grid when agents are available", () => {
      render(<LibraryTab {...defaultProps} />);

      expect(screen.getByText("Research Assistant")).toBeInTheDocument();
      expect(screen.getByText("Code Reviewer")).toBeInTheDocument();
      expect(screen.getByText("Claude 3 Sonnet")).toBeInTheDocument();
      expect(screen.getByText("GPT-4 Turbo")).toBeInTheDocument();
    });

    it("displays correct number of agents in grid", () => {
      render(<LibraryTab {...defaultProps} />);

      const researchAssistant = screen.getByText("Research Assistant");
      const codeReviewer = screen.getByText("Code Reviewer");
      expect(researchAssistant).toBeInTheDocument();
      expect(codeReviewer).toBeInTheDocument();
    });

    it("renders skip link for accessibility", () => {
      render(<LibraryTab {...defaultProps} />);

      const skipLink = screen.getByText("Skip to agents content");
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#agents-main-content");
    });

    it("renders create new agent button", () => {
      render(<LibraryTab {...defaultProps} />);

      const createButton = screen.getByText("Create New Agent");
      expect(createButton).toBeInTheDocument();
    });

    it("calls openCreateModal when create button is clicked", () => {
      const openCreateModal = jest.fn();
      render(
        <LibraryTab {...defaultProps} openCreateModal={openCreateModal} />,
      );

      const createButton = screen.getByText("Create New Agent");
      fireEvent.click(createButton);

      expect(openCreateModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    it("displays loading indicator when isLoading is true", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true,
        isInitialized: true,
      });

      render(<LibraryTab {...defaultProps} />);

      expect(screen.getByText("Loading agents...")).toBeInTheDocument();
      expect(screen.queryByText("Research Assistant")).not.toBeInTheDocument();
    });

    it("displays initializing message when not initialized", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: false,
        isInitialized: false,
      });

      render(<LibraryTab {...defaultProps} />);

      expect(screen.getByText("Initializing agents...")).toBeInTheDocument();
      expect(screen.queryByText("Research Assistant")).not.toBeInTheDocument();
    });

    it("shows loading state when both isLoading and not initialized", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true,
        isInitialized: false,
      });

      render(<LibraryTab {...defaultProps} />);

      expect(screen.getByText("Initializing agents...")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("displays error message when error exists", () => {
      const errorMessage = "Failed to load agents from storage";
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: { message: errorMessage, isRetryable: true },
      });

      render(<LibraryTab {...defaultProps} />);

      expect(screen.getByText("Failed to load agents")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText("Research Assistant")).not.toBeInTheDocument();
    });

    it("shows retry button when error is retryable", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: { message: "Network error", isRetryable: true },
      });

      render(<LibraryTab {...defaultProps} />);

      const retryButton = screen.getByText("Retry");
      expect(retryButton).toBeInTheDocument();
    });

    it("hides retry button when error is not retryable", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: { message: "Validation error", isRetryable: false },
      });

      render(<LibraryTab {...defaultProps} />);

      expect(screen.queryByText("Retry")).not.toBeInTheDocument();
    });

    it("calls retryLastOperation when retry button is clicked", () => {
      const retryLastOperation = jest.fn();
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: { message: "Network error", isRetryable: true },
        retryLastOperation,
      });

      render(<LibraryTab {...defaultProps} />);

      const retryButton = screen.getByText("Retry");
      fireEvent.click(retryButton);

      expect(retryLastOperation).toHaveBeenCalledTimes(1);
    });

    it("calls clearErrorState when dismiss button is clicked", () => {
      const clearErrorState = jest.fn();
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: { message: "Network error", isRetryable: true },
        clearErrorState,
      });

      render(<LibraryTab {...defaultProps} />);

      const dismissButton = screen.getByText("Dismiss");
      fireEvent.click(dismissButton);

      expect(clearErrorState).toHaveBeenCalledTimes(1);
    });

    it("shows dismiss button when error is retryable", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: { message: "Network error", isRetryable: true },
      });

      render(<LibraryTab {...defaultProps} />);

      expect(screen.getByText("Dismiss")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("displays empty state when no agents exist", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        agents: [],
      });

      render(<LibraryTab {...defaultProps} />);

      // EmptyLibraryState component should be rendered
      // We can't test its exact content without knowing its implementation,
      // but we can verify the agent grid is not shown
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    });

    it("shows create button even in empty state", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        agents: [],
        isLoading: false,
        isInitialized: true,
        error: { message: null },
      });

      render(<LibraryTab {...defaultProps} />);

      // Should have two Create New Agent buttons - one in empty state and one at bottom
      const createButtons = screen.getAllByText("Create New Agent");
      expect(createButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Component State Changes", () => {
    it("re-renders when store state changes", async () => {
      const { rerender } = render(<LibraryTab {...defaultProps} />);

      expect(screen.getByText("Research Assistant")).toBeInTheDocument();

      // Simulate store state change
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        agents: [mockAgents[0]], // Only one agent now
      });

      rerender(<LibraryTab {...defaultProps} />);

      expect(screen.getByText("Research Assistant")).toBeInTheDocument();
      expect(screen.queryByText("Code Reviewer")).not.toBeInTheDocument();
    });

    it("handles transition from loading to loaded state", () => {
      // Start with loading state
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: true,
        agents: [],
      });

      const { rerender } = render(<LibraryTab {...defaultProps} />);
      expect(screen.getByText("Loading agents...")).toBeInTheDocument();

      // Transition to loaded state
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        isLoading: false,
        agents: mockAgents,
      });

      rerender(<LibraryTab {...defaultProps} />);
      expect(screen.queryByText("Loading agents...")).not.toBeInTheDocument();
      expect(screen.getByText("Research Assistant")).toBeInTheDocument();
    });

    it("handles transition from error to success state", () => {
      // Start with error state
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: { message: "Network error", isRetryable: true },
        agents: [],
      });

      const { rerender } = render(<LibraryTab {...defaultProps} />);
      expect(screen.getByText("Failed to load agents")).toBeInTheDocument();

      // Transition to success state
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: { message: null },
        agents: mockAgents,
      });

      rerender(<LibraryTab {...defaultProps} />);
      expect(
        screen.queryByText("Failed to load agents"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Research Assistant")).toBeInTheDocument();
    });
  });

  describe("Type Compatibility", () => {
    it("passes AgentSettingsViewModel objects to openEditModal", () => {
      const openEditModal = jest.fn();
      render(<LibraryTab {...defaultProps} openEditModal={openEditModal} />);

      // Find edit buttons and click one
      const editButtons = screen.getAllByLabelText(/Edit .* agent/);
      expect(editButtons).toHaveLength(2);
      fireEvent.click(editButtons[0]!);

      expect(openEditModal).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          model: expect.any(String),
          role: expect.any(String),
          personality: expect.any(String),
        }),
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels and roles", () => {
      render(<LibraryTab {...defaultProps} />);

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-label", "Agents library content");

      const grid = screen.getByRole("grid");
      expect(grid).toHaveAttribute("aria-label", "Grid of 2 agents");
    });

    it("skip link has proper focus behavior", () => {
      render(<LibraryTab {...defaultProps} />);

      const skipLink = screen.getByText("Skip to agents content");
      skipLink.focus();

      expect(skipLink).toHaveFocus();
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined error gracefully", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: undefined,
      });

      expect(() => {
        render(<LibraryTab {...defaultProps} />);
      }).not.toThrow();
    });

    it("handles null error gracefully", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: null,
      });

      expect(() => {
        render(<LibraryTab {...defaultProps} />);
      }).not.toThrow();
    });

    it("handles empty error object gracefully", () => {
      mockUseAgentsStore.mockReturnValue({
        ...defaultStoreState,
        error: {},
      });

      expect(() => {
        render(<LibraryTab {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe("Delete Confirmation Dialog", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseAgentsStore.mockReturnValue(defaultStoreState);
    });

    it("shows confirmation dialog when delete button is clicked", async () => {
      mockShowConfirmation.mockResolvedValue(true);

      render(<LibraryTab {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/Delete .* agent/);
      expect(deleteButtons).toHaveLength(2);

      fireEvent.click(deleteButtons[0]!);

      expect(mockShowConfirmation).toHaveBeenCalledWith({
        title: "Delete Agent",
        message: `Are you sure you want to delete "Research Assistant"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
      });
    });

    it("displays correct agent name in confirmation message", async () => {
      mockShowConfirmation.mockResolvedValue(true);

      render(<LibraryTab {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/Delete .* agent/);
      fireEvent.click(deleteButtons[1]!); // Click second agent (Code Reviewer)

      expect(mockShowConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `Are you sure you want to delete "Code Reviewer"? This action cannot be undone.`,
        }),
      );
    });

    it("calls deleteAgent when user confirms deletion", async () => {
      mockShowConfirmation.mockResolvedValue(true);

      render(<LibraryTab {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/Delete .* agent/);
      fireEvent.click(deleteButtons[0]!);

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockDeleteAgent).toHaveBeenCalledWith("agent-1");
    });

    it("does not call deleteAgent when user cancels deletion", async () => {
      mockShowConfirmation.mockResolvedValue(false);

      render(<LibraryTab {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/Delete .* agent/);
      fireEvent.click(deleteButtons[0]!);

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockDeleteAgent).not.toHaveBeenCalled();
    });

    it("prevents multiple deletions of the same agent", async () => {
      mockShowConfirmation.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<LibraryTab {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/Delete .* agent/);
      fireEvent.click(deleteButtons[0]!);
      fireEvent.click(deleteButtons[0]!); // Click again while first is pending

      expect(mockShowConfirmation).toHaveBeenCalledTimes(1);
    });

    it("handles errors during deletion gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockShowConfirmation.mockResolvedValue(true);
      mockDeleteAgent.mockImplementation(() => {
        throw new Error("Deletion failed");
      });

      render(<LibraryTab {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/Delete .* agent/);
      fireEvent.click(deleteButtons[0]!);

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockDeleteAgent).toHaveBeenCalledWith("agent-1");
      // Error should be logged but not crash the app

      consoleErrorSpy.mockRestore();
    });

    it("resets loading state after successful deletion", async () => {
      mockShowConfirmation.mockResolvedValue(true);

      render(<LibraryTab {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/Delete .* agent/);
      fireEvent.click(deleteButtons[0]!);

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockDeleteAgent).toHaveBeenCalledWith("agent-1");
      // Component should be able to handle another deletion
      fireEvent.click(deleteButtons[1]!);
      expect(mockShowConfirmation).toHaveBeenCalledTimes(2);
    });

    it("resets loading state after cancelled deletion", async () => {
      mockShowConfirmation.mockResolvedValue(false);

      render(<LibraryTab {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/Delete .* agent/);
      fireEvent.click(deleteButtons[0]!);

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Component should be able to handle another deletion
      fireEvent.click(deleteButtons[1]!);
      expect(mockShowConfirmation).toHaveBeenCalledTimes(2);
    });

    it("resets loading state after error during deletion", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockShowConfirmation.mockResolvedValue(true);
      mockDeleteAgent.mockImplementation(() => {
        throw new Error("Deletion failed");
      });

      render(<LibraryTab {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText(/Delete .* agent/);
      fireEvent.click(deleteButtons[0]!);

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Component should be able to handle another deletion
      mockDeleteAgent.mockReset();
      fireEvent.click(deleteButtons[1]!);
      expect(mockShowConfirmation).toHaveBeenCalledTimes(2);

      consoleErrorSpy.mockRestore();
    });
  });
});
