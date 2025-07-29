import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AgentCard } from "../AgentCard";
import type { AgentCard as AgentCardType } from "@fishbowl-ai/shared";

const mockAgent: AgentCardType = {
  id: "test-agent-1",
  name: "Research Assistant",
  model: "Claude 3.5 Sonnet",
  role: "Research and Analysis",
};

const defaultProps = {
  agent: mockAgent,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("AgentCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders agent name prominently", () => {
      render(<AgentCard {...defaultProps} />);

      const nameElement = screen.getByText("Research Assistant");
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass("text-lg");
    });

    it("displays agent model information", () => {
      render(<AgentCard {...defaultProps} />);

      const modelElement = screen.getByText("Claude 3.5 Sonnet");
      expect(modelElement).toBeInTheDocument();
      expect(modelElement).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("displays agent role information", () => {
      render(<AgentCard {...defaultProps} />);

      const roleElement = screen.getByText("Research and Analysis");
      expect(roleElement).toBeInTheDocument();
      expect(roleElement).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("renders with proper card structure", () => {
      const { container } = render(<AgentCard {...defaultProps} />);

      const card = container.querySelector('[class*="hover:shadow-md"]');
      expect(card).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <AgentCard {...defaultProps} className="custom-class" />,
      );

      const card = container.querySelector(".custom-class");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("renders edit button with proper accessibility", () => {
      render(<AgentCard {...defaultProps} />);

      const editButton = screen.getByLabelText("Edit Research Assistant");
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveAttribute(
        "aria-label",
        "Edit Research Assistant",
      );
    });

    it("renders delete button with proper accessibility", () => {
      render(<AgentCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText("Delete Research Assistant");
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveAttribute(
        "aria-label",
        "Delete Research Assistant",
      );
    });

    it("calls onEdit with agent ID when edit button clicked", () => {
      const onEdit = jest.fn();
      render(<AgentCard {...defaultProps} onEdit={onEdit} />);

      const editButton = screen.getByLabelText("Edit Research Assistant");
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith("test-agent-1");
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("calls onDelete with agent ID when delete button clicked", () => {
      const onDelete = jest.fn();
      render(<AgentCard {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByLabelText("Delete Research Assistant");
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith("test-agent-1");
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("does not crash when onEdit is undefined", () => {
      render(<AgentCard agent={mockAgent} />);

      const editButton = screen.getByLabelText("Edit Research Assistant");

      expect(() => {
        fireEvent.click(editButton);
      }).not.toThrow();
    });

    it("does not crash when onDelete is undefined", () => {
      render(<AgentCard agent={mockAgent} />);

      const deleteButton = screen.getByLabelText("Delete Research Assistant");

      expect(() => {
        fireEvent.click(deleteButton);
      }).not.toThrow();
    });
  });

  describe("Keyboard Navigation", () => {
    it("edit button is focusable", () => {
      render(<AgentCard {...defaultProps} />);

      const editButton = screen.getByLabelText("Edit Research Assistant");
      editButton.focus();

      expect(editButton).toHaveFocus();
    });

    it("delete button is focusable", () => {
      render(<AgentCard {...defaultProps} />);

      const deleteButton = screen.getByLabelText("Delete Research Assistant");
      deleteButton.focus();

      expect(deleteButton).toHaveFocus();
    });
  });

  describe("Visual States", () => {
    it("has hover transition classes", () => {
      const { container } = render(<AgentCard {...defaultProps} />);

      const card = container.querySelector('[class*="hover:shadow-md"]');
      expect(card).toHaveClass("transition-shadow");
    });

    it("has group hover behavior for buttons", () => {
      const { container } = render(<AgentCard {...defaultProps} />);

      const buttonContainer = container.querySelector(
        '[class*="group-hover:opacity-100"]',
      );
      expect(buttonContainer).toBeInTheDocument();
      expect(buttonContainer).toHaveClass("transition-opacity");
    });
  });

  describe("Different Agent Data", () => {
    it("handles different agent names correctly", () => {
      const differentAgent = {
        ...mockAgent,
        name: "Code Reviewer",
      };

      render(<AgentCard agent={differentAgent} onEdit={defaultProps.onEdit} />);

      expect(screen.getByText("Code Reviewer")).toBeInTheDocument();
      expect(screen.getByLabelText("Edit Code Reviewer")).toBeInTheDocument();
    });

    it("handles different models and roles", () => {
      const differentAgent = {
        ...mockAgent,
        model: "GPT-4",
        role: "Code Review and Quality Assurance",
      };

      render(<AgentCard agent={differentAgent} />);

      expect(screen.getByText("GPT-4")).toBeInTheDocument();
      expect(
        screen.getByText("Code Review and Quality Assurance"),
      ).toBeInTheDocument();
    });

    it("handles empty or minimal data gracefully", () => {
      const minimalAgent = {
        id: "minimal",
        name: "",
        model: "",
        role: "",
      };

      expect(() => {
        render(<AgentCard agent={minimalAgent} />);
      }).not.toThrow();
    });
  });
});
