import { createMessageInputSchema } from "../schemas/CreateMessageInputSchema";

describe("CreateMessageInputSchema validation", () => {
  const validInput = {
    conversation_id: "550e8400-e29b-41d4-a716-446655440001",
    role: "user" as const,
    content: "Hello world",
  };

  it("should validate valid user message input", () => {
    const userInput = {
      ...validInput,
      role: "user" as const,
    };
    expect(() => createMessageInputSchema.parse(userInput)).not.toThrow();
  });

  it("should validate valid system message input", () => {
    const systemInput = {
      ...validInput,
      role: "system" as const,
      content: "System message content",
    };
    expect(() => createMessageInputSchema.parse(systemInput)).not.toThrow();
  });

  it("should validate valid agent message input with conversation_agent_id", () => {
    const agentInput = {
      ...validInput,
      role: "agent" as const,
      conversation_agent_id: "550e8400-e29b-41d4-a716-446655440002",
      content: "Agent response",
    };
    expect(() => createMessageInputSchema.parse(agentInput)).not.toThrow();
  });

  it("should validate input with optional included field", () => {
    const inputWithIncluded = {
      ...validInput,
      included: false,
    };
    expect(() =>
      createMessageInputSchema.parse(inputWithIncluded),
    ).not.toThrow();
  });

  it("should allow messages without length limits", () => {
    const longContent = "a".repeat(10000);
    const input = {
      conversation_id: "550e8400-e29b-41d4-a716-446655440001",
      role: "user" as const,
      content: longContent,
    };
    expect(() => createMessageInputSchema.parse(input)).not.toThrow();
  });

  it("should reject invalid conversation_id format", () => {
    const invalidInput = { ...validInput, conversation_id: "not-a-uuid" };
    expect(() => createMessageInputSchema.parse(invalidInput)).toThrow(
      "Invalid conversation ID format",
    );
  });

  it("should reject invalid conversation_agent_id format", () => {
    const invalidInput = {
      ...validInput,
      role: "agent" as const,
      conversation_agent_id: "not-a-uuid",
    };
    expect(() => createMessageInputSchema.parse(invalidInput)).toThrow(
      "Invalid conversation agent ID format",
    );
  });

  it("should reject invalid role values", () => {
    const invalidInput = {
      ...validInput,
      role: "assistant" as unknown as "user",
    };
    expect(() => createMessageInputSchema.parse(invalidInput)).toThrow(
      "Role must be user, agent, or system",
    );
  });

  it("should reject empty content", () => {
    const invalidInput = { ...validInput, content: "" };
    expect(() => createMessageInputSchema.parse(invalidInput)).toThrow(
      "Message content cannot be empty",
    );
  });

  it("should reject agent messages without conversation_agent_id", () => {
    const invalidInput = {
      ...validInput,
      role: "agent" as const,
    };
    expect(() => createMessageInputSchema.parse(invalidInput)).toThrow(
      "conversation_agent_id is required for agent role and must be omitted for user/system roles",
    );
  });

  it("should reject user messages with conversation_agent_id", () => {
    const invalidInput = {
      ...validInput,
      role: "user" as const,
      conversation_agent_id: "550e8400-e29b-41d4-a716-446655440002",
    };
    expect(() => createMessageInputSchema.parse(invalidInput)).toThrow(
      "conversation_agent_id is required for agent role and must be omitted for user/system roles",
    );
  });

  it("should reject system messages with conversation_agent_id", () => {
    const invalidInput = {
      ...validInput,
      role: "system" as const,
      conversation_agent_id: "550e8400-e29b-41d4-a716-446655440002",
    };
    expect(() => createMessageInputSchema.parse(invalidInput)).toThrow(
      "conversation_agent_id is required for agent role and must be omitted for user/system roles",
    );
  });
});
