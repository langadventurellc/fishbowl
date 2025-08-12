import { mapSingleRoleUIToPersistence } from "../mapSingleRoleUIToPersistence";
import type { RoleViewModel } from "../../../types/settings/RoleViewModel";

describe("mapSingleRoleUIToPersistence", () => {
  const mockDate = "2025-01-15T10:00:00.000Z";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should transform complete role to persistence format", () => {
    const uiRole: RoleViewModel = {
      id: "role-123",
      name: "Project Manager",
      description: "Manages projects",
      systemPrompt: "You are a project manager",
      createdAt: "2025-01-10T09:00:00.000Z",
      updatedAt: "2025-01-14T15:30:00.000Z",
    };

    const result = mapSingleRoleUIToPersistence(uiRole);

    expect(result).toEqual({
      id: "role-123",
      name: "Project Manager",
      description: "Manages projects",
      systemPrompt: "You are a project manager",
      createdAt: "2025-01-10T09:00:00.000Z",
      updatedAt: mockDate,
    });
  });

  it("should generate timestamps for missing fields", () => {
    const uiRole: RoleViewModel = {
      id: "role-456",
      name: "Test Role",
      description: "Test description",
      systemPrompt: "Test system prompt",
    };

    const result = mapSingleRoleUIToPersistence(uiRole);

    expect(result.createdAt).toBe(mockDate);
    expect(result.updatedAt).toBe(mockDate);
  });

  it("should preserve existing timestamps", () => {
    const existingCreatedAt = "2025-01-01T12:00:00.000Z";
    const uiRole: RoleViewModel = {
      id: "role-789",
      name: "Existing Role",
      description: "Has timestamps",
      systemPrompt: "Test system prompt",
      createdAt: existingCreatedAt,
    };

    const result = mapSingleRoleUIToPersistence(uiRole);

    expect(result.createdAt).toBe(existingCreatedAt);
    expect(result.updatedAt).toBe(mockDate);
  });

  it("should normalize string fields", () => {
    const uiRole: RoleViewModel = {
      id: "  role-trim  ",
      name: "  Needs Trimming  ",
      description: "  Extra spaces  ",
      systemPrompt: "  System prompt with spaces  ",
    };

    const result = mapSingleRoleUIToPersistence(uiRole);

    expect(result.id).toBe("role-trim");
    expect(result.name).toBe("Needs Trimming");
    expect(result.description).toBe("Extra spaces");
    expect(result.systemPrompt).toBe("System prompt with spaces");
  });

  it("should handle required systemPrompt field", () => {
    const uiRole: RoleViewModel = {
      id: "role-minimal",
      name: "Minimal Role",
      description: "Basic description",
      systemPrompt: "Test system prompt",
    };

    const result = mapSingleRoleUIToPersistence(uiRole);

    expect(result.systemPrompt).toBe("Test system prompt"); // systemPrompt is now required
  });

  it("should enforce field length constraints", () => {
    const uiRole: RoleViewModel = {
      id: "role-long",
      name: "X".repeat(150), // Exceeds max 100
      description: "Y".repeat(600), // Exceeds max 500
      systemPrompt: "Z".repeat(6000), // Exceeds max 5000
    };

    const result = mapSingleRoleUIToPersistence(uiRole);

    expect(result.name).toBe("X".repeat(100));
    expect(result.description).toBe("Y".repeat(500));
    expect(result.systemPrompt).toBe("Z".repeat(5000));
  });
});
