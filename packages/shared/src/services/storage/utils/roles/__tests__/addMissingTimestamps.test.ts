import { addMissingTimestamps } from "../addMissingTimestamps";

describe("addMissingTimestamps", () => {
  const baseRoleData = {
    id: "test-role",
    name: "Test Role",
    description: "A test role",
    systemPrompt: "You are helpful",
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-15T10:30:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("missing timestamps", () => {
    it("should add both timestamps when both are missing", () => {
      const result = addMissingTimestamps(baseRoleData);

      expect(result.createdAt).toBe("2025-01-15T10:30:00.000Z");
      expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
    });

    it("should add createdAt when only createdAt is missing", () => {
      const roleDataWithUpdatedAt = {
        ...baseRoleData,
        updatedAt: "2025-01-10T08:00:00.000Z",
      };

      const result = addMissingTimestamps(roleDataWithUpdatedAt);

      expect(result.createdAt).toBe("2025-01-15T10:30:00.000Z");
      expect(result.updatedAt).toBe("2025-01-10T08:00:00.000Z");
    });

    it("should add updatedAt when only updatedAt is missing", () => {
      const roleDataWithCreatedAt = {
        ...baseRoleData,
        createdAt: "2025-01-10T08:00:00.000Z",
      };

      const result = addMissingTimestamps(roleDataWithCreatedAt);

      expect(result.createdAt).toBe("2025-01-10T08:00:00.000Z");
      expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
    });
  });

  describe("existing valid timestamps", () => {
    it("should preserve existing valid timestamps", () => {
      const roleDataWithTimestamps = {
        ...baseRoleData,
        createdAt: "2025-01-10T08:00:00.000Z",
        updatedAt: "2025-01-12T14:30:00.000Z",
      };

      const result = addMissingTimestamps(roleDataWithTimestamps);

      expect(result.createdAt).toBe("2025-01-10T08:00:00.000Z");
      expect(result.updatedAt).toBe("2025-01-12T14:30:00.000Z");
    });
  });

  describe("null timestamp handling", () => {
    it("should replace null createdAt with current timestamp", () => {
      const roleDataWithNullCreatedAt = {
        ...baseRoleData,
        createdAt: null,
        updatedAt: "2025-01-12T14:30:00.000Z",
      };

      const result = addMissingTimestamps(roleDataWithNullCreatedAt);

      expect(result.createdAt).toBe("2025-01-15T10:30:00.000Z");
      expect(result.updatedAt).toBe("2025-01-12T14:30:00.000Z");
    });

    it("should replace null updatedAt with current timestamp", () => {
      const roleDataWithNullUpdatedAt = {
        ...baseRoleData,
        createdAt: "2025-01-10T08:00:00.000Z",
        updatedAt: null,
      };

      const result = addMissingTimestamps(roleDataWithNullUpdatedAt);

      expect(result.createdAt).toBe("2025-01-10T08:00:00.000Z");
      expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
    });

    it("should replace both null timestamps with current timestamp", () => {
      const roleDataWithNullTimestamps = {
        ...baseRoleData,
        createdAt: null,
        updatedAt: null,
      };

      const result = addMissingTimestamps(roleDataWithNullTimestamps);

      expect(result.createdAt).toBe("2025-01-15T10:30:00.000Z");
      expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
    });
  });

  describe("invalid timestamp handling", () => {
    it("should replace invalid date strings with current timestamp", () => {
      const roleDataWithInvalidTimestamps = {
        ...baseRoleData,
        createdAt: "invalid-date",
        updatedAt: "also-invalid",
      };

      const result = addMissingTimestamps(roleDataWithInvalidTimestamps);

      expect(result.createdAt).toBe("2025-01-15T10:30:00.000Z");
      expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
    });

    it("should normalize mixed valid and invalid timestamps", () => {
      const roleDataMixed = {
        ...baseRoleData,
        createdAt: "2025-01-10T08:00:00.000Z",
        updatedAt: "not-a-date",
      };

      const result = addMissingTimestamps(roleDataMixed);

      expect(result.createdAt).toBe("2025-01-10T08:00:00.000Z");
      expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
    });
  });

  describe("result completeness", () => {
    it("should return a complete PersistedRoleData object", () => {
      const result = addMissingTimestamps(baseRoleData);

      expect(result).toHaveProperty("id", "test-role");
      expect(result).toHaveProperty("name", "Test Role");
      expect(result).toHaveProperty("description", "A test role");
      expect(result).toHaveProperty("systemPrompt", "You are helpful");
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
    });

    it("should preserve all original fields", () => {
      const extendedRoleData = {
        ...baseRoleData,
        customField: "custom value",
      };

      const result = addMissingTimestamps(
        extendedRoleData as Record<string, unknown>,
      );

      expect(result).toHaveProperty("customField", "custom value");
    });
  });
});
