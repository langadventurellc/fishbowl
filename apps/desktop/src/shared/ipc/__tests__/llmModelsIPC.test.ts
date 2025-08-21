/**
 * Unit tests for LLM models IPC constants and type definitions
 */

import {
  LLM_MODELS_CHANNELS,
  type LlmModelsChannelType,
  type LlmModelsLoadResponse,
} from "../index";

describe("LLM Models IPC Constants", () => {
  it("should have correct channel constant values", () => {
    expect(LLM_MODELS_CHANNELS.LOAD).toBe("llm-models:load");
    expect(LLM_MODELS_CHANNELS.SAVE).toBe("llm-models:save");
    expect(LLM_MODELS_CHANNELS.RESET).toBe("llm-models:reset");
  });

  it("should export all required channel constants", () => {
    expect(LLM_MODELS_CHANNELS).toHaveProperty("LOAD");
    expect(LLM_MODELS_CHANNELS).toHaveProperty("SAVE");
    expect(LLM_MODELS_CHANNELS).toHaveProperty("RESET");
    expect(Object.keys(LLM_MODELS_CHANNELS)).toHaveLength(3);
  });
});

describe("LLM Models IPC Types", () => {
  it("should compile LlmModelsChannelType correctly", () => {
    const loadChannel: LlmModelsChannelType = "llm-models:load";

    expect(loadChannel).toBe(LLM_MODELS_CHANNELS.LOAD);
  });

  it("should compile response types correctly", () => {
    // Test that response types can be instantiated
    const loadResponse: LlmModelsLoadResponse = {
      success: true,
      data: {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8192,
              },
            ],
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
    };

    expect(loadResponse).toBeDefined();
    expect(loadResponse.success).toBe(true);
    expect(loadResponse.data).toBeDefined();
    expect(loadResponse.data?.providers).toHaveLength(1);
    expect(loadResponse.data?.providers[0]?.models).toHaveLength(1);
  });

  it("should handle error responses correctly", () => {
    const errorResponse: LlmModelsLoadResponse = {
      success: false,
      error: {
        message: "Test error",
        code: "LLM_MODELS_ERROR",
      },
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBeDefined();
    expect(errorResponse.error?.message).toBe("Test error");
    expect(errorResponse.error?.code).toBe("LLM_MODELS_ERROR");
  });

  it("should support minimal success response", () => {
    const minimalResponse: LlmModelsLoadResponse = {
      success: true,
    };

    expect(minimalResponse.success).toBe(true);
    expect(minimalResponse.data).toBeUndefined();
    expect(minimalResponse.error).toBeUndefined();
  });
});

describe("LLM Models IPC Exports", () => {
  it("should export all constants through barrel file", () => {
    expect(LLM_MODELS_CHANNELS).toBeDefined();
    expect(typeof LLM_MODELS_CHANNELS).toBe("object");
  });

  it("should export all types through barrel file", () => {
    // These should compile without TypeScript errors
    const _loadResponse: LlmModelsLoadResponse = { success: true };
    const _channelType: LlmModelsChannelType = "llm-models:load";

    // If we reach here, all types compiled successfully
    expect(true).toBe(true);
  });
});

describe("Type-only Imports", () => {
  it("should support type-only imports", () => {
    // This test verifies that type-only imports work correctly
    // The imports at the top of the file demonstrate this functionality

    // Test that we can use the types in type positions
    const testFunction = (): LlmModelsLoadResponse => ({
      success: true,
      data: {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "anthropic",
            name: "Anthropic",
            models: [
              {
                id: "claude-3-opus",
                name: "Claude 3 Opus",
                contextLength: 200000,
              },
            ],
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
    });

    expect(testFunction).toBeDefined();
    expect(typeof testFunction).toBe("function");

    const result = testFunction();
    expect(result.success).toBe(true);
    expect(result.data?.providers).toHaveLength(1);
  });
});
