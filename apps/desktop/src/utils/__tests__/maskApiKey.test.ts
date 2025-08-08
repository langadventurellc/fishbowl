import { maskApiKey, isMaskedApiKey } from "../maskApiKey";

describe("maskApiKey", () => {
  it("should mask API keys with first 3 and last 3 characters", () => {
    const apiKey = "sk-1234567890abcdef1234567890abcdef";
    const masked = maskApiKey(apiKey);
    expect(masked).toBe("sk-...def");
  });

  it("should return dots for short API keys", () => {
    const shortKey = "abc";
    const masked = maskApiKey(shortKey);
    expect(masked).toBe("••••••••");
  });

  it("should return dots for empty API keys", () => {
    const emptyKey = "";
    const masked = maskApiKey(emptyKey);
    expect(masked).toBe("••••••••");
  });

  it("should handle exactly 6 character keys", () => {
    const sixCharKey = "abcdef";
    const masked = maskApiKey(sixCharKey);
    expect(masked).toBe("abc...def");
  });
});

describe("isMaskedApiKey", () => {
  it("should identify masked API keys", () => {
    expect(isMaskedApiKey("sk-...def")).toBe(true);
    expect(isMaskedApiKey("abc...xyz")).toBe(true);
  });

  it("should identify dot patterns as masked", () => {
    expect(isMaskedApiKey("••••••••")).toBe(true);
    expect(isMaskedApiKey("••••")).toBe(true);
  });

  it("should not identify regular API keys as masked", () => {
    expect(isMaskedApiKey("sk-1234567890abcdef1234567890abcdef")).toBe(false);
    expect(isMaskedApiKey("regular-string")).toBe(false);
    expect(isMaskedApiKey("abc..def")).toBe(false); // Wrong pattern
    expect(isMaskedApiKey("ab...def")).toBe(false); // Wrong pattern
  });

  it("should handle empty strings", () => {
    expect(isMaskedApiKey("")).toBe(false);
  });
});
