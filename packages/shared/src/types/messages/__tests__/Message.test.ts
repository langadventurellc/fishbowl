import { messageSchema } from "../schemas/MessageSchema";
import { MessageRole } from "../MessageRole";

describe("MessageSchema validation", () => {
  const validMessage = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    conversation_id: "550e8400-e29b-41d4-a716-446655440001",
    conversation_agent_id: null,
    role: "user" as const,
    content: "Hello world",
    included: true,
    created_at: "2024-01-01T00:00:00Z",
  };

  it("should validate valid message objects", () => {
    expect(() => messageSchema.parse(validMessage)).not.toThrow();
  });

  it("should validate user messages with null conversation_agent_id", () => {
    const userMessage = {
      ...validMessage,
      role: "user" as const,
      conversation_agent_id: null,
    };
    expect(() => messageSchema.parse(userMessage)).not.toThrow();
  });

  it("should validate system messages with null conversation_agent_id", () => {
    const systemMessage = {
      ...validMessage,
      role: "system" as const,
      conversation_agent_id: null,
    };
    expect(() => messageSchema.parse(systemMessage)).not.toThrow();
  });

  it("should validate agent messages with non-null conversation_agent_id", () => {
    const agentMessage = {
      ...validMessage,
      role: "agent" as const,
      conversation_agent_id: "550e8400-e29b-41d4-a716-446655440002",
    };
    expect(() => messageSchema.parse(agentMessage)).not.toThrow();
  });

  it("should reject invalid role values", () => {
    const invalidMessage = { ...validMessage, role: "assistant" };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "Role must be user, agent, or system",
    );
  });

  it("should reject non-UUID id values", () => {
    const invalidMessage = { ...validMessage, id: "not-a-uuid" };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "Invalid message ID format",
    );
  });

  it("should reject non-UUID conversation_id values", () => {
    const invalidMessage = { ...validMessage, conversation_id: "not-a-uuid" };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "Invalid conversation ID format",
    );
  });

  it("should reject non-UUID conversation_agent_id values", () => {
    const invalidMessage = {
      ...validMessage,
      conversation_agent_id: "not-a-uuid",
    };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "Invalid conversation agent ID format",
    );
  });

  it("should reject empty content", () => {
    const invalidMessage = { ...validMessage, content: "" };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "Message content cannot be empty",
    );
  });

  it("should reject non-boolean included values", () => {
    const invalidMessage = {
      ...validMessage,
      included: "true" as unknown as boolean,
    };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "Included must be a boolean",
    );
  });

  it("should reject invalid timestamp format", () => {
    const invalidMessage = { ...validMessage, created_at: "not-a-timestamp" };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "Invalid timestamp format",
    );
  });

  it("should reject agent messages with null conversation_agent_id", () => {
    const invalidMessage = {
      ...validMessage,
      role: "agent" as const,
      conversation_agent_id: null,
    };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "conversation_agent_id must be present for agent messages and null otherwise",
    );
  });

  it("should reject user messages with non-null conversation_agent_id", () => {
    const invalidMessage = {
      ...validMessage,
      role: "user" as const,
      conversation_agent_id: "550e8400-e29b-41d4-a716-446655440002",
    };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "conversation_agent_id must be present for agent messages and null otherwise",
    );
  });

  it("should reject system messages with non-null conversation_agent_id", () => {
    const invalidMessage = {
      ...validMessage,
      role: "system" as const,
      conversation_agent_id: "550e8400-e29b-41d4-a716-446655440002",
    };
    expect(() => messageSchema.parse(invalidMessage)).toThrow(
      "conversation_agent_id must be present for agent messages and null otherwise",
    );
  });
});

describe("MessageRole enum", () => {
  it("should have correct enum values", () => {
    expect(MessageRole.USER).toBe("user");
    expect(MessageRole.AGENT).toBe("agent");
    expect(MessageRole.SYSTEM).toBe("system");
  });

  it("should not have 'assistant' role", () => {
    expect(MessageRole).not.toHaveProperty("ASSISTANT");
  });
});
