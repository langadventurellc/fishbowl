/**
 * Unit tests for useFocusTrap hook.
 *
 * Tests the core functionality of the focus trap hook including initialization,
 * event listener management, and configuration handling.
 *
 * @module hooks/__tests__/useFocusTrap.test
 */

import { renderHook, act } from "@testing-library/react";
import { useFocusTrap } from "../useFocusTrap";
import type { FocusTrapOptions } from "../types/FocusTrapOptions";

// Mock console methods
const mockConsoleWarn = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "warn").mockImplementation(mockConsoleWarn);
  document.body.innerHTML = "";
});

afterEach(() => {
  jest.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("useFocusTrap", () => {
  describe("Hook Initialization", () => {
    it("should return containerRef and setInitialFocus function", () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: false }));

      expect(result.current.containerRef).toBeDefined();
      expect(result.current.containerRef.current).toBeNull();
      expect(result.current.setInitialFocus).toBeInstanceOf(Function);
    });

    it("should not throw with minimal configuration", () => {
      expect(() => {
        renderHook(() => useFocusTrap({ isActive: false }));
      }).not.toThrow();
    });

    it("should handle all configuration options", () => {
      expect(() => {
        renderHook(() =>
          useFocusTrap({
            isActive: true,
            restoreFocus: true,
            initialFocusSelector: "[data-focus]",
          }),
        );
      }).not.toThrow();
    });

    it("should handle undefined container gracefully", () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }));

      // Should not throw when container is not attached
      expect(() => {
        result.current.setInitialFocus(document.createElement("button"));
      }).not.toThrow();
    });
  });

  describe("Event Listener Management", () => {
    it("should add keydown listener when activated", () => {
      const addEventListenerSpy = jest.spyOn(document, "addEventListener");
      const container = document.createElement("div");
      document.body.appendChild(container);

      const { result } = renderHook(() => useFocusTrap({ isActive: true }));

      act(() => {
        result.current.containerRef.current = container;
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
    });

    it("should remove keydown listener when deactivated", () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener",
      );
      const container = document.createElement("div");
      document.body.appendChild(container);

      const { result, rerender } = renderHook<
        ReturnType<typeof useFocusTrap>,
        FocusTrapOptions
      >((props) => useFocusTrap(props), { initialProps: { isActive: true } });

      act(() => {
        result.current.containerRef.current = container;
      });

      // Deactivate
      act(() => {
        rerender({ isActive: false });
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
    });

    it("should remove keydown listener on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener",
      );
      const container = document.createElement("div");
      document.body.appendChild(container);

      const { result, unmount } = renderHook(() =>
        useFocusTrap({ isActive: true }),
      );

      act(() => {
        result.current.containerRef.current = container;
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
    });
  });

  describe("setInitialFocus Function", () => {
    it("should handle null element gracefully", () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: false }));

      expect(() => {
        act(() => {
          result.current.setInitialFocus(null);
        });
      }).not.toThrow();
    });

    it("should validate element is within container", () => {
      const container = document.createElement("div");
      const externalButton = document.createElement("button");
      document.body.appendChild(container);
      document.body.appendChild(externalButton);

      const { result } = renderHook(() => useFocusTrap({ isActive: false }));

      act(() => {
        result.current.containerRef.current = container;
      });

      act(() => {
        result.current.setInitialFocus(externalButton);
      });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Initial focus element is not within the focus trap container",
      );
    });

    it("should accept element within container", () => {
      const container = document.createElement("div");
      const internalButton = document.createElement("button");
      container.appendChild(internalButton);
      document.body.appendChild(container);

      const { result } = renderHook(() => useFocusTrap({ isActive: false }));

      act(() => {
        result.current.containerRef.current = container;
      });

      expect(() => {
        act(() => {
          result.current.setInitialFocus(internalButton);
        });
      }).not.toThrow();

      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe("Configuration Options", () => {
    it("should work with restoreFocus enabled", () => {
      const { result, rerender } = renderHook<
        ReturnType<typeof useFocusTrap>,
        FocusTrapOptions
      >((props) => useFocusTrap(props), {
        initialProps: { isActive: false, restoreFocus: true },
      });

      const container = document.createElement("div");
      const button = document.createElement("button");
      container.appendChild(button);
      document.body.appendChild(container);

      act(() => {
        result.current.containerRef.current = container;
      });

      // Activate then deactivate
      expect(() => {
        act(() => {
          rerender({ isActive: true, restoreFocus: true });
        });

        act(() => {
          rerender({ isActive: false, restoreFocus: true });
        });
      }).not.toThrow();
    });

    it("should work with restoreFocus disabled", () => {
      const { result, rerender } = renderHook<
        ReturnType<typeof useFocusTrap>,
        FocusTrapOptions
      >((props) => useFocusTrap(props), {
        initialProps: { isActive: false, restoreFocus: false },
      });

      const container = document.createElement("div");
      const button = document.createElement("button");
      container.appendChild(button);
      document.body.appendChild(container);

      act(() => {
        result.current.containerRef.current = container;
      });

      expect(() => {
        act(() => {
          rerender({ isActive: true, restoreFocus: false });
        });

        act(() => {
          rerender({ isActive: false, restoreFocus: false });
        });
      }).not.toThrow();
    });

    it("should handle initialFocusSelector option", () => {
      const { result } = renderHook(() =>
        useFocusTrap({
          isActive: true,
          initialFocusSelector: "[data-initial-focus]",
        }),
      );

      const container = document.createElement("div");
      const button = document.createElement("button");
      button.setAttribute("data-initial-focus", "true");
      container.appendChild(button);
      document.body.appendChild(container);

      expect(() => {
        act(() => {
          result.current.containerRef.current = container;
        });
      }).not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle container removal gracefully", () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }));

      const container = document.createElement("div");
      const button = document.createElement("button");
      container.appendChild(button);
      document.body.appendChild(container);

      act(() => {
        result.current.containerRef.current = container;
      });

      // Remove container from DOM
      container.remove();

      // Should not throw when trying to work with removed container
      expect(() => {
        act(() => {
          result.current.setInitialFocus(button);
        });
      }).not.toThrow();
    });

    it("should handle empty container", () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }));

      const container = document.createElement("div");
      document.body.appendChild(container);

      expect(() => {
        act(() => {
          result.current.containerRef.current = container;
        });
      }).not.toThrow();
    });

    it("should handle invalid initial focus selector", () => {
      const { result } = renderHook(() =>
        useFocusTrap({
          isActive: true,
          initialFocusSelector: "[invalid selector syntax",
        }),
      );

      const container = document.createElement("div");
      const button = document.createElement("button");
      container.appendChild(button);
      document.body.appendChild(container);

      // Mock querySelector to throw for invalid selector
      const originalQuerySelector = container.querySelector;
      container.querySelector = jest.fn().mockImplementation(() => {
        throw new Error("Invalid selector");
      });

      expect(() => {
        act(() => {
          result.current.containerRef.current = container;
        });
      }).not.toThrow();

      // Restore original method
      container.querySelector = originalQuerySelector;
    });
  });

  describe("Multiple Lifecycle", () => {
    it("should handle multiple activation/deactivation cycles", () => {
      const { result, rerender } = renderHook<
        ReturnType<typeof useFocusTrap>,
        FocusTrapOptions
      >((props) => useFocusTrap(props), { initialProps: { isActive: false } });

      const container = document.createElement("div");
      const button = document.createElement("button");
      container.appendChild(button);
      document.body.appendChild(container);

      act(() => {
        result.current.containerRef.current = container;
      });

      // Multiple cycles should not throw
      expect(() => {
        for (let i = 0; i < 3; i++) {
          act(() => {
            rerender({ isActive: true });
          });

          act(() => {
            rerender({ isActive: false });
          });
        }
      }).not.toThrow();
    });

    it("should handle container changes", () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }));

      const container1 = document.createElement("div");
      const container2 = document.createElement("div");

      const button1 = document.createElement("button");
      const button2 = document.createElement("button");

      container1.appendChild(button1);
      container2.appendChild(button2);

      document.body.appendChild(container1);
      document.body.appendChild(container2);

      expect(() => {
        act(() => {
          result.current.containerRef.current = container1;
        });

        act(() => {
          result.current.containerRef.current = container2;
        });

        act(() => {
          result.current.containerRef.current = null;
        });
      }).not.toThrow();
    });
  });
});
