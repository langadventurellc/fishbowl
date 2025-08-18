import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RolesErrorBoundary } from "../RolesErrorBoundary";
import { StructuredLogger } from "@fishbowl-ai/shared";

// Create mock logger using type assertion for testing
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn(),
  setLevel: jest.fn(),
  getLevel: jest.fn(),
  child: jest.fn(),
  addTransport: jest.fn(),
  removeTransport: jest.fn(),
  setFormatter: jest.fn(),
} as unknown as StructuredLogger;

const ThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({
  shouldThrow,
}) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div data-testid="success">Component rendered successfully</div>;
};

describe("RolesErrorBoundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for error boundary tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <RolesErrorBoundary logger={mockLogger}>
        <ThrowingComponent shouldThrow={false} />
      </RolesErrorBoundary>,
    );

    expect(screen.getByTestId("success")).toBeInTheDocument();
    expect(
      screen.getByText("Component rendered successfully"),
    ).toBeInTheDocument();
  });

  it("catches error and renders default error UI", () => {
    render(
      <RolesErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </RolesErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.queryByTestId("success")).not.toBeInTheDocument();
  });

  it("renders custom fallback UI when provided", () => {
    const customFallback = (error: Error, resetError: () => void) => (
      <div data-testid="custom-fallback">
        <p>Custom error: {error.message}</p>
        <button onClick={resetError}>Custom Reset</button>
      </div>
    );

    render(
      <RolesErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </RolesErrorBoundary>,
    );

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();
    expect(screen.getByText("Custom Reset")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("resets error state when Try Again is clicked", () => {
    let shouldThrow = true;
    const ToggleComponent = () => {
      return <ThrowingComponent shouldThrow={shouldThrow} />;
    };

    const { rerender } = render(
      <RolesErrorBoundary>
        <ToggleComponent />
      </RolesErrorBoundary>,
    );

    // Error should be displayed
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();

    // Simulate fixing the error
    shouldThrow = false;

    // Click Try Again button
    const tryAgainButton = screen.getByText("Try Again");
    fireEvent.click(tryAgainButton);

    // Re-render with fixed component
    rerender(
      <RolesErrorBoundary>
        <ToggleComponent />
      </RolesErrorBoundary>,
    );

    // Success state should be displayed
    expect(screen.getByTestId("success")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("resets error state when custom fallback reset is called", () => {
    let shouldThrow = true;
    const customFallback = (error: Error, resetError: () => void) => (
      <div data-testid="custom-fallback">
        <p>Custom error: {error.message}</p>
        <button onClick={resetError} data-testid="custom-reset">
          Custom Reset
        </button>
      </div>
    );

    const ToggleComponent = () => {
      return <ThrowingComponent shouldThrow={shouldThrow} />;
    };

    const { rerender } = render(
      <RolesErrorBoundary fallback={customFallback}>
        <ToggleComponent />
      </RolesErrorBoundary>,
    );

    // Custom error should be displayed
    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();

    // Simulate fixing the error
    shouldThrow = false;

    // Click custom reset button
    const resetButton = screen.getByTestId("custom-reset");
    fireEvent.click(resetButton);

    // Re-render with fixed component
    rerender(
      <RolesErrorBoundary fallback={customFallback}>
        <ToggleComponent />
      </RolesErrorBoundary>,
    );

    // Success state should be displayed
    expect(screen.getByTestId("success")).toBeInTheDocument();
    expect(screen.queryByTestId("custom-fallback")).not.toBeInTheDocument();
  });

  it("handles multiple error states correctly", () => {
    let errorMessage = "First error";
    const DynamicThrowingComponent = () => {
      throw new Error(errorMessage);
    };

    const { rerender } = render(
      <RolesErrorBoundary>
        <DynamicThrowingComponent />
      </RolesErrorBoundary>,
    );

    // First error should be displayed
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("First error")).toBeInTheDocument();

    // Change error message and re-render to trigger new error
    errorMessage = "Second error";
    rerender(
      <RolesErrorBoundary>
        <DynamicThrowingComponent />
      </RolesErrorBoundary>,
    );

    // Still should show first error (error boundary doesn't re-catch until reset)
    expect(screen.getByText("First error")).toBeInTheDocument();
    expect(screen.queryByText("Second error")).not.toBeInTheDocument();
  });
});
