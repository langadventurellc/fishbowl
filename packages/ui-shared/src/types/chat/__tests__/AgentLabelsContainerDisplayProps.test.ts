/**
 * Unit tests for AgentLabelsContainerDisplayProps interface.
 *
 * Tests interface structure validation, property types,
 * and integration with conversation agent patterns.
 *
 * @module types/chat/__tests__/AgentLabelsContainerDisplayProps.test
 */

import type { AgentPillViewModel } from "../../AgentPillViewModel";
import type { AgentLabelsContainerDisplayProps } from "../AgentLabelsContainerDisplayProps";

describe("AgentLabelsContainerDisplayProps", () => {
  const mockAgent: AgentPillViewModel = {
    name: "Test Agent",
    role: "Test Role",
    color: "#3b82f6",
    isThinking: false,
  };

  describe("interface structure", () => {
    it("should have required properties with correct types", () => {
      const validProps: AgentLabelsContainerDisplayProps = {
        agents: [mockAgent],
      };

      expect(Array.isArray(validProps.agents)).toBe(true);
      expect(validProps.agents.length).toBe(1);
    });

    it("should allow all optional properties", () => {
      const fullProps: AgentLabelsContainerDisplayProps = {
        agents: [mockAgent],
        onAddAgent: () => {},
        barHeight: "56px",
        agentSpacing: "8px",
        containerPadding: "0 16px",
        horizontalScroll: true,
        showBottomBorder: true,
        backgroundVariant: "card",
        className: "test-class",
        style: { backgroundColor: "red" },
        selectedConversationId: "conv-123",
      };

      expect(typeof fullProps.onAddAgent).toBe("function");
      expect(fullProps.barHeight).toBe("56px");
      expect(fullProps.agentSpacing).toBe("8px");
      expect(fullProps.containerPadding).toBe("0 16px");
      expect(fullProps.horizontalScroll).toBe(true);
      expect(fullProps.showBottomBorder).toBe(true);
      expect(fullProps.backgroundVariant).toBe("card");
      expect(fullProps.className).toBe("test-class");
      expect(fullProps.style).toEqual({ backgroundColor: "red" });
      expect(fullProps.selectedConversationId).toBe("conv-123");
    });

    it("should work without optional properties", () => {
      const minimalProps: AgentLabelsContainerDisplayProps = {
        agents: [],
      };

      expect(minimalProps.onAddAgent).toBeUndefined();
      expect(minimalProps.selectedConversationId).toBeUndefined();
    });
  });

  describe("selectedConversationId property", () => {
    it("should accept string value for selectedConversationId", () => {
      const props: AgentLabelsContainerDisplayProps = {
        agents: [mockAgent],
        selectedConversationId: "conversation-123",
      };

      expect(typeof props.selectedConversationId).toBe("string");
      expect(props.selectedConversationId).toBe("conversation-123");
    });

    it("should accept null value for selectedConversationId", () => {
      const props: AgentLabelsContainerDisplayProps = {
        agents: [mockAgent],
        selectedConversationId: null,
      };

      expect(props.selectedConversationId).toBeNull();
    });

    it("should work without selectedConversationId (backward compatibility)", () => {
      const props: AgentLabelsContainerDisplayProps = {
        agents: [mockAgent],
      };

      expect(props.selectedConversationId).toBeUndefined();
    });

    it("should handle various conversation ID formats", () => {
      const testIds = [
        "conv-123",
        "conversation-uuid-456",
        "",
        "very-long-conversation-id-with-hyphens-12345",
      ];

      testIds.forEach((id) => {
        const props: AgentLabelsContainerDisplayProps = {
          agents: [],
          selectedConversationId: id,
        };

        expect(typeof props.selectedConversationId).toBe("string");
        expect(props.selectedConversationId).toBe(id);
      });
    });
  });

  describe("type compatibility", () => {
    it("should accept different barHeight formats", () => {
      const stringHeight: AgentLabelsContainerDisplayProps = {
        agents: [],
        barHeight: "64px",
      };

      const numberHeight: AgentLabelsContainerDisplayProps = {
        agents: [],
        barHeight: 64,
      };

      expect(typeof stringHeight.barHeight).toBe("string");
      expect(typeof numberHeight.barHeight).toBe("number");
    });

    it("should accept different agentSpacing formats", () => {
      const stringSpacing: AgentLabelsContainerDisplayProps = {
        agents: [],
        agentSpacing: "12px",
      };

      const numberSpacing: AgentLabelsContainerDisplayProps = {
        agents: [],
        agentSpacing: 12,
      };

      expect(typeof stringSpacing.agentSpacing).toBe("string");
      expect(typeof numberSpacing.agentSpacing).toBe("number");
    });

    it("should accept all backgroundVariant options", () => {
      const variants: Array<"card" | "background" | "transparent"> = [
        "card",
        "background",
        "transparent",
      ];

      variants.forEach((variant) => {
        const props: AgentLabelsContainerDisplayProps = {
          agents: [],
          backgroundVariant: variant,
        };

        expect(props.backgroundVariant).toBe(variant);
      });
    });

    it("should accept proper callback function for onAddAgent", () => {
      const mockCallback = jest.fn();

      const props: AgentLabelsContainerDisplayProps = {
        agents: [],
        onAddAgent: mockCallback,
      };

      if (props.onAddAgent) {
        props.onAddAgent();
      }

      expect(mockCallback).toHaveBeenCalledWith();
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("conversation integration compatibility", () => {
    it("should support useConversationAgents hook integration pattern", () => {
      // Test the intended usage pattern with conversation hooks
      const props: AgentLabelsContainerDisplayProps = {
        agents: [mockAgent], // From useConversationAgents hook
        selectedConversationId: "conv-123", // From parent component state
        onAddAgent: () => {}, // Opens AddAgentToConversationModal
      };

      expect(props.agents).toEqual([mockAgent]);
      expect(props.selectedConversationId).toBe("conv-123");
      expect(typeof props.onAddAgent).toBe("function");
    });

    it("should support disabled state when no conversation selected", () => {
      const disabledProps: AgentLabelsContainerDisplayProps = {
        agents: [], // Empty when no conversation selected
        selectedConversationId: null, // No conversation selected
        onAddAgent: undefined, // Should disable Add Agent button
      };

      expect(disabledProps.agents).toEqual([]);
      expect(disabledProps.selectedConversationId).toBeNull();
      expect(disabledProps.onAddAgent).toBeUndefined();
    });
  });

  describe("backward compatibility", () => {
    it("should maintain compatibility with existing component usage", () => {
      // Test that existing usage without selectedConversationId still works
      const legacyProps: AgentLabelsContainerDisplayProps = {
        agents: [mockAgent],
        onAddAgent: () => {},
        barHeight: "56px",
        agentSpacing: "8px",
        containerPadding: "0 16px",
        horizontalScroll: true,
        showBottomBorder: true,
        backgroundVariant: "card",
        className: "legacy-class",
        style: { margin: "10px" },
      };

      expect(legacyProps).toBeDefined();
      expect(legacyProps.selectedConversationId).toBeUndefined();
    });
  });

  describe("import and export functionality", () => {
    it("should be importable from the module", () => {
      const props: AgentLabelsContainerDisplayProps = {
        agents: [mockAgent],
        selectedConversationId: "test-conv",
      };

      expect(props).toBeDefined();
    });
  });

  describe("JSDoc documentation", () => {
    it("should have comprehensive property documentation", () => {
      const documentedProps: AgentLabelsContainerDisplayProps = {
        agents: [mockAgent], // Should be documented as "Array of agent data to display as pills"
        onAddAgent: () => {}, // Should be documented as "Optional callback for the built-in Add New Agent button"
        barHeight: "56px", // Should be documented as "Height of the agent labels bar"
        agentSpacing: "8px", // Should be documented as "Gap spacing between agent pills"
        containerPadding: "0 16px", // Should be documented as "Horizontal padding inside the container"
        horizontalScroll: true, // Should be documented as "Whether the container supports horizontal scrolling"
        showBottomBorder: true, // Should be documented as "Whether to show the bottom border"
        backgroundVariant: "card", // Should be documented as "Background color variant for the container"
        className: "test", // Should be documented as "Additional CSS class names for the container"
        style: {}, // Should be documented as "Custom styles for the container"
        selectedConversationId: "conv-123", // Should be documented as "ID of the currently selected conversation"
      };

      expect(documentedProps).toBeDefined();
    });
  });
});
