import type { PersonalityViewModel } from "@fishbowl-ai/ui-shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DeletePersonalityDialog } from "../DeletePersonalityDialog";

const mockPersonality: PersonalityViewModel = {
  id: "test-personality-1",
  name: "Creative Thinker",
  bigFive: {
    openness: 85,
    conscientiousness: 70,
    extraversion: 60,
    agreeableness: 75,
    neuroticism: 30,
  },
  behaviors: {
    creativity: 90,
    analytical: 70,
  },
  customInstructions: "Be creative and think outside the box",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  personality: mockPersonality,
  onConfirm: jest.fn(),
  isDeleting: false,
};

describe("DeletePersonalityDialog Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with correct title and description", () => {
    render(<DeletePersonalityDialog {...defaultProps} />);

    expect(screen.getByText("Delete Personality")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete/),
    ).toBeInTheDocument();
    expect(screen.getByText('"Creative Thinker"')).toBeInTheDocument();
    expect(
      screen.getByText(/This action cannot be undone/),
    ).toBeInTheDocument();
  });

  it("displays personality name being deleted", () => {
    render(<DeletePersonalityDialog {...defaultProps} />);

    const personalityName = screen.getByText('"Creative Thinker"');
    expect(personalityName).toBeInTheDocument();
    expect(personalityName).toHaveClass("font-semibold", "text-foreground");
  });

  it("renders Cancel and Delete buttons", () => {
    render(<DeletePersonalityDialog {...defaultProps} />);

    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onOpenChange when Cancel button is clicked", () => {
    render(<DeletePersonalityDialog {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onConfirm with personality when Delete button is clicked", () => {
    render(<DeletePersonalityDialog {...defaultProps} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledWith(mockPersonality);
  });

  it("shows loading state during deletion", () => {
    render(<DeletePersonalityDialog {...defaultProps} isDeleting={true} />);

    expect(screen.getByText("Deleting...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete/ })).toBeInTheDocument();
  });

  it("disables buttons during deletion", () => {
    render(<DeletePersonalityDialog {...defaultProps} isDeleting={true} />);

    const cancelButton = screen.getByText("Cancel");
    const deleteButton = screen.getByText("Deleting...");

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it("prevents dialog closing during deletion", () => {
    render(<DeletePersonalityDialog {...defaultProps} isDeleting={true} />);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
  });

  it("handles Enter key to confirm deletion", async () => {
    render(<DeletePersonalityDialog {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Enter" });

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledWith(mockPersonality);
    });
  });

  it("does not confirm deletion on Enter when loading", async () => {
    render(<DeletePersonalityDialog {...defaultProps} isDeleting={true} />);

    fireEvent.keyDown(document, { key: "Enter" });

    await waitFor(() => {
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });
  });

  it("handles missing personality gracefully", () => {
    render(
      <DeletePersonalityDialog {...defaultProps} personality={undefined} />,
    );

    expect(
      screen.getByText(
        "Are you sure you want to delete this personality? This action cannot be undone.",
      ),
    ).toBeInTheDocument();

    const deleteButton = screen.getByText("Delete");
    expect(deleteButton).toBeDisabled();
  });

  it("disables Delete button when no personality provided", () => {
    render(
      <DeletePersonalityDialog {...defaultProps} personality={undefined} />,
    );

    const deleteButton = screen.getByText("Delete");
    expect(deleteButton).toBeDisabled();
  });

  it("has proper accessibility attributes", () => {
    render(<DeletePersonalityDialog {...defaultProps} />);

    const deleteButton = screen.getByText("Delete");
    expect(deleteButton).toHaveAttribute(
      "aria-label",
      "Delete Creative Thinker personality",
    );
  });

  it("does not render when dialog is closed", () => {
    render(<DeletePersonalityDialog {...defaultProps} open={false} />);

    expect(screen.queryByText("Delete Personality")).not.toBeInTheDocument();
  });

  it("has destructive styling on Delete button", () => {
    render(<DeletePersonalityDialog {...defaultProps} />);

    const deleteButton = screen.getByText("Delete");
    expect(deleteButton).toHaveClass(
      "bg-destructive",
      "text-destructive-foreground",
      "hover:bg-destructive/90",
    );
  });

  it("cleans up keyboard listeners when dialog closes", () => {
    const { rerender } = render(<DeletePersonalityDialog {...defaultProps} />);

    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    rerender(<DeletePersonalityDialog {...defaultProps} open={false} />);

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});
