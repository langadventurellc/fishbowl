/**
 * Unit tests for agents IPC constants and type definitions
 */

import {
  AGENTS_CHANNELS,
  type AgentsChannelType,
  type AgentsLoadRequest,
  type AgentsSaveRequest,
  type AgentsResetRequest,
  type AgentsLoadResponse,
  type AgentsSaveResponse,
  type AgentsResetResponse,
} from "../index";

describe("Agents IPC Constants", () => {
  it("should have correct channel constant values", () => {
    expect(AGENTS_CHANNELS.LOAD).toBe("agents:load");
    expect(AGENTS_CHANNELS.SAVE).toBe("agents:save");
    expect(AGENTS_CHANNELS.RESET).toBe("agents:reset");
  });

  it("should export all required channel constants", () => {
    expect(AGENTS_CHANNELS).toHaveProperty("LOAD");
    expect(AGENTS_CHANNELS).toHaveProperty("SAVE");
    expect(AGENTS_CHANNELS).toHaveProperty("RESET");
    expect(Object.keys(AGENTS_CHANNELS)).toHaveLength(3);
  });
});

describe("Agents IPC Types", () => {
  it("should compile AgentsChannelType correctly", () => {
    const loadChannel: AgentsChannelType = "agents:load";
    const saveChannel: AgentsChannelType = "agents:save";
    const resetChannel: AgentsChannelType = "agents:reset";

    expect(loadChannel).toBe(AGENTS_CHANNELS.LOAD);
    expect(saveChannel).toBe(AGENTS_CHANNELS.SAVE);
    expect(resetChannel).toBe(AGENTS_CHANNELS.RESET);
  });

  it("should compile request types correctly", () => {
    // Test that request types can be instantiated
    const loadRequest: AgentsLoadRequest = {};
    const saveRequest: AgentsSaveRequest = {
      agents: {
        schemaVersion: "1.0.0",
        agents: [],
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
        lastUpdated: new Date().toISOString(),
      },
    };
    const resetRequest: AgentsResetRequest = {};

    expect(loadRequest).toBeDefined();
    expect(saveRequest).toBeDefined();
    expect(saveRequest.agents).toBeDefined();
    expect(resetRequest).toBeDefined();
  });

  it("should compile response types correctly", () => {
    // Test that response types can be instantiated
    const loadResponse: AgentsLoadResponse = {
      success: true,
      data: {
        schemaVersion: "1.0.0",
        agents: [],
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
        lastUpdated: new Date().toISOString(),
      },
    };

    const saveResponse: AgentsSaveResponse = {
      success: true,
    };

    const resetResponse: AgentsResetResponse = {
      success: true,
      data: {
        schemaVersion: "1.0.0",
        agents: [],
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
        lastUpdated: new Date().toISOString(),
      },
    };

    expect(loadResponse).toBeDefined();
    expect(loadResponse.success).toBe(true);
    expect(loadResponse.data).toBeDefined();

    expect(saveResponse).toBeDefined();
    expect(saveResponse.success).toBe(true);

    expect(resetResponse).toBeDefined();
    expect(resetResponse.success).toBe(true);
    expect(resetResponse.data).toBeDefined();
  });

  it("should handle error responses correctly", () => {
    const errorResponse: AgentsLoadResponse = {
      success: false,
      error: {
        message: "Test error",
        code: "AGENTS_ERROR",
      },
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBeDefined();
    expect(errorResponse.error?.message).toBe("Test error");
    expect(errorResponse.error?.code).toBe("AGENTS_ERROR");
  });
});

describe("Agents IPC Exports", () => {
  it("should export all constants through barrel file", () => {
    expect(AGENTS_CHANNELS).toBeDefined();
    expect(typeof AGENTS_CHANNELS).toBe("object");
  });

  it("should export all types through barrel file", () => {
    // These should compile without TypeScript errors
    const _loadRequest: AgentsLoadRequest = {};
    const _saveRequest: AgentsSaveRequest = {
      agents: {
        schemaVersion: "1.0.0",
        agents: [],
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
        lastUpdated: new Date().toISOString(),
      },
    };
    const _resetRequest: AgentsResetRequest = {};
    const _loadResponse: AgentsLoadResponse = { success: true };
    const _saveResponse: AgentsSaveResponse = { success: true };
    const _resetResponse: AgentsResetResponse = { success: true };
    const _channelType: AgentsChannelType = "agents:load";

    // If we reach here, all types compiled successfully
    expect(true).toBe(true);
  });
});

describe("Type-only Imports", () => {
  it("should support type-only imports", () => {
    // This test verifies that type-only imports work correctly
    // The imports at the top of the file demonstrate this functionality

    // Test that we can use the types in type positions
    const testFunction = (_request: AgentsLoadRequest): AgentsLoadResponse => ({
      success: true,
      data: {
        schemaVersion: "1.0.0",
        agents: [],
        defaults: {
          temperature: 1.0,
          maxTokens: 1000,
          topP: 0.95,
        },
        lastUpdated: new Date().toISOString(),
      },
    });

    expect(testFunction).toBeDefined();
    expect(typeof testFunction).toBe("function");
  });
});
