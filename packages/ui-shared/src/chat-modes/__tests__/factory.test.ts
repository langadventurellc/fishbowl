import {
  createChatModeHandler,
  getSupportedChatModes,
  isSupportedChatMode,
  type ChatModeName,
} from "../index";
import { ManualChatMode } from "../ManualChatMode";
import { RoundRobinChatMode } from "../RoundRobinChatMode";

describe("Chat Mode Factory", () => {
  describe("createChatModeHandler", () => {
    it("should create ManualChatMode instance for 'manual'", () => {
      const handler = createChatModeHandler("manual");

      expect(handler).toBeInstanceOf(ManualChatMode);
      expect(handler.name).toBe("manual");
    });

    it("should create RoundRobinChatMode instance for 'round-robin'", () => {
      const handler = createChatModeHandler("round-robin");

      expect(handler).toBeInstanceOf(RoundRobinChatMode);
      expect(handler.name).toBe("round-robin");
    });

    it("should create different instances on multiple calls", () => {
      const handler1 = createChatModeHandler("manual");
      const handler2 = createChatModeHandler("manual");

      expect(handler1).not.toBe(handler2);
      expect(handler1).toBeInstanceOf(ManualChatMode);
      expect(handler2).toBeInstanceOf(ManualChatMode);
    });

    it("should throw descriptive error for unknown mode", () => {
      expect(() => {
        // @ts-expect-error - Testing runtime error handling
        createChatModeHandler("unknown-mode");
      }).toThrow(
        "Unknown chat mode: unknown-mode. Supported modes: manual, round-robin",
      );
    });

    it("should throw error for null mode", () => {
      expect(() => {
        // @ts-expect-error - Testing runtime error handling
        createChatModeHandler(null);
      }).toThrow("Unknown chat mode: null");
    });

    it("should throw error for undefined mode", () => {
      expect(() => {
        // @ts-expect-error - Testing runtime error handling
        createChatModeHandler(undefined);
      }).toThrow("Unknown chat mode: undefined");
    });

    it("should throw error for empty string mode", () => {
      expect(() => {
        // @ts-expect-error - Testing runtime error handling
        createChatModeHandler("");
      }).toThrow("Unknown chat mode: ");
    });
  });

  describe("getSupportedChatModes", () => {
    it("should return array of supported mode names", () => {
      const modes = getSupportedChatModes();

      expect(Array.isArray(modes)).toBe(true);
      expect(modes).toContain("manual");
      expect(modes).toContain("round-robin");
      expect(modes).toHaveLength(2);
    });

    it("should return consistent results on multiple calls", () => {
      const modes1 = getSupportedChatModes();
      const modes2 = getSupportedChatModes();

      expect(modes1).toEqual(modes2);
    });

    it("should return array with correct typing", () => {
      const modes = getSupportedChatModes();

      // TypeScript compilation test - should work with ChatModeName type
      modes.forEach((mode: ChatModeName) => {
        expect(typeof mode).toBe("string");
      });
    });
  });

  describe("isSupportedChatMode", () => {
    it("should return true for supported modes", () => {
      expect(isSupportedChatMode("manual")).toBe(true);
      expect(isSupportedChatMode("round-robin")).toBe(true);
    });

    it("should return false for unsupported modes", () => {
      expect(isSupportedChatMode("unknown")).toBe(false);
      expect(isSupportedChatMode("invalid-mode")).toBe(false);
      expect(isSupportedChatMode("")).toBe(false);
      expect(isSupportedChatMode("MANUAL")).toBe(false); // Case sensitive
    });

    it("should return false for non-string inputs", () => {
      // @ts-expect-error - Testing runtime behavior
      expect(isSupportedChatMode(null)).toBe(false);
      // @ts-expect-error - Testing runtime behavior
      expect(isSupportedChatMode(undefined)).toBe(false);
      // @ts-expect-error - Testing runtime behavior
      expect(isSupportedChatMode(123)).toBe(false);
      // @ts-expect-error - Testing runtime behavior
      expect(isSupportedChatMode({})).toBe(false);
      // @ts-expect-error - Testing runtime behavior
      expect(isSupportedChatMode([])).toBe(false);
    });

    it("should work as type guard", () => {
      const mode: string = "manual";

      if (isSupportedChatMode(mode)) {
        // TypeScript should narrow the type to ChatModeName
        const handler = createChatModeHandler(mode);
        expect(handler).toBeDefined();
      }
    });
  });

  describe("integration", () => {
    it("should work with all supported modes from getSupportedChatModes", () => {
      const supportedModes = getSupportedChatModes();

      supportedModes.forEach((mode) => {
        expect(isSupportedChatMode(mode)).toBe(true);

        const handler = createChatModeHandler(mode);
        expect(handler).toBeDefined();
        expect(handler.name).toBe(mode);
      });
    });

    it("should create handlers with correct interface compliance", () => {
      const supportedModes = getSupportedChatModes();

      supportedModes.forEach((mode) => {
        const handler = createChatModeHandler(mode);

        // Verify handler implements required interface methods
        expect(typeof handler.handleAgentAdded).toBe("function");
        expect(typeof handler.handleAgentToggle).toBe("function");
        expect(typeof handler.handleConversationProgression).toBe("function");
        expect(typeof handler.name).toBe("string");

        // Verify methods return proper intent objects
        const intent = handler.handleAgentAdded([], "test-agent");
        expect(intent).toHaveProperty("toEnable");
        expect(intent).toHaveProperty("toDisable");
        expect(Array.isArray(intent.toEnable)).toBe(true);
        expect(Array.isArray(intent.toDisable)).toBe(true);
      });
    });
  });

  describe("extensibility", () => {
    it("should handle new modes easily when registry is extended", () => {
      // This test documents how the pattern supports future extension
      const currentModes = getSupportedChatModes();
      expect(currentModes).toEqual(["manual", "round-robin"]);

      // When new modes are added to CHAT_MODE_REGISTRY, they should automatically
      // be supported by all factory functions
    });
  });

  describe("error messages", () => {
    it("should provide helpful error messages with supported modes list", () => {
      let thrownError: Error;
      try {
        // @ts-expect-error - Testing error handling
        createChatModeHandler("invalid");
      } catch (error) {
        thrownError = error as Error;
      }

      expect(thrownError!).toBeDefined();
      expect(thrownError!.message).toContain("Unknown chat mode: invalid");
      expect(thrownError!.message).toContain("Supported modes:");
      expect(thrownError!.message).toContain("manual");
      expect(thrownError!.message).toContain("round-robin");
    });
  });

  describe("performance", () => {
    it("should create handlers efficiently", () => {
      const start = performance.now();

      // Create many handlers
      for (let i = 0; i < 100; i++) {
        createChatModeHandler("manual");
        createChatModeHandler("round-robin");
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(10); // Should be very fast
    });
  });
});

// Test re-exports
describe("Chat Mode Exports", () => {
  it("should re-export all required types and classes", () => {
    // This ensures the barrel export pattern works correctly
    expect(typeof createChatModeHandler).toBe("function");
    expect(typeof getSupportedChatModes).toBe("function");
    expect(typeof isSupportedChatMode).toBe("function");
    expect(typeof ManualChatMode).toBe("function");
    expect(typeof RoundRobinChatMode).toBe("function");
  });
});
