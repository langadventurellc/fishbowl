/**
 * Unit tests for conversations IPC constants and type definitions
 */

import {
  CONVERSATION_CHANNELS,
  type ConversationsChannelType,
  type ConversationsCreateRequest,
  type ConversationsListRequest,
  type ConversationsGetRequest,
  type ConversationsUpdateRequest,
  type ConversationsDeleteRequest,
  type ConversationsCreateResponse,
  type ConversationsListResponse,
  type ConversationsGetResponse,
  type ConversationsUpdateResponse,
  type ConversationsDeleteResponse,
} from "../index";

describe("Conversations IPC Constants", () => {
  it("should have correct channel constant values", () => {
    expect(CONVERSATION_CHANNELS.CREATE).toBe("conversations:create");
    expect(CONVERSATION_CHANNELS.LIST).toBe("conversations:list");
    expect(CONVERSATION_CHANNELS.GET).toBe("conversations:get");
    expect(CONVERSATION_CHANNELS.UPDATE).toBe("conversations:update");
    expect(CONVERSATION_CHANNELS.DELETE).toBe("conversations:delete");
  });

  it("should export all required channel constants", () => {
    expect(CONVERSATION_CHANNELS).toHaveProperty("CREATE");
    expect(CONVERSATION_CHANNELS).toHaveProperty("LIST");
    expect(CONVERSATION_CHANNELS).toHaveProperty("GET");
    expect(CONVERSATION_CHANNELS).toHaveProperty("UPDATE");
    expect(CONVERSATION_CHANNELS).toHaveProperty("DELETE");
    expect(Object.keys(CONVERSATION_CHANNELS)).toHaveLength(5);
  });

  it("should have no duplicate channel names", () => {
    const values = Object.values(CONVERSATION_CHANNELS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});

describe("Conversations IPC Types", () => {
  it("should compile ConversationsChannelType correctly", () => {
    const createChannel: ConversationsChannelType = "conversations:create";
    const listChannel: ConversationsChannelType = "conversations:list";
    const getChannel: ConversationsChannelType = "conversations:get";
    const updateChannel: ConversationsChannelType = "conversations:update";
    const deleteChannel: ConversationsChannelType = "conversations:delete";

    expect(createChannel).toBe(CONVERSATION_CHANNELS.CREATE);
    expect(listChannel).toBe(CONVERSATION_CHANNELS.LIST);
    expect(getChannel).toBe(CONVERSATION_CHANNELS.GET);
    expect(updateChannel).toBe(CONVERSATION_CHANNELS.UPDATE);
    expect(deleteChannel).toBe(CONVERSATION_CHANNELS.DELETE);
  });

  it("should compile request types correctly", () => {
    // Test that request types can be instantiated
    const createRequest: ConversationsCreateRequest = {
      title: "Test Conversation",
    };
    const createRequestEmpty: ConversationsCreateRequest = {};
    const listRequest: ConversationsListRequest = {};
    const getRequest: ConversationsGetRequest = { id: "conv-123" };
    const updateRequest: ConversationsUpdateRequest = {
      id: "conv-123",
      updates: { title: "Updated Title" },
    };
    const deleteRequest: ConversationsDeleteRequest = { id: "conv-123" };

    expect(createRequest).toBeDefined();
    expect(createRequest.title).toBe("Test Conversation");
    expect(createRequestEmpty).toBeDefined();
    expect(listRequest).toBeDefined();
    expect(getRequest).toBeDefined();
    expect(getRequest.id).toBe("conv-123");
    expect(updateRequest).toBeDefined();
    expect(updateRequest.id).toBe("conv-123");
    expect(updateRequest.updates).toBeDefined();
    expect(deleteRequest).toBeDefined();
    expect(deleteRequest.id).toBe("conv-123");
  });

  it("should compile response types correctly", () => {
    // Test that response types can be instantiated
    const createResponse: ConversationsCreateResponse = {
      success: true,
      data: {
        id: "conv-123",
        title: "Test Conversation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const listResponse: ConversationsListResponse = {
      success: true,
      data: [
        {
          id: "conv-123",
          title: "Test Conversation",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    };

    const getResponse: ConversationsGetResponse = {
      success: true,
      data: {
        id: "conv-123",
        title: "Test Conversation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const getResponseNull: ConversationsGetResponse = {
      success: true,
      data: null,
    };

    const updateResponse: ConversationsUpdateResponse = {
      success: true,
      data: {
        id: "conv-123",
        title: "Updated Conversation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const deleteResponse: ConversationsDeleteResponse = {
      success: true,
      data: true,
    };

    expect(createResponse).toBeDefined();
    expect(createResponse.success).toBe(true);
    expect(createResponse.data).toBeDefined();

    expect(listResponse).toBeDefined();
    expect(listResponse.success).toBe(true);
    expect(Array.isArray(listResponse.data)).toBe(true);

    expect(getResponse).toBeDefined();
    expect(getResponse.success).toBe(true);
    expect(getResponse.data).toBeDefined();

    expect(getResponseNull).toBeDefined();
    expect(getResponseNull.success).toBe(true);
    expect(getResponseNull.data).toBe(null);

    expect(updateResponse).toBeDefined();
    expect(updateResponse.success).toBe(true);
    expect(updateResponse.data).toBeDefined();

    expect(deleteResponse).toBeDefined();
    expect(deleteResponse.success).toBe(true);
    expect(deleteResponse.data).toBe(true);
  });

  it("should handle error responses correctly", () => {
    const createErrorResponse: ConversationsCreateResponse = {
      success: false,
      error: {
        message: "Failed to create conversation",
        code: "CONVERSATION_CREATE_ERROR",
      },
    };

    const listErrorResponse: ConversationsListResponse = {
      success: false,
      error: {
        message: "Failed to list conversations",
        code: "CONVERSATION_LIST_ERROR",
      },
    };

    const getErrorResponse: ConversationsGetResponse = {
      success: false,
      error: {
        message: "Conversation not found",
        code: "CONVERSATION_NOT_FOUND",
      },
    };

    const updateErrorResponse: ConversationsUpdateResponse = {
      success: false,
      error: {
        message: "Failed to update conversation",
        code: "CONVERSATION_UPDATE_ERROR",
      },
    };

    const deleteErrorResponse: ConversationsDeleteResponse = {
      success: false,
      error: {
        message: "Failed to delete conversation",
        code: "CONVERSATION_DELETE_ERROR",
      },
    };

    expect(createErrorResponse.success).toBe(false);
    expect(createErrorResponse.error).toBeDefined();
    expect(createErrorResponse.error?.message).toBe(
      "Failed to create conversation",
    );

    expect(listErrorResponse.success).toBe(false);
    expect(listErrorResponse.error).toBeDefined();
    expect(listErrorResponse.error?.message).toBe(
      "Failed to list conversations",
    );

    expect(getErrorResponse.success).toBe(false);
    expect(getErrorResponse.error).toBeDefined();
    expect(getErrorResponse.error?.message).toBe("Conversation not found");

    expect(updateErrorResponse.success).toBe(false);
    expect(updateErrorResponse.error).toBeDefined();
    expect(updateErrorResponse.error?.message).toBe(
      "Failed to update conversation",
    );

    expect(deleteErrorResponse.success).toBe(false);
    expect(deleteErrorResponse.error).toBeDefined();
    expect(deleteErrorResponse.error?.message).toBe(
      "Failed to delete conversation",
    );
  });
});

describe("Conversations IPC Exports", () => {
  it("should export all constants through barrel file", () => {
    expect(CONVERSATION_CHANNELS).toBeDefined();
    expect(typeof CONVERSATION_CHANNELS).toBe("object");
  });

  it("should export all types through barrel file", () => {
    // These should compile without TypeScript errors
    const _createRequest: ConversationsCreateRequest = {};
    const _listRequest: ConversationsListRequest = {};
    const _getRequest: ConversationsGetRequest = { id: "test" };
    const _updateRequest: ConversationsUpdateRequest = {
      id: "test",
      updates: {},
    };
    const _deleteRequest: ConversationsDeleteRequest = { id: "test" };
    const _createResponse: ConversationsCreateResponse = { success: true };
    const _listResponse: ConversationsListResponse = { success: true };
    const _getResponse: ConversationsGetResponse = { success: true };
    const _updateResponse: ConversationsUpdateResponse = { success: true };
    const _deleteResponse: ConversationsDeleteResponse = { success: true };
    const _channelType: ConversationsChannelType = "conversations:create";

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
      _request: ConversationsCreateRequest,
    ): ConversationsCreateResponse => ({
      success: true,
      data: {
        id: "test-conv",
        title: "Test Conversation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    expect(testFunction).toBeDefined();
    expect(typeof testFunction).toBe("function");
  });
});
