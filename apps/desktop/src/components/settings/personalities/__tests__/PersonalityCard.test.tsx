import type { PersonalityViewModel } from "@fishbowl-ai/ui-shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { PersonalityCard } from "../PersonalityCard";

const mockPersonality: PersonalityViewModel = {
  id: "test-personality-1",
  name: "Creative Thinker",
  behaviors: {
    creativity: 90,
    analytical: 70,
  },
  customInstructions: "Be creative and think outside the box",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const defaultProps = {
  personality: mockPersonality,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("PersonalityCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders personality name prominently", () => {
    render(<PersonalityCard {...defaultProps} />);

    const nameElement = screen.getByText("Creative Thinker");
    expect(nameElement).toBeInTheDocument();
  });

  it("displays behavior count and custom instructions preview", () => {
    render(<PersonalityCard {...defaultProps} />);

    const descriptionText = screen.getByText(
      "2 behaviors • Be creative and think outside the box",
    );
    expect(descriptionText).toBeInTheDocument();
  });

  it("renders edit and delete buttons with proper accessibility", () => {
    render(<PersonalityCard {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    const deleteButton = screen.getByRole("button", { name: /delete/i });

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(<PersonalityCard {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockPersonality);
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(<PersonalityCard {...defaultProps} />);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockPersonality);
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it("applies hover effects with transition classes", () => {
    render(<PersonalityCard {...defaultProps} />);

    const cardElement = screen
      .getByText("Creative Thinker")
      .closest('[data-slot="card"]');
    expect(cardElement).toHaveClass("hover:shadow-md", "transition-shadow");
  });

  it("handles long personality names appropriately", () => {
    const longNamePersonality: PersonalityViewModel = {
      ...mockPersonality,
      name: "A Very Long Personality Name That Might Wrap",
    };

    render(
      <PersonalityCard {...defaultProps} personality={longNamePersonality} />,
    );

    const nameElement = screen.getByText(
      "A Very Long Personality Name That Might Wrap",
    );
    expect(nameElement).toBeInTheDocument();
  });

  it("maintains proper component structure with Card components", () => {
    render(<PersonalityCard {...defaultProps} />);

    // Check that we have the expected card structure
    const cardElement = screen
      .getByText("Creative Thinker")
      .closest('[data-slot="card"]');
    expect(cardElement).toBeInTheDocument();

    // Check that both edit and delete buttons are present
    const editButton = screen.getByRole("button", { name: /edit/i });
    const deleteButton = screen.getByRole("button", { name: /delete/i });

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it("calculates behavior count correctly", () => {
    const personalityWithManyBehaviors: PersonalityViewModel = {
      ...mockPersonality,
      behaviors: {
        creativity: 90,
        analytical: 70,
        patience: 80,
        enthusiasm: 65,
        formality: 45,
      },
    };

    render(
      <PersonalityCard
        {...defaultProps}
        personality={personalityWithManyBehaviors}
      />,
    );

    expect(screen.getByText(/5 behaviors/)).toBeInTheDocument();
  });

  it("truncates long custom instructions", () => {
    const personalityWithLongInstructions: PersonalityViewModel = {
      ...mockPersonality,
      customInstructions:
        "This is a very long custom instruction that should be truncated at exactly 50 characters and show ellipsis",
    };

    render(
      <PersonalityCard
        {...defaultProps}
        personality={personalityWithLongInstructions}
      />,
    );

    // Check that the text contains ellipsis indicating truncation
    const descriptionElement = screen.getByText(/behaviors •/);
    expect(descriptionElement.textContent).toContain("...");
    expect(descriptionElement.textContent).not.toContain(
      "should be truncated at exactly 50 characters and show ellipsis",
    );
  });

  it("handles empty custom instructions", () => {
    const personalityWithoutInstructions: PersonalityViewModel = {
      ...mockPersonality,
      customInstructions: "",
    };

    render(
      <PersonalityCard
        {...defaultProps}
        personality={personalityWithoutInstructions}
      />,
    );

    expect(screen.getByText(/No custom instructions/)).toBeInTheDocument();
  });
});
