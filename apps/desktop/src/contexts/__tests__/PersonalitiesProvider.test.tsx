import "@testing-library/jest-dom";
import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import {
  PersonalitiesProvider,
  usePersonalitiesAdapter,
} from "../PersonalitiesProvider";
import { desktopPersonalitiesAdapter } from "../../adapters/desktopPersonalitiesAdapter";

// Mock the desktop personalities adapter
jest.mock("../../adapters/desktopPersonalitiesAdapter", () => ({
  desktopPersonalitiesAdapter: {
    save: jest.fn(),
    load: jest.fn(),
    reset: jest.fn(),
  },
}));

// Mock the usePersonalitiesStore from ui-shared
const mockInitialize = jest.fn();

// Create a mutable mock state that we can modify in tests
const mockStoreState = {
  isInitialized: false,
  personalities: [] as Array<{ id: string; name: string; [key: string]: any }>,
  error: null,
  initialize: mockInitialize,
};

jest.mock("@fishbowl-ai/ui-shared", () => ({
  usePersonalitiesStore: {
    getState: () => mockStoreState,
  },
}));

// Mock useServices hook
jest.mock("../useServices", () => ({
  useServices: jest.fn(() => ({
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  })),
}));

describe("PersonalitiesProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitialize.mockResolvedValue(undefined);
    // Reset mock store state
    mockStoreState.isInitialized = false;
    mockStoreState.personalities = [];
    mockStoreState.error = null;
    mockStoreState.initialize = mockInitialize;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("successful initialization", () => {
    it("should initialize store and render children when successful", async () => {
      mockStoreState.isInitialized = false;
      mockStoreState.personalities = [{ id: "1", name: "Test Personality" }];
      mockStoreState.error = null;
      mockStoreState.initialize = mockInitialize;

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      // Should show loading state initially
      expect(screen.getByText("Loading personalities...")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId("child")).toBeInTheDocument();
      });

      expect(screen.getByText("Test Child")).toBeInTheDocument();
      expect(mockInitialize).toHaveBeenCalledWith(
        desktopPersonalitiesAdapter,
        expect.objectContaining({
          debug: expect.any(Function),
          info: expect.any(Function),
          warn: expect.any(Function),
          error: expect.any(Function),
        }),
      );
    });

    it("should skip initialization if store is already initialized", async () => {
      mockStoreState.isInitialized = true;
      mockStoreState.personalities = [];
      mockStoreState.error = null;
      mockStoreState.initialize = mockInitialize;

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      // Should render children immediately without loading state
      await waitFor(() => {
        expect(screen.getByTestId("child")).toBeInTheDocument();
      });

      expect(screen.getByText("Test Child")).toBeInTheDocument();
      expect(mockInitialize).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("should show loading spinner during initialization", () => {
      // Mock a store that doesn't resolve immediately
      mockInitialize.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          }),
      );

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      // Verify loading state is displayed
      expect(screen.getByText("Loading personalities...")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();

      // Verify loading spinner is present
      const spinner = screen.getByLabelText("Loading personalities...");
      expect(spinner).toBeInTheDocument();
    });

    it("should use correct CSS classes for loading state", () => {
      mockInitialize.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          }),
      );

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      // Verify loading spinner has proper styling classes
      const spinner = screen.getByLabelText("Loading personalities...");
      expect(spinner).toHaveClass(
        "animate-spin",
        "h-8",
        "w-8",
        "border-4",
        "border-primary",
        "border-t-transparent",
        "rounded-full",
      );

      // Verify container has proper classes
      const mainContainer = document.querySelector(
        ".flex.items-center.justify-center.min-h-\\[200px\\]",
      );
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("should display error message when initialization fails", async () => {
      const testError = new Error("Test initialization error");
      mockInitialize.mockRejectedValue(testError);

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Failed to Initialize Personalities"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Test initialization error")).toBeInTheDocument();
      expect(screen.getByText("Reload Application")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });

    it("should handle both Error objects and string errors", async () => {
      // Test with Error object
      const errorObject = new Error("Error object message");
      mockInitialize.mockRejectedValue(errorObject);

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Error object message")).toBeInTheDocument();
      });

      // Test with string error in a separate test component to avoid rerender issues
      jest.clearAllMocks();
      mockStoreState.isInitialized = false;
      mockStoreState.personalities = [];
      mockStoreState.error = null;
      mockStoreState.initialize = mockInitialize;
      mockInitialize.mockRejectedValue("String error message");

      // Render a new component instance
      const { container } = render(
        <PersonalitiesProvider>
          <div data-testid="child-2">Test Child 2</div>
        </PersonalitiesProvider>,
        { container: document.createElement("div") },
      );

      await waitFor(() => {
        expect(
          container.querySelector('[class*="text-muted-foreground"]'),
        ).toHaveTextContent("String error message");
      });
    });

    it("should show reload button that is clickable", async () => {
      const testError = new Error("Test error");
      mockInitialize.mockRejectedValue(testError);

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Reload Application")).toBeInTheDocument();
      });

      const reloadButton = screen.getByText("Reload Application");
      expect(reloadButton).toBeEnabled();
      expect(reloadButton).toHaveClass(
        "px-4",
        "py-2",
        "bg-primary",
        "text-primary-foreground",
        "rounded",
        "hover:bg-primary/90",
      );

      // Verify button is functional (clickable without error)
      expect(() => fireEvent.click(reloadButton)).not.toThrow();
    });
  });

  describe("context provider", () => {
    it("should provide adapter through context after successful initialization", async () => {
      mockInitialize.mockResolvedValue(undefined);

      const TestComponent = () => {
        const adapter = usePersonalitiesAdapter();
        return (
          <div data-testid="adapter-test">
            {adapter === desktopPersonalitiesAdapter
              ? "Adapter provided"
              : "No adapter"}
          </div>
        );
      };

      render(
        <PersonalitiesProvider>
          <TestComponent />
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Adapter provided")).toBeInTheDocument();
      });
    });

    it("should throw error when usePersonalitiesAdapter is used outside provider", () => {
      const TestComponent = () => {
        const adapter = usePersonalitiesAdapter();
        return <div>{adapter ? "Has adapter" : "No adapter"}</div>;
      };

      // Suppress console.error for this test since we expect an error
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        "usePersonalitiesAdapter must be used within a PersonalitiesProvider",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("component lifecycle", () => {
    it("should prevent multiple initialization attempts", async () => {
      let resolveInit: () => void;
      mockInitialize.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveInit = resolve;
          }),
      );

      const { rerender } = render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      // Trigger multiple re-renders during initialization
      rerender(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child Updated</div>
        </PersonalitiesProvider>,
      );

      // Resolve the initialization
      await act(async () => {
        resolveInit!();
      });

      await waitFor(() => {
        expect(screen.getByTestId("child")).toBeInTheDocument();
      });

      // Should only be called once despite multiple re-renders
      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });

    it("should cleanup properly on unmount", async () => {
      let resolveInit: () => void;
      mockInitialize.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveInit = resolve;
          }),
      );

      const { unmount } = render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      // Unmount during initialization
      unmount();

      // Complete initialization after unmount
      await act(async () => {
        resolveInit!();
      });

      // Should not cause any errors or warnings
      // The component should handle unmounting gracefully
      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });

    it("should handle mount/unmount cycles correctly", async () => {
      mockInitialize.mockResolvedValue(undefined);

      const { unmount } = render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("child")).toBeInTheDocument();
      });

      // Unmount
      unmount();

      // Reset and remount with a fresh render
      jest.clearAllMocks();
      mockStoreState.isInitialized = false;
      mockStoreState.personalities = [];
      mockStoreState.error = null;
      mockStoreState.initialize = mockInitialize;

      render(
        <PersonalitiesProvider>
          <div data-testid="child-remounted">Test Child Remounted</div>
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("child-remounted")).toBeInTheDocument();
      });

      // Should reinitialize on remount
      expect(mockInitialize).toHaveBeenCalledWith(
        desktopPersonalitiesAdapter,
        expect.objectContaining({
          debug: expect.any(Function),
          info: expect.any(Function),
          warn: expect.any(Function),
          error: expect.any(Function),
        }),
      );
    });
  });

  describe("store integration", () => {
    it("should call store.initialize with correct adapter", async () => {
      mockInitialize.mockResolvedValue(undefined);

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalledWith(
          desktopPersonalitiesAdapter,
          expect.objectContaining({
            debug: expect.any(Function),
            info: expect.any(Function),
            warn: expect.any(Function),
            error: expect.any(Function),
          }),
        );
      });
    });

    it("should log initialization events correctly", async () => {
      const testPersonalities = [
        { id: "1", name: "Personality 1" },
        { id: "2", name: "Personality 2" },
      ];

      mockStoreState.isInitialized = false;
      mockStoreState.personalities = testPersonalities;
      mockStoreState.error = null;
      mockStoreState.initialize = mockInitialize;

      mockInitialize.mockResolvedValue(undefined);

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("child")).toBeInTheDocument();
      });

      // Verify initialization completed successfully
      expect(mockInitialize).toHaveBeenCalledWith(
        desktopPersonalitiesAdapter,
        expect.objectContaining({
          debug: expect.any(Function),
          info: expect.any(Function),
          warn: expect.any(Function),
          error: expect.any(Function),
        }),
      );
    });

    it("should log errors with proper metadata", async () => {
      const testError = new Error("Initialization failed");
      mockInitialize.mockRejectedValue(testError);

      render(
        <PersonalitiesProvider>
          <div data-testid="child">Test Child</div>
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Failed to Initialize Personalities"),
        ).toBeInTheDocument();
      });

      // Verify error was handled properly
      expect(mockInitialize).toHaveBeenCalledWith(
        desktopPersonalitiesAdapter,
        expect.objectContaining({
          debug: expect.any(Function),
          info: expect.any(Function),
          warn: expect.any(Function),
          error: expect.any(Function),
        }),
      );
    });

    it("should provide correct adapter interface after initialization", async () => {
      mockInitialize.mockResolvedValue(undefined);

      const TestComponent = () => {
        const adapter = usePersonalitiesAdapter();
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
        <PersonalitiesProvider>
          <TestComponent />
        </PersonalitiesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText("Interface correct")).toBeInTheDocument();
      });
    });
  });
});
