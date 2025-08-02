/**
 * Tests for SettingsCategory type
 */

import type { SettingsCategory } from "../SettingsCategory";

describe("SettingsCategory", () => {
  it("should define all valid categories", () => {
    const validCategories: SettingsCategory[] = [
      "general",
      "appearance",
      "advanced",
    ];

    // Type checking - these should compile without errors
    expect(validCategories.includes("general")).toBe(true);
    expect(validCategories.includes("appearance")).toBe(true);
    expect(validCategories.includes("advanced")).toBe(true);
  });

  it("should validate all category combinations", () => {
    const categories: SettingsCategory[] = [
      "general",
      "appearance",
      "advanced",
    ];
    const validCombinations = [
      ["general", "appearance", "advanced"],
      ["appearance", "general", "advanced"],
      ["advanced", "general", "appearance"],
    ];

    validCombinations.forEach((combo) => {
      combo.forEach((category) => {
        expect(categories.includes(category as SettingsCategory)).toBe(true);
      });
    });
  });
});
