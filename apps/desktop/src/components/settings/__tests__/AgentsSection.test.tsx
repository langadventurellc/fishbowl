/**
 * Unit tests for AgentsSection component.
 *
 * @module components/settings/__tests__/AgentsSection.test
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AgentsSection } from "../AgentsSection";

// Mock shared package to avoid dependency issues
jest.mock("@fishbowl-ai/shared", () => ({
  useSettingsNavigation: () => ({
    activeSubTab: "library",
    setActiveSubTab: jest.fn(),
  }),
}));

// Mock TabContainer to simplify testing
jest.mock("../TabContainer", () => ({
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
    expect(screen.getByText("Research Assistant")).toBeInTheDocument();
    expect(screen.getByText("Code Reviewer")).toBeInTheDocument();

    expect(screen.getByText("Agent Templates")).toBeInTheDocument();
    expect(
      screen.getByText("Create and manage pre-configured agent templates."),
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

    // Check that other tabs maintain placeholder structure
    const templatesContent = screen.getByText("Agent Templates").closest("div");
    expect(templatesContent).toHaveClass("text-center", "py-8");

    const defaultsContent = screen.getByText("Agent Defaults").closest("div");
    expect(defaultsContent).toHaveClass("text-center", "py-8");
  });
});
