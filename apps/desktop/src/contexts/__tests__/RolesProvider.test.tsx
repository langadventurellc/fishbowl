import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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

// Mock the useRolesStore from ui-shared
const mockInitialize = jest.fn();

jest.mock("@fishbowl-ai/ui-shared", () => ({
  useRolesStore: {
    getState: () => ({
      isInitialized: false,
      roles: [],
      error: null,
      initialize: mockInitialize,
    }),
  },
}));

// Mock the logger
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe("RolesProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitialize.mockResolvedValue(undefined);
  });

  it("shows loading state during initialization", () => {
    render(
      <RolesProvider>
        <div data-testid="child">Test Child</div>
      </RolesProvider>,
    );

    expect(screen.getByText("Loading roles...")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("initializes store with desktop adapter on mount", async () => {
    mockInitialize.mockResolvedValue(undefined);

    render(
      <RolesProvider>
        <div data-testid="child">Test Child</div>
      </RolesProvider>,
    );

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledWith(desktopRolesAdapter);
    });
  });

  it("renders children after successful initialization", async () => {
    mockInitialize.mockResolvedValue(undefined);

    render(
      <RolesProvider>
        <div data-testid="child">Test Child</div>
      </RolesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("shows error state when initialization fails", async () => {
    const testError = new Error("Test initialization error");
    mockInitialize.mockRejectedValue(testError);

    render(
      <RolesProvider>
        <div data-testid="child">Test Child</div>
      </RolesProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed to Initialize Roles"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Test initialization error")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("provides the desktop roles adapter through context after initialization", async () => {
    mockInitialize.mockResolvedValue(undefined);

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

    await waitFor(() => {
      expect(screen.getByText("Adapter provided")).toBeInTheDocument();
    });
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

  it("provides the correct adapter interface after initialization", async () => {
    mockInitialize.mockResolvedValue(undefined);

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

    await waitFor(() => {
      expect(screen.getByText("Interface correct")).toBeInTheDocument();
    });
  });
});
