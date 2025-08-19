/**
 * Unit tests for agentsRepositoryManager.
 *
 * Tests the singleton manager for AgentsRepository,
 * including initialization, access control, and error handling.
 *
 * @module data/repositories/__tests__/agentsRepositoryManager.test
 */

import { agentsRepositoryManager } from "../agentsRepositoryManager";
import { AgentsRepository } from "../AgentsRepository";

// Mock AgentsRepository
jest.mock("../AgentsRepository");
const MockedAgentsRepository = AgentsRepository as jest.MockedClass<
  typeof AgentsRepository
>;

describe("agentsRepositoryManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the manager state before each test
    agentsRepositoryManager.reset();
  });

  afterEach(() => {
    // Clean up after each test
    agentsRepositoryManager.reset();
  });

  describe("initialize", () => {
    it("should initialize repository with provided data path", () => {
      const testPath = "/test/data";

      agentsRepositoryManager.initialize(testPath);

      expect(MockedAgentsRepository).toHaveBeenCalledTimes(1);
      expect(MockedAgentsRepository).toHaveBeenCalledWith(testPath);
    });

    it("should throw error if already initialized", () => {
      const testPath = "/test/data";

      agentsRepositoryManager.initialize(testPath);

      expect(() => {
        agentsRepositoryManager.initialize(testPath);
      }).toThrow("Agents repository already initialized");
    });

    it("should work with different data paths", () => {
      const testPath1 = "/first/path";
      const testPath2 = "/second/path";

      agentsRepositoryManager.initialize(testPath1);
      expect(MockedAgentsRepository).toHaveBeenCalledWith(testPath1);

      agentsRepositoryManager.reset();

      agentsRepositoryManager.initialize(testPath2);
      expect(MockedAgentsRepository).toHaveBeenCalledWith(testPath2);
    });
  });

  describe("get", () => {
    it("should return repository instance after initialization", () => {
      const testPath = "/test/data";

      agentsRepositoryManager.initialize(testPath);
      const result = agentsRepositoryManager.get();

      expect(result).toBeInstanceOf(AgentsRepository);
      expect(MockedAgentsRepository).toHaveBeenCalledWith(testPath);
    });

    it("should throw error if not initialized", () => {
      expect(() => {
        agentsRepositoryManager.get();
      }).toThrow("Agents repository not initialized");
    });

    it("should return same instance on multiple calls", () => {
      const testPath = "/test/data";

      agentsRepositoryManager.initialize(testPath);

      const instance1 = agentsRepositoryManager.get();
      const instance2 = agentsRepositoryManager.get();

      expect(instance1).toBe(instance2);
      expect(MockedAgentsRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe("reset", () => {
    it("should clear repository instance", () => {
      const testPath = "/test/data";

      agentsRepositoryManager.initialize(testPath);
      expect(() => agentsRepositoryManager.get()).not.toThrow();

      agentsRepositoryManager.reset();

      expect(() => agentsRepositoryManager.get()).toThrow(
        "Agents repository not initialized",
      );
    });

    it("should allow reinitialization after reset", () => {
      const testPath1 = "/first/path";
      const testPath2 = "/second/path";

      // First initialization
      agentsRepositoryManager.initialize(testPath1);
      expect(MockedAgentsRepository).toHaveBeenCalledWith(testPath1);

      // Reset and reinitialize
      agentsRepositoryManager.reset();
      agentsRepositoryManager.initialize(testPath2);

      expect(MockedAgentsRepository).toHaveBeenCalledWith(testPath2);
      expect(MockedAgentsRepository).toHaveBeenCalledTimes(2);
    });

    it("should be safe to call multiple times", () => {
      agentsRepositoryManager.reset();
      agentsRepositoryManager.reset();

      expect(() => agentsRepositoryManager.get()).toThrow(
        "Agents repository not initialized",
      );
    });

    it("should be safe to call before initialization", () => {
      expect(() => agentsRepositoryManager.reset()).not.toThrow();

      expect(() => agentsRepositoryManager.get()).toThrow(
        "Agents repository not initialized",
      );
    });
  });

  describe("Singleton Behavior", () => {
    it("should maintain single instance across imports", () => {
      // This test ensures the exported instance is a singleton
      expect(agentsRepositoryManager).toBe(agentsRepositoryManager);
    });

    it("should persist state across multiple operations", () => {
      const testPath = "/test/data";

      // Initialize
      agentsRepositoryManager.initialize(testPath);

      // Get instance multiple times
      const instance1 = agentsRepositoryManager.get();
      const instance2 = agentsRepositoryManager.get();
      const instance3 = agentsRepositoryManager.get();

      // All should be the same instance
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);

      // Repository constructor should only be called once
      expect(MockedAgentsRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle empty string data path", () => {
      const emptyPath = "";

      expect(() => {
        agentsRepositoryManager.initialize(emptyPath);
      }).not.toThrow();

      expect(MockedAgentsRepository).toHaveBeenCalledWith(emptyPath);
    });

    it("should handle special characters in data path", () => {
      const specialPath = "/path/with spaces/and-dashes_and.dots";

      expect(() => {
        agentsRepositoryManager.initialize(specialPath);
      }).not.toThrow();

      expect(MockedAgentsRepository).toHaveBeenCalledWith(specialPath);
    });

    it("should maintain error state consistency", () => {
      // Ensure get() consistently throws before initialization
      expect(() => agentsRepositoryManager.get()).toThrow(
        "Agents repository not initialized",
      );
      expect(() => agentsRepositoryManager.get()).toThrow(
        "Agents repository not initialized",
      );
      expect(() => agentsRepositoryManager.get()).toThrow(
        "Agents repository not initialized",
      );
    });
  });

  describe("Integration with AgentsRepository", () => {
    it("should pass data path correctly to AgentsRepository constructor", () => {
      const testPath = "/integration/test/path";

      agentsRepositoryManager.initialize(testPath);

      expect(MockedAgentsRepository).toHaveBeenCalledTimes(1);
      expect(MockedAgentsRepository).toHaveBeenCalledWith(testPath);
    });

    it("should return actual AgentsRepository instance", () => {
      const testPath = "/test/data";

      agentsRepositoryManager.initialize(testPath);
      const repository = agentsRepositoryManager.get();

      expect(repository).toBeInstanceOf(AgentsRepository);
    });
  });
});
