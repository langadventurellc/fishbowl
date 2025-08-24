import type { DatabaseBridge, CryptoUtilsInterface } from "@fishbowl-ai/shared";
import {
  ConversationsRepository,
  ConversationsRepositoryInterface,
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationResult,
  ConversationNotFoundError,
  ConversationValidationError,
} from "..";

describe("Conversation exports", () => {
  it("should export ConversationsRepository", () => {
    expect(ConversationsRepository).toBeDefined();
    expect(typeof ConversationsRepository).toBe("function");
  });

  it("should export ConversationsRepositoryInterface", () => {
    // Interface types can't be tested directly at runtime, but we can verify
    // that the repository implements it by checking its methods
    const mockBridge: DatabaseBridge = {
      query: jest.fn(),
      execute: jest.fn(),
      transaction: jest.fn(),
      close: jest.fn(),
    };
    const mockCrypto: CryptoUtilsInterface = {
      generateId: jest.fn(),
      randomBytes: jest.fn(),
      getByteLength: jest.fn(),
    };

    const repository = new ConversationsRepository(mockBridge, mockCrypto);

    // Verify interface methods exist
    expect(typeof repository.create).toBe("function");
    expect(typeof repository.get).toBe("function");
    expect(typeof repository.list).toBe("function");
    expect(typeof repository.update).toBe("function");
    expect(typeof repository.delete).toBe("function");
    expect(typeof repository.exists).toBe("function");
  });

  it("should export conversation types", () => {
    // Runtime verification of type shapes through object creation
    const conversation: Conversation = {
      id: "test-id",
      title: "Test Title",
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z",
    };

    const createInput: CreateConversationInput = {
      title: "New Conversation",
    };

    const updateInput: UpdateConversationInput = {
      title: "Updated Title",
    };

    const successResult: ConversationResult = {
      success: true,
      data: conversation,
    };

    const errorResult: ConversationResult = {
      success: false,
      error: new Error("Test error"),
    };

    // Verify objects can be created with proper shapes
    expect(conversation.id).toBe("test-id");
    expect(createInput.title).toBe("New Conversation");
    expect(updateInput.title).toBe("Updated Title");
    expect(successResult.success).toBe(true);
    expect(errorResult.success).toBe(false);
  });

  it("should export error classes", () => {
    expect(ConversationNotFoundError).toBeDefined();
    expect(typeof ConversationNotFoundError).toBe("function");

    expect(ConversationValidationError).toBeDefined();
    expect(typeof ConversationValidationError).toBe("function");

    // Test error instantiation
    const notFoundError = new ConversationNotFoundError("test-id");
    expect(notFoundError).toBeInstanceOf(Error);
    expect(notFoundError).toBeInstanceOf(ConversationNotFoundError);

    const validationError = new ConversationValidationError([
      { field: "title", message: "Test validation error" },
    ]);
    expect(validationError).toBeInstanceOf(Error);
    expect(validationError).toBeInstanceOf(ConversationValidationError);
  });

  it("should be accessible from main package export", async () => {
    // Test that the main index file re-exports our conversation components
    const mainIndex = await import("../../../index");

    expect(mainIndex.ConversationsRepository).toBeDefined();
    expect(mainIndex.ConversationNotFoundError).toBeDefined();
    expect(mainIndex.ConversationValidationError).toBeDefined();
  });
});
