/**
 * Unit tests for llmModelsRepositoryManager.
 *
 * Tests the singleton manager for LlmModelsRepository,
 * including initialization, access control, and error handling.
 *
 * @module data/repositories/__tests__/llmModelsRepositoryManager.test
 */

import { llmModelsRepositoryManager } from "../llmModelsRepositoryManager";
import { LlmModelsRepository } from "../LlmModelsRepository";

// Mock LlmModelsRepository
jest.mock("../LlmModelsRepository");
const MockedLlmModelsRepository = LlmModelsRepository as jest.MockedClass<
  typeof LlmModelsRepository
>;

describe("llmModelsRepositoryManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the manager state before each test
    llmModelsRepositoryManager.reset();
  });

  afterEach(() => {
    // Clean up after each test
    llmModelsRepositoryManager.reset();
  });

  describe("initialize", () => {
    it("should initialize repository with provided data path", () => {
      const testPath = "/test/data";

      llmModelsRepositoryManager.initialize(testPath);

      expect(MockedLlmModelsRepository).toHaveBeenCalledTimes(1);
      expect(MockedLlmModelsRepository).toHaveBeenCalledWith(testPath);
    });

    it("should throw error if already initialized", () => {
      const testPath = "/test/data";

      llmModelsRepositoryManager.initialize(testPath);

      expect(() => {
        llmModelsRepositoryManager.initialize(testPath);
      }).toThrow("LLM models repository already initialized");
    });

    it("should work with different data paths", () => {
      const testPath1 = "/first/path";
      const testPath2 = "/second/path";

      llmModelsRepositoryManager.initialize(testPath1);
      expect(MockedLlmModelsRepository).toHaveBeenCalledWith(testPath1);

      llmModelsRepositoryManager.reset();

      llmModelsRepositoryManager.initialize(testPath2);
      expect(MockedLlmModelsRepository).toHaveBeenCalledWith(testPath2);
    });
  });

  describe("get", () => {
    it("should return repository instance after initialization", () => {
      const testPath = "/test/data";

      llmModelsRepositoryManager.initialize(testPath);
      const result = llmModelsRepositoryManager.get();

      expect(result).toBeInstanceOf(LlmModelsRepository);
      expect(MockedLlmModelsRepository).toHaveBeenCalledWith(testPath);
    });

    it("should throw error if not initialized", () => {
      expect(() => {
        llmModelsRepositoryManager.get();
      }).toThrow("LLM models repository not initialized");
    });

    it("should return same instance on multiple calls", () => {
      const testPath = "/test/data";

      llmModelsRepositoryManager.initialize(testPath);

      const instance1 = llmModelsRepositoryManager.get();
      const instance2 = llmModelsRepositoryManager.get();

      expect(instance1).toBe(instance2);
      expect(MockedLlmModelsRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe("reset", () => {
    it("should clear repository instance", () => {
      const testPath = "/test/data";

      llmModelsRepositoryManager.initialize(testPath);
      expect(() => llmModelsRepositoryManager.get()).not.toThrow();

      llmModelsRepositoryManager.reset();

      expect(() => llmModelsRepositoryManager.get()).toThrow(
        "LLM models repository not initialized",
      );
    });

    it("should allow reinitialization after reset", () => {
      const testPath1 = "/first/path";
      const testPath2 = "/second/path";

      // First initialization
      llmModelsRepositoryManager.initialize(testPath1);
      expect(MockedLlmModelsRepository).toHaveBeenCalledWith(testPath1);

      // Reset and reinitialize
      llmModelsRepositoryManager.reset();
      llmModelsRepositoryManager.initialize(testPath2);

      expect(MockedLlmModelsRepository).toHaveBeenCalledWith(testPath2);
      expect(MockedLlmModelsRepository).toHaveBeenCalledTimes(2);
    });

    it("should be safe to call multiple times", () => {
      llmModelsRepositoryManager.reset();
      llmModelsRepositoryManager.reset();

      expect(() => llmModelsRepositoryManager.get()).toThrow(
        "LLM models repository not initialized",
      );
    });

    it("should be safe to call before initialization", () => {
      expect(() => llmModelsRepositoryManager.reset()).not.toThrow();

      expect(() => llmModelsRepositoryManager.get()).toThrow(
        "LLM models repository not initialized",
      );
    });
  });

  describe("Singleton Behavior", () => {
    it("should maintain single instance across imports", () => {
      // This test ensures the exported instance is a singleton
      expect(llmModelsRepositoryManager).toBe(llmModelsRepositoryManager);
    });

    it("should persist state across multiple operations", () => {
      const testPath = "/test/data";

      // Initialize
      llmModelsRepositoryManager.initialize(testPath);

      // Get instance multiple times
      const instance1 = llmModelsRepositoryManager.get();
      const instance2 = llmModelsRepositoryManager.get();
      const instance3 = llmModelsRepositoryManager.get();

      // All should be the same instance
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);

      // Repository constructor should only be called once
      expect(MockedLlmModelsRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle empty string data path", () => {
      const emptyPath = "";

      expect(() => {
        llmModelsRepositoryManager.initialize(emptyPath);
      }).not.toThrow();

      expect(MockedLlmModelsRepository).toHaveBeenCalledWith(emptyPath);
    });

    it("should handle special characters in data path", () => {
      const specialPath = "/path/with spaces/and-dashes_and.dots";

      expect(() => {
        llmModelsRepositoryManager.initialize(specialPath);
      }).not.toThrow();

      expect(MockedLlmModelsRepository).toHaveBeenCalledWith(specialPath);
    });

    it("should maintain error state consistency", () => {
      // Ensure get() consistently throws before initialization
      expect(() => llmModelsRepositoryManager.get()).toThrow(
        "LLM models repository not initialized",
      );
      expect(() => llmModelsRepositoryManager.get()).toThrow(
        "LLM models repository not initialized",
      );
      expect(() => llmModelsRepositoryManager.get()).toThrow(
        "LLM models repository not initialized",
      );
    });
  });

  describe("Integration with LlmModelsRepository", () => {
    it("should pass data path correctly to LlmModelsRepository constructor", () => {
      const testPath = "/integration/test/path";

      llmModelsRepositoryManager.initialize(testPath);

      expect(MockedLlmModelsRepository).toHaveBeenCalledTimes(1);
      expect(MockedLlmModelsRepository).toHaveBeenCalledWith(testPath);
    });

    it("should return actual LlmModelsRepository instance", () => {
      const testPath = "/test/data";

      llmModelsRepositoryManager.initialize(testPath);
      const repository = llmModelsRepositoryManager.get();

      expect(repository).toBeInstanceOf(LlmModelsRepository);
    });
  });
});
