/**
 * Unit tests for conversation agents IPC constants and type definitions
 */

import {
  CONVERSATION_AGENT_CHANNELS,
  type ConversationAgentChannelType,
  type ConversationAgentGetByConversationRequest,
  type ConversationAgentAddRequest,
  type ConversationAgentRemoveRequest,
  type ConversationAgentListRequest,
  type ConversationAgentGetByConversationResponse,
  type ConversationAgentAddResponse,
  type ConversationAgentRemoveResponse,
  type ConversationAgentListResponse,
} from "../index";

describe("Conversation Agents IPC Constants", () => {
  it("should have correct channel constant values", () => {
    expect(CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION).toBe(
      "conversationAgent:getByConversation",
    );
    expect(CONVERSATION_AGENT_CHANNELS.ADD).toBe("conversationAgent:add");
    expect(CONVERSATION_AGENT_CHANNELS.REMOVE).toBe("conversationAgent:remove");
    expect(CONVERSATION_AGENT_CHANNELS.UPDATE).toBe("conversationAgent:update");
    expect(CONVERSATION_AGENT_CHANNELS.LIST).toBe("conversationAgent:list");
  });

  it("should export all required channel constants", () => {
    expect(CONVERSATION_AGENT_CHANNELS).toHaveProperty("GET_BY_CONVERSATION");
    expect(CONVERSATION_AGENT_CHANNELS).toHaveProperty("ADD");
    expect(CONVERSATION_AGENT_CHANNELS).toHaveProperty("REMOVE");
    expect(CONVERSATION_AGENT_CHANNELS).toHaveProperty("UPDATE");
    expect(CONVERSATION_AGENT_CHANNELS).toHaveProperty("LIST");
    expect(Object.keys(CONVERSATION_AGENT_CHANNELS)).toHaveLength(5);
  });

  it("should have no duplicate channel names", () => {
    const values = Object.values(CONVERSATION_AGENT_CHANNELS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it("should have different channel prefix from conversations", () => {
    const conversationAgentChannels = Object.values(
      CONVERSATION_AGENT_CHANNELS,
    );
    const hasCorrectPrefix = conversationAgentChannels.every((channel) =>
      channel.startsWith("conversationAgent:"),
    );
    expect(hasCorrectPrefix).toBe(true);
  });
});

describe("Conversation Agents IPC Types", () => {
  it("should compile ConversationAgentChannelType correctly", () => {
    const getByConversationChannel: ConversationAgentChannelType =
      "conversationAgent:getByConversation";
    const addChannel: ConversationAgentChannelType = "conversationAgent:add";
    const removeChannel: ConversationAgentChannelType =
      "conversationAgent:remove";
    const updateChannel: ConversationAgentChannelType =
      "conversationAgent:update";
    const listChannel: ConversationAgentChannelType = "conversationAgent:list";

    expect(getByConversationChannel).toBe(
      CONVERSATION_AGENT_CHANNELS.GET_BY_CONVERSATION,
    );
    expect(addChannel).toBe(CONVERSATION_AGENT_CHANNELS.ADD);
    expect(removeChannel).toBe(CONVERSATION_AGENT_CHANNELS.REMOVE);
    expect(updateChannel).toBe(CONVERSATION_AGENT_CHANNELS.UPDATE);
    expect(listChannel).toBe(CONVERSATION_AGENT_CHANNELS.LIST);
  });

  it("should compile request types correctly", () => {
    // Test that request types can be instantiated
    const getByConversationRequest: ConversationAgentGetByConversationRequest =
      {
        conversationId: "conv-123",
      };

    const addRequest: ConversationAgentAddRequest = {
      conversation_id: "conv-123",
      agent_id: "agent-456",
      display_order: 1,
    };

    const addRequestMinimal: ConversationAgentAddRequest = {
      conversation_id: "conv-123",
      agent_id: "agent-456",
    };

    const removeRequest: ConversationAgentRemoveRequest = {
      conversation_id: "conv-123",
      agent_id: "agent-456",
    };

    const listRequest: ConversationAgentListRequest = {};

    expect(getByConversationRequest).toBeDefined();
    expect(getByConversationRequest.conversationId).toBe("conv-123");

    expect(addRequest).toBeDefined();
    expect(addRequest.conversation_id).toBe("conv-123");
    expect(addRequest.agent_id).toBe("agent-456");
    expect(addRequest.display_order).toBe(1);

    expect(addRequestMinimal).toBeDefined();
    expect(addRequestMinimal.conversation_id).toBe("conv-123");
    expect(addRequestMinimal.agent_id).toBe("agent-456");

    expect(removeRequest).toBeDefined();
    expect(removeRequest.conversation_id).toBe("conv-123");
    expect(removeRequest.agent_id).toBe("agent-456");

    expect(listRequest).toBeDefined();
  });

  it("should compile response types correctly", () => {
    const mockConversationAgent = {
      id: "ca-123",
      conversation_id: "conv-123",
      agent_id: "agent-456",
      added_at: new Date().toISOString(),
      is_active: true,
      enabled: true,
      display_order: 0,
    };

    // Test that response types can be instantiated
    const getByConversationResponse: ConversationAgentGetByConversationResponse =
      {
        success: true,
        data: [mockConversationAgent],
      };

    const getByConversationResponseEmpty: ConversationAgentGetByConversationResponse =
      {
        success: true,
        data: [],
      };

    const addResponse: ConversationAgentAddResponse = {
      success: true,
      data: mockConversationAgent,
    };

    const removeResponse: ConversationAgentRemoveResponse = {
      success: true,
      data: true,
    };

    const listResponse: ConversationAgentListResponse = {
      success: true,
      data: [mockConversationAgent],
    };

    expect(getByConversationResponse).toBeDefined();
    expect(getByConversationResponse.success).toBe(true);
    expect(Array.isArray(getByConversationResponse.data)).toBe(true);
    expect(getByConversationResponse.data).toHaveLength(1);

    expect(getByConversationResponseEmpty).toBeDefined();
    expect(getByConversationResponseEmpty.success).toBe(true);
    expect(Array.isArray(getByConversationResponseEmpty.data)).toBe(true);
    expect(getByConversationResponseEmpty.data).toHaveLength(0);

    expect(addResponse).toBeDefined();
    expect(addResponse.success).toBe(true);
    expect(addResponse.data).toBeDefined();
    expect(addResponse.data?.id).toBe("ca-123");

    expect(removeResponse).toBeDefined();
    expect(removeResponse.success).toBe(true);
    expect(removeResponse.data).toBe(true);

    expect(listResponse).toBeDefined();
    expect(listResponse.success).toBe(true);
    expect(Array.isArray(listResponse.data)).toBe(true);
    expect(listResponse.data).toHaveLength(1);
  });

  it("should handle error responses correctly", () => {
    const getByConversationErrorResponse: ConversationAgentGetByConversationResponse =
      {
        success: false,
        error: {
          message: "Failed to get conversation agents",
          code: "CONVERSATION_AGENTS_GET_ERROR",
        },
      };

    const addErrorResponse: ConversationAgentAddResponse = {
      success: false,
      error: {
        message: "Failed to add agent to conversation",
        code: "CONVERSATION_AGENT_ADD_ERROR",
      },
    };

    const removeErrorResponse: ConversationAgentRemoveResponse = {
      success: false,
      error: {
        message: "Failed to remove agent from conversation",
        code: "CONVERSATION_AGENT_REMOVE_ERROR",
      },
    };

    const listErrorResponse: ConversationAgentListResponse = {
      success: false,
      error: {
        message: "Failed to list conversation agents",
        code: "CONVERSATION_AGENTS_LIST_ERROR",
      },
    };

    expect(getByConversationErrorResponse.success).toBe(false);
    expect(getByConversationErrorResponse.error).toBeDefined();
    expect(getByConversationErrorResponse.error?.message).toBe(
      "Failed to get conversation agents",
    );

    expect(addErrorResponse.success).toBe(false);
    expect(addErrorResponse.error).toBeDefined();
    expect(addErrorResponse.error?.message).toBe(
      "Failed to add agent to conversation",
    );

    expect(removeErrorResponse.success).toBe(false);
    expect(removeErrorResponse.error).toBeDefined();
    expect(removeErrorResponse.error?.message).toBe(
      "Failed to remove agent from conversation",
    );

    expect(listErrorResponse.success).toBe(false);
    expect(listErrorResponse.error).toBeDefined();
    expect(listErrorResponse.error?.message).toBe(
      "Failed to list conversation agents",
    );
  });
});

describe("Conversation Agents IPC Exports", () => {
  it("should export all constants through barrel file", () => {
    expect(CONVERSATION_AGENT_CHANNELS).toBeDefined();
    expect(typeof CONVERSATION_AGENT_CHANNELS).toBe("object");
  });

  it("should export all types through barrel file", () => {
    // These should compile without TypeScript errors
    const _getByConversationRequest: ConversationAgentGetByConversationRequest =
      { conversationId: "test" };
    const _addRequest: ConversationAgentAddRequest = {
      conversation_id: "test",
      agent_id: "test",
    };
    const _removeRequest: ConversationAgentRemoveRequest = {
      conversation_id: "test",
      agent_id: "test",
    };
    const _listRequest: ConversationAgentListRequest = {};
    const _getByConversationResponse: ConversationAgentGetByConversationResponse =
      { success: true };
    const _addResponse: ConversationAgentAddResponse = { success: true };
    const _removeResponse: ConversationAgentRemoveResponse = { success: true };
    const _listResponse: ConversationAgentListResponse = { success: true };
    const _channelType: ConversationAgentChannelType = "conversationAgent:add";

    // If we reach here, all types compiled successfully
    expect(true).toBe(true);
  });
});

describe("Type-only Imports", () => {
  it("should support type-only imports", () => {
    // This test verifies that type-only imports work correctly
    // The imports at the top of the file demonstrate this functionality

    // Test that we can use the types in type positions
    const testFunction = (
      _request: ConversationAgentAddRequest,
    ): ConversationAgentAddResponse => ({
      success: true,
      data: {
        id: "ca-123",
        conversation_id: _request.conversation_id,
        agent_id: _request.agent_id,
        added_at: new Date().toISOString(),
        is_active: true,
        enabled: true,
        display_order: _request.display_order || 0,
      },
    });

    expect(testFunction).toBeDefined();
    expect(typeof testFunction).toBe("function");

    // Test the function
    const result = testFunction({
      conversation_id: "conv-123",
      agent_id: "agent-456",
    });
    expect(result.success).toBe(true);
    expect(result.data?.conversation_id).toBe("conv-123");
    expect(result.data?.agent_id).toBe("agent-456");
  });
});
