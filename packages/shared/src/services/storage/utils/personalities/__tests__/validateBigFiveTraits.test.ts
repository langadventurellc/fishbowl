import {
  validateBigFiveTraits,
  validateBigFiveTrait,
  BIG_FIVE_TRAITS,
} from "../index";

describe("validateBigFiveTraits", () => {
  it("should return valid for complete valid Big Five object", () => {
    const validBigFive = {
      openness: 75,
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 90,
      neuroticism: 25,
    };

    const result = validateBigFiveTraits(validBigFive);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.errors).toBeUndefined();
  });

  it("should accept decimal values", () => {
    const validBigFive = {
      openness: 75.5,
      conscientiousness: 80.2,
      extraversion: 60.8,
      agreeableness: 90.1,
      neuroticism: 25.9,
    };

    const result = validateBigFiveTraits(validBigFive);

    expect(result.isValid).toBe(true);
  });

  it("should accept boundary values (0 and 100)", () => {
    const validBigFive = {
      openness: 0,
      conscientiousness: 100,
      extraversion: 50,
      agreeableness: 0,
      neuroticism: 100,
    };

    const result = validateBigFiveTraits(validBigFive);

    expect(result.isValid).toBe(true);
  });

  it("should return error for null input", () => {
    const result = validateBigFiveTraits(null);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Big Five traits data is required and cannot be null or undefined",
    );
  });

  it("should return error for undefined input", () => {
    const result = validateBigFiveTraits(undefined);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Big Five traits data is required and cannot be null or undefined",
    );
  });

  it("should return error for non-object input", () => {
    const result = validateBigFiveTraits("not an object");

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Big Five traits must be an object");
  });

  it("should identify missing traits", () => {
    const incompleteBigFive = {
      openness: 75,
      conscientiousness: 80,
      // missing extraversion, agreeableness, neuroticism
    };

    const result = validateBigFiveTraits(incompleteBigFive);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Big Five trait 'extraversion' is required",
    );
    expect(result.errors).toContain(
      "Big Five trait 'agreeableness' is required",
    );
    expect(result.errors).toContain("Big Five trait 'neuroticism' is required");
  });

  it("should identify all missing traits", () => {
    const emptyObject = {};

    const result = validateBigFiveTraits(emptyObject);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(5);
    BIG_FIVE_TRAITS.forEach((trait) => {
      expect(result.errors).toContain(`Big Five trait '${trait}' is required`);
    });
  });

  it("should reject negative values", () => {
    const invalidBigFive = {
      openness: -10,
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 90,
      neuroticism: 25,
    };

    const result = validateBigFiveTraits(invalidBigFive);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Big Five trait 'openness' must be between 0-100, received: -10",
    );
  });

  it("should reject values over 100", () => {
    const invalidBigFive = {
      openness: 75,
      conscientiousness: 105,
      extraversion: 60,
      agreeableness: 90,
      neuroticism: 25,
    };

    const result = validateBigFiveTraits(invalidBigFive);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Big Five trait 'conscientiousness' must be between 0-100, received: 105",
    );
  });

  it("should reject non-numeric values with specific error messages", () => {
    const invalidBigFive = {
      openness: "high",
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 90,
      neuroticism: 25,
    };

    const result = validateBigFiveTraits(invalidBigFive);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Big Five trait 'openness' must be a number, received: 'high'",
    );
  });

  it("should handle multiple validation errors", () => {
    const invalidBigFive = {
      openness: "high",
      conscientiousness: -5,
      extraversion: 110,
      // missing agreeableness and neuroticism
    };

    const result = validateBigFiveTraits(invalidBigFive);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Big Five trait 'agreeableness' is required",
    );
    expect(result.errors).toContain("Big Five trait 'neuroticism' is required");
    expect(result.errors).toContain(
      "Big Five trait 'openness' must be a number, received: 'high'",
    );
    expect(result.errors).toContain(
      "Big Five trait 'conscientiousness' must be between 0-100, received: -5",
    );
    expect(result.errors).toContain(
      "Big Five trait 'extraversion' must be between 0-100, received: 110",
    );
  });

  it("should handle NaN values", () => {
    const invalidBigFive = {
      openness: NaN,
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 90,
      neuroticism: 25,
    };

    const result = validateBigFiveTraits(invalidBigFive);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Big Five trait 'openness' must be a valid number, received: NaN",
    );
  });

  it("should handle Infinity values", () => {
    const invalidBigFive = {
      openness: Infinity,
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 90,
      neuroticism: 25,
    };

    const result = validateBigFiveTraits(invalidBigFive);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Big Five trait 'openness' must be a valid number, received: Infinity",
    );
  });

  it("should gracefully handle extra properties", () => {
    const bigFiveWithExtra = {
      openness: 75,
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 90,
      neuroticism: 25,
      extraProperty: "should be ignored",
    };

    const result = validateBigFiveTraits(bigFiveWithExtra);

    expect(result.isValid).toBe(true);
  });
});

describe("validateBigFiveTrait", () => {
  it("should return null for valid numeric values", () => {
    expect(validateBigFiveTrait("openness", 50)).toBeNull();
    expect(validateBigFiveTrait("openness", 0)).toBeNull();
    expect(validateBigFiveTrait("openness", 100)).toBeNull();
    expect(validateBigFiveTrait("openness", 75.5)).toBeNull();
  });

  it("should return error for non-numeric values", () => {
    expect(validateBigFiveTrait("openness", "high")).toBe(
      "Big Five trait 'openness' must be a number, received: 'high'",
    );
    expect(validateBigFiveTrait("openness", null)).toBe(
      "Big Five trait 'openness' must be a number, received: null",
    );
    expect(validateBigFiveTrait("openness", undefined)).toBe(
      "Big Five trait 'openness' must be a number, received: undefined",
    );
    expect(validateBigFiveTrait("openness", {})).toBe(
      "Big Five trait 'openness' must be a number, received: [object Object]",
    );
  });

  it("should return error for out-of-range values", () => {
    expect(validateBigFiveTrait("conscientiousness", -1)).toBe(
      "Big Five trait 'conscientiousness' must be between 0-100, received: -1",
    );
    expect(validateBigFiveTrait("conscientiousness", 101)).toBe(
      "Big Five trait 'conscientiousness' must be between 0-100, received: 101",
    );
  });

  it("should return error for NaN and Infinity", () => {
    expect(validateBigFiveTrait("extraversion", NaN)).toBe(
      "Big Five trait 'extraversion' must be a valid number, received: NaN",
    );
    expect(validateBigFiveTrait("extraversion", Infinity)).toBe(
      "Big Five trait 'extraversion' must be a valid number, received: Infinity",
    );
    expect(validateBigFiveTrait("extraversion", -Infinity)).toBe(
      "Big Five trait 'extraversion' must be a valid number, received: -Infinity",
    );
  });
});

describe("BIG_FIVE_TRAITS", () => {
  it("should contain all five required traits", () => {
    expect(BIG_FIVE_TRAITS).toHaveLength(5);
    expect(BIG_FIVE_TRAITS).toContain("openness");
    expect(BIG_FIVE_TRAITS).toContain("conscientiousness");
    expect(BIG_FIVE_TRAITS).toContain("extraversion");
    expect(BIG_FIVE_TRAITS).toContain("agreeableness");
    expect(BIG_FIVE_TRAITS).toContain("neuroticism");
  });

  it("should be a readonly array", () => {
    // TypeScript readonly arrays should prevent modification
    // This test ensures the type is correct
    expect(Array.isArray(BIG_FIVE_TRAITS)).toBe(true);
  });
});
