import { truncateDescription } from "../truncateDescription";

describe("truncateDescription", () => {
  it("returns original text when under max length", () => {
    const shortText = "Short description";
    expect(truncateDescription(shortText)).toBe(shortText);
  });

  it("truncates at word boundaries when possible", () => {
    const longText =
      "This is a very long description that needs to be truncated at a reasonable word boundary for better readability and user experience";
    const result = truncateDescription(longText, 50);

    expect(result).toContain("...");
    expect(result.length).toBeLessThan(longText.length);

    // The result should be a reasonable truncation that doesn't cut words awkwardly
    // Since we're looking for word boundaries within 80% of the limit, it should find one
    expect(result.length).toBeLessThanOrEqual(53); // 50 + "..."

    // Verify the truncated text makes sense (contains complete words)
    const withoutEllipsis = result.replace("...", "").trim();
    expect(withoutEllipsis).toMatch(
      /^This is a very long description that needs to be$/,
    );
  });

  it("uses character limit when no good word boundary exists", () => {
    const longText =
      "Averylongwordwithoutspacesorbreaksthatcannotbetruncatedatwordboundariessoit";
    const result = truncateDescription(longText, 50);

    expect(result).toContain("...");
    expect(result.length).toBeLessThanOrEqual(53); // 50 + "..."
  });

  it("uses custom max length", () => {
    const text =
      "This is a description that should be truncated at a custom length";
    const result = truncateDescription(text, 30);

    expect(result).toContain("...");
    expect(result.length).toBeLessThanOrEqual(33); // 30 + "..."
  });

  it("handles empty strings", () => {
    expect(truncateDescription("")).toBe("");
  });

  it("handles whitespace-only strings", () => {
    expect(truncateDescription("   ", 10)).toBe("   ");
  });

  it("trims whitespace before adding ellipsis", () => {
    const text = "This is a long description with trailing spaces    ";
    const result = truncateDescription(text, 20);

    expect(result).not.toMatch(/\s+\.\.\./); // No spaces before ellipsis
  });

  it("uses default max length of 100 when not specified", () => {
    const text = "A".repeat(120); // 120 characters
    const result = truncateDescription(text);

    expect(result).toContain("...");
    expect(result.length).toBeLessThanOrEqual(103); // 100 + "..."
  });

  it("handles text exactly at max length", () => {
    const text = "A".repeat(100); // Exactly 100 characters
    const result = truncateDescription(text, 100);

    expect(result).toBe(text);
    expect(result).not.toContain("...");
  });

  it("finds word boundary within 80% of max length", () => {
    const text =
      "This is a test description with multiple words that should be truncated cleanly";
    const result = truncateDescription(text, 50);

    // Should find a space within 80% of 50 chars (40 chars) and break there
    expect(result).toContain("...");
    const lastSpaceIndex = result.lastIndexOf(" ");
    expect(lastSpaceIndex).toBeGreaterThan(0); // Should have found a space to break at
  });

  it("falls back to character limit when word boundary is too early", () => {
    const text =
      "Word then_a_very_long_word_without_spaces_that_goes_beyond_the_eighty_percent_threshold";
    const result = truncateDescription(text, 50);

    expect(result).toContain("...");
    // Should use character limit since the only space is very early (before 80% threshold)
  });
});
