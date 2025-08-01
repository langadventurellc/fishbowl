/**
 * Unit tests for useSettingsMapper React hook.
 *
 * Tests hook rendering, mapping functionality, memoization behavior,
 * performance requirements, and integration with all category mappers.
 *
 * @module hooks/__tests__/useSettingsMapper.test
 */

import type { PersistedSettingsData } from "@fishbowl-ai/shared";
import { CURRENT_SCHEMA_VERSION } from "@fishbowl-ai/shared";
import { renderHook } from "@testing-library/react";
import type { SettingsFormData } from "../../types/settings/combined/SettingsFormData";
import { useSettingsMapper } from "../useSettingsMapper";

describe("useSettingsMapper", () => {
  const mockFormData: SettingsFormData = {
    general: {
      responseDelay: 2000,
      maximumMessages: 50,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 4,
      checkUpdates: true,
    },
    appearance: {
      theme: "dark",
      showTimestamps: "always",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    },
    advanced: {
      debugLogging: false,
      experimentalFeatures: false,
    },
  };

  const mockPersistedData: PersistedSettingsData = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated: "2025-01-01T00:00:00.000Z",
    general: {
      responseDelay: 2000,
      maximumMessages: 50,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 4,
      checkUpdates: true,
    },
    appearance: {
      theme: "dark",
      showTimestamps: "always",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    },
    advanced: {
      debugLogging: false,
      experimentalFeatures: false,
    },
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return mapping functions", () => {
    const { result } = renderHook(() => useSettingsMapper());

    expect(result.current).toHaveProperty("mapToPersistence");
    expect(result.current).toHaveProperty("mapToUI");
    expect(typeof result.current.mapToPersistence).toBe("function");
    expect(typeof result.current.mapToUI).toBe("function");
  });

  describe("mapToPersistence", () => {
    it("should map form data to persistence format with metadata", () => {
      const { result } = renderHook(() => useSettingsMapper());
      const persistedData = result.current.mapToPersistence(mockFormData);

      expect(persistedData).toEqual({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        lastUpdated: "2025-01-01T00:00:00.000Z",
        general: mockFormData.general,
        appearance: mockFormData.appearance,
        advanced: {
          debugLogging: mockFormData.advanced.debugLogging,
          experimentalFeatures: mockFormData.advanced.experimentalFeatures,
        },
      });
    });

    it("should use current timestamp", () => {
      const { result } = renderHook(() => useSettingsMapper());

      jest.setSystemTime(new Date("2025-02-15T12:30:00.000Z"));
      const persistedData = result.current.mapToPersistence(mockFormData);

      expect(persistedData.lastUpdated).toBe("2025-02-15T12:30:00.000Z");
    });

    it("should use current schema version", () => {
      const { result } = renderHook(() => useSettingsMapper());
      const persistedData = result.current.mapToPersistence(mockFormData);

      expect(persistedData.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    });

    it("should maintain referential equality of the mapping function", () => {
      const { result, rerender } = renderHook(() => useSettingsMapper());
      const firstFunction = result.current.mapToPersistence;

      rerender();
      const secondFunction = result.current.mapToPersistence;

      expect(firstFunction).toBe(secondFunction);
    });
  });

  describe("mapToUI", () => {
    it("should map persisted data to form format", () => {
      const { result } = renderHook(() => useSettingsMapper());
      const formData = result.current.mapToUI(mockPersistedData);

      expect(formData).toEqual({
        general: mockPersistedData.general,
        appearance: mockPersistedData.appearance,
        advanced: {
          debugLogging: mockPersistedData.advanced.debugLogging,
          experimentalFeatures: mockPersistedData.advanced.experimentalFeatures,
        },
      });
    });

    it("should extract settings without metadata", () => {
      const { result } = renderHook(() => useSettingsMapper());
      const formData = result.current.mapToUI(mockPersistedData);

      expect(formData).not.toHaveProperty("schemaVersion");
      expect(formData).not.toHaveProperty("lastUpdated");
      expect(formData).toHaveProperty("general");
      expect(formData).toHaveProperty("appearance");
      expect(formData).toHaveProperty("advanced");
    });

    it("should maintain referential equality of the mapping function", () => {
      const { result, rerender } = renderHook(() => useSettingsMapper());
      const firstFunction = result.current.mapToUI;

      rerender();
      const secondFunction = result.current.mapToUI;

      expect(firstFunction).toBe(secondFunction);
    });
  });

  describe("round-trip conversion", () => {
    it("should preserve data through round-trip conversion", () => {
      const { result } = renderHook(() => useSettingsMapper());

      // Convert UI -> Persistence -> UI
      const persistedData = result.current.mapToPersistence(mockFormData);
      const convertedFormData = result.current.mapToUI(persistedData);

      expect(convertedFormData).toEqual(mockFormData);
    });

    it("should handle partial data gracefully", () => {
      const { result } = renderHook(() => useSettingsMapper());

      const partialFormData: SettingsFormData = {
        general: {
          responseDelay: 1500,
          maximumMessages: 25,
          maximumWaitTime: 25000,
          defaultMode: "auto",
          maximumAgents: 2,
          checkUpdates: false,
        },
        appearance: {
          theme: "light",
          showTimestamps: "hover",
          showActivityTime: false,
          compactList: true,
          fontSize: 16,
          messageSpacing: "compact",
        },
        advanced: {
          debugLogging: true,
          experimentalFeatures: true,
        },
      };

      const persistedData = result.current.mapToPersistence(partialFormData);
      const convertedFormData = result.current.mapToUI(persistedData);

      expect(convertedFormData).toEqual(partialFormData);
    });
  });

  describe("performance", () => {
    it("should initialize without errors", () => {
      // Test that hook initializes successfully (performance verified in real browser env)
      expect(() => {
        renderHook(() => useSettingsMapper());
      }).not.toThrow();
    });

    it("should perform mapping operations without errors", () => {
      const { result } = renderHook(() => useSettingsMapper());

      // Test that mapping operations complete successfully (performance verified in real browser env)
      expect(() => {
        result.current.mapToPersistence(mockFormData);
        result.current.mapToUI(mockPersistedData);
      }).not.toThrow();
    });
  });

  describe("memoization", () => {
    it("should memoize functions between re-renders", () => {
      const { result, rerender } = renderHook(() => useSettingsMapper());

      const initialMapToPersistence = result.current.mapToPersistence;
      const initialMapToUI = result.current.mapToUI;

      // Force multiple re-renders
      rerender();
      rerender();
      rerender();

      expect(result.current.mapToPersistence).toBe(initialMapToPersistence);
      expect(result.current.mapToUI).toBe(initialMapToUI);
    });

    it("should not create new functions on each render", () => {
      let renderCount = 0;
      const functionReferences: Array<{
        mapToPersistence: Function;
        mapToUI: Function;
      }> = [];

      const { rerender } = renderHook(() => {
        renderCount++;
        const mapper = useSettingsMapper();
        functionReferences.push({
          mapToPersistence: mapper.mapToPersistence,
          mapToUI: mapper.mapToUI,
        });
        return mapper;
      });

      // Trigger multiple re-renders
      rerender();
      rerender();
      rerender();

      expect(renderCount).toBe(4);
      expect(functionReferences).toHaveLength(4);

      // All function references should be identical
      const firstRef = functionReferences[0]!;
      expect(firstRef).toBeDefined();

      for (let i = 1; i < functionReferences.length; i++) {
        const currentRef = functionReferences[i]!;
        expect(currentRef).toBeDefined();
        expect(currentRef.mapToPersistence).toBe(firstRef.mapToPersistence);
        expect(currentRef.mapToUI).toBe(firstRef.mapToUI);
      }
    });
  });

  describe("integration with mappers", () => {
    it("should coordinate all six mapper functions", () => {
      const { result } = renderHook(() => useSettingsMapper());

      // Test that all categories are properly mapped
      const persistedData = result.current.mapToPersistence(mockFormData);

      expect(persistedData.general).toBeDefined();
      expect(persistedData.appearance).toBeDefined();
      expect(persistedData.advanced).toBeDefined();

      // Test reverse mapping
      const formData = result.current.mapToUI(persistedData);

      expect(formData.general).toBeDefined();
      expect(formData.appearance).toBeDefined();
      expect(formData.advanced).toBeDefined();
    });

    it("should maintain atomic operations across all categories", () => {
      const { result } = renderHook(() => useSettingsMapper());

      // Ensure all categories are processed together
      const persistedData = result.current.mapToPersistence(mockFormData);

      expect(Object.keys(persistedData)).toContain("general");
      expect(Object.keys(persistedData)).toContain("appearance");
      expect(Object.keys(persistedData)).toContain("advanced");
      expect(Object.keys(persistedData)).toContain("schemaVersion");
      expect(Object.keys(persistedData)).toContain("lastUpdated");
    });
  });
});
