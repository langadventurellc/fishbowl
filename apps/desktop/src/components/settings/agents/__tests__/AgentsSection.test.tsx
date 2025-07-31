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
  useAgentSearch: jest.fn(() => ({
    searchTerm: "",
    setSearchTerm: jest.fn(),
    debouncedSearchTerm: "",
    filteredAgents: [
      {
        id: "1",
        name: "Research Assistant",
        model: "Claude 3.5 Sonnet",
        role: "Research and Analysis",
      },
      { id: "2", name: "Code Reviewer", model: "GPT-4", role: "Code Analysis" },
    ],
    isSearching: false,
    resultsCount: 2,
    clearSearch: jest.fn(),
    handleKeyDown: jest.fn(),
  })),
  useUnsavedChanges: () => ({
    hasUnsavedChanges: false,
    setUnsavedChanges: jest.fn(),
    clearUnsavedChanges: jest.fn(),
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

describe("AgentsSection", () => {
  test("renders without crashing", () => {
    render(<AgentsSection />);
    expect(screen.getByTestId("tab-container")).toBeInTheDocument();
  });

  test("renders all three tabs with correct labels", () => {
    render(<AgentsSection />);

    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Templates")).toBeInTheDocument();
    expect(screen.getByText("Defaults")).toBeInTheDocument();
  });

  test("renders tab content correctly", () => {
    render(<AgentsSection />);

    // Library tab content
    expect(screen.getByPlaceholderText("Search agents...")).toBeInTheDocument();
    expect(screen.getByText("Create New Agent")).toBeInTheDocument();
    expect(screen.getAllByText("Research Assistant")).toHaveLength(2); // One in Library, one in Templates
    expect(screen.getAllByText("Code Reviewer")).toHaveLength(2); // One in Library, one in Templates

    expect(screen.getByText("Agent Templates")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Choose from pre-configured templates to quickly create specialized agents.",
      ),
    ).toBeInTheDocument();

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
    expect(screen.getByTestId("tab-templates")).toBeInTheDocument();
    expect(screen.getByTestId("tab-defaults")).toBeInTheDocument();
  });

  test("tab content maintains expected structure", () => {
    render(<AgentsSection />);

    // Check that Library tab has functional content structure
    const searchInput = screen.getByPlaceholderText("Search agents...");
    expect(searchInput).toBeInTheDocument();

    const createButton = screen.getByText("Create New Agent");
    expect(createButton).toBeInTheDocument();

    // Check that Templates tab has functional content structure (no longer placeholder)
    const templatesContent = screen.getByText("Agent Templates").closest("div");
    expect(templatesContent).toHaveClass("space-y-2");

    // Check template cards are present
    expect(screen.getAllByText("Use Template")).toHaveLength(8); // 8 template cards

    // Check that Defaults tab has functional content structure (no longer placeholder)
    const defaultsContent = screen.getByText("Agent Defaults").closest("div");
    expect(defaultsContent).toHaveClass("space-y-2");

    // Check that the default settings controls are present
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("Max Tokens")).toBeInTheDocument();
    expect(screen.getByText("Top P")).toBeInTheDocument();
    expect(screen.getByText("Settings Preview")).toBeInTheDocument();
  });
});
