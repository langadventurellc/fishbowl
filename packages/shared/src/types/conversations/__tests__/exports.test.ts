describe("Conversation exports", () => {
  it("should export all schemas", async () => {
    const {
      conversationSchema,
      createConversationInputSchema,
      updateConversationInputSchema,
    } = await import("../index");

    // Verify schemas have parse methods (Zod schemas)
    expect(typeof conversationSchema.parse).toBe("function");
    expect(typeof createConversationInputSchema.parse).toBe("function");
    expect(typeof updateConversationInputSchema.parse).toBe("function");
  });

  it("should export all error classes", async () => {
    const { ConversationNotFoundError, ConversationValidationError } =
      await import("../index");

    // Verify error classes are constructable
    expect(typeof ConversationNotFoundError).toBe("function");
    expect(typeof ConversationValidationError).toBe("function");

    // Test instantiation
    const notFoundError = new ConversationNotFoundError("test-id");
    expect(notFoundError).toBeInstanceOf(Error);
    expect(notFoundError.name).toBe("ConversationNotFoundError");

    const validationError = new ConversationValidationError([
      { field: "title", message: "Required" },
    ]);
    expect(validationError).toBeInstanceOf(Error);
    expect(validationError.name).toBe("ConversationValidationError");
  });

  it("should not have circular dependencies", async () => {
    // This test passes if the import succeeds without throwing
    await expect(import("../index")).resolves.toBeDefined();
  });

  it("should export runtime code properly", async () => {
    const exports = await import("../index");

    // Runtime exports should be available
    expect(typeof exports.ConversationNotFoundError).toBe("function");
    expect(typeof exports.ConversationValidationError).toBe("function");
    expect(typeof exports.conversationSchema).toBe("object");
    expect(typeof exports.createConversationInputSchema).toBe("object");
    expect(typeof exports.updateConversationInputSchema).toBe("object");
  });
});
