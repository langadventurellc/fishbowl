/**
 * Test suite for PersonalitiesSection component focusing on layout restructuring
 * and header functionality as implemented in T-restructure-layout-with.
 *
 * Tests verify:
 * - Header layout with proper typography and button positioning
 * - Create button functionality and accessibility
 * - Component structure and styling
 * - Props interface functionality
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { PersonalitiesSection } from "../PersonalitiesSection";

// Mock the store hook
jest.mock("@fishbowl-ai/ui-shared", () => ({
  usePersonalitiesStore: jest.fn(),
}));

// Mock the logger
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
}));

const { usePersonalitiesStore } = require("@fishbowl-ai/ui-shared");

describe("PersonalitiesSection Component", () => {
  const defaultMockStore = {
    personalities: [],
    isLoading: false,
    error: null,
    isSaving: false,
    createPersonality: jest.fn(),
    updatePersonality: jest.fn(),
    deletePersonality: jest.fn(),
    clearError: jest.fn(),
    retryLastOperation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usePersonalitiesStore.mockReturnValue(defaultMockStore);
  });

  describe("Header Layout and Structure", () => {
    it("renders header with correct typography", () => {
      render(<PersonalitiesSection />);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveTextContent("Personalities");
      expect(title).toHaveClass("text-3xl", "font-bold", "tracking-tight");

      const description = screen.getByText(
        "Manage agent personalities and their characteristics.",
      );
      expect(description).toHaveClass("text-muted-foreground");
    });

    it("renders create button with proper styling and icon", () => {
      render(<PersonalitiesSection />);

      const createButton = screen.getByRole("button", {
        name: /create personality/i,
      });
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveClass("gap-2");

      // Check for Plus icon
      const icon = createButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("h-4", "w-4");
    });

    it("uses flex layout with space-between for header", () => {
      render(<PersonalitiesSection />);

      const headerContainer = screen
        .getByRole("heading", { level: 2 })
        .closest("div");
      expect(headerContainer?.parentElement).toHaveClass(
        "flex",
        "items-center",
        "justify-between",
      );
    });

    it("renders create button and handles click without errors", () => {
      render(<PersonalitiesSection />);

      const createButton = screen.getByRole("button", {
        name: /create personality/i,
      });
      expect(createButton).toBeInTheDocument();

      // Button should be clickable without errors
      expect(() => fireEvent.click(createButton)).not.toThrow();
    });
  });

  describe("Component Structure", () => {
    it("applies correct container classes", () => {
      const { container } = render(<PersonalitiesSection />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass("space-y-6", "p-6");
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <PersonalitiesSection className="custom-class" />,
      );

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass("custom-class", "space-y-6", "p-6");
    });

    it("has proper semantic structure", () => {
      render(<PersonalitiesSection />);

      // Should have main heading
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();

      // Should have create button
      expect(
        screen.getByRole("button", { name: /create personality/i }),
      ).toBeInTheDocument();

      // Should have description text
      expect(
        screen.getByText(/manage agent personalities/i),
      ).toBeInTheDocument();
    });
  });

  describe("Content Area", () => {
    it("renders content area with proper structure", () => {
      const { container } = render(<PersonalitiesSection />);

      // Should have content structure (specific content depends on state)
      const contentContainers = container.querySelectorAll("div");
      expect(contentContainers.length).toBeGreaterThan(3); // Header + content + nested divs
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<PersonalitiesSection />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveAccessibleName("Personalities");
    });

    it("has accessible button with descriptive name", () => {
      render(<PersonalitiesSection />);

      const button = screen.getByRole("button", {
        name: /create personality/i,
      });
      expect(button).toHaveAccessibleName();
    });
  });

  describe("Layout Implementation Verification", () => {
    it("implements the required header structure from task specification", () => {
      render(<PersonalitiesSection />);

      // Verify header section exists with flex layout
      const headerSection = screen
        .getByRole("heading", { level: 2 })
        .closest("div")?.parentElement;
      expect(headerSection).toHaveClass(
        "flex",
        "items-center",
        "justify-between",
      );

      // Verify title section with description
      const titleSection = screen.getByRole("heading", {
        level: 2,
      }).parentElement;
      expect(titleSection).toContainElement(
        screen.getByText(/manage agent personalities/i),
      );

      // Verify create button is positioned correctly
      const createButton = screen.getByRole("button", {
        name: /create personality/i,
      });
      expect(headerSection).toContainElement(createButton);
    });

    it("has correct spacing and padding classes", () => {
      const { container } = render(<PersonalitiesSection />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass("space-y-6", "p-6");
    });

    it("uses correct h2 styling instead of h1", () => {
      render(<PersonalitiesSection />);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveClass("text-3xl", "font-bold", "tracking-tight");

      // Should not have h1 elements
      expect(
        screen.queryByRole("heading", { level: 1 }),
      ).not.toBeInTheDocument();
    });
  });
});
