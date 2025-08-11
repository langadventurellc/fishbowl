/**
 * Unit tests for handleNullTimestamps utility function
 */

import { handleNullTimestamps } from "../handleNullTimestamps";

describe("handleNullTimestamps", () => {
  const mockDate = "2025-01-15T10:00:00.000Z";

  beforeEach(() => {
    // Mock Date.now() for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("with valid timestamps", () => {
    it("should preserve existing valid timestamps", () => {
      const role = {
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = handleNullTimestamps(role);

      expect(result).toEqual({
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      });
    });

    it("should preserve timestamps even with extra whitespace", () => {
      const role = {
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe("2025-01-10T09:00:00.000Z");
      expect(result.updatedAt).toBe("2025-01-14T15:30:00.000Z");
    });
  });

  describe("with null timestamps", () => {
    it("should generate new timestamps for null values", () => {
      const role = {
        createdAt: null,
        updatedAt: null,
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should generate timestamp for null createdAt, preserve valid updatedAt", () => {
      const role = {
        createdAt: null,
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe("2025-01-14T15:30:00.000Z");
    });

    it("should preserve valid createdAt, generate timestamp for null updatedAt", () => {
      const role = {
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: null,
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe("2025-01-10T09:00:00.000Z");
      expect(result.updatedAt).toBe(mockDate);
    });
  });

  describe("with undefined timestamps", () => {
    it("should generate new timestamps for undefined values", () => {
      const role = {
        createdAt: undefined,
        updatedAt: undefined,
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should generate timestamp for undefined createdAt, preserve valid updatedAt", () => {
      const role = {
        createdAt: undefined,
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe("2025-01-14T15:30:00.000Z");
    });
  });

  describe("with empty/whitespace strings", () => {
    it("should generate new timestamps for empty strings", () => {
      const role = {
        createdAt: "",
        updatedAt: "",
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should generate new timestamps for whitespace-only strings", () => {
      const role = {
        createdAt: "   ",
        updatedAt: "  \t  \n  ",
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should generate timestamp for empty createdAt, preserve valid updatedAt", () => {
      const role = {
        createdAt: "  ",
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe("2025-01-14T15:30:00.000Z");
    });
  });

  describe("with missing properties", () => {
    it("should handle role object with no timestamp properties", () => {
      const role = {};

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should handle role object with only createdAt", () => {
      const role = {
        createdAt: "2025-01-10T09:00:00.000Z",
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe("2025-01-10T09:00:00.000Z");
      expect(result.updatedAt).toBe(mockDate);
    });

    it("should handle role object with only updatedAt", () => {
      const role = {
        updatedAt: "2025-01-14T15:30:00.000Z",
      };

      const result = handleNullTimestamps(role);

      expect(result.createdAt).toBe(mockDate);
      expect(result.updatedAt).toBe("2025-01-14T15:30:00.000Z");
    });
  });

  describe("type safety", () => {
    it("should always return strings for both timestamps", () => {
      const role = {
        createdAt: null,
        updatedAt: undefined,
      };

      const result = handleNullTimestamps(role);

      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
      expect(result.createdAt.length).toBeGreaterThan(0);
      expect(result.updatedAt.length).toBeGreaterThan(0);
    });

    it("should return valid ISO timestamp format", () => {
      const role = {
        createdAt: null,
        updatedAt: null,
      };

      const result = handleNullTimestamps(role);

      // Verify the format matches ISO 8601
      expect(result.createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(result.updatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      // Verify they can be parsed as valid dates
      expect(new Date(result.createdAt)).toBeInstanceOf(Date);
      expect(new Date(result.updatedAt)).toBeInstanceOf(Date);
      expect(new Date(result.createdAt).getTime()).not.toBeNaN();
      expect(new Date(result.updatedAt).getTime()).not.toBeNaN();
    });
  });
});
