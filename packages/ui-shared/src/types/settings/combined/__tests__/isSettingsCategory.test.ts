/**
 * Tests for isSettingsCategory type guard
 */

import { isSettingsCategory } from "../isSettingsCategory";

describe("isSettingsCategory", () => {
  it("should validate valid categories", () => {
    expect(isSettingsCategory("general")).toBe(true);
    expect(isSettingsCategory("appearance")).toBe(true);
    expect(isSettingsCategory("advanced")).toBe(true);
  });

  it("should reject invalid categories", () => {
    expect(isSettingsCategory("invalid")).toBe(false);
    expect(isSettingsCategory("")).toBe(false);
    expect(isSettingsCategory(null)).toBe(false);
    expect(isSettingsCategory(undefined)).toBe(false);
    expect(isSettingsCategory(123)).toBe(false);
    expect(isSettingsCategory({})).toBe(false);
  });

  it("should handle edge cases", () => {
    expect(isSettingsCategory("GENERAL")).toBe(false); // case sensitive
    expect(isSettingsCategory(" general ")).toBe(false); // whitespace
    expect(isSettingsCategory("general-settings")).toBe(false); // similar but invalid
  });
});
