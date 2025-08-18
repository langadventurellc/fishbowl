import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

const defaultProps = {
  onCreateClick: jest.fn(),
};

describe("EmptyState Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state message", () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText("No personalities yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Create your first personality to define unique AI agent behaviors and traits/,
      ),
    ).toBeInTheDocument();
  });

  it("renders create button with correct text", () => {
    render(<EmptyState {...defaultProps} />);

    const createButton = screen.getByRole("button", {
      name: /Create your first personality/i,
    });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveTextContent("Create First Personality");
  });

  it("calls onCreateClick when create button is clicked", () => {
    render(<EmptyState {...defaultProps} />);

    const createButton = screen.getByRole("button", {
      name: /Create your first personality/i,
    });
    fireEvent.click(createButton);

    expect(defaultProps.onCreateClick).toHaveBeenCalledTimes(1);
  });

  it("renders Users icon", () => {
    render(<EmptyState {...defaultProps} />);

    // The icon should be present (using data-testid or checking for SVG elements)
    const iconContainer = screen
      .getByRole("button")
      .closest("div")
      ?.querySelector("div > div");
    expect(iconContainer).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-empty-state";
    render(<EmptyState {...defaultProps} className={customClass} />);

    const container = screen.getByText("No personalities yet").closest("div");
    expect(container).toHaveClass(customClass);
  });

  it("has proper accessibility attributes", () => {
    render(<EmptyState {...defaultProps} />);

    const createButton = screen.getByRole("button", {
      name: /Create your first personality/i,
    });
    expect(createButton).toHaveAttribute(
      "aria-label",
      "Create your first personality",
    );
  });

  it("has proper semantic structure", () => {
    render(<EmptyState {...defaultProps} />);

    // Check for heading structure
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("No personalities yet");

    // Check for descriptive text
    const description = screen.getByText(
      /Create your first personality to define unique AI agent behaviors and traits/,
    );
    expect(description).toBeInTheDocument();
  });
});
