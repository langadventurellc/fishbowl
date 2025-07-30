import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmptyTemplatesState } from "../EmptyTemplatesState";

const defaultProps = {
  onAction: jest.fn(),
};

describe("EmptyTemplatesState Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders heading text correctly", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      const heading = screen.getByText("No templates available");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("text-xl", "font-semibold");
    });

    it("renders descriptive text", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      const description = screen.getByText(
        "Templates help you quickly set up agents with pre-configured settings",
      );
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("renders Sparkles icon in background circle", () => {
      const { container } = render(<EmptyTemplatesState {...defaultProps} />);

      // Check for the muted background circle
      const iconContainer = container.querySelector(".bg-muted.rounded-full");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass("w-16", "h-16");

      // Check for Sparkles icon (Lucide icons don't have predictable test IDs, so we check the SVG)
      const svgIcon = container.querySelector("svg");
      expect(svgIcon).toBeInTheDocument();
      expect(svgIcon).toHaveClass("h-8", "w-8", "text-muted-foreground");
    });

    it("renders action button with correct text and icon", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: "Browse available templates",
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Browse Templates");
      expect(button).toHaveAttribute(
        "aria-label",
        "Browse available templates",
      );
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <EmptyTemplatesState {...defaultProps} className="custom-class" />,
      );

      const rootElement = container.firstChild;
      expect(rootElement).toHaveClass("custom-class");
    });

    it("has proper container structure and styling", () => {
      const { container } = render(<EmptyTemplatesState {...defaultProps} />);

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
      render(<EmptyTemplatesState onAction={onAction} />);

      const button = screen.getByRole("button", {
        name: "Browse available templates",
      });
      fireEvent.click(button);

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it("does not crash when onAction is undefined", () => {
      render(<EmptyTemplatesState />);

      const button = screen.getByRole("button", {
        name: "Browse available templates",
      });

      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });

    it("button maintains proper gap styling for icon", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: "Browse available templates",
      });
      expect(button).toHaveClass("gap-2");
    });
  });

  describe("Keyboard Navigation", () => {
    it("button is focusable", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: "Browse available templates",
      });
      button.focus();

      expect(button).toHaveFocus();
    });

    it("is keyboard accessible and clickable when focused", () => {
      const onAction = jest.fn();
      render(<EmptyTemplatesState onAction={onAction} />);

      const button = screen.getByRole("button", {
        name: "Browse available templates",
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
      render(<EmptyTemplatesState {...defaultProps} />);

      // Check for heading role
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("No templates available");

      // Check for button role
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("has descriptive aria-label on button", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute(
        "aria-label",
        "Browse available templates",
      );
    });

    it("maintains text hierarchy for screen readers", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      const heading = screen.getByText("No templates available");
      const description = screen.getByText(
        "Templates help you quickly set up agents with pre-configured settings",
      );

      // Heading should come before description in DOM order
      expect(heading.compareDocumentPosition(description)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
  });

  describe("Visual Layout", () => {
    it("centers content properly", () => {
      const { container } = render(<EmptyTemplatesState {...defaultProps} />);

      const rootElement = container.firstChild;
      expect(rootElement).toHaveClass("items-center", "justify-center");
    });

    it("has generous padding for visual breathing room", () => {
      const { container } = render(<EmptyTemplatesState {...defaultProps} />);

      const rootElement = container.firstChild;
      expect(rootElement).toHaveClass("py-16", "px-4");
    });

    it("maintains proper spacing between elements", () => {
      const { container } = render(<EmptyTemplatesState {...defaultProps} />);

      // Icon container has bottom margin
      const iconContainer = container.querySelector(".bg-muted.rounded-full");
      expect(iconContainer).toHaveClass("mb-6");

      // Heading has bottom margin
      const heading = screen.getByText("No templates available");
      expect(heading).toHaveClass("mb-2");

      // Description has bottom margin
      const description = screen.getByText(
        "Templates help you quickly set up agents with pre-configured settings",
      );
      expect(description).toHaveClass("mb-6");
    });

    it("limits description width for readability", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      const description = screen.getByText(
        "Templates help you quickly set up agents with pre-configured settings",
      );
      expect(description).toHaveClass("max-w-md");
    });
  });

  describe("Content Differences from EmptyLibraryState", () => {
    it("has educational tone about templates", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      // More informative/educational messaging compared to Library
      const heading = screen.getByText("No templates available");
      const description = screen.getByText(
        "Templates help you quickly set up agents with pre-configured settings",
      );
      const button = screen.getByText("Browse Templates");

      expect(heading).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it("uses discovery-focused button text", () => {
      render(<EmptyTemplatesState {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Browse Templates");
      // Different from EmptyLibraryState which uses "Create New Agent"
      expect(button).not.toHaveTextContent("Create");
    });
  });

  describe("Component Integration", () => {
    it("renders without any props", () => {
      expect(() => {
        render(<EmptyTemplatesState />);
      }).not.toThrow();
    });

    it("merges custom className with default classes", () => {
      const { container } = render(
        <EmptyTemplatesState className="additional-class" />,
      );

      const rootElement = container.firstChild;
      expect(rootElement).toHaveClass("additional-class");
      expect(rootElement).toHaveClass("flex", "flex-col"); // Default classes still present
    });
  });
});
