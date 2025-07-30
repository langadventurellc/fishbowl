/**
 * Tests for getRolesByCategory utility function
 */

import { getRolesByCategory } from "../getRolesByCategory";

describe("getRolesByCategory", () => {
  it("should return all roles when no category specified", () => {
    const roles = getRolesByCategory();
    expect(roles).toHaveLength(10);
  });

  it("should filter roles by category", () => {
    const creativeRoles = getRolesByCategory("creative");
    expect(creativeRoles).toHaveLength(2);
    expect(creativeRoles.every((role) => role.category === "creative")).toBe(
      true,
    );
  });

  it("should return empty array for non-existent category", () => {
    const roles = getRolesByCategory("non-existent");
    expect(roles).toHaveLength(0);
  });

  it("should return immutable copy of roles array", () => {
    const roles1 = getRolesByCategory();
    const roles2 = getRolesByCategory();
    expect(roles1).not.toBe(roles2);
    expect(roles1).toEqual(roles2);
  });
});
