import { renderHook, act } from "@testing-library/react";
import { useKeyboardNavigation } from "../useKeyboardNavigation";
import type { KeyboardNavigationOptions } from "../types/KeyboardNavigationOptions";

// Mock keyboard events helper
const createKeyboardEvent = (
  key: string,
  options: Partial<KeyboardEvent> = {},
): any => ({
  key,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...options,
});

describe("useKeyboardNavigation", () => {
  const mockItems = ["item1", "item2", "item3"];
  const mockOnItemChange = jest.fn();
  const mockOnItemActivate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultOptions: KeyboardNavigationOptions = {
    items: mockItems,
    activeItem: "item1",
    onItemChange: mockOnItemChange,
    onItemActivate: mockOnItemActivate,
  };

  describe("initialization", () => {
    it("should initialize with correct focused index based on active item", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          activeItem: "item2",
        }),
      );

      expect(result.current.focusedIndex).toBe(1);
    });

    it("should default to index 0 when active item is not found", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          activeItem: "nonexistent",
        }),
      );

      expect(result.current.focusedIndex).toBe(0);
    });

    it("should handle empty items array gracefully", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          items: [],
        }),
      );

      expect(result.current.focusedIndex).toBe(0);
    });
  });

  describe("ArrowDown navigation", () => {
    it("should move to next item on ArrowDown", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(defaultOptions),
      );
      const event = createKeyboardEvent("ArrowDown");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnItemChange).toHaveBeenCalledWith("item2");
    });

    it("should loop to first item when at last item with loop=true", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          activeItem: "item3",
          loop: true,
        }),
      );
      const event = createKeyboardEvent("ArrowDown");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnItemChange).toHaveBeenCalledWith("item1");
    });

    it("should stay at last item when loop=false", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          activeItem: "item3",
          loop: false,
        }),
      );
      const event = createKeyboardEvent("ArrowDown");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnItemChange).not.toHaveBeenCalled();
    });
  });

  describe("ArrowUp navigation", () => {
    it("should move to previous item on ArrowUp", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          activeItem: "item2",
        }),
      );
      const event = createKeyboardEvent("ArrowUp");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnItemChange).toHaveBeenCalledWith("item1");
    });

    it("should loop to last item when at first item with loop=true", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          loop: true,
        }),
      );
      const event = createKeyboardEvent("ArrowUp");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnItemChange).toHaveBeenCalledWith("item3");
    });

    it("should stay at first item when loop=false", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          loop: false,
        }),
      );
      const event = createKeyboardEvent("ArrowUp");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnItemChange).not.toHaveBeenCalled();
    });
  });

  describe("Home and End navigation", () => {
    it("should move to first item on Home key", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          activeItem: "item3",
        }),
      );
      const event = createKeyboardEvent("Home");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnItemChange).toHaveBeenCalledWith("item1");
    });

    it("should move to last item on End key", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(defaultOptions),
      );
      const event = createKeyboardEvent("End");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnItemChange).toHaveBeenCalledWith("item3");
    });
  });

  describe("Enter and Space activation", () => {
    it("should call onItemActivate on Enter key", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          activeItem: "item2",
        }),
      );
      const event = createKeyboardEvent("Enter");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnItemActivate).toHaveBeenCalledWith("item2");
    });

    it("should call onItemActivate on Space key", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          activeItem: "item2",
        }),
      );
      const event = createKeyboardEvent(" ");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnItemActivate).toHaveBeenCalledWith("item2");
    });

    it("should fallback to onItemChange when onItemActivate is not provided", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          onItemActivate: undefined,
        }),
      );
      const event = createKeyboardEvent("Enter");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnItemChange).toHaveBeenCalledWith("item1");
    });
  });

  describe("non-navigation keys", () => {
    it("should ignore non-navigation keys", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(defaultOptions),
      );
      const event = createKeyboardEvent("a");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockOnItemChange).not.toHaveBeenCalled();
      expect(mockOnItemActivate).not.toHaveBeenCalled();
    });

    it("should ignore Tab key", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(defaultOptions),
      );
      const event = createKeyboardEvent("Tab");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockOnItemChange).not.toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("should not respond to any keys when disabled", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          ...defaultOptions,
          disabled: true,
        }),
      );
      const event = createKeyboardEvent("ArrowDown");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockOnItemChange).not.toHaveBeenCalled();
    });
  });

  describe("setFocusedIndex", () => {
    it("should allow manual focus index setting", () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation(defaultOptions),
      );

      // First verify initial state
      expect(result.current.focusedIndex).toBe(0);

      act(() => {
        result.current.setFocusedIndex(2);
      });

      expect(result.current.focusedIndex).toBe(2);
    });
  });

  describe("focus synchronization", () => {
    it("should update focused index when active item changes", () => {
      const { result, rerender } = renderHook(
        (props) => useKeyboardNavigation(props),
        { initialProps: defaultOptions },
      );

      expect(result.current.focusedIndex).toBe(0);

      rerender({
        ...defaultOptions,
        activeItem: "item3",
      });

      expect(result.current.focusedIndex).toBe(2);
    });

    it("should maintain focused index within bounds when items change", () => {
      const { result, rerender } = renderHook(
        (props) => useKeyboardNavigation(props),
        {
          initialProps: {
            ...defaultOptions,
            activeItem: "item3",
          },
        },
      );

      expect(result.current.focusedIndex).toBe(2);

      rerender({
        ...defaultOptions,
        items: ["item1", "item2"], // Shorter list
        activeItem: "item2",
      });

      expect(result.current.focusedIndex).toBe(1);
    });
  });
});
