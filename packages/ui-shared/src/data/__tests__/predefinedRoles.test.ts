/**
 * Tests for predefined roles data
 */

import { PREDEFINED_ROLES, PREDEFINED_ROLES_MAP } from "../predefinedRoles";
import { ROLE_VALIDATION } from "@fishbowl-ai/shared";

describe("Predefined Roles Data", () => {
  describe("PREDEFINED_ROLES", () => {
    it("should contain exactly 10 roles from product specification", () => {
      expect(PREDEFINED_ROLES).toHaveLength(10);
    });

    it("should have all required fields for each role", () => {
      PREDEFINED_ROLES.forEach((role) => {
        expect(role).toHaveProperty("id");
        expect(role).toHaveProperty("name");
        expect(role).toHaveProperty("description");
        expect(typeof role.id).toBe("string");
        expect(typeof role.name).toBe("string");
        expect(typeof role.description).toBe("string");
      });
    });

    it("should have unique role IDs", () => {
      const ids = PREDEFINED_ROLES.map((role) => role.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique role names", () => {
      const names = PREDEFINED_ROLES.map((role) => role.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("should have descriptions within length limits", () => {
      PREDEFINED_ROLES.forEach((role) => {
        expect(role.description.length).toBeGreaterThanOrEqual(
          ROLE_VALIDATION.MIN_DESCRIPTION_LENGTH,
        );
        expect(role.description.length).toBeLessThanOrEqual(
          ROLE_VALIDATION.MAX_DESCRIPTION_LENGTH,
        );
      });
    });

    it("should include all roles from product specification", () => {
      const expectedRoleIds = [
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

      const actualRoleIds = PREDEFINED_ROLES.map((role) => role.id);
      expect(actualRoleIds.sort()).toEqual(expectedRoleIds.sort());
    });
  });

  describe("PREDEFINED_ROLES_MAP", () => {
    it("should contain all roles keyed by ID", () => {
      expect(Object.keys(PREDEFINED_ROLES_MAP)).toHaveLength(10);

      PREDEFINED_ROLES.forEach((role) => {
        expect(PREDEFINED_ROLES_MAP[role.id]).toEqual(role);
      });
    });
  });
});
