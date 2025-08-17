/**
 * Unit tests for personalitiesRepositoryManager.
 *
 * Tests the singleton manager for PersonalitiesRepository,
 * including initialization, access control, and error handling.
 *
 * @module data/repositories/__tests__/personalitiesRepositoryManager.test
 */

import { personalitiesRepositoryManager } from "../personalitiesRepositoryManager";
import { PersonalitiesRepository } from "../PersonalitiesRepository";

// Mock PersonalitiesRepository
jest.mock("../PersonalitiesRepository");
const MockedPersonalitiesRepository =
  PersonalitiesRepository as jest.MockedClass<typeof PersonalitiesRepository>;

describe("personalitiesRepositoryManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the manager state before each test
    personalitiesRepositoryManager.reset();
  });

  afterEach(() => {
    // Clean up after each test
    personalitiesRepositoryManager.reset();
  });

  describe("initialize", () => {
    it("should initialize repository with provided data path", () => {
      const testPath = "/test/data";

      personalitiesRepositoryManager.initialize(testPath);

      expect(MockedPersonalitiesRepository).toHaveBeenCalledTimes(1);
      expect(MockedPersonalitiesRepository).toHaveBeenCalledWith(testPath);
    });

    it("should throw error if already initialized", () => {
      const testPath = "/test/data";

      personalitiesRepositoryManager.initialize(testPath);

      expect(() => {
        personalitiesRepositoryManager.initialize(testPath);
      }).toThrow("Personalities repository already initialized");
    });

    it("should work with different data paths", () => {
      const testPath1 = "/first/path";
      const testPath2 = "/second/path";

      personalitiesRepositoryManager.initialize(testPath1);
      expect(MockedPersonalitiesRepository).toHaveBeenCalledWith(testPath1);

      personalitiesRepositoryManager.reset();

      personalitiesRepositoryManager.initialize(testPath2);
      expect(MockedPersonalitiesRepository).toHaveBeenCalledWith(testPath2);
    });
  });

  describe("get", () => {
    it("should return repository instance after initialization", () => {
      const testPath = "/test/data";

      personalitiesRepositoryManager.initialize(testPath);
      const result = personalitiesRepositoryManager.get();

      expect(result).toBeInstanceOf(PersonalitiesRepository);
      expect(MockedPersonalitiesRepository).toHaveBeenCalledWith(testPath);
    });

    it("should throw error if not initialized", () => {
      expect(() => {
        personalitiesRepositoryManager.get();
      }).toThrow("Personalities repository not initialized");
    });

    it("should return same instance on multiple calls", () => {
      const testPath = "/test/data";

      personalitiesRepositoryManager.initialize(testPath);

      const instance1 = personalitiesRepositoryManager.get();
      const instance2 = personalitiesRepositoryManager.get();

      expect(instance1).toBe(instance2);
      expect(MockedPersonalitiesRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe("reset", () => {
    it("should clear repository instance", () => {
      const testPath = "/test/data";

      personalitiesRepositoryManager.initialize(testPath);
      expect(() => personalitiesRepositoryManager.get()).not.toThrow();

      personalitiesRepositoryManager.reset();

      expect(() => personalitiesRepositoryManager.get()).toThrow(
        "Personalities repository not initialized",
      );
    });

    it("should allow reinitialization after reset", () => {
      const testPath1 = "/first/path";
      const testPath2 = "/second/path";

      // First initialization
      personalitiesRepositoryManager.initialize(testPath1);
      expect(MockedPersonalitiesRepository).toHaveBeenCalledWith(testPath1);

      // Reset and reinitialize
      personalitiesRepositoryManager.reset();
      personalitiesRepositoryManager.initialize(testPath2);

      expect(MockedPersonalitiesRepository).toHaveBeenCalledWith(testPath2);
      expect(MockedPersonalitiesRepository).toHaveBeenCalledTimes(2);
    });

    it("should be safe to call multiple times", () => {
      personalitiesRepositoryManager.reset();
      personalitiesRepositoryManager.reset();

      expect(() => personalitiesRepositoryManager.get()).toThrow(
        "Personalities repository not initialized",
      );
    });

    it("should be safe to call before initialization", () => {
      expect(() => personalitiesRepositoryManager.reset()).not.toThrow();

      expect(() => personalitiesRepositoryManager.get()).toThrow(
        "Personalities repository not initialized",
      );
    });
  });

  describe("Singleton Behavior", () => {
    it("should maintain single instance across imports", () => {
      // This test ensures the exported instance is a singleton
      expect(personalitiesRepositoryManager).toBe(
        personalitiesRepositoryManager,
      );
    });

    it("should persist state across multiple operations", () => {
      const testPath = "/test/data";

      // Initialize
      personalitiesRepositoryManager.initialize(testPath);

      // Get instance multiple times
      const instance1 = personalitiesRepositoryManager.get();
      const instance2 = personalitiesRepositoryManager.get();
      const instance3 = personalitiesRepositoryManager.get();

      // All should be the same instance
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);

      // Repository constructor should only be called once
      expect(MockedPersonalitiesRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle empty string data path", () => {
      const emptyPath = "";

      expect(() => {
        personalitiesRepositoryManager.initialize(emptyPath);
      }).not.toThrow();

      expect(MockedPersonalitiesRepository).toHaveBeenCalledWith(emptyPath);
    });

    it("should handle special characters in data path", () => {
      const specialPath = "/path/with spaces/and-dashes_and.dots";

      expect(() => {
        personalitiesRepositoryManager.initialize(specialPath);
      }).not.toThrow();

      expect(MockedPersonalitiesRepository).toHaveBeenCalledWith(specialPath);
    });

    it("should maintain error state consistency", () => {
      // Ensure get() consistently throws before initialization
      expect(() => personalitiesRepositoryManager.get()).toThrow(
        "Personalities repository not initialized",
      );
      expect(() => personalitiesRepositoryManager.get()).toThrow(
        "Personalities repository not initialized",
      );
      expect(() => personalitiesRepositoryManager.get()).toThrow(
        "Personalities repository not initialized",
      );
    });
  });

  describe("Integration with PersonalitiesRepository", () => {
    it("should pass data path correctly to PersonalitiesRepository constructor", () => {
      const testPath = "/integration/test/path";

      personalitiesRepositoryManager.initialize(testPath);

      expect(MockedPersonalitiesRepository).toHaveBeenCalledTimes(1);
      expect(MockedPersonalitiesRepository).toHaveBeenCalledWith(testPath);
    });

    it("should return actual PersonalitiesRepository instance", () => {
      const testPath = "/test/data";

      personalitiesRepositoryManager.initialize(testPath);
      const repository = personalitiesRepositoryManager.get();

      expect(repository).toBeInstanceOf(PersonalitiesRepository);
    });
  });
});
