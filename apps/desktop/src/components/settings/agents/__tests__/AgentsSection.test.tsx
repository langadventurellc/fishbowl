/**
 * Unit tests for AgentsSection component.
 *
 * @module components/settings/__tests__/AgentsSection.test
 */
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AgentsSection } from "../AgentsSection";

// Mock shared package to avoid dependency issues
jest.mock("@fishbowl-ai/ui-shared", () => ({
  useAgentsStore: () => ({
    agents: [
      {
        id: "1",
        name: "Research Assistant",
        model: "Claude 3.5 Sonnet",
        role: "Research and Analysis",
        personality: "Analytical and thorough",
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
        systemPrompt: "You are a research assistant",
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Code Reviewer",
        model: "GPT-4",
        role: "Code Analysis",
        personality: "Detail-oriented and constructive",
        temperature: 0.3,
        maxTokens: 1500,
        topP: 0.8,
        systemPrompt: "You are a code reviewer",
        createdAt: "2023-01-02T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
      },
    ],
    isLoading: false,
    error: { message: null },
    isInitialized: true,
    isSaving: false,
    retryLastOperation: jest.fn(),
    clearErrorState: jest.fn(),
    createAgent: jest.fn(() => "mock-agent-id"),
    updateAgent: jest.fn(),
  }),
}));

// Mock LibraryTab to simplify testing
jest.mock("../LibraryTab", () => ({
  LibraryTab: ({
    openCreateModal,
    openEditModal,
  }: {
    openCreateModal: () => void;
    openEditModal: (agent: any) => void;
  }) => (
    <div data-testid="library-tab">
      <button onClick={openCreateModal}>Create New Agent</button>
      <div data-testid="agent-research-assistant">Research Assistant</div>
      <div data-testid="agent-code-reviewer">Code Reviewer</div>
      <button
        onClick={() => openEditModal({ id: "1", name: "Research Assistant" })}
      >
        Edit Research Assistant
      </button>
    </div>
  ),
}));

// Mock AgentFormModal to avoid testing modal functionality
jest.mock("../AgentFormModal", () => ({
  AgentFormModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="agent-form-modal">Agent Form Modal</div> : null,
}));

// Mock useServices hook
jest.mock("../../../../contexts", () => ({
  useServices: jest.fn(() => ({
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    },
  })),
}));

describe("AgentsSection", () => {
  test("renders without crashing", () => {
    render(<AgentsSection />);
    expect(screen.getByTestId("library-tab")).toBeInTheDocument();
  });

  test("renders LibraryTab directly without tab navigation", () => {
    render(<AgentsSection />);

    // Library tab content should be present
    expect(screen.getByTestId("library-tab")).toBeInTheDocument();

    // No tab navigation elements should be present
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByText("Library")).not.toBeInTheDocument(); // No tab label
    expect(screen.queryByText("Defaults")).not.toBeInTheDocument(); // No defaults tab
  });

  test("renders agent content correctly", () => {
    render(<AgentsSection />);

    // Agent management content
    expect(screen.getByText("Create New Agent")).toBeInTheDocument();
    expect(screen.getByTestId("agent-research-assistant")).toBeInTheDocument();
    expect(screen.getByTestId("agent-code-reviewer")).toBeInTheDocument();
  });

  test("applies custom className when provided", () => {
    const { container } = render(<AgentsSection className="custom-class" />);
    expect(container.firstChild).toHaveClass("agents-section", "custom-class");
  });

  test("maintains proper container styling", () => {
    const { container } = render(<AgentsSection />);

    // Should have the space-y-6 class for proper spacing
    expect(container.firstChild).toHaveClass("space-y-6");
  });

  test("renders section header correctly", () => {
    render(<AgentsSection />);

    expect(screen.getByText("Agents")).toBeInTheDocument();
    expect(
      screen.getByText("Configure AI agents and their behavior settings."),
    ).toBeInTheDocument();
  });

  test("passes modal control functions to LibraryTab", () => {
    render(<AgentsSection />);

    // Verify that LibraryTab receives the necessary props to control modals
    expect(screen.getByText("Create New Agent")).toBeInTheDocument();
    expect(screen.getByText("Edit Research Assistant")).toBeInTheDocument();
  });

  test("modal is closed by default", () => {
    render(<AgentsSection />);

    expect(screen.queryByTestId("agent-form-modal")).not.toBeInTheDocument();
  });
});
