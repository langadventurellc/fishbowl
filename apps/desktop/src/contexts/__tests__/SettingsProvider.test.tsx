import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  SettingsProvider,
  useSettingsPersistenceAdapter,
} from "../SettingsProvider";
import { desktopSettingsAdapter } from "../../adapters/desktopSettingsAdapter";

// Mock the desktop settings adapter
jest.mock("../../adapters/desktopSettingsAdapter", () => ({
  desktopSettingsAdapter: {
    save: jest.fn(),
    load: jest.fn(),
    reset: jest.fn(),
  },
}));

describe("SettingsProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children correctly", () => {
    render(
      <SettingsProvider>
        <div data-testid="child">Test Child</div>
      </SettingsProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("provides the desktop settings adapter through context", () => {
    const TestComponent = () => {
      const adapter = useSettingsPersistenceAdapter();
      return (
        <div data-testid="adapter-test">
          {adapter === desktopSettingsAdapter
            ? "Adapter provided"
            : "No adapter"}
        </div>
      );
    };

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>,
    );

    expect(screen.getByText("Adapter provided")).toBeInTheDocument();
  });

  it("throws error when useSettingsPersistenceAdapter is used outside provider", () => {
    const TestComponent = () => {
      const adapter = useSettingsPersistenceAdapter();
      return <div>{adapter ? "Has adapter" : "No adapter"}</div>;
    };

    // Suppress console.error for this test since we expect an error
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useSettingsPersistenceAdapter must be used within a SettingsProvider",
    );

    consoleSpy.mockRestore();
  });

  it("provides the correct adapter interface", () => {
    const TestComponent = () => {
      const adapter = useSettingsPersistenceAdapter();
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
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>,
    );

    expect(screen.getByText("Interface correct")).toBeInTheDocument();
  });
});
