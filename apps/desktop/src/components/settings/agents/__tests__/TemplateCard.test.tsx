import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TemplateCard } from "../TemplateCard";
import type { AgentTemplate } from "@fishbowl-ai/shared";

const mockTemplate: AgentTemplate = {
  id: "test-template-1",
  name: "Research Assistant",
  description:
    "Specialized in gathering information, analyzing sources, and providing comprehensive research summaries with proper citations.",
  icon: "BookOpen",
  configuration: {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    model: "Claude 3.5 Sonnet",
    systemPrompt: "You are a meticulous research assistant...",
  },
};

const defaultProps = {
  template: mockTemplate,
  onUseTemplate: jest.fn(),
};

describe("TemplateCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders template name prominently", () => {
      render(<TemplateCard {...defaultProps} />);

      const nameElement = screen.getByText("Research Assistant");
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass("text-lg", "font-medium");
    });

    it("displays template model information", () => {
      render(<TemplateCard {...defaultProps} />);

      const modelElement = screen.getByText("Claude 3.5 Sonnet");
      expect(modelElement).toBeInTheDocument();
      expect(modelElement).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("displays template description", () => {
      render(<TemplateCard {...defaultProps} />);

      const descriptionElement = screen.getByText(
        /Specialized in gathering information/,
      );
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement).toHaveClass(
        "text-sm",
        "text-muted-foreground",
      );
    });

    it("renders Use Template button", () => {
      render(<TemplateCard {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: /Use Research Assistant template/,
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Use Template");
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <TemplateCard {...defaultProps} className="custom-class" />,
      );

      const card = container.querySelector(".custom-class");
      expect(card).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls onUseTemplate with template ID when button clicked", () => {
      const onUseTemplate = jest.fn();
      render(<TemplateCard {...defaultProps} onUseTemplate={onUseTemplate} />);

      const button = screen.getByRole("button", {
        name: /Use Research Assistant template/,
      });
      fireEvent.click(button);

      expect(onUseTemplate).toHaveBeenCalledWith("test-template-1");
      expect(onUseTemplate).toHaveBeenCalledTimes(1);
    });

    it("does not crash when onUseTemplate is undefined", () => {
      render(<TemplateCard template={mockTemplate} />);

      const button = screen.getByRole("button", {
        name: /Use Research Assistant template/,
      });

      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    it("button has proper aria-label", () => {
      render(<TemplateCard {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: "Use Research Assistant template",
      });
      expect(button).toHaveAttribute(
        "aria-label",
        "Use Research Assistant template",
      );
    });

    it("button is focusable", () => {
      render(<TemplateCard {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: /Use Research Assistant template/,
      });
      button.focus();

      expect(button).toHaveFocus();
    });
  });

  describe("Visual States", () => {
    it("has hover transition classes", () => {
      const { container } = render(<TemplateCard {...defaultProps} />);

      const card = container.querySelector('[class*="hover:shadow-lg"]');
      expect(card).toHaveClass("transition-all", "duration-200");
    });

    it("maintains consistent height with flex layout", () => {
      const { container } = render(<TemplateCard {...defaultProps} />);

      const card = container.querySelector('[class*="h-full"]');
      expect(card).toHaveClass("flex", "flex-col");
    });
  });

  describe("Icon Handling", () => {
    it("renders correct icon for template", () => {
      const { container } = render(<TemplateCard {...defaultProps} />);

      // BookOpen icon should be rendered
      const iconContainer = container.querySelector('[class*="bg-muted"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it("handles unknown icon gracefully", () => {
      const templateWithUnknownIcon = {
        ...mockTemplate,
        icon: "UnknownIcon",
      };

      expect(() => {
        render(<TemplateCard template={templateWithUnknownIcon} />);
      }).not.toThrow();
    });
  });

  describe("Description Text Handling", () => {
    it("handles long descriptions with line clamping", () => {
      const templateWithLongDescription = {
        ...mockTemplate,
        description:
          "This is a very long description that should be clamped to three lines maximum. ".repeat(
            10,
          ),
      };

      render(<TemplateCard template={templateWithLongDescription} />);

      const descriptionElement = screen.getByText(
        /This is a very long description/,
      );
      expect(descriptionElement).toHaveClass("line-clamp-3");
    });

    it("handles empty description gracefully", () => {
      const templateWithEmptyDescription = {
        ...mockTemplate,
        description: "",
      };

      expect(() => {
        render(<TemplateCard template={templateWithEmptyDescription} />);
      }).not.toThrow();
    });
  });

  describe("Layout and Styling", () => {
    it("applies correct card structure classes", () => {
      const { container } = render(<TemplateCard {...defaultProps} />);

      const card = container.querySelector('[class*="group"]');
      expect(card).toHaveClass("cursor-pointer", "h-full", "flex", "flex-col");
    });

    it("has proper spacing and layout for content", () => {
      render(<TemplateCard {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full");
    });
  });
});
