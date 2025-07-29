/**
 * Tests for getRoleCategories utility function
 */

import { getRoleCategories } from "../getRoleCategories";

describe("getRoleCategories", () => {
  it("should return all unique categories in sorted order", () => {
    const categories = getRoleCategories();
    expect(categories).toEqual([
      "analytical",
      "creative",
      "general",
      "management",
      "strategic",
      "supportive",
      "technical",
    ]);
  });
});
