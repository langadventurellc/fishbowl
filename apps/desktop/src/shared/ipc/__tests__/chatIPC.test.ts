/**
 * Unit tests for chat IPC constants and type definitions
 */

import {
  CHAT_CHANNELS,
  CHAT_EVENTS,
  type ChatChannel,
  type ChatEvent,
  type AgentUpdateEvent,
  type AllCompleteEvent,
  type SendToAgentsRequest,
} from "../index";

describe("Chat IPC Constants", () => {
  it("should have correct chat channel constant values", () => {
    expect(CHAT_CHANNELS.SEND_TO_AGENTS).toBe("chat:sendToAgents");
  });

  it("should export all required chat channel constants", () => {
    expect(CHAT_CHANNELS).toHaveProperty("SEND_TO_AGENTS");
    expect(Object.keys(CHAT_CHANNELS)).toHaveLength(1);
  });

  it("should have correct chat event constant values", () => {
    expect(CHAT_EVENTS.AGENT_UPDATE).toBe("agent:update");
    expect(CHAT_EVENTS.ALL_COMPLETE).toBe("all:complete");
  });

  it("should export all required chat event constants", () => {
    expect(CHAT_EVENTS).toHaveProperty("AGENT_UPDATE");
    expect(CHAT_EVENTS).toHaveProperty("ALL_COMPLETE");
    expect(Object.keys(CHAT_EVENTS)).toHaveLength(2);
  });

  it("should have no duplicate channel names", () => {
    const channelValues = Object.values(CHAT_CHANNELS);
    const uniqueChannelValues = new Set(channelValues);
    expect(uniqueChannelValues.size).toBe(channelValues.length);
  });

  it("should have no duplicate event names", () => {
    const eventValues = Object.values(CHAT_EVENTS);
    const uniqueEventValues = new Set(eventValues);
    expect(uniqueEventValues.size).toBe(eventValues.length);
  });
});

describe("Chat IPC Types", () => {
  it("should compile ChatChannel type correctly", () => {
    const sendToAgentsChannel: ChatChannel = "chat:sendToAgents";
    expect(sendToAgentsChannel).toBe(CHAT_CHANNELS.SEND_TO_AGENTS);
  });

  it("should compile ChatEvent type correctly", () => {
    const agentUpdateEvent: ChatEvent = "agent:update";
    const allCompleteEvent: ChatEvent = "all:complete";

    expect(agentUpdateEvent).toBe(CHAT_EVENTS.AGENT_UPDATE);
    expect(allCompleteEvent).toBe(CHAT_EVENTS.ALL_COMPLETE);
  });

  it("should compile AgentUpdateEvent interface correctly", () => {
    const thinkingEvent: AgentUpdateEvent = {
      conversationId: "conv-123",
      conversationAgentId: "agent-123",
      status: "thinking",
    };

    const completeEvent: AgentUpdateEvent = {
      conversationId: "conv-123",
      conversationAgentId: "agent-123",
      status: "complete",
      messageId: "msg-456",
    };

    const errorEvent: AgentUpdateEvent = {
      conversationId: "conv-123",
      conversationAgentId: "agent-123",
      status: "error",
      error: "Processing failed",
    };

    expect(thinkingEvent.conversationAgentId).toBe("agent-123");
    expect(thinkingEvent.status).toBe("thinking");
    expect(thinkingEvent.messageId).toBeUndefined();
    expect(thinkingEvent.error).toBeUndefined();

    expect(completeEvent.conversationAgentId).toBe("agent-123");
    expect(completeEvent.status).toBe("complete");
    expect(completeEvent.messageId).toBe("msg-456");
    expect(completeEvent.error).toBeUndefined();

    expect(errorEvent.conversationAgentId).toBe("agent-123");
    expect(errorEvent.status).toBe("error");
    expect(errorEvent.error).toBe("Processing failed");
    expect(errorEvent.messageId).toBeUndefined();
  });

  it("should compile AllCompleteEvent interface correctly", () => {
    const allCompleteEvent: AllCompleteEvent = {
      conversationId: "conv-789",
    };

    expect(allCompleteEvent.conversationId).toBe("conv-789");
  });

  it("should compile SendToAgentsRequest interface correctly", () => {
    const sendRequest: SendToAgentsRequest = {
      conversationId: "conv-789",
      userMessageId: "msg-123",
    };

    expect(sendRequest.conversationId).toBe("conv-789");
    expect(sendRequest.userMessageId).toBe("msg-123");
  });
});

describe("Chat IPC Exports", () => {
  it("should export all constants through barrel file", () => {
    expect(CHAT_CHANNELS).toBeDefined();
    expect(typeof CHAT_CHANNELS).toBe("object");
    expect(CHAT_EVENTS).toBeDefined();
    expect(typeof CHAT_EVENTS).toBe("object");
  });

  it("should export all types through barrel file", () => {
    // These should compile without TypeScript errors
    const _channel: ChatChannel = "chat:sendToAgents";
    const _event: ChatEvent = "agent:update";
    const _agentUpdate: AgentUpdateEvent = {
      conversationId: "test-conv",
      conversationAgentId: "test",
      status: "thinking",
    };
    const _allComplete: AllCompleteEvent = {
      conversationId: "test",
    };
    const _sendRequest: SendToAgentsRequest = {
      conversationId: "test",
      userMessageId: "test",
    };

    // If we reach here, all types compiled successfully
    expect(true).toBe(true);
  });
});

describe("Type-only Imports", () => {
  it("should support type-only imports", () => {
    // This test verifies that type-only imports work correctly
    // The imports at the top of the file demonstrate this functionality

    // Test that we can use the types in type positions
    const testFunction = (_request: SendToAgentsRequest): AgentUpdateEvent => ({
      conversationId: _request.conversationId,
      conversationAgentId: _request.conversationId + "-agent",
      status: "thinking",
    });

    expect(testFunction).toBeDefined();
    expect(typeof testFunction).toBe("function");
  });
});
