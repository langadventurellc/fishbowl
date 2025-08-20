import React from "react";
import { render, screen } from "@testing-library/react";
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

    it("applies custom className when provided", () => {
      const { container } = render(
        <EmptyLibraryState {...defaultProps} className="custom-class" />,
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass("custom-class");
    });
  });

  describe("Layout and Styling", () => {
    it("uses flex layout for centering content", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
      );
    });

    it("applies proper spacing classes", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass("py-16", "px-4");
    });

    it("applies proper text centering", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const heading = screen.getByText("No agents configured");
      const description = screen.getByText(
        "Create your first agent to get started with personalized AI assistants",
      );

      expect(heading).toHaveClass("text-center");
      expect(description).toHaveClass("text-center");
    });
  });

  describe("Accessibility", () => {
    it("has proper semantic structure", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      // Check for heading role
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("No agents configured");

      // Check for descriptive text
      expect(
        screen.getByText(
          "Create your first agent to get started with personalized AI assistants",
        ),
      ).toBeInTheDocument();
    });

    it("provides clear informational content", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      // Verify the component provides clear information about the empty state
      expect(screen.getByText("No agents configured")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Create your first agent to get started with personalized AI assistants",
        ),
      ).toBeInTheDocument();
    });

    it("maintains text hierarchy for screen readers", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      // Verify proper heading hierarchy
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();

      // Verify descriptive text is present and accessible
      const description = screen.getByText(
        "Create your first agent to get started with personalized AI assistants",
      );
      expect(description).toBeInTheDocument();
    });

    it("uses proper contrast classes for visibility", () => {
      render(<EmptyLibraryState {...defaultProps} />);

      const heading = screen.getByText("No agents configured");
      const description = screen.getByText(
        "Create your first agent to get started with personalized AI assistants",
      );

      // Heading should have strong contrast
      expect(heading).toHaveClass("text-xl", "font-semibold");

      // Description should use muted foreground for hierarchy
      expect(description).toHaveClass("text-muted-foreground");
    });
  });

  describe("Icon Display", () => {
    it("renders icon with proper sizing", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      const svgIcon = container.querySelector("svg");
      expect(svgIcon).toHaveClass("h-8", "w-8");
    });

    it("uses muted foreground color for icon", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      const svgIcon = container.querySelector("svg");
      expect(svgIcon).toHaveClass("text-muted-foreground");
    });

    it("centers icon in background circle", () => {
      const { container } = render(<EmptyLibraryState {...defaultProps} />);

      const iconContainer = container.querySelector(".bg-muted.rounded-full");
      expect(iconContainer).toHaveClass(
        "flex",
        "items-center",
        "justify-center",
      );
    });
  });
});
