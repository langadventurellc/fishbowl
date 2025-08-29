/**
 * Unit tests for chat store barrel exports.
 *
 * Tests barrel export functionality, import resolution, and TypeScript
 * type compatibility to ensure clean integration with the main stores.
 *
 * @module stores/chat/__tests__/index.test
 */

import { renderHook } from "@testing-library/react";
import { useChatStore } from "../index";
import type { ChatStore } from "../index";

describe("Chat store barrel exports", () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useChatStore.getState().clearConversationState();
  });

  describe("Hook exports", () => {
    it("should export useChatStore", () => {
      expect(useChatStore).toBeDefined();
      expect(typeof useChatStore).toBe("function");
    });

    it("should provide working store instance", () => {
      const state = useChatStore.getState();
      expect(state.sendingMessage).toBe(false);
      expect(state.agentThinking).toEqual({});
      expect(state.lastError).toEqual({});
      expect(state.processingConversationId).toBe(null);
    });

    it("should provide all required store actions", () => {
      const state = useChatStore.getState();

      expect(typeof state.setSending).toBe("function");
      expect(typeof state.setAgentThinking).toBe("function");
      expect(typeof state.setAgentError).toBe("function");
      expect(typeof state.setProcessingConversation).toBe("function");
      expect(typeof state.clearAgentState).toBe("function");
      expect(typeof state.clearAllThinking).toBe("function");
      expect(typeof state.clearConversationState).toBe("function");
    });
  });

  describe("React hook integration", () => {
    it("should work with React renderHook", () => {
      const { result } = renderHook(() => useChatStore());
      expect(result.current).toBeDefined();
      expect(result.current.sendingMessage).toBe(false);
    });

    it("should provide working store state selectors", () => {
      const { result } = renderHook(() =>
        useChatStore((state) => state.sendingMessage),
      );
      expect(result.current).toBe(false);
    });
  });

  describe("TypeScript type exports", () => {
    it("should export ChatStore type interface", () => {
      // This test ensures TypeScript compilation works with the exported type
      const checkTypeCompatibility = (store: ChatStore): boolean => {
        return (
          typeof store.sendingMessage === "boolean" &&
          typeof store.agentThinking === "object" &&
          typeof store.lastError === "object" &&
          (store.processingConversationId === null ||
            typeof store.processingConversationId === "string") &&
          typeof store.setSending === "function" &&
          typeof store.setAgentThinking === "function" &&
          typeof store.setAgentError === "function" &&
          typeof store.setProcessingConversation === "function" &&
          typeof store.clearAgentState === "function" &&
          typeof store.clearAllThinking === "function" &&
          typeof store.clearConversationState === "function"
        );
      };

      const storeState = useChatStore.getState();
      expect(checkTypeCompatibility(storeState)).toBe(true);
    });

    it("should allow type-safe store usage", () => {
      // Test TypeScript type compatibility with barrel exports
      const store = useChatStore.getState();

      // These should all compile with correct types
      const sendingMessage: boolean = store.sendingMessage;
      const agentThinking: Record<string, boolean> = store.agentThinking;
      const lastError: Record<string, string | null> = store.lastError;
      const processingId: string | null = store.processingConversationId;

      expect(typeof sendingMessage).toBe("boolean");
      expect(typeof agentThinking).toBe("object");
      expect(typeof lastError).toBe("object");
      expect(processingId === null || typeof processingId === "string").toBe(
        true,
      );
    });
  });

  describe("Store functionality through barrel exports", () => {
    it("should maintain store state through barrel export", () => {
      const store = useChatStore.getState();

      // Test state updates work through barrel export
      store.setSending(true);
      expect(useChatStore.getState().sendingMessage).toBe(true);

      store.setAgentThinking("agent-123", true);
      expect(useChatStore.getState().agentThinking["agent-123"]).toBe(true);

      store.setAgentError("agent-123", "Test error");
      expect(useChatStore.getState().lastError["agent-123"]).toBe("Test error");

      store.setProcessingConversation("conv-456");
      expect(useChatStore.getState().processingConversationId).toBe("conv-456");
    });

    it("should provide clean state reset through barrel export", () => {
      const store = useChatStore.getState();

      // Set up some state
      store.setSending(true);
      store.setAgentThinking("agent-123", true);
      store.setAgentError("agent-456", "Error message");
      store.setProcessingConversation("conv-789");

      // Clear state
      store.clearConversationState();

      // Verify conversation-specific state is reset (but not global UI state like sendingMessage)
      const finalState = useChatStore.getState();
      expect(finalState.sendingMessage).toBe(true); // sendingMessage is not conversation-specific, so should remain
      expect(finalState.agentThinking).toEqual({});
      expect(finalState.lastError).toEqual({});
      expect(finalState.processingConversationId).toBe(null);
    });
  });

  describe("Import resolution", () => {
    it("should resolve imports from chat barrel export", () => {
      // Test that both hook and type can be imported from same barrel
      expect(useChatStore).toBeDefined();
      expect(typeof useChatStore).toBe("function");

      // Test that store provides expected interface
      const state = useChatStore.getState();
      const requiredProperties = [
        "sendingMessage",
        "agentThinking",
        "lastError",
        "processingConversationId",
        "setSending",
        "setAgentThinking",
        "setAgentError",
        "setProcessingConversation",
        "clearAgentState",
        "clearAllThinking",
        "clearConversationState",
      ];

      requiredProperties.forEach((prop) => {
        expect(state).toHaveProperty(prop);
      });
    });
  });
});
