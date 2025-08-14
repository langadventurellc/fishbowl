/**
 * Tests for sample roles data constants
 */

import { SAMPLE_ROLES } from "../sampleRoles";
import { roleSchema } from "../../schemas/roleSchema";

describe("SAMPLE_ROLES", () => {
  it("should contain exactly 10 roles", () => {
    expect(SAMPLE_ROLES).toHaveLength(10);
  });

  it("should have all required CustomRoleViewModel fields", () => {
    SAMPLE_ROLES.forEach((role) => {
      expect(role).toHaveProperty("id");
      expect(role).toHaveProperty("name");
      expect(role).toHaveProperty("description");
      expect(role).toHaveProperty("createdAt");
      expect(role).toHaveProperty("updatedAt");
    });
  });

  it("should have unique IDs for all roles", () => {
    const ids = SAMPLE_ROLES.map((role) => role.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have non-empty names and descriptions", () => {
    SAMPLE_ROLES.forEach((role) => {
      expect(role.name.trim()).not.toBe("");
      expect(role.description.trim()).not.toBe("");
    });
  });

  it("should pass roleSchema validation for name, description, and systemPrompt", () => {
    SAMPLE_ROLES.forEach((role) => {
      const result = roleSchema.safeParse({
        name: role.name,
        description: role.description,
        systemPrompt: role.systemPrompt,
      });
      expect(result.success).toBe(true);
    });
  });

  it("should use consistent mock timestamps", () => {
    const expectedTimestamp = "2025-01-01T12:00:00.000Z";
    SAMPLE_ROLES.forEach((role) => {
      expect(role.createdAt).toBe(expectedTimestamp);
      expect(role.updatedAt).toBe(expectedTimestamp);
    });
  });

  it("should include all expected role templates", () => {
    const expectedIds = [
      "project-manager",
      "technical-advisor",
      "creative-director",
      "storyteller",
      "analyst",
      "coach",
      "critic",
      "business-strategist",
      "financial-advisor",
      "generalist",
    ];
    const actualIds = SAMPLE_ROLES.map((role) => role.id);
    expect(actualIds).toEqual(expectedIds);
  });
});
