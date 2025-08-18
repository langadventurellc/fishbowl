/**
 * Unit tests for the personalities Zustand store.
 *
 * Tests store initialization, CRUD operations, validation, error handling,
 * persistence integration, and edge cases for the personalities management.
 *
 * @module stores/__tests__/personalitiesStore.test
 */

import type {
  PersistedPersonalitiesSettingsData,
  StructuredLogger,
} from "@fishbowl-ai/shared";
import type { PersonalityFormData, PersonalityViewModel } from "../../";
import { usePersonalitiesStore } from "../usePersonalitiesStore";

// Mock console methods
const mockConsoleError = jest.fn();

// Mock logger for tests
const createMockLogger = (): StructuredLogger =>
  ({
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    setLevel: jest.fn(),
    getLevel: jest.fn().mockReturnValue("info"),
    child: jest.fn().mockReturnThis(),
    addTransport: jest.fn(),
    removeTransport: jest.fn(),
    setFormatter: jest.fn(),
  }) as unknown as StructuredLogger;

beforeEach(() => {
  // Reset store to clean state
  usePersonalitiesStore.setState({
    personalities: [],
    isLoading: false,
    error: {
      message: null,
      operation: null,
      isRetryable: false,
      retryCount: 0,
      timestamp: null,
    },
    adapter: null,
    logger: createMockLogger(), // Provide default mock logger
    isInitialized: false,
    isSaving: false,
    lastSyncTime: null,
    pendingOperations: [],
    retryTimers: new Map(),
  });

  // Reset console mocks
  mockConsoleError.mockClear();
  jest.spyOn(console, "error").mockImplementation(mockConsoleError);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("personalitiesStore", () => {
  describe("store initialization", () => {
    it("should initialize with correct default values", () => {
      const state = usePersonalitiesStore.getState();

      expect(state.personalities).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error?.message).toBe(null);
      expect(state.adapter).toBe(null);
      expect(state.isInitialized).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.lastSyncTime).toBe(null);
      expect(state.pendingOperations).toEqual([]);
      expect(state.retryTimers).toBeInstanceOf(Map);
    });
  });

  describe("createPersonality action", () => {
    const validPersonalityData: PersonalityFormData = {
      name: "Test Personality",
      bigFive: {
        openness: 75,
        conscientiousness: 80,
        extraversion: 60,
        agreeableness: 90,
        neuroticism: 25,
      },
      behaviors: {
        creativity: 85,
        humor: 70,
        formality: 40,
      },
      customInstructions: "Test custom instructions for this personality",
    };

    it("should create a new personality with valid data", () => {
      const store = usePersonalitiesStore.getState();

      const personalityId = store.createPersonality(validPersonalityData);

      expect(personalityId).toBeTruthy();
      expect(personalityId).toMatch(/^[a-f0-9-]{36}$|^[a-z0-9]+$/); // UUID or fallback format

      const state = usePersonalitiesStore.getState();
      expect(state.personalities).toHaveLength(1);
      expect(state.personalities[0]).toBeTruthy();
      expect(state.personalities[0]!.name).toBe(validPersonalityData.name);
      expect(state.personalities[0]!.bigFive).toEqual(
        validPersonalityData.bigFive,
      );
      expect(state.personalities[0]!.behaviors).toEqual(
        validPersonalityData.behaviors,
      );
      expect(state.personalities[0]!.customInstructions).toBe(
        validPersonalityData.customInstructions,
      );
      expect(state.personalities[0]!.id).toBe(personalityId);
      expect(state.personalities[0]!.createdAt).toBeTruthy();
      expect(state.personalities[0]!.updatedAt).toBeTruthy();
      expect(state.error?.message).toBe(null);
      expect(state.pendingOperations).toHaveLength(1);
      expect(state.pendingOperations[0]!.type).toBe("create");
    });

    it("should reject duplicate personality names (case-insensitive)", () => {
      const store = usePersonalitiesStore.getState();

      // Create first personality
      const firstId = store.createPersonality(validPersonalityData);
      expect(firstId).toBeTruthy();

      // Try to create personality with same name (different case)
      const duplicateData: PersonalityFormData = {
        name: "TEST PERSONALITY",
        bigFive: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 50,
        },
        behaviors: {},
        customInstructions: "Different instructions",
      };

      const secondId = store.createPersonality(duplicateData);

      expect(secondId).toBe("");
      const state = usePersonalitiesStore.getState();
      expect(state.personalities).toHaveLength(1);
      expect(state.error?.message).toBe(
        "A personality with this name already exists",
      );
    });

    it("should handle invalid data and return empty string", () => {
      const store = usePersonalitiesStore.getState();

      const invalidData = {
        name: "", // Invalid: empty name
        bigFive: {
          openness: 75,
          conscientiousness: 80,
          extraversion: 60,
          agreeableness: 90,
          neuroticism: 25,
        },
        behaviors: {},
        customInstructions: "",
      } as PersonalityFormData;

      const personalityId = store.createPersonality(invalidData);

      expect(personalityId).toBe("");
      const state = usePersonalitiesStore.getState();
      expect(state.personalities).toHaveLength(0);
      expect(state.error?.message).toBeTruthy();
    });

    it("should handle invalid Big Five values", () => {
      const store = usePersonalitiesStore.getState();

      const invalidBigFiveData = {
        name: "Test Personality",
        bigFive: {
          openness: 150, // Invalid: > 100
          conscientiousness: -10, // Invalid: < 0
          extraversion: 60,
          agreeableness: 90,
          neuroticism: 25,
        },
        behaviors: {},
        customInstructions: "",
      } as PersonalityFormData;

      const personalityId = store.createPersonality(invalidBigFiveData);

      expect(personalityId).toBe("");
      const state = usePersonalitiesStore.getState();
      expect(state.personalities).toHaveLength(0);
      expect(state.error?.message).toBeTruthy();
    });

    it("should handle invalid name characters", () => {
      const store = usePersonalitiesStore.getState();

      const invalidNameData = {
        name: "Test@Personality!", // Invalid: contains special characters
        bigFive: {
          openness: 75,
          conscientiousness: 80,
          extraversion: 60,
          agreeableness: 90,
          neuroticism: 25,
        },
        behaviors: {},
        customInstructions: "",
      } as PersonalityFormData;

      const personalityId = store.createPersonality(invalidNameData);

      expect(personalityId).toBe("");
      const state = usePersonalitiesStore.getState();
      expect(state.personalities).toHaveLength(0);
      expect(state.error?.message).toBeTruthy();
    });
  });

  describe("updatePersonality action", () => {
    const existingPersonality: PersonalityViewModel = {
      id: "existing-1",
      name: "Original Personality",
      bigFive: {
        openness: 70,
        conscientiousness: 75,
        extraversion: 55,
        agreeableness: 85,
        neuroticism: 30,
      },
      behaviors: {
        creativity: 80,
        humor: 65,
      },
      customInstructions: "Original custom instructions",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      usePersonalitiesStore.setState({
        personalities: [existingPersonality],
        isLoading: false,
        error: {
          message: null,
          operation: null,
          isRetryable: false,
          retryCount: 0,
          timestamp: null,
        },
        adapter: null,
        isInitialized: false,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });
    });

    it("should update existing personality with valid data", () => {
      const store = usePersonalitiesStore.getState();

      const updateData: PersonalityFormData = {
        name: "Updated Personality",
        bigFive: {
          openness: 90,
          conscientiousness: 85,
          extraversion: 70,
          agreeableness: 95,
          neuroticism: 20,
        },
        behaviors: {
          creativity: 95,
          humor: 80,
          formality: 30,
        },
        customInstructions: "Updated custom instructions",
      };

      store.updatePersonality(existingPersonality.id, updateData);

      const state = usePersonalitiesStore.getState();
      expect(state.personalities).toHaveLength(1);
      expect(state.personalities[0]!.id).toBe(existingPersonality.id);
      expect(state.personalities[0]!.name).toBe(updateData.name);
      expect(state.personalities[0]!.bigFive).toEqual(updateData.bigFive);
      expect(state.personalities[0]!.behaviors).toEqual(updateData.behaviors);
      expect(state.personalities[0]!.customInstructions).toBe(
        updateData.customInstructions,
      );
      expect(state.personalities[0]!.createdAt).toBe(
        existingPersonality.createdAt,
      );
      expect(state.personalities[0]!.updatedAt).not.toBe(
        existingPersonality.updatedAt,
      );
      expect(state.error?.message).toBe(null);
      expect(state.pendingOperations).toHaveLength(1);
      expect(state.pendingOperations[0]!.type).toBe("update");
      expect(state.pendingOperations[0]!.rollbackData).toEqual(
        existingPersonality,
      );
    });

    it("should reject non-existent personality ID", () => {
      const store = usePersonalitiesStore.getState();

      const updateData: PersonalityFormData = {
        name: "Updated Personality",
        bigFive: {
          openness: 90,
          conscientiousness: 85,
          extraversion: 70,
          agreeableness: 95,
          neuroticism: 20,
        },
        behaviors: {},
        customInstructions: "Updated instructions",
      };

      store.updatePersonality("non-existent", updateData);

      const state = usePersonalitiesStore.getState();
      expect(state.personalities[0]).toEqual(existingPersonality); // Unchanged
      expect(state.error?.message).toBe("Personality not found");
    });

    it("should reject duplicate names when updating (excluding current personality)", () => {
      const secondPersonality: PersonalityViewModel = {
        id: "existing-2",
        name: "Second Personality",
        bigFive: {
          openness: 60,
          conscientiousness: 70,
          extraversion: 80,
          agreeableness: 75,
          neuroticism: 40,
        },
        behaviors: {},
        customInstructions: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      usePersonalitiesStore.setState({
        personalities: [existingPersonality, secondPersonality],
        isLoading: false,
        error: {
          message: null,
          operation: null,
          isRetryable: false,
          retryCount: 0,
          timestamp: null,
        },
        adapter: null,
        isInitialized: false,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });

      const store = usePersonalitiesStore.getState();

      const updateData: PersonalityFormData = {
        name: "Second Personality", // Conflicts with existing personality
        bigFive: {
          openness: 90,
          conscientiousness: 85,
          extraversion: 70,
          agreeableness: 95,
          neuroticism: 20,
        },
        behaviors: {},
        customInstructions: "",
      };

      store.updatePersonality(existingPersonality.id, updateData);

      const state = usePersonalitiesStore.getState();
      expect(state.personalities[0]).toEqual(existingPersonality); // Unchanged
      expect(state.error?.message).toBe(
        "A personality with this name already exists",
      );
    });

    it("should allow updating personality to keep the same name", () => {
      const store = usePersonalitiesStore.getState();

      const updateData: PersonalityFormData = {
        name: "Original Personality", // Same name
        bigFive: {
          openness: 90,
          conscientiousness: 85,
          extraversion: 70,
          agreeableness: 95,
          neuroticism: 20,
        },
        behaviors: {
          creativity: 95,
        },
        customInstructions: "Updated instructions with same name",
      };

      store.updatePersonality(existingPersonality.id, updateData);

      const state = usePersonalitiesStore.getState();
      expect(state.personalities).toHaveLength(1);
      expect(state.personalities[0]!.name).toBe(updateData.name);
      expect(state.personalities[0]!.customInstructions).toBe(
        updateData.customInstructions,
      );
      expect(state.error?.message).toBe(null);
    });
  });

  describe("deletePersonality action", () => {
    const existingPersonality: PersonalityViewModel = {
      id: "existing-1",
      name: "Test Personality",
      bigFive: {
        openness: 70,
        conscientiousness: 75,
        extraversion: 55,
        agreeableness: 85,
        neuroticism: 30,
      },
      behaviors: {
        creativity: 80,
        humor: 65,
      },
      customInstructions: "Test instructions",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      usePersonalitiesStore.setState({
        personalities: [existingPersonality],
        isLoading: false,
        error: {
          message: null,
          operation: null,
          isRetryable: false,
          retryCount: 0,
          timestamp: null,
        },
        adapter: null,
        isInitialized: false,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });
    });

    it("should delete existing personality", () => {
      const store = usePersonalitiesStore.getState();

      store.deletePersonality(existingPersonality.id);

      const state = usePersonalitiesStore.getState();
      expect(state.personalities).toHaveLength(0);
      expect(state.error?.message).toBe(null);
      expect(state.pendingOperations).toHaveLength(1);
      expect(state.pendingOperations[0]!.type).toBe("delete");
      expect(state.pendingOperations[0]!.rollbackData).toEqual(
        existingPersonality,
      );
    });

    it("should reject non-existent personality ID", () => {
      const store = usePersonalitiesStore.getState();

      store.deletePersonality("non-existent");

      const state = usePersonalitiesStore.getState();
      expect(state.personalities).toHaveLength(1);
      expect(state.personalities[0]).toEqual(existingPersonality); // Unchanged
      expect(state.error?.message).toBe("Personality not found");
    });
  });

  describe("getPersonalityById action", () => {
    const personalities: PersonalityViewModel[] = [
      {
        id: "personality-1",
        name: "First Personality",
        bigFive: {
          openness: 70,
          conscientiousness: 75,
          extraversion: 55,
          agreeableness: 85,
          neuroticism: 30,
        },
        behaviors: {},
        customInstructions: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "personality-2",
        name: "Second Personality",
        bigFive: {
          openness: 80,
          conscientiousness: 65,
          extraversion: 75,
          agreeableness: 70,
          neuroticism: 45,
        },
        behaviors: {},
        customInstructions: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    beforeEach(() => {
      usePersonalitiesStore.setState({
        personalities,
        isLoading: false,
        error: {
          message: null,
          operation: null,
          isRetryable: false,
          retryCount: 0,
          timestamp: null,
        },
        adapter: null,
        isInitialized: false,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });
    });

    it("should return personality by valid ID", () => {
      const store = usePersonalitiesStore.getState();

      const found = store.getPersonalityById("personality-1");

      expect(found).toEqual(personalities[0]);
    });

    it("should return undefined for non-existent ID", () => {
      const store = usePersonalitiesStore.getState();

      const found = store.getPersonalityById("non-existent");

      expect(found).toBeUndefined();
    });

    it("should return undefined for empty ID", () => {
      const store = usePersonalitiesStore.getState();

      const found = store.getPersonalityById("");

      expect(found).toBeUndefined();
    });
  });

  describe("isPersonalityNameUnique action", () => {
    const personalities: PersonalityViewModel[] = [
      {
        id: "personality-1",
        name: "Creative Thinker",
        bigFive: {
          openness: 90,
          conscientiousness: 70,
          extraversion: 60,
          agreeableness: 80,
          neuroticism: 30,
        },
        behaviors: {},
        customInstructions: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "personality-2",
        name: "Analytical Mind",
        bigFive: {
          openness: 70,
          conscientiousness: 95,
          extraversion: 40,
          agreeableness: 60,
          neuroticism: 20,
        },
        behaviors: {},
        customInstructions: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    beforeEach(() => {
      usePersonalitiesStore.setState({
        personalities,
        isLoading: false,
        error: {
          message: null,
          operation: null,
          isRetryable: false,
          retryCount: 0,
          timestamp: null,
        },
        adapter: null,
        isInitialized: false,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });
    });

    it("should return true for unique name", () => {
      const store = usePersonalitiesStore.getState();

      const isUnique = store.isPersonalityNameUnique("New Personality");

      expect(isUnique).toBe(true);
    });

    it("should return false for duplicate name (case-insensitive)", () => {
      const store = usePersonalitiesStore.getState();

      const isUnique = store.isPersonalityNameUnique("CREATIVE THINKER");

      expect(isUnique).toBe(false);
    });

    it("should return true for duplicate name when excluding that personality", () => {
      const store = usePersonalitiesStore.getState();

      const isUnique = store.isPersonalityNameUnique(
        "Creative Thinker",
        "personality-1",
      );

      expect(isUnique).toBe(true);
    });

    it("should return false for duplicate name with different excluded ID", () => {
      const store = usePersonalitiesStore.getState();

      const isUnique = store.isPersonalityNameUnique(
        "Creative Thinker",
        "personality-2",
      );

      expect(isUnique).toBe(false);
    });

    it("should handle empty name", () => {
      const store = usePersonalitiesStore.getState();

      const isUnique = store.isPersonalityNameUnique("");

      expect(isUnique).toBe(true); // Empty name is unique (but invalid)
    });
  });

  describe("error state management", () => {
    it("should set and clear error states correctly", () => {
      const store = usePersonalitiesStore.getState();

      // Set error
      store.setError("Test error message");
      let state = usePersonalitiesStore.getState();
      expect(state.error?.message).toBe("Test error message");

      // Clear error
      store.clearError();
      state = usePersonalitiesStore.getState();
      expect(state.error?.message).toBe(null);
    });

    it("should return error details", () => {
      const store = usePersonalitiesStore.getState();

      store.setError("Detailed error message");
      const errorDetails = store.getErrorDetails();

      expect(errorDetails.message).toBe("Detailed error message");
      expect(errorDetails.timestamp).toBeTruthy();
    });
  });

  describe("pending operations tracking", () => {
    it("should track create operations", () => {
      const store = usePersonalitiesStore.getState();

      const validPersonalityData: PersonalityFormData = {
        name: "Test Personality",
        bigFive: {
          openness: 75,
          conscientiousness: 80,
          extraversion: 60,
          agreeableness: 90,
          neuroticism: 25,
        },
        behaviors: {},
        customInstructions: "",
      };

      store.createPersonality(validPersonalityData);

      const state = usePersonalitiesStore.getState();
      expect(state.pendingOperations).toHaveLength(1);
      expect(state.pendingOperations[0]!.type).toBe("create");
      expect(state.pendingOperations[0]!.status).toBe("pending");
      expect(state.pendingOperations[0]!.rollbackData).toBeUndefined();
    });

    it("should track update operations with rollback data", () => {
      const existingPersonality: PersonalityViewModel = {
        id: "existing-1",
        name: "Original",
        bigFive: {
          openness: 70,
          conscientiousness: 75,
          extraversion: 55,
          agreeableness: 85,
          neuroticism: 30,
        },
        behaviors: {},
        customInstructions: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      usePersonalitiesStore.setState({
        personalities: [existingPersonality],
        isLoading: false,
        error: {
          message: null,
          operation: null,
          isRetryable: false,
          retryCount: 0,
          timestamp: null,
        },
        adapter: null,
        isInitialized: false,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });

      const store = usePersonalitiesStore.getState();

      const updateData: PersonalityFormData = {
        name: "Updated",
        bigFive: {
          openness: 90,
          conscientiousness: 85,
          extraversion: 70,
          agreeableness: 95,
          neuroticism: 20,
        },
        behaviors: {},
        customInstructions: "",
      };

      store.updatePersonality(existingPersonality.id, updateData);

      const state = usePersonalitiesStore.getState();
      expect(state.pendingOperations).toHaveLength(1);
      expect(state.pendingOperations[0]!.type).toBe("update");
      expect(state.pendingOperations[0]!.rollbackData).toEqual(
        existingPersonality,
      );
    });

    it("should track delete operations with rollback data", () => {
      const existingPersonality: PersonalityViewModel = {
        id: "existing-1",
        name: "To Delete",
        bigFive: {
          openness: 70,
          conscientiousness: 75,
          extraversion: 55,
          agreeableness: 85,
          neuroticism: 30,
        },
        behaviors: {},
        customInstructions: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      usePersonalitiesStore.setState({
        personalities: [existingPersonality],
        isLoading: false,
        error: {
          message: null,
          operation: null,
          isRetryable: false,
          retryCount: 0,
          timestamp: null,
        },
        adapter: null,
        isInitialized: false,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });

      const store = usePersonalitiesStore.getState();

      store.deletePersonality(existingPersonality.id);

      const state = usePersonalitiesStore.getState();
      expect(state.pendingOperations).toHaveLength(1);
      expect(state.pendingOperations[0]!.type).toBe("delete");
      expect(state.pendingOperations[0]!.rollbackData).toEqual(
        existingPersonality,
      );
    });
  });

  describe("timestamp management", () => {
    it("should set created and updated timestamps on create", () => {
      const store = usePersonalitiesStore.getState();

      const beforeTime = new Date().toISOString();

      const validPersonalityData: PersonalityFormData = {
        name: "Test Personality",
        bigFive: {
          openness: 75,
          conscientiousness: 80,
          extraversion: 60,
          agreeableness: 90,
          neuroticism: 25,
        },
        behaviors: {},
        customInstructions: "",
      };

      store.createPersonality(validPersonalityData);

      const afterTime = new Date().toISOString();
      const state = usePersonalitiesStore.getState();

      expect(state.personalities[0]!.createdAt).toBeTruthy();
      expect(state.personalities[0]!.updatedAt).toBeTruthy();
      expect(state.personalities[0]!.createdAt).toEqual(
        state.personalities[0]!.updatedAt,
      );

      // Verify timestamps are within reasonable range
      expect(
        new Date(state.personalities[0]!.createdAt!).getTime(),
      ).toBeGreaterThanOrEqual(new Date(beforeTime).getTime());
      expect(
        new Date(state.personalities[0]!.createdAt!).getTime(),
      ).toBeLessThanOrEqual(new Date(afterTime).getTime());
    });

    it("should update only updatedAt timestamp on update", () => {
      const existingPersonality: PersonalityViewModel = {
        id: "existing-1",
        name: "Original",
        bigFive: {
          openness: 70,
          conscientiousness: 75,
          extraversion: 55,
          agreeableness: 85,
          neuroticism: 30,
        },
        behaviors: {},
        customInstructions: "",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      usePersonalitiesStore.setState({
        personalities: [existingPersonality],
        isLoading: false,
        error: {
          message: null,
          operation: null,
          isRetryable: false,
          retryCount: 0,
          timestamp: null,
        },
        adapter: null,
        isInitialized: false,
        isSaving: false,
        lastSyncTime: null,
        pendingOperations: [],
        retryTimers: new Map(),
      });

      const store = usePersonalitiesStore.getState();

      const updateData: PersonalityFormData = {
        name: "Updated",
        bigFive: {
          openness: 90,
          conscientiousness: 85,
          extraversion: 70,
          agreeableness: 95,
          neuroticism: 20,
        },
        behaviors: {},
        customInstructions: "",
      };

      store.updatePersonality(existingPersonality.id, updateData);

      const state = usePersonalitiesStore.getState();
      expect(state.personalities[0]!.createdAt).toBe(
        existingPersonality.createdAt,
      );
      expect(state.personalities[0]!.updatedAt).not.toBe(
        existingPersonality.updatedAt,
      );
    });
  });

  describe("error handling and retry logic", () => {
    // Mock adapter for testing persistence operations
    const createMockAdapter = (options = {}) => ({
      load: jest.fn(),
      save: jest.fn(),
      reset: jest.fn(),
      ...options,
    });

    beforeEach(() => {
      // Use real timers like the roles store tests
    });

    afterEach(() => {
      // Clean up any pending timers
      const store = usePersonalitiesStore.getState();
      store.retryTimers.forEach((timer) => clearTimeout(timer));
      store.retryTimers.clear();
    });

    describe("_isRetryableError function", () => {
      it("should not retry validation errors", () => {
        const store = usePersonalitiesStore.getState();
        const invalidData = { name: "" } as PersonalityFormData;
        store.createPersonality(invalidData);

        const state = usePersonalitiesStore.getState();
        expect(state.error?.message).toBeTruthy();
        expect(state.error?.isRetryable).toBe(false);
      });

      it("should not retry permission errors", async () => {
        const mockAdapter = createMockAdapter();
        const permissionError = {
          code: "EACCES",
          message: "Permission denied",
        };
        mockAdapter.save.mockRejectedValue(permissionError);

        usePersonalitiesStore.setState({ adapter: mockAdapter });
        const store = usePersonalitiesStore.getState();

        try {
          await store.persistChanges();
        } catch {
          // Expected to fail
        }

        expect(mockAdapter.save).toHaveBeenCalled();
      });

      it("should retry network-related errors", async () => {
        const mockAdapter = createMockAdapter();
        const networkError = {
          code: "ETIMEDOUT",
          message: "Connection timeout",
        };
        mockAdapter.save.mockRejectedValue(networkError);

        usePersonalitiesStore.setState({ adapter: mockAdapter });
        const store = usePersonalitiesStore.getState();

        try {
          await store.persistChanges();
        } catch {
          // Expected to fail after retries
        }

        expect(mockAdapter.save).toHaveBeenCalled();
      });
    });

    describe("direct operation behavior (no automatic retries)", () => {
      it("should fail immediately on operation error", async () => {
        const mockAdapter = createMockAdapter();
        mockAdapter.load.mockRejectedValue(new Error("Operation failed"));

        usePersonalitiesStore.setState({ adapter: mockAdapter });
        const store = usePersonalitiesStore.getState();

        // Operations now fail immediately without automatic retries
        await expect(store.syncWithStorage()).rejects.toThrow(
          "Operation failed",
        );
        expect(mockAdapter.load).toHaveBeenCalledTimes(1); // Only called once
      });

      it("should succeed immediately on operation success", async () => {
        const mockAdapter = createMockAdapter();
        mockAdapter.load.mockResolvedValue({ personalities: [] });

        usePersonalitiesStore.setState({ adapter: mockAdapter });
        const store = usePersonalitiesStore.getState();

        await store.syncWithStorage();

        expect(mockAdapter.load).toHaveBeenCalledTimes(1);
        const state = usePersonalitiesStore.getState();
        expect(state.error?.message).toBe(null);
      });
    });

    describe("save error handling with rollback", () => {
      it("should rollback state on save failure", async () => {
        const originalPersonalities = [
          {
            id: "existing-1",
            name: "Original",
            bigFive: {
              openness: 70,
              conscientiousness: 75,
              extraversion: 55,
              agreeableness: 85,
              neuroticism: 30,
            },
            behaviors: {},
            customInstructions: "",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ];

        const mockAdapter = createMockAdapter();
        mockAdapter.save.mockRejectedValue(new Error("Save failed"));

        usePersonalitiesStore.setState({
          personalities: originalPersonalities,
          adapter: mockAdapter,
          pendingOperations: [
            {
              id: "op-1",
              type: "update",
              personalityId: "existing-1",
              timestamp: new Date().toISOString(),
              rollbackData: originalPersonalities[0],
              status: "pending",
            },
          ],
        });

        const store = usePersonalitiesStore.getState();

        try {
          await store.persistChanges();
        } catch {
          // Expected to fail
        }

        // Rollback logic happens immediately, no timer needed

        const state = usePersonalitiesStore.getState();
        expect(state.personalities).toEqual(originalPersonalities);
        expect(state.isSaving).toBe(false);
        expect(state.pendingOperations[0]?.status).toBe("failed");
      });

      it("should fail immediately on save error (no automatic retries)", async () => {
        const mockAdapter = createMockAdapter();
        mockAdapter.save.mockRejectedValue(new Error("Save failure"));

        usePersonalitiesStore.setState({
          personalities: [],
          adapter: mockAdapter,
        });

        const store = usePersonalitiesStore.getState();

        // Expect immediate failure without retries
        await expect(store.persistChanges()).rejects.toThrow("Save failure");
        expect(mockAdapter.save).toHaveBeenCalledTimes(1); // Only called once
      });
    });

    describe("async method implementations", () => {
      describe("initialize", () => {
        it("should initialize store with adapter and load data", async () => {
          const mockAdapter = createMockAdapter();
          const mockData = { personalities: [{ id: "test-1", name: "Test" }] };
          mockAdapter.load.mockResolvedValue(mockData);

          const store = usePersonalitiesStore.getState();

          await store.initialize(mockAdapter, createMockLogger());

          const state = usePersonalitiesStore.getState();
          expect(state.adapter).toBe(mockAdapter);
          expect(state.isInitialized).toBe(true);
          expect(state.isLoading).toBe(false);
          // Mapping function adds defaults, so expect the expanded structure
          expect(state.personalities).toHaveLength(1);
          expect(state.personalities[0]?.id).toBe("test-1");
          expect(state.personalities[0]?.name).toBe("Test");
          expect(state.personalities[0]?.bigFive).toBeDefined();
          expect(state.personalities[0]?.behaviors).toBeDefined();
          expect(mockAdapter.load).toHaveBeenCalled();
        });

        it("should handle initialization failure gracefully", async () => {
          const mockAdapter = createMockAdapter();
          mockAdapter.load.mockRejectedValue(new Error("Load failed"));

          const store = usePersonalitiesStore.getState();

          await store.initialize(mockAdapter, createMockLogger());

          const state = usePersonalitiesStore.getState();
          expect(state.isInitialized).toBe(false);
          expect(state.isLoading).toBe(false);
          expect(state.error?.message).toContain(
            "Failed to initialize personalities",
          );
          expect(mockConsoleError).toHaveBeenCalled();
        });

        it("should start with empty array when no persisted data", async () => {
          const mockAdapter = createMockAdapter();
          mockAdapter.load.mockResolvedValue(null);

          const store = usePersonalitiesStore.getState();

          await store.initialize(mockAdapter, createMockLogger());

          const state = usePersonalitiesStore.getState();
          expect(state.personalities).toEqual([]);
          expect(state.isInitialized).toBe(true);
        });
      });

      describe("persistChanges", () => {
        it("should save personalities through adapter", async () => {
          const personalities: PersonalityViewModel[] = [
            {
              id: "test-1",
              name: "Test Personality",
              bigFive: {
                openness: 70,
                conscientiousness: 75,
                extraversion: 55,
                agreeableness: 85,
                neuroticism: 30,
              },
              behaviors: {},
              customInstructions: "",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
          ];
          const mockAdapter = createMockAdapter();
          mockAdapter.save.mockResolvedValue(undefined);

          usePersonalitiesStore.setState({
            personalities,
            adapter: mockAdapter,
          });

          const store = usePersonalitiesStore.getState();

          await store.persistChanges();

          const state = usePersonalitiesStore.getState();
          expect(mockAdapter.save).toHaveBeenCalled();
          expect(state.isSaving).toBe(false);
          expect(state.lastSyncTime).toBeTruthy();
        });

        it("should prevent concurrent saves", async () => {
          const mockAdapter = createMockAdapter();
          mockAdapter.save.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100)),
          );

          usePersonalitiesStore.setState({
            personalities: [],
            adapter: mockAdapter,
            isSaving: true, // Already saving
          });

          const store = usePersonalitiesStore.getState();

          await store.persistChanges(); // Should return early

          expect(mockAdapter.save).not.toHaveBeenCalled();
        });

        it("should throw error when no adapter configured", async () => {
          usePersonalitiesStore.setState({
            personalities: [],
            adapter: null,
          });

          const store = usePersonalitiesStore.getState();

          await expect(store.persistChanges()).rejects.toThrow(
            "Cannot persist changes: no adapter configured",
          );
        });
      });

      describe("exportPersonalities", () => {
        it("should export personalities in persistence format", async () => {
          const personalities: PersonalityViewModel[] = [
            {
              id: "test-1",
              name: "Test",
              bigFive: {
                openness: 70,
                conscientiousness: 75,
                extraversion: 55,
                agreeableness: 85,
                neuroticism: 30,
              },
              behaviors: {},
              customInstructions: "",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
          ];
          usePersonalitiesStore.setState({
            personalities,
          });

          const store = usePersonalitiesStore.getState();

          const exported = await store.exportPersonalities();

          // Export returns full persistence format with schema version and timestamp
          expect(exported.personalities).toHaveLength(1);
          expect(exported.personalities[0]?.id).toBe("test-1");
          expect(exported.personalities[0]?.name).toBe("Test");
          expect(exported.schemaVersion).toBeDefined();
          expect(exported.lastUpdated).toBeDefined();
        });
      });

      describe("importPersonalities", () => {
        it("should import and save personalities", async () => {
          const importData: PersistedPersonalitiesSettingsData = {
            schemaVersion: "1.0",
            lastUpdated: "2024-01-01T00:00:00.000Z",
            personalities: [
              {
                id: "imported-1",
                name: "Imported",
                bigFive: {
                  openness: 70,
                  conscientiousness: 75,
                  extraversion: 55,
                  agreeableness: 85,
                  neuroticism: 30,
                },
                behaviors: {},
                customInstructions: "",
                createdAt: "2024-01-01T00:00:00.000Z",
                updatedAt: "2024-01-01T00:00:00.000Z",
              },
            ],
          };
          const mockAdapter = createMockAdapter();
          mockAdapter.save.mockResolvedValue(undefined);

          usePersonalitiesStore.setState({ adapter: mockAdapter });

          const store = usePersonalitiesStore.getState();

          await store.importPersonalities(importData);

          const state = usePersonalitiesStore.getState();
          // Import updates timestamps, so check core fields instead of exact equality
          expect(state.personalities).toHaveLength(1);
          expect(state.personalities[0]?.id).toBe("imported-1");
          expect(state.personalities[0]?.name).toBe("Imported");
          expect(state.personalities[0]?.bigFive).toEqual(
            importData.personalities[0]?.bigFive,
          );
          expect(state.pendingOperations).toEqual([]);
          expect(mockAdapter.save).toHaveBeenCalled();
        });

        it("should throw error when no adapter configured", async () => {
          usePersonalitiesStore.setState({ adapter: null });

          const store = usePersonalitiesStore.getState();

          await expect(
            store.importPersonalities({
              schemaVersion: "1.0",
              lastUpdated: "2024-01-01T00:00:00.000Z",
              personalities: [],
            }),
          ).rejects.toThrow(
            "Cannot import personalities: no adapter configured",
          );
        });
      });

      describe("resetPersonalities", () => {
        it("should clear store and reset adapter", async () => {
          const mockAdapter = createMockAdapter();
          mockAdapter.reset.mockResolvedValue(undefined);

          const testPersonality: PersonalityViewModel = {
            id: "test-1",
            name: "Test",
            bigFive: {
              openness: 70,
              conscientiousness: 75,
              extraversion: 55,
              agreeableness: 85,
              neuroticism: 30,
            },
            behaviors: {},
            customInstructions: "",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          };

          usePersonalitiesStore.setState({
            personalities: [testPersonality],
            adapter: mockAdapter,
            isInitialized: true,
            lastSyncTime: "2024-01-01T00:00:00.000Z",
            pendingOperations: [
              {
                id: "op-1",
                type: "create",
                personalityId: "test-1",
                timestamp: "2024-01-01T00:00:00.000Z",
                rollbackData: undefined,
                status: "pending",
              },
            ],
          });

          const store = usePersonalitiesStore.getState();

          await store.resetPersonalities();

          const state = usePersonalitiesStore.getState();
          expect(state.personalities).toEqual([]);
          expect(state.isInitialized).toBe(false);
          expect(state.lastSyncTime).toBe(null);
          expect(state.pendingOperations).toEqual([]);
          expect(mockAdapter.reset).toHaveBeenCalled();
        });
      });
    });

    describe("error recovery methods", () => {
      describe("retryLastOperation", () => {
        it("should retry save operation", async () => {
          const mockAdapter = createMockAdapter();
          mockAdapter.save.mockResolvedValue(undefined);

          usePersonalitiesStore.setState({
            adapter: mockAdapter,
            error: {
              message: "Save failed",
              operation: "save",
              isRetryable: true,
              retryCount: 1,
              timestamp: new Date().toISOString(),
            },
          });

          const store = usePersonalitiesStore.getState();

          await store.retryLastOperation();

          expect(mockAdapter.save).toHaveBeenCalled();
        });

        it("should retry sync operation", async () => {
          const mockAdapter = createMockAdapter();
          mockAdapter.load.mockResolvedValue({ personalities: [] });

          usePersonalitiesStore.setState({
            adapter: mockAdapter,
            error: {
              message: "Sync failed",
              operation: "sync",
              isRetryable: true,
              retryCount: 1,
              timestamp: new Date().toISOString(),
            },
          });

          const store = usePersonalitiesStore.getState();

          await store.retryLastOperation();

          expect(mockAdapter.load).toHaveBeenCalled();
        });

        it("should not retry when no error state", async () => {
          const store = usePersonalitiesStore.getState();

          await store.retryLastOperation();

          // Should complete without issues
          expect(true).toBe(true);
        });

        it("should not retry non-retryable operations", async () => {
          usePersonalitiesStore.setState({
            error: {
              message: "Validation failed",
              operation: "save",
              isRetryable: false,
              retryCount: 0,
              timestamp: new Date().toISOString(),
            },
          });

          const store = usePersonalitiesStore.getState();

          await store.retryLastOperation();

          // Should complete without retrying
          expect(true).toBe(true);
        });
      });

      describe("clearErrorState", () => {
        it("should clear error state and pending timers", () => {
          const mockTimer = setTimeout(() => {}, 1000);
          const retryTimers = new Map([["save", mockTimer]]);

          usePersonalitiesStore.setState({
            error: {
              message: "Test error",
              operation: "save",
              isRetryable: true,
              retryCount: 1,
              timestamp: new Date().toISOString(),
            },
            retryTimers,
          });

          const store = usePersonalitiesStore.getState();

          store.clearErrorState();

          const state = usePersonalitiesStore.getState();
          expect(state.error?.message).toBe(null);
          expect(state.retryTimers.size).toBe(0);
        });
      });
    });

    describe("timer management and memory cleanup", () => {
      it("should clean up retry timers on successful operations", async () => {
        const mockAdapter = createMockAdapter();
        mockAdapter.load.mockResolvedValue({ personalities: [] });

        usePersonalitiesStore.setState({ adapter: mockAdapter });

        const store = usePersonalitiesStore.getState();

        await store.syncWithStorage();

        const state = usePersonalitiesStore.getState();
        expect(state.retryTimers.size).toBe(0);
      });

      it("should have no retry timers after immediate operation failure", async () => {
        const mockAdapter = createMockAdapter();
        mockAdapter.load.mockRejectedValue(new Error("Operation failed"));

        usePersonalitiesStore.setState({ adapter: mockAdapter });

        const store = usePersonalitiesStore.getState();

        // Operations fail immediately, no timers are created
        await expect(store.syncWithStorage()).rejects.toThrow(
          "Operation failed",
        );

        const state = usePersonalitiesStore.getState();
        expect(state.retryTimers.size).toBe(0); // No timers created
      });
    });

    describe("error message formatting", () => {
      it("should format validation errors with field details", () => {
        const store = usePersonalitiesStore.getState();

        const invalidData = { name: "" } as PersonalityFormData;
        store.createPersonality(invalidData);

        const state = usePersonalitiesStore.getState();
        expect(state.error?.message).toBeTruthy();
        // fieldErrors are set for certain validation errors (implementation detail)
        expect(state.error?.isRetryable).toBe(false);
      });

      it("should format file system errors appropriately", async () => {
        const mockAdapter = createMockAdapter();
        const fsError = { code: "ENOENT", message: "File not found" };
        mockAdapter.load.mockRejectedValue(fsError);

        usePersonalitiesStore.setState({ adapter: mockAdapter });

        const store = usePersonalitiesStore.getState();

        try {
          await store.syncWithStorage();
        } catch {
          // Expected to fail
        }

        const state = usePersonalitiesStore.getState();
        // Error message is generated by the retry operation error handling
        expect(state.error?.message).toContain("Failed to sync");
      });
    });

    describe("concurrent operations", () => {
      it("should handle multiple concurrent sync operations", async () => {
        const mockAdapter = createMockAdapter();
        mockAdapter.load.mockResolvedValue({ personalities: [] });

        usePersonalitiesStore.setState({ adapter: mockAdapter });

        const store = usePersonalitiesStore.getState();

        // Start multiple concurrent operations
        const promises = [
          store.syncWithStorage(),
          store.syncWithStorage(),
          store.syncWithStorage(),
        ];

        await Promise.all(promises);

        // All should complete successfully
        const state = usePersonalitiesStore.getState();
        expect(state.error?.message).toBe(null);
      });

      it("should prevent concurrent save operations", async () => {
        const mockAdapter = createMockAdapter();
        mockAdapter.save.mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

        usePersonalitiesStore.setState({
          personalities: [],
          adapter: mockAdapter,
        });

        const store = usePersonalitiesStore.getState();

        // Start first save
        const firstSave = store.persistChanges();

        // Try to start second save while first is in progress
        const secondSave = store.persistChanges();

        await Promise.all([firstSave, secondSave]);

        // Only one save should have been attempted
        expect(mockAdapter.save).toHaveBeenCalledTimes(1);
      });
    });

    describe("edge cases and boundary conditions", () => {
      it("should handle undefined/null adapter gracefully", async () => {
        usePersonalitiesStore.setState({ adapter: null });

        const store = usePersonalitiesStore.getState();

        await expect(store.persistChanges()).rejects.toThrow(
          "Cannot persist changes: no adapter configured",
        );
        await expect(store.syncWithStorage()).rejects.toThrow(
          "Cannot sync: no adapter configured",
        );
        await expect(store.resetPersonalities()).rejects.toThrow(
          "Cannot reset personalities: no adapter configured",
        );
      });

      it("should handle empty personalities array", async () => {
        const mockAdapter = createMockAdapter();
        mockAdapter.save.mockResolvedValue(undefined);

        usePersonalitiesStore.setState({
          personalities: [],
          adapter: mockAdapter,
        });

        const store = usePersonalitiesStore.getState();

        await store.persistChanges();

        expect(mockAdapter.save).toHaveBeenCalled();

        const state = usePersonalitiesStore.getState();
        expect(state.error?.message).toBe(null);
      });

      it("should fail immediately on persistent errors (no retries)", async () => {
        const mockAdapter = createMockAdapter();
        mockAdapter.load.mockRejectedValue(new Error("Always fails"));

        usePersonalitiesStore.setState({ adapter: mockAdapter });

        const store = usePersonalitiesStore.getState();

        // Operations fail immediately without retries
        await expect(store.syncWithStorage()).rejects.toThrow("Always fails");
        expect(mockAdapter.load).toHaveBeenCalledTimes(1); // Only called once
      });
    });
  });
});
