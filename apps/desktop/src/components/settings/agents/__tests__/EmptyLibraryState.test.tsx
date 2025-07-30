import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmptyLibraryState } from "../EmptyLibraryState";

const defaultProps = {
  onAction: jest.fn(),
};

describe("EmptyLibraryState Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders heading text correctly", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const heading = screen.getByText("No agents configured");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("text-xl", "font-semibold");
    });

    it("renders descriptive text", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const description = screen.getByText(
        "Create your first agent to get started with personalized AI assistants",
      );
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("renders UserPlus icon in background circle", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      // Check for the muted background circle
      const iconContainer = container.querySelector(".bg-muted.rounded-full");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass("w-16", "h-16");

      // Check for UserPlus icon (Lucide icons don't have predictable test IDs, so we check the SVG)
      const svgIcon = container.querySelector("svg");
      expect(svgIcon).toBeInTheDocument();
      expect(svgIcon).toHaveClass("h-8", "w-8", "text-muted-foreground");
    });

    it("renders action button with correct text and icon", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: "Create your first agent",
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Create New Agent");
      expect(button).toHaveAttribute("aria-label", "Create your first agent");
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <EmptyLibraryState {...defaultProps} className="custom-class" />,
      );

      const rootElement = container.firstChild;
      expect(rootElement).toHaveClass("custom-class");
    });

    it("has proper container structure and styling", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      const rootElement = container.firstChild;
      expect(rootElement).toHaveClass(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "py-16",
        "px-4",
      );
    });
  });

  describe("Action Button Interaction", () => {
    it("calls onAction when button is clicked", () => {
      const onAction = jest.fn();
      render(<EmptyLibraryState onAction={onAction} />);

      const button = screen.getByRole("button", {
        name: "Create your first agent",
      });
      fireEvent.click(button);

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it("does not crash when onAction is undefined", () => {
      render(<EmptyLibraryState />);

      const button = screen.getByRole("button", {
        name: "Create your first agent",
      });

      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });

    it("button maintains proper gap styling for icon", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: "Create your first agent",
      });
      expect(button).toHaveClass("gap-2");
    });
  });

  describe("Keyboard Navigation", () => {
    it("button is focusable", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: "Create your first agent",
      });
      button.focus();

      expect(button).toHaveFocus();
    });

    it("is keyboard accessible and clickable when focused", () => {
      const onAction = jest.fn();
      render(<EmptyLibraryState onAction={onAction} />);

      const button = screen.getByRole("button", {
        name: "Create your first agent",
      });
      button.focus();

      // Verify button is focused and can be activated
      expect(button).toHaveFocus();
      fireEvent.click(button);

      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("has proper semantic structure", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      // Check for heading role
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("No agents configured");

      // Check for button role
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("has descriptive aria-label on button", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Create your first agent");
    });

    it("maintains text hierarchy for screen readers", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const heading = screen.getByText("No agents configured");
      const description = screen.getByText(
        "Create your first agent to get started with personalized AI assistants",
      );

      // Heading should come before description in DOM order
      expect(heading.compareDocumentPosition(description)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
  });

  describe("Visual Layout", () => {
    it("centers content properly", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      const rootElement = container.firstChild;
      expect(rootElement).toHaveClass("items-center", "justify-center");
    });

    it("has generous padding for visual breathing room", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      const rootElement = container.firstChild;
      expect(rootElement).toHaveClass("py-16", "px-4");
    });

    it("maintains proper spacing between elements", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      // Icon container has bottom margin
      const iconContainer = container.querySelector(".bg-muted.rounded-full");
      expect(iconContainer).toHaveClass("mb-6");

      // Heading has bottom margin
      const heading = screen.getByText("No agents configured");
      expect(heading).toHaveClass("mb-2");

      // Description has bottom margin
      const description = screen.getByText(
        "Create your first agent to get started with personalized AI assistants",
      );
      expect(description).toHaveClass("mb-6");
    });

    it("limits description width for readability", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const description = screen.getByText(
        "Create your first agent to get started with personalized AI assistants",
      );
      expect(description).toHaveClass("max-w-md");
    });
  });

  describe("Component Integration", () => {
    it("renders without any props", () => {
      expect(() => {
        render(<EmptyLibraryState />);
      }).not.toThrow();
    });

    it("merges custom className with default classes", () => {
      const { container } = render(
        <EmptyLibraryState className="additional-class" />,
      );

      const rootElement = container.firstChild;
      expect(rootElement).toHaveClass("additional-class");
      expect(rootElement).toHaveClass("flex", "flex-col"); // Default classes still present
    });
  });
});
