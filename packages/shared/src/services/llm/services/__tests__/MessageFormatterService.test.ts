import { MessageFormatterService } from "../MessageFormatterService";
import type { Message } from "../../../../types/messages/Message";
import type { FormattedMessage } from "../../interfaces";

describe("MessageFormatterService", () => {
  let service: MessageFormatterService;

  const targetAgentId = "agent-123";
  const otherAgentId = "agent-456";

  const agentNameMap = {
    [targetAgentId]: "Assistant Alpha",
    [otherAgentId]: "Assistant Beta",
  };

  beforeEach(() => {
    service = new MessageFormatterService();
  });

  describe("formatMessages", () => {
    describe("inclusion filtering", () => {
      it("should only include messages with included=true", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "user",
            content: "Included message",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
          {
            id: "msg-2",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "user",
            content: "Excluded message",
            included: false,
            created_at: "2024-01-01T00:00:02Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          role: "user",
          content: "Included message",
        });
      });
    });

    describe("system message exclusion", () => {
      it("should exclude all system role messages", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "system",
            content: "System message",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
          {
            id: "msg-2",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "user",
            content: "User message",
            included: true,
            created_at: "2024-01-01T00:00:02Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          role: "user",
          content: "User message",
        });
      });

      it("should exclude system messages even when included=true", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "system",
            content: "System prompt",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toHaveLength(0);
      });
    });

    describe("role mapping scenarios", () => {
      it("should map user messages to 'user' role", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "user",
            content: "Hello from user",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          role: "user",
          content: "Hello from user",
        });
      });

      it("should map target agent messages to 'assistant' role", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: targetAgentId,
            role: "agent",
            content: "Hello from target agent",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          role: "assistant",
          content: "Hello from target agent",
        });
      });

      it("should map other agent messages to 'user' role with name prefix", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: otherAgentId,
            role: "agent",
            content: "Hello from other agent",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          role: "user",
          content: "Assistant Beta: Hello from other agent",
        });
      });
    });

    describe("name prefixing for non-target agents", () => {
      it("should prefix other agent messages with their display name", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: otherAgentId,
            role: "agent",
            content: "This is from another agent",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result[0]).toEqual({
          role: "user",
          content: "Assistant Beta: This is from another agent",
        });
      });

      it("should use 'Unknown Agent' when agent ID is not in name map", () => {
        const unknownAgentId = "agent-999";
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: unknownAgentId,
            role: "agent",
            content: "Message from unknown agent",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result[0]).toEqual({
          role: "user",
          content: "Unknown Agent: Message from unknown agent",
        });
      });

      it("should use 'Unknown Agent' when conversation_agent_id is null", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "agent",
            content: "Message from agent with null ID",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result[0]).toEqual({
          role: "user",
          content: "Unknown Agent: Message from agent with null ID",
        });
      });
    });

    describe("order preservation", () => {
      it("should preserve chronological order of messages", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "user",
            content: "First message",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
          {
            id: "msg-2",
            conversation_id: "conv-1",
            conversation_agent_id: targetAgentId,
            role: "agent",
            content: "Second message",
            included: true,
            created_at: "2024-01-01T00:00:02Z",
          },
          {
            id: "msg-3",
            conversation_id: "conv-1",
            conversation_agent_id: otherAgentId,
            role: "agent",
            content: "Third message",
            included: true,
            created_at: "2024-01-01T00:00:03Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({
          role: "user",
          content: "First message",
        });
        expect(result[1]).toEqual({
          role: "assistant",
          content: "Second message",
        });
        expect(result[2]).toEqual({
          role: "user",
          content: "Assistant Beta: Third message",
        });
      });
    });

    describe("complex scenarios", () => {
      it("should handle mixed message types with filtering and ordering", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "system",
            content: "System message (should be excluded)",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
          {
            id: "msg-2",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "user",
            content: "User message (excluded by included=false)",
            included: false,
            created_at: "2024-01-01T00:00:02Z",
          },
          {
            id: "msg-3",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "user",
            content: "Included user message",
            included: true,
            created_at: "2024-01-01T00:00:03Z",
          },
          {
            id: "msg-4",
            conversation_id: "conv-1",
            conversation_agent_id: targetAgentId,
            role: "agent",
            content: "Target agent response",
            included: true,
            created_at: "2024-01-01T00:00:04Z",
          },
          {
            id: "msg-5",
            conversation_id: "conv-1",
            conversation_agent_id: otherAgentId,
            role: "agent",
            content: "Other agent input",
            included: true,
            created_at: "2024-01-01T00:00:05Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toHaveLength(3);
        expect(result).toEqual([
          {
            role: "user",
            content: "Included user message",
          },
          {
            role: "assistant",
            content: "Target agent response",
          },
          {
            role: "user",
            content: "Assistant Beta: Other agent input",
          },
        ]);
      });

      it("should handle empty messages array", () => {
        const messages: Message[] = [];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toEqual([]);
      });

      it("should handle empty agent name map", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: otherAgentId,
            role: "agent",
            content: "Message from unmapped agent",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(messages, targetAgentId, {});

        expect(result[0]).toEqual({
          role: "user",
          content: "Unknown Agent: Message from unmapped agent",
        });
      });

      it("should handle messages with only excluded/system messages", () => {
        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "system",
            content: "System message",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
          {
            id: "msg-2",
            conversation_id: "conv-1",
            conversation_agent_id: null,
            role: "user",
            content: "Excluded user message",
            included: false,
            created_at: "2024-01-01T00:00:02Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentNameMap,
        );

        expect(result).toEqual([]);
      });
    });

    describe("missing name handling", () => {
      it("should gracefully handle undefined values in name map", () => {
        const agentMapWithUndefined: Record<string, string | undefined> = {
          [targetAgentId]: "Assistant Alpha",
          [otherAgentId]: undefined, // Simulate undefined value
        };

        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: otherAgentId,
            role: "agent",
            content: "Message from agent with undefined name",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentMapWithUndefined as Record<string, string>,
        );

        expect(result[0]).toEqual({
          role: "user",
          content: "Unknown Agent: Message from agent with undefined name",
        });
      });

      it("should gracefully handle empty string names in map", () => {
        const agentMapWithEmpty = {
          [targetAgentId]: "Assistant Alpha",
          [otherAgentId]: "", // Empty string name
        };

        const messages: Message[] = [
          {
            id: "msg-1",
            conversation_id: "conv-1",
            conversation_agent_id: otherAgentId,
            role: "agent",
            content: "Message from agent with empty name",
            included: true,
            created_at: "2024-01-01T00:00:01Z",
          },
        ];

        const result = service.formatMessages(
          messages,
          targetAgentId,
          agentMapWithEmpty,
        );

        expect(result[0]).toEqual({
          role: "user",
          content: "Unknown Agent: Message from agent with empty name",
        });
      });
    });
  });
});
