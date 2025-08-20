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
  useSettingsNavigation: () => ({
    activeSubTab: "library",
    setActiveSubTab: jest.fn(),
  }),
  useUnsavedChanges: () => ({
    hasUnsavedChanges: false,
    setUnsavedChanges: jest.fn(),
    clearUnsavedChanges: jest.fn(),
  }),
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
    retryLastOperation: jest.fn(),
    clearErrorState: jest.fn(),
    createAgent: jest.fn(() => "mock-agent-id"),
    updateAgent: jest.fn(),
  }),
}));

// Mock TabContainer to simplify testing
jest.mock("../../TabContainer", () => ({
  TabContainer: ({
    tabs,
  }: {
    tabs: Array<{ id: string; label: string; content: () => React.ReactNode }>;
  }) => (
    <div data-testid="tab-container">
      {tabs.map((tab) => (
        <div key={tab.id} data-testid={`tab-${tab.id}`}>
          <button>{tab.label}</button>
          <div>{tab.content()}</div>
        </div>
      ))}
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
    expect(screen.getByTestId("tab-container")).toBeInTheDocument();
  });

  test("renders both tabs with correct labels", () => {
    render(<AgentsSection />);

    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Defaults")).toBeInTheDocument();
  });

  test("renders tab content correctly", () => {
    render(<AgentsSection />);

    // Library tab content
    expect(screen.getByText("Create New Agent")).toBeInTheDocument();
    expect(screen.getByText("Research Assistant")).toBeInTheDocument();
    expect(screen.getByText("Code Reviewer")).toBeInTheDocument();

    // Defaults tab content
    expect(screen.getByText("Agent Defaults")).toBeInTheDocument();
    expect(
      screen.getByText("Configure default settings for new agents."),
    ).toBeInTheDocument();
  });

  test("applies custom className when provided", () => {
    const { container } = render(<AgentsSection className="custom-class" />);
    expect(container.firstChild).toHaveClass("agents-section", "custom-class");
  });

  test("has correct structure for tab configuration", () => {
    render(<AgentsSection />);

    expect(screen.getByTestId("tab-library")).toBeInTheDocument();
    expect(screen.getByTestId("tab-defaults")).toBeInTheDocument();
  });

  test("tab content maintains expected structure", () => {
    render(<AgentsSection />);

    // Check that Library tab has functional content structure
    const createButton = screen.getByText("Create New Agent");
    expect(createButton).toBeInTheDocument();

    // Check that Defaults tab has functional content structure
    const defaultsContent = screen.getByText("Agent Defaults").closest("div");
    expect(defaultsContent).toHaveClass("space-y-2");

    // Check that the default settings controls are present
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("Max Tokens")).toBeInTheDocument();
    expect(screen.getByText("Top P")).toBeInTheDocument();
    expect(screen.getByText("Settings Preview")).toBeInTheDocument();
  });
});
