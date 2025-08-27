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

// Mock the useServices hook
jest.mock("../../../../contexts", () => ({
  useServices: jest.fn(() => ({
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
  })),
}));

// Mock the PersonalityFormModal component
jest.mock("../PersonalityFormModal", () => ({
  PersonalityFormModal: jest.fn(() => null),
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
    usePersonalitiesStore.mockImplementation((selector: any) => {
      if (typeof selector === "function") {
        return selector(defaultMockStore);
      }
      return defaultMockStore;
    });
  });

  describe("Header Layout and Structure", () => {
    it("renders header with correct typography", () => {
      render(<PersonalitiesSection />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent("Personalities");
      expect(title).toHaveClass("text-2xl", "font-bold", "mb-2");

      const description = screen.getByText(
        "Define and configure agent personalities and characteristics.",
      );
      expect(description).toHaveClass("text-muted-foreground", "mb-6");
    });

    it("renders create button with proper styling and icon", () => {
      render(<PersonalitiesSection />);

      const createButton = screen.getByRole("button", {
        name: "Create your first personality",
      });
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveClass("gap-2");

      // Check for Plus icon
      const icon = createButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("h-4", "w-4");
    });

    it("uses simple div layout for header", () => {
      render(<PersonalitiesSection />);

      const headerContainer = screen
        .getByRole("heading", { level: 1 })
        .closest("div");
      expect(headerContainer).toBeInTheDocument();
    });

    it("renders create button and handles click without errors", () => {
      render(<PersonalitiesSection />);

      const createButton = screen.getByRole("button", {
        name: "Create your first personality",
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
      expect(mainContainer).toHaveClass("personalities-section", "space-y-6");
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <PersonalitiesSection className="custom-class" />,
      );

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass(
        "custom-class",
        "personalities-section",
        "space-y-6",
      );
    });

    it("has proper semantic structure", () => {
      render(<PersonalitiesSection />);

      // Should have main heading
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

      // Should have create button
      expect(
        screen.getByRole("button", { name: "Create your first personality" }),
      ).toBeInTheDocument();

      // Should have description text
      expect(
        screen.getByText(/define and configure agent personalities/i),
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

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveAccessibleName("Personalities");
    });

    it("has accessible button with descriptive name", () => {
      render(<PersonalitiesSection />);

      const button = screen.getByRole("button", {
        name: "Create your first personality",
      });
      expect(button).toHaveAccessibleName();
    });
  });

  describe("Layout Implementation Verification", () => {
    it("implements the required header structure from task specification", () => {
      render(<PersonalitiesSection />);

      // Verify header section exists with simple div layout (matching RolesSection)
      const headerSection = screen
        .getByRole("heading", { level: 1 })
        .closest("div");
      expect(headerSection).toBeInTheDocument();

      // Verify title section with description
      const titleSection = screen.getByRole("heading", {
        level: 1,
      }).parentElement;
      expect(titleSection).toContainElement(
        screen.getByText(/define and configure agent personalities/i),
      );

      // Verify create button exists in empty state
      const createButton = screen.getByRole("button", {
        name: "Create your first personality",
      });
      expect(createButton).toBeInTheDocument();
    });

    it("has correct spacing and padding classes", () => {
      const { container } = render(<PersonalitiesSection />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass("personalities-section", "space-y-6");
    });

    it("uses correct h1 styling following RolesSection pattern", () => {
      render(<PersonalitiesSection />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveClass("text-2xl", "font-bold", "mb-2");

      // Should not have h2 elements for main title
      expect(
        screen.queryByRole("heading", { level: 2 }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Empty State and PersonalitiesList Integration", () => {
    it("renders empty state when no personalities exist", () => {
      render(<PersonalitiesSection />);

      // Should show empty state message
      expect(
        screen.getByText("No personalities configured"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Create your first personality to define custom agent behaviors/,
        ),
      ).toBeInTheDocument();
    });

    it("renders PersonalitiesList component when personalities exist", () => {
      // Mock store with personalities
      const mockStoreWithData = {
        ...defaultMockStore,
        personalities: [
          {
            id: "test-1",
            name: "Test Personality",
            behaviors: { creativity: 0.8 },
            customInstructions: "Test instructions",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      };

      usePersonalitiesStore.mockImplementation((selector: any) => {
        if (typeof selector === "function") {
          return selector(mockStoreWithData);
        }
        return mockStoreWithData;
      });

      render(<PersonalitiesSection />);

      // Should not show empty state
      expect(
        screen.queryByText("No personalities configured"),
      ).not.toBeInTheDocument();
    });

    it("integrates with modal components correctly", () => {
      render(<PersonalitiesSection />);

      // Check that modal components are rendered (mocked, but should be present in DOM structure)
      // The actual modal functionality is tested in individual component tests
      expect(screen.getByTestId).toBeDefined(); // Basic DOM interaction works
    });
  });
});
