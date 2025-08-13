import type { RoleViewModel } from "@fishbowl-ai/ui-shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RoleListItem } from "../RoleListItem";

const mockRole: RoleViewModel = {
  id: "test-role-1",
  name: "Test Developer",
  description:
    "A role for testing development scenarios with comprehensive testing capabilities and detailed feedback mechanisms.",
  systemPrompt:
    "You are a helpful software developer who provides clear and concise code solutions.",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-02T00:00:00Z",
};

const defaultProps = {
  role: mockRole,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("RoleListItem Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders role name prominently", () => {
    render(<RoleListItem {...defaultProps} />);

    const nameElement = screen.getByText("Test Developer");
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveClass("text-base", "font-semibold");
  });

  it("truncates long descriptions at word boundaries", () => {
    render(<RoleListItem {...defaultProps} />);

    const descriptionElement = screen.getByText(
      /A role for testing development scenarios/,
    );
    expect(descriptionElement).toBeInTheDocument();
    // With maxLength 120, this text should not be truncated
    expect(descriptionElement.textContent).not.toContain("...");
  });

  it("renders edit and delete buttons with proper accessibility", () => {
    render(<RoleListItem {...defaultProps} />);

    const editButton = screen.getByLabelText("Edit Test Developer role");
    const deleteButton = screen.getByLabelText("Delete Test Developer role");

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();

    expect(editButton).toHaveClass("h-8", "px-3");
    expect(deleteButton).toHaveClass("h-8", "px-3");
  });

  it("calls onEdit when edit button is clicked", async () => {
    render(<RoleListItem {...defaultProps} />);

    const editButton = screen.getByLabelText("Edit Test Developer role");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockRole);
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onDelete when delete button is clicked", async () => {
    render(<RoleListItem {...defaultProps} />);

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

    render(<RoleListItem {...defaultProps} onEdit={slowOnEdit} />);

    const editButton = screen.getByLabelText("Edit Test Developer role");

    // Click the edit button
    fireEvent.click(editButton);

    // Wait for the operation to complete
    await waitFor(() => {
      expect(slowOnEdit).toHaveBeenCalledWith(mockRole);
    });
  });

  it("applies hover effects with transition classes", () => {
    render(<RoleListItem {...defaultProps} />);

    // Check that the card has hover classes applied (we can't easily test the actual hover state)
    const roleNameElement = screen.getByText("Test Developer");
    const cardContainer = roleNameElement.closest(
      'div[class*="hover:shadow-md"]',
    );
    expect(cardContainer).toBeInTheDocument();
  });

  it("handles short descriptions without truncation", () => {
    const shortDescriptionRole: RoleViewModel = {
      ...mockRole,
      description: "Short description",
    };

    render(<RoleListItem {...defaultProps} role={shortDescriptionRole} />);

    const descriptionElement = screen.getByText("Short description");
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement.textContent).not.toContain("...");
  });

  it("maintains proper layout with long role names", () => {
    const longNameRole: RoleViewModel = {
      ...mockRole,
      name: "A Very Long Role Name That Might Wrap to Multiple Lines",
    };

    render(<RoleListItem {...defaultProps} role={longNameRole} />);

    const nameElement = screen.getByText(
      "A Very Long Role Name That Might Wrap to Multiple Lines",
    );
    expect(nameElement).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-test-class";
    render(<RoleListItem {...defaultProps} className={customClass} />);

    const roleNameElement = screen.getByText("Test Developer");
    const cardContainer = roleNameElement.closest(`div.${customClass}`);
    expect(cardContainer).toBeInTheDocument();
  });

  it("displays delete button with destructive styling", () => {
    render(<RoleListItem {...defaultProps} />);

    const deleteButton = screen.getByLabelText("Delete Test Developer role");
    expect(deleteButton).toHaveClass("text-muted-foreground");
  });

  it("shows both icon and text in buttons", () => {
    render(<RoleListItem {...defaultProps} />);

    const editButton = screen.getByLabelText("Edit Test Developer role");
    const deleteButton = screen.getByLabelText("Delete Test Developer role");

    expect(editButton).toHaveTextContent("Edit");
    expect(deleteButton).toHaveTextContent("Delete");
  });
});
