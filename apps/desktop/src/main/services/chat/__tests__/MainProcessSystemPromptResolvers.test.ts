/**
 * Unit tests for MainProcessSystemPromptResolvers.
 */

import type {
  PersistedPersonalityData,
  PersistedRoleData,
} from "@fishbowl-ai/shared";

import { MainProcessSystemPromptResolvers } from "../MainProcessSystemPromptResolvers";
import { personalitiesRepositoryManager } from "../../../../data/repositories/personalitiesRepositoryManager";
import { rolesRepositoryManager } from "../../../../data/repositories/rolesRepositoryManager";

// Mock repository managers
jest.mock(
  "../../../../data/repositories/personalitiesRepositoryManager",
  () => ({
    personalitiesRepositoryManager: {
      get: jest.fn(),
    },
  }),
);

jest.mock("../../../../data/repositories/rolesRepositoryManager", () => ({
  rolesRepositoryManager: {
    get: jest.fn(),
  },
}));

describe("MainProcessSystemPromptResolvers", () => {
  let resolvers: MainProcessSystemPromptResolvers;
  let mockRolesRepository: jest.Mocked<any>;
  let mockPersonalitiesRepository: jest.Mocked<any>;

  const mockRoleData: PersistedRoleData = {
    id: "test-role-id",
    name: "Test Role",
    description: "A test role for unit tests",
    systemPrompt: "You are a test role.",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockPersonalityData: PersistedPersonalityData = {
    id: "test-personality-id",
    name: "Test Personality",
    customInstructions: "Be helpful and friendly.",
    behaviors: {
      helpfulness: 85,
      friendliness: 90,
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock repositories
    mockRolesRepository = {
      loadRoles: jest.fn(),
    };

    mockPersonalitiesRepository = {
      loadPersonalities: jest.fn(),
    };

    (rolesRepositoryManager.get as jest.Mock).mockReturnValue(
      mockRolesRepository,
    );
    (personalitiesRepositoryManager.get as jest.Mock).mockReturnValue(
      mockPersonalitiesRepository,
    );

    resolvers = new MainProcessSystemPromptResolvers();
  });

  describe("resolveRole", () => {
    it("should resolve role successfully when role exists", async () => {
      // Arrange
      const rolesData = {
        roles: [mockRoleData],
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      mockRolesRepository.loadRoles.mockResolvedValue(rolesData);

      // Act
      const result = await resolvers.resolveRole("test-role-id");

      // Assert
      expect(result).toEqual(mockRoleData);
      expect(rolesRepositoryManager.get).toHaveBeenCalledTimes(1);
      expect(mockRolesRepository.loadRoles).toHaveBeenCalledTimes(1);
    });

    it("should throw error when role not found", async () => {
      // Arrange
      const rolesData = {
        roles: [mockRoleData],
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      mockRolesRepository.loadRoles.mockResolvedValue(rolesData);

      // Act & Assert
      await expect(resolvers.resolveRole("non-existent-role")).rejects.toThrow(
        "Role not found: non-existent-role",
      );
    });

    it("should throw error when roles array is undefined", async () => {
      // Arrange
      const rolesData = {
        roles: undefined,
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      mockRolesRepository.loadRoles.mockResolvedValue(rolesData);

      // Act & Assert
      await expect(resolvers.resolveRole("test-role-id")).rejects.toThrow(
        "Role not found: test-role-id",
      );
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const error = new Error("Repository failed to load roles");
      mockRolesRepository.loadRoles.mockRejectedValue(error);

      // Act & Assert
      await expect(resolvers.resolveRole("test-role-id")).rejects.toThrow(
        error,
      );
    });

    it("should handle repository manager errors gracefully", async () => {
      // Arrange
      const error = new Error("Repository not initialized");
      (rolesRepositoryManager.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(resolvers.resolveRole("test-role-id")).rejects.toThrow(
        error,
      );
    });
  });

  describe("resolvePersonality", () => {
    it("should resolve personality successfully when personality exists", async () => {
      // Arrange
      const personalitiesData = {
        personalities: [mockPersonalityData],
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      mockPersonalitiesRepository.loadPersonalities.mockResolvedValue(
        personalitiesData,
      );

      // Act
      const result = await resolvers.resolvePersonality("test-personality-id");

      // Assert
      expect(result).toEqual(mockPersonalityData);
      expect(personalitiesRepositoryManager.get).toHaveBeenCalledTimes(1);
      expect(
        mockPersonalitiesRepository.loadPersonalities,
      ).toHaveBeenCalledTimes(1);
    });

    it("should throw error when personality not found", async () => {
      // Arrange
      const personalitiesData = {
        personalities: [mockPersonalityData],
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      mockPersonalitiesRepository.loadPersonalities.mockResolvedValue(
        personalitiesData,
      );

      // Act & Assert
      await expect(
        resolvers.resolvePersonality("non-existent-personality"),
      ).rejects.toThrow("Personality not found: non-existent-personality");
    });

    it("should throw error when personalities array is undefined", async () => {
      // Arrange
      const personalitiesData = {
        personalities: undefined,
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      mockPersonalitiesRepository.loadPersonalities.mockResolvedValue(
        personalitiesData,
      );

      // Act & Assert
      await expect(
        resolvers.resolvePersonality("test-personality-id"),
      ).rejects.toThrow("Personality not found: test-personality-id");
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const error = new Error("Repository failed to load personalities");
      mockPersonalitiesRepository.loadPersonalities.mockRejectedValue(error);

      // Act & Assert
      await expect(
        resolvers.resolvePersonality("test-personality-id"),
      ).rejects.toThrow(error);
    });

    it("should handle repository manager errors gracefully", async () => {
      // Arrange
      const error = new Error("Repository not initialized");
      (personalitiesRepositoryManager.get as jest.Mock).mockImplementation(
        () => {
          throw error;
        },
      );

      // Act & Assert
      await expect(
        resolvers.resolvePersonality("test-personality-id"),
      ).rejects.toThrow(error);
    });
  });

  describe("constructor", () => {
    it("should initialize without throwing", () => {
      expect(() => new MainProcessSystemPromptResolvers()).not.toThrow();
    });
  });

  describe("integration scenarios", () => {
    it("should resolve both role and personality in sequence", async () => {
      // Arrange
      const rolesData = {
        roles: [mockRoleData],
        lastUpdated: "2024-01-01T00:00:00Z",
      };
      const personalitiesData = {
        personalities: [mockPersonalityData],
        lastUpdated: "2024-01-01T00:00:00Z",
      };

      mockRolesRepository.loadRoles.mockResolvedValue(rolesData);
      mockPersonalitiesRepository.loadPersonalities.mockResolvedValue(
        personalitiesData,
      );

      // Act
      const [role, personality] = await Promise.all([
        resolvers.resolveRole("test-role-id"),
        resolvers.resolvePersonality("test-personality-id"),
      ]);

      // Assert
      expect(role).toEqual(mockRoleData);
      expect(personality).toEqual(mockPersonalityData);
    });

    it("should handle mixed success and failure scenarios", async () => {
      // Arrange
      const rolesData = {
        roles: [mockRoleData],
        lastUpdated: "2024-01-01T00:00:00Z",
      };

      mockRolesRepository.loadRoles.mockResolvedValue(rolesData);
      mockPersonalitiesRepository.loadPersonalities.mockRejectedValue(
        new Error("Personalities failed to load"),
      );

      // Act & Assert
      const rolePromise = resolvers.resolveRole("test-role-id");
      const personalityPromise = resolvers.resolvePersonality(
        "test-personality-id",
      );

      await expect(rolePromise).resolves.toEqual(mockRoleData);
      await expect(personalityPromise).rejects.toThrow(
        "Personalities failed to load",
      );
    });
  });
});
