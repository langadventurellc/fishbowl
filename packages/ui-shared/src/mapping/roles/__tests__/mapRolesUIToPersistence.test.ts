import { mapRolesUIToPersistence } from "../mapRolesUIToPersistence";
import type { RoleViewModel } from "../../../types/settings/RoleViewModel";

describe("mapRolesUIToPersistence", () => {
  const mockDate = "2025-01-15T10:00:00.000Z";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should transform complete role array to persistence format", () => {
    const uiRoles: RoleViewModel[] = [
      {
        id: "role-1",
        name: "Manager",
        description: "Manages tasks",
        systemPrompt: "You are a manager",
        createdAt: "2025-01-10T09:00:00.000Z",
        updatedAt: "2025-01-14T15:30:00.000Z",
      },
      {
        id: "role-2",
        name: "Developer",
        description: "Writes code",
        systemPrompt: "You are a developer",
        createdAt: "2025-01-11T10:00:00.000Z",
        updatedAt: "2025-01-15T16:00:00.000Z",
      },
    ];

    const result = mapRolesUIToPersistence(uiRoles);

    expect(result.schemaVersion).toBe("1.0.0");
    expect(result.lastUpdated).toBe(mockDate);
    expect(result.roles).toHaveLength(2);
    expect(result.roles[0]).toEqual({
      id: "role-1",
      name: "Manager",
      description: "Manages tasks",
      systemPrompt: "You are a manager",
      createdAt: "2025-01-10T09:00:00.000Z",
      updatedAt: mockDate,
    });
  });

  it("should handle empty roles array", () => {
    const result = mapRolesUIToPersistence([]);

    expect(result).toEqual({
      schemaVersion: "1.0.0",
      roles: [],
      lastUpdated: mockDate,
    });
  });

  it("should generate schema version and timestamp", () => {
    const uiRoles: RoleViewModel[] = [
      {
        id: "test-role",
        name: "Test",
        description: "Test role",
        systemPrompt: "Test system prompt",
      },
    ];

    const result = mapRolesUIToPersistence(uiRoles);

    expect(result.schemaVersion).toBe("1.0.0");
    expect(result.lastUpdated).toBe(mockDate);
  });

  it("should validate output against schema", () => {
    const validRoles: RoleViewModel[] = [
      {
        id: "valid-role",
        name: "Valid Role",
        description: "Valid description",
        systemPrompt: "Valid prompt",
      },
    ];

    expect(() => mapRolesUIToPersistence(validRoles)).not.toThrow();
  });

  it("should throw on invalid transformed data", () => {
    const invalidRole = {
      id: "", // Empty ID should fail validation after trimming
      name: "Valid Name",
      description: "Valid Description",
    } as RoleViewModel;

    expect(() => mapRolesUIToPersistence([invalidRole])).toThrow();
  });

  it("should preserve role field data correctly", () => {
    const uiRoles: RoleViewModel[] = [
      {
        id: "preserve-test",
        name: "Preserve Test",
        description: "Should preserve all fields",
        systemPrompt: "System prompt preserved",
        createdAt: "2025-01-05T08:00:00.000Z",
        updatedAt: "2025-01-10T12:00:00.000Z",
      },
    ];

    const result = mapRolesUIToPersistence(uiRoles);

    const role = result.roles[0]!;
    expect(role.id).toBe("preserve-test");
    expect(role.name).toBe("Preserve Test");
    expect(role.description).toBe("Should preserve all fields");
    expect(role.systemPrompt).toBe("System prompt preserved");
    expect(role.createdAt).toBe("2025-01-05T08:00:00.000Z");
  });

  it("should handle large role arrays (100+ roles)", () => {
    const largeRoleArray: RoleViewModel[] = Array.from(
      { length: 100 },
      (_, i) => ({
        id: `role-${i}`,
        name: `Role ${i}`,
        description: `Description for role ${i}`,
        systemPrompt: `System prompt for role ${i}`,
        createdAt: "2025-01-01T10:00:00.000Z",
        updatedAt: "2025-01-10T15:00:00.000Z",
      }),
    );

    const startTime = performance.now();
    const result = mapRolesUIToPersistence(largeRoleArray);
    const endTime = performance.now();

    expect(result.roles).toHaveLength(100);
    expect(endTime - startTime).toBeLessThan(50);
    expect(result.roles[0]!.id).toBe("role-0");
    expect(result.roles[99]!.id).toBe("role-99");
  });
});
