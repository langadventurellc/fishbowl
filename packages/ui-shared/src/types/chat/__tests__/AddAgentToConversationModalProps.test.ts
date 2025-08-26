/**
 * Unit tests for AddAgentToConversationModalProps interface.
 *
 * Tests interface structure validation, property types,
 * and integration with existing modal patterns.
 *
 * @module types/chat/__tests__/AddAgentToConversationModalProps.test
 */

import type { AddAgentToConversationModalProps } from "../AddAgentToConversationModalProps";

describe("AddAgentToConversationModalProps", () => {
  describe("interface structure", () => {
    it("should have required properties with correct types", () => {
      // This test validates that the interface can be satisfied with required properties
      const validProps: AddAgentToConversationModalProps = {
        open: true,
        onOpenChange: (_open: boolean) => {},
        conversationId: "conv-123",
      };

      expect(typeof validProps.open).toBe("boolean");
      expect(typeof validProps.onOpenChange).toBe("function");
      expect(typeof validProps.conversationId).toBe("string");
    });

    it("should allow optional onAgentAdded callback", () => {
      const propsWithCallback: AddAgentToConversationModalProps = {
        open: false,
        onOpenChange: (_open: boolean) => {},
        conversationId: "conv-456",
        onAgentAdded: () => {},
      };

      expect(typeof propsWithCallback.onAgentAdded).toBe("function");
    });

    it("should work without optional onAgentAdded callback", () => {
      const propsWithoutCallback: AddAgentToConversationModalProps = {
        open: false,
        onOpenChange: (_open: boolean) => {},
        conversationId: "conv-789",
      };

      expect(propsWithoutCallback.onAgentAdded).toBeUndefined();
    });
  });

  describe("type compatibility", () => {
    it("should accept boolean values for open property", () => {
      const testProps = (open: boolean): AddAgentToConversationModalProps => ({
        open,
        onOpenChange: () => {},
        conversationId: "test-id",
      });

      expect(() => testProps(true)).not.toThrow();
      expect(() => testProps(false)).not.toThrow();
    });

    it("should accept proper callback function for onOpenChange", () => {
      const mockCallback = jest.fn((open: boolean) => {
        expect(typeof open).toBe("boolean");
      });

      const props: AddAgentToConversationModalProps = {
        open: true,
        onOpenChange: mockCallback,
        conversationId: "test-conv",
      };

      props.onOpenChange(false);
      expect(mockCallback).toHaveBeenCalledWith(false);
    });

    it("should accept string values for conversationId", () => {
      const createProps = (id: string): AddAgentToConversationModalProps => ({
        open: true,
        onOpenChange: () => {},
        conversationId: id,
      });

      expect(() => createProps("conv-123")).not.toThrow();
      expect(() => createProps("")).not.toThrow();
      expect(() =>
        createProps("very-long-conversation-id-12345"),
      ).not.toThrow();
    });

    it("should accept optional onAgentAdded callback with no parameters", () => {
      const mockCallback = jest.fn();

      const props: AddAgentToConversationModalProps = {
        open: true,
        onOpenChange: () => {},
        conversationId: "test-conv",
        onAgentAdded: mockCallback,
      };

      if (props.onAgentAdded) {
        props.onAgentAdded();
      }

      expect(mockCallback).toHaveBeenCalledWith();
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("modal pattern consistency", () => {
    it("should follow established modal prop patterns with open and onOpenChange", () => {
      // Test that it follows the same pattern as other modal components
      const modalProps: Pick<
        AddAgentToConversationModalProps,
        "open" | "onOpenChange"
      > = {
        open: true,
        onOpenChange: (_open: boolean) => {},
      };

      expect(modalProps).toHaveProperty("open");
      expect(modalProps).toHaveProperty("onOpenChange");
      expect(typeof modalProps.open).toBe("boolean");
      expect(typeof modalProps.onOpenChange).toBe("function");
    });

    it("should have domain-specific properties for agent addition", () => {
      const domainProps: Pick<
        AddAgentToConversationModalProps,
        "conversationId" | "onAgentAdded"
      > = {
        conversationId: "conv-123",
        onAgentAdded: () => {},
      };

      expect(domainProps).toHaveProperty("conversationId");
      expect(domainProps).toHaveProperty("onAgentAdded");
      expect(typeof domainProps.conversationId).toBe("string");
      expect(typeof domainProps.onAgentAdded).toBe("function");
    });
  });

  describe("import and export functionality", () => {
    it("should be importable from the module", () => {
      // This test validates that the interface can be imported
      // The fact that we can use it in type annotations above proves this works
      const props: AddAgentToConversationModalProps = {
        open: true,
        onOpenChange: () => {},
        conversationId: "test",
      };

      expect(props).toBeDefined();
    });
  });

  describe("JSDoc documentation", () => {
    it("should have comprehensive property documentation", () => {
      // This test ensures the interface has proper JSDoc comments
      // While we can't directly test JSDoc at runtime, this documents the expectation
      const exampleProps: AddAgentToConversationModalProps = {
        open: true, // Should be documented as "Whether the modal is open"
        onOpenChange: () => {}, // Should be documented as "Callback when modal open state changes"
        conversationId: "conv-123", // Should be documented as "ID of the conversation to add agents to"
        onAgentAdded: () => {}, // Should be documented as "Optional callback fired after successful agent addition"
      };

      expect(exampleProps).toBeDefined();
    });
  });
});
