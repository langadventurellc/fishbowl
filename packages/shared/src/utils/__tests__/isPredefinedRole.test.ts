/**
 * Tests for isPredefinedRole utility function
 */

import { isPredefinedRole } from "../isPredefinedRole";

describe("isPredefinedRole", () => {
  it("should return true for valid predefined role IDs", () => {
    expect(isPredefinedRole("project-manager")).toBe(true);
    expect(isPredefinedRole("technical-advisor")).toBe(true);
  });

  it("should return false for invalid role IDs", () => {
    expect(isPredefinedRole("custom-role")).toBe(false);
    expect(isPredefinedRole("")).toBe(false);
    expect(isPredefinedRole("non-existent")).toBe(false);
  });
});
