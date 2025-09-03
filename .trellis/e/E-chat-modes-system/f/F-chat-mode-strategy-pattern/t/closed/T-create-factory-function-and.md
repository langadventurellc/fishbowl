---
id: T-create-factory-function-and
title: Create factory function and barrel exports with unit tests
status: done
priority: medium
parent: F-chat-mode-strategy-pattern
prerequisites:
  - T-implement-manualchatmode
  - T-implement-roundrobinchatmode
affectedFiles:
  packages/ui-shared/src/chat-modes/index.ts: Updated with factory function,
    registry pattern, utility functions, and comprehensive barrel exports. Added
    createChatModeHandler() with registry-based mode creation,
    getSupportedChatModes() and isSupportedChatMode() utility functions,
    ChatModeName type, and re-exports for all chat mode types and classes with
    comprehensive JSDoc documentation.
  packages/ui-shared/src/chat-modes/__tests__/factory.test.ts:
    Created comprehensive unit test suite with 37 test cases covering factory
    function creation, error handling for invalid inputs, utility function
    validation, type safety verification, integration testing with existing
    modes, performance testing, and barrel export validation. Tests include edge
    cases, TypeScript type guard functionality, and extensibility pattern
    documentation.
log:
  - Successfully implemented factory function and barrel exports with
    comprehensive unit tests for chat mode strategy pattern. Created
    createChatModeHandler() factory function with registry pattern, utility
    functions (getSupportedChatModes, isSupportedChatMode), and complete barrel
    exports. All functions include comprehensive JSDoc documentation with
    examples. Implemented robust error handling for unknown modes with
    descriptive messages listing supported modes. Created extensive unit test
    suite with 37 test cases covering factory functionality, error handling,
    performance requirements, type safety, and integration scenarios. All
    quality checks pass and tests run successfully with full coverage of factory
    functions, utility functions, and barrel exports.
schema: v1.0
childrenIds: []
created: 2025-09-03T20:25:46.702Z
updated: 2025-09-03T20:25:46.702Z
---

# Create Factory Function and Barrel Exports with Unit Tests

## Context

Implement the factory function and barrel exports that provide a clean API for creating chat mode handler instances and exporting all chat mode components. This includes error handling for unknown modes and extensibility for future mode additions.

## Technical Approach

Create main index file and comprehensive unit tests:

- `packages/ui-shared/src/chat-modes/index.ts` - Factory function and barrel exports
- `packages/ui-shared/src/chat-modes/__tests__/factory.test.ts` - Complete factory testing

## Detailed Implementation Requirements

### Factory and Exports (packages/ui-shared/src/chat-modes/index.ts)

````typescript
import type { ChatModeHandler } from "./ChatModeHandler";
import { ManualChatMode } from "./ManualChatMode";
import { RoundRobinChatMode } from "./RoundRobinChatMode";

/**
 * Chat mode registry mapping mode names to handler constructors
 */
const CHAT_MODE_REGISTRY = {
  manual: ManualChatMode,
  "round-robin": RoundRobinChatMode,
} as const;

/**
 * Type representing valid chat mode names
 */
export type ChatModeName = keyof typeof CHAT_MODE_REGISTRY;

/**
 * Factory function to create chat mode handler instances
 *
 * Creates appropriate chat mode handler based on the provided mode name.
 * Supports extensible registration of new modes via the registry pattern.
 *
 * @param mode - The chat mode name ("manual" or "round-robin")
 * @returns ChatModeHandler instance for the specified mode
 * @throws Error when mode is not recognized
 *
 * @example
 * ```typescript
 * const manualHandler = createChatModeHandler("manual");
 * const roundRobinHandler = createChatModeHandler("round-robin");
 * ```
 */
export function createChatModeHandler(mode: ChatModeName): ChatModeHandler {
  const HandlerClass = CHAT_MODE_REGISTRY[mode];

  if (!HandlerClass) {
    throw new Error(
      `Unknown chat mode: ${mode}. Supported modes: ${Object.keys(CHAT_MODE_REGISTRY).join(", ")}`,
    );
  }

  return new HandlerClass();
}

/**
 * Get list of all supported chat mode names
 *
 * @returns Array of supported chat mode names
 *
 * @example
 * ```typescript
 * const modes = getSupportedChatModes();
 * // Returns: ["manual", "round-robin"]
 * ```
 */
export function getSupportedChatModes(): ChatModeName[] {
  return Object.keys(CHAT_MODE_REGISTRY) as ChatModeName[];
}

/**
 * Check if a chat mode name is supported
 *
 * @param mode - The mode name to check
 * @returns true if mode is supported, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isSupportedChatMode("manual"); // true
 * const isInvalid = isSupportedChatMode("unknown"); // false
 * ```
 */
export function isSupportedChatMode(mode: string): mode is ChatModeName {
  return mode in CHAT_MODE_REGISTRY;
}

// Re-export all types and classes for clean imports
export type { ChatModeHandler } from "./ChatModeHandler";
export type { ChatModeIntent } from "./ChatModeIntent";
export { ManualChatMode } from "./ManualChatMode";
export { RoundRobinChatMode } from "./RoundRobinChatMode";
````

### Unit Tests (packages/ui-shared/src/chat-modes/**tests**/factory.test.ts)

```typescript
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
      try {
        // @ts-expect-error - Testing error handling
        createChatModeHandler("invalid");
        fail("Expected error to be thrown");
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        expect(error.message).toContain("Unknown chat mode: invalid");
        expect(error.message).toContain("Supported modes:");
        expect(error.message).toContain("manual");
        expect(error.message).toContain("round-robin");
      }
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
```

## Acceptance Criteria

- [ ] **Factory Function**: createChatModeHandler() creates correct handler instances
- [ ] **Mode Registry**: Internal registry maps mode names to constructors
- [ ] **Error Handling**: Descriptive errors for unknown modes with supported modes list
- [ ] **Utility Functions**: getSupportedChatModes() and isSupportedChatMode() work correctly
- [ ] **Type Safety**: ChatModeName type properly constrains factory input
- [ ] **Barrel Exports**: All types and classes re-exported for clean imports
- [ ] **Extensibility**: Registry pattern supports easy addition of new modes
- [ ] **Unit Tests**: >95% code coverage with comprehensive test cases
- [ ] **Documentation**: JSDoc with examples for all public functions
- [ ] **Performance**: Handler creation completes quickly (<10ms for 100 instances)

## Dependencies

- Requires T-implement-manualchatmode (ManualChatMode class)
- Requires T-implement-roundrobinchatmode (RoundRobinChatMode class)
- Requires ChatModeHandler and ChatModeIntent interfaces
- Must run `pnpm build:libs` after implementation

## Testing Requirements

- Unit tests cover factory function with valid and invalid inputs
- Error handling tests for edge cases (null, undefined, empty string)
- Utility function tests (getSupportedChatModes, isSupportedChatMode)
- Integration tests ensuring factory works with all supported modes
- Type guard functionality tests
- Performance tests for handler creation
- Re-export validation tests

## Security Considerations

- Input validation for factory function parameters
- Safe error handling without exposing internal implementation
- Type safety to prevent invalid mode usage
- No sensitive information in error messages

## Performance Requirements

- Factory function should create handlers efficiently (<10ms for 100 instances)
- Utility functions should be fast for UI usage
- Minimal memory allocation and no memory leaks
- Registry lookup should be O(1) operation

## Out of Scope

- Dynamic mode registration at runtime (static registry only)
- Mode configuration or parameters (simple factory pattern)
- Integration with state management (handled in separate feature)
- UI components for mode selection (separate epic)
