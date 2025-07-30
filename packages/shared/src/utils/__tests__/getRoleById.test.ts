/**
 * Tests for getRoleById utility function
 */

import { getRoleById } from "../getRoleById";

describe("getRoleById", () => {
  it("should return role for valid ID", () => {
    const role = getRoleById("project-manager");
    expect(role).toBeDefined();
    expect(role?.name).toBe("Project Manager");
  });

  it("should return undefined for invalid ID", () => {
    const role = getRoleById("non-existent-role");
    expect(role).toBeUndefined();
  });

  it("should handle empty string ID", () => {
    const role = getRoleById("");
    expect(role).toBeUndefined();
  });
});
