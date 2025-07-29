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

    expect(screen.getByText("Agent Library")).toBeInTheDocument();
    expect(
      screen.getByText("Browse and manage your collection of AI agents."),
    ).toBeInTheDocument();

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

  test("placeholder content maintains consistent styling", () => {
    render(<AgentsSection />);

    // Check that all tab content has the expected structure
    const libraryContent = screen.getByText("Agent Library").closest("div");
    expect(libraryContent).toHaveClass("text-center", "py-8");

    const templatesContent = screen.getByText("Agent Templates").closest("div");
    expect(templatesContent).toHaveClass("text-center", "py-8");

    const defaultsContent = screen.getByText("Agent Defaults").closest("div");
    expect(defaultsContent).toHaveClass("text-center", "py-8");
  });
});
