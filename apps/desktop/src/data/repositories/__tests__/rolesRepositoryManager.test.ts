/**
 * Unit tests for rolesRepositoryManager.
 *
 * Tests the singleton manager for RolesRepository,
 * including initialization, access control, and error handling.
 *
 * @module data/repositories/__tests__/rolesRepositoryManager.test
 */

import { rolesRepositoryManager } from "../rolesRepositoryManager";
import { RolesRepository } from "../RolesRepository";

// Mock RolesRepository
jest.mock("../RolesRepository");
const MockedRolesRepository = RolesRepository as jest.MockedClass<
  typeof RolesRepository
>;

describe("rolesRepositoryManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the manager state before each test
    rolesRepositoryManager.reset();
  });

  afterEach(() => {
    // Clean up after each test
    rolesRepositoryManager.reset();
  });

  describe("initialize", () => {
    it("should initialize repository with provided data path", () => {
      const testPath = "/test/data";

      rolesRepositoryManager.initialize(testPath);

      expect(MockedRolesRepository).toHaveBeenCalledTimes(1);
      expect(MockedRolesRepository).toHaveBeenCalledWith(testPath);
    });

    it("should throw error if already initialized", () => {
      const testPath = "/test/data";

      rolesRepositoryManager.initialize(testPath);

      expect(() => {
        rolesRepositoryManager.initialize(testPath);
      }).toThrow("Roles repository already initialized");
    });

    it("should work with different data paths", () => {
      const testPath1 = "/first/path";
      const testPath2 = "/second/path";

      rolesRepositoryManager.initialize(testPath1);
      expect(MockedRolesRepository).toHaveBeenCalledWith(testPath1);

      rolesRepositoryManager.reset();

      rolesRepositoryManager.initialize(testPath2);
      expect(MockedRolesRepository).toHaveBeenCalledWith(testPath2);
    });
  });

  describe("get", () => {
    it("should return repository instance after initialization", () => {
      const testPath = "/test/data";

      rolesRepositoryManager.initialize(testPath);
      const result = rolesRepositoryManager.get();

      expect(result).toBeInstanceOf(RolesRepository);
      expect(MockedRolesRepository).toHaveBeenCalledWith(testPath);
    });

    it("should throw error if not initialized", () => {
      expect(() => {
        rolesRepositoryManager.get();
      }).toThrow("Roles repository not initialized");
    });

    it("should return same instance on multiple calls", () => {
      const testPath = "/test/data";

      rolesRepositoryManager.initialize(testPath);

      const instance1 = rolesRepositoryManager.get();
      const instance2 = rolesRepositoryManager.get();

      expect(instance1).toBe(instance2);
      expect(MockedRolesRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe("reset", () => {
    it("should clear repository instance", () => {
      const testPath = "/test/data";

      rolesRepositoryManager.initialize(testPath);
      expect(() => rolesRepositoryManager.get()).not.toThrow();

      rolesRepositoryManager.reset();

      expect(() => rolesRepositoryManager.get()).toThrow(
        "Roles repository not initialized",
      );
    });

    it("should allow reinitialization after reset", () => {
      const testPath1 = "/first/path";
      const testPath2 = "/second/path";

      // First initialization
      rolesRepositoryManager.initialize(testPath1);
      expect(MockedRolesRepository).toHaveBeenCalledWith(testPath1);

      // Reset and reinitialize
      rolesRepositoryManager.reset();
      rolesRepositoryManager.initialize(testPath2);

      expect(MockedRolesRepository).toHaveBeenCalledWith(testPath2);
      expect(MockedRolesRepository).toHaveBeenCalledTimes(2);
    });

    it("should be safe to call multiple times", () => {
      rolesRepositoryManager.reset();
      rolesRepositoryManager.reset();

      expect(() => rolesRepositoryManager.get()).toThrow(
        "Roles repository not initialized",
      );
    });

    it("should be safe to call before initialization", () => {
      expect(() => rolesRepositoryManager.reset()).not.toThrow();

      expect(() => rolesRepositoryManager.get()).toThrow(
        "Roles repository not initialized",
      );
    });
  });

  describe("Singleton Behavior", () => {
    it("should maintain single instance across imports", () => {
      // This test ensures the exported instance is a singleton
      expect(rolesRepositoryManager).toBe(rolesRepositoryManager);
    });

    it("should persist state across multiple operations", () => {
      const testPath = "/test/data";

      // Initialize
      rolesRepositoryManager.initialize(testPath);

      // Get instance multiple times
      const instance1 = rolesRepositoryManager.get();
      const instance2 = rolesRepositoryManager.get();
      const instance3 = rolesRepositoryManager.get();

      // All should be the same instance
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);

      // Repository constructor should only be called once
      expect(MockedRolesRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle empty string data path", () => {
      const emptyPath = "";

      expect(() => {
        rolesRepositoryManager.initialize(emptyPath);
      }).not.toThrow();

      expect(MockedRolesRepository).toHaveBeenCalledWith(emptyPath);
    });

    it("should handle special characters in data path", () => {
      const specialPath = "/path/with spaces/and-dashes_and.dots";

      expect(() => {
        rolesRepositoryManager.initialize(specialPath);
      }).not.toThrow();

      expect(MockedRolesRepository).toHaveBeenCalledWith(specialPath);
    });

    it("should maintain error state consistency", () => {
      // Ensure get() consistently throws before initialization
      expect(() => rolesRepositoryManager.get()).toThrow(
        "Roles repository not initialized",
      );
      expect(() => rolesRepositoryManager.get()).toThrow(
        "Roles repository not initialized",
      );
      expect(() => rolesRepositoryManager.get()).toThrow(
        "Roles repository not initialized",
      );
    });
  });

  describe("Integration with RolesRepository", () => {
    it("should pass data path correctly to RolesRepository constructor", () => {
      const testPath = "/integration/test/path";

      rolesRepositoryManager.initialize(testPath);

      expect(MockedRolesRepository).toHaveBeenCalledTimes(1);
      expect(MockedRolesRepository).toHaveBeenCalledWith(testPath);
    });

    it("should return actual RolesRepository instance", () => {
      const testPath = "/test/data";

      rolesRepositoryManager.initialize(testPath);
      const repository = rolesRepositoryManager.get();

      expect(repository).toBeInstanceOf(RolesRepository);
    });
  });
});
