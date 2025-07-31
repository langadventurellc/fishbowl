/**
 * Tests for isValidPredefinedRole utility function
 */

import { isValidPredefinedRole } from "../isValidPredefinedRole";

describe("isValidPredefinedRole", () => {
  it("should return true for valid role objects", () => {
    const validRole = {
      id: "test-role",
      name: "Test Role",
      description: "Test description",
      icon: "🧪",
      category: "test",
    };
    expect(isValidPredefinedRole(validRole)).toBe(true);
  });

  it("should return true for role without category", () => {
    const validRole = {
      id: "test-role",
      name: "Test Role",
      description: "Test description",
      icon: "🧪",
    };
    expect(isValidPredefinedRole(validRole)).toBe(true);
  });

  it("should return false for invalid objects", () => {
    expect(isValidPredefinedRole(null)).toBe(false);
    expect(isValidPredefinedRole(undefined)).toBe(false);
    expect(isValidPredefinedRole({})).toBe(false);
    expect(isValidPredefinedRole({ id: "test" })).toBe(false);
    expect(isValidPredefinedRole({ id: 123 })).toBe(false);
  });
});
