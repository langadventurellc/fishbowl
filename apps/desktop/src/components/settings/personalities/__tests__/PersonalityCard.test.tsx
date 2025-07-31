import type { Personality } from "@fishbowl-ai/ui-shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { PersonalityCard } from "../PersonalityCard";

const mockPersonality: Personality = {
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
};

const defaultProps = {
  personality: mockPersonality,
  onEdit: jest.fn(),
  onClone: jest.fn(),
};

describe("PersonalityCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders personality name prominently", () => {
    render(<PersonalityCard {...defaultProps} />);

    const nameElement = screen.getByText("Creative Thinker");
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveClass("text-lg");
  });

  it("displays Big Five traits in correct format", () => {
    render(<PersonalityCard {...defaultProps} />);

    const traitsText = screen.getByText("O:85 C:70 E:60 A:75 N:30");
    expect(traitsText).toBeInTheDocument();
    expect(traitsText).toHaveClass("font-mono");
    expect(traitsText).toHaveClass("text-muted-foreground");
  });

  it("renders edit and clone buttons with proper accessibility", () => {
    render(<PersonalityCard {...defaultProps} />);

    const editButton = screen.getByLabelText("Edit Creative Thinker");
    const cloneButton = screen.getByLabelText("Clone Creative Thinker");

    expect(editButton).toBeInTheDocument();
    expect(cloneButton).toBeInTheDocument();

    // Check button styling
    expect(editButton).toHaveClass("h-8", "w-8", "p-0");
    expect(cloneButton).toHaveClass("h-8", "w-8", "p-0");
  });

  it("calls onEdit when edit button is clicked", () => {
    render(<PersonalityCard {...defaultProps} />);

    const editButton = screen.getByLabelText("Edit Creative Thinker");
    fireEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockPersonality);
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onClone when clone button is clicked", () => {
    render(<PersonalityCard {...defaultProps} />);

    const cloneButton = screen.getByLabelText("Clone Creative Thinker");
    fireEvent.click(cloneButton);

    expect(defaultProps.onClone).toHaveBeenCalledWith(mockPersonality);
    expect(defaultProps.onClone).toHaveBeenCalledTimes(1);
  });

  it("applies hover effects with transition classes", () => {
    render(<PersonalityCard {...defaultProps} />);

    const cardElement = screen
      .getByText("Creative Thinker")
      .closest('[data-slot="card"]');
    expect(cardElement).toHaveClass("hover:shadow-md", "transition-shadow");
  });

  it("formats Big Five traits correctly with different values", () => {
    const customPersonality: Personality = {
      ...mockPersonality,
      bigFive: {
        openness: 100,
        conscientiousness: 0,
        extraversion: 50,
        agreeableness: 25,
        neuroticism: 75,
      },
    };

    render(
      <PersonalityCard {...defaultProps} personality={customPersonality} />,
    );

    const traitsText = screen.getByText("O:100 C:0 E:50 A:25 N:75");
    expect(traitsText).toBeInTheDocument();
  });

  it("handles long personality names appropriately", () => {
    const longNamePersonality: Personality = {
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

    // Check button container structure
    const buttonContainer = screen.getByLabelText(
      "Edit Creative Thinker",
    ).parentElement;
    expect(buttonContainer).toHaveClass("flex", "gap-2");
  });
});
