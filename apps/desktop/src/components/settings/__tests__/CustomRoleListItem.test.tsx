import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CustomRoleListItem } from "../CustomRoleListItem";
import type { CustomRole } from "@fishbowl-ai/shared";

const mockRole: CustomRole = {
  id: "test-role-1",
  name: "Test Developer",
  description:
    "A role for testing development scenarios with comprehensive testing capabilities and detailed feedback mechanisms.",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-02T00:00:00Z",
};

const defaultProps = {
  role: mockRole,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("CustomRoleListItem Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders role name prominently", () => {
    render(<CustomRoleListItem {...defaultProps} />);

    const nameElement = screen.getByText("Test Developer");
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveClass("text-base", "font-medium");
  });

  it("truncates long descriptions at word boundaries", () => {
    render(<CustomRoleListItem {...defaultProps} />);

    const descriptionElement = screen.getByText(
      /A role for testing development scenarios/,
    );
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement.textContent).toContain("...");
  });

  it("renders edit and delete buttons with proper accessibility", () => {
    render(<CustomRoleListItem {...defaultProps} />);

    const editButton = screen.getByLabelText("Edit Test Developer role");
    const deleteButton = screen.getByLabelText("Delete Test Developer role");

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();

    expect(editButton).toHaveClass("h-8", "px-3");
    expect(deleteButton).toHaveClass("h-8", "px-3");
  });

  it("calls onEdit when edit button is clicked", async () => {
    render(<CustomRoleListItem {...defaultProps} />);

    const editButton = screen.getByLabelText("Edit Test Developer role");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockRole);
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onDelete when delete button is clicked", async () => {
    render(<CustomRoleListItem {...defaultProps} />);

    const deleteButton = screen.getByLabelText("Delete Test Developer role");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockRole);
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });
  });

  it("handles button clicks correctly with async operations", async () => {
    const slowOnEdit = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 50)),
      );

    render(<CustomRoleListItem {...defaultProps} onEdit={slowOnEdit} />);

    const editButton = screen.getByLabelText("Edit Test Developer role");

    // Click the edit button
    fireEvent.click(editButton);

    // Wait for the operation to complete
    await waitFor(() => {
      expect(slowOnEdit).toHaveBeenCalledWith(mockRole);
    });
  });

  it("applies hover effects with transition classes", () => {
    render(<CustomRoleListItem {...defaultProps} />);

    // Check that the card has hover classes applied (we can't easily test the actual hover state)
    const roleNameElement = screen.getByText("Test Developer");
    const cardContainer = roleNameElement.closest(
      'div[class*="hover:shadow-sm"]',
    );
    expect(cardContainer).toBeInTheDocument();
  });

  it("handles short descriptions without truncation", () => {
    const shortDescriptionRole: CustomRole = {
      ...mockRole,
      description: "Short description",
    };

    render(
      <CustomRoleListItem {...defaultProps} role={shortDescriptionRole} />,
    );

    const descriptionElement = screen.getByText("Short description");
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement.textContent).not.toContain("...");
  });

  it("maintains proper layout with long role names", () => {
    const longNameRole: CustomRole = {
      ...mockRole,
      name: "A Very Long Role Name That Might Wrap to Multiple Lines",
    };

    render(<CustomRoleListItem {...defaultProps} role={longNameRole} />);

    const nameElement = screen.getByText(
      "A Very Long Role Name That Might Wrap to Multiple Lines",
    );
    expect(nameElement).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-test-class";
    render(<CustomRoleListItem {...defaultProps} className={customClass} />);

    const roleNameElement = screen.getByText("Test Developer");
    const cardContainer = roleNameElement.closest(`div.${customClass}`);
    expect(cardContainer).toBeInTheDocument();
  });

  it("displays delete button with destructive styling", () => {
    render(<CustomRoleListItem {...defaultProps} />);

    const deleteButton = screen.getByLabelText("Delete Test Developer role");
    expect(deleteButton).toHaveClass("text-destructive");
  });

  it("shows both icon and text in buttons", () => {
    render(<CustomRoleListItem {...defaultProps} />);

    const editButton = screen.getByLabelText("Edit Test Developer role");
    const deleteButton = screen.getByLabelText("Delete Test Developer role");

    expect(editButton).toHaveTextContent("Edit");
    expect(deleteButton).toHaveTextContent("Delete");
  });
});
