import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { RolesProvider, useRolesAdapter } from "../RolesProvider";
import { desktopRolesAdapter } from "../../adapters/desktopRolesAdapter";

// Mock the desktop roles adapter
jest.mock("../../adapters/desktopRolesAdapter", () => ({
  desktopRolesAdapter: {
    save: jest.fn(),
    load: jest.fn(),
    reset: jest.fn(),
  },
}));

describe("RolesProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(
      <RolesProvider>
        <div data-testid="child">Test Child</div>
      </RolesProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("provides the desktop roles adapter through context", () => {
    const TestComponent = () => {
      const adapter = useRolesAdapter();
      return (
        <div data-testid="adapter-test">
          {adapter === desktopRolesAdapter ? "Adapter provided" : "No adapter"}
        </div>
      );
    };

    render(
      <RolesProvider>
        <TestComponent />
      </RolesProvider>,
    );

    expect(screen.getByText("Adapter provided")).toBeInTheDocument();
  });

  it("throws error when useRolesAdapter is used outside provider", () => {
    const TestComponent = () => {
      const adapter = useRolesAdapter();
      return <div>{adapter ? "Has adapter" : "No adapter"}</div>;
    };

    // Suppress console.error for this test since we expect an error
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useRolesAdapter must be used within a RolesProvider",
    );

    consoleSpy.mockRestore();
  });

  it("provides the correct adapter interface", () => {
    const TestComponent = () => {
      const adapter = useRolesAdapter();
      const hasExpectedMethods =
        typeof adapter.save === "function" &&
        typeof adapter.load === "function" &&
        typeof adapter.reset === "function";

      return (
        <div data-testid="interface-test">
          {hasExpectedMethods ? "Interface correct" : "Interface incorrect"}
        </div>
      );
    };

    render(
      <RolesProvider>
        <TestComponent />
      </RolesProvider>,
    );

    expect(screen.getByText("Interface correct")).toBeInTheDocument();
  });
});
