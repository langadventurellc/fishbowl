import { validateApiKey } from "../validateApiKey";
import type { Provider } from "../Provider";

describe("validateApiKey", () => {
  describe("OpenAI keys", () => {
    it("validates correct OpenAI keys", () => {
      const validKey = "sk-" + "a".repeat(38);
      expect(validateApiKey(validKey, "openai")).toBe(true);
    });

    it("rejects short OpenAI keys", () => {
      const shortKey = "sk-short";
      expect(validateApiKey(shortKey, "openai")).toBe(false);
    });

    it("rejects keys without sk- prefix", () => {
      const wrongPrefix = "wrong-" + "a".repeat(38);
      expect(validateApiKey(wrongPrefix, "openai")).toBe(false);
    });

    it("accepts keys with exactly 40 characters", () => {
      const exactLength = "sk-" + "a".repeat(37); // sk- + 37 = 40 total
      expect(validateApiKey(exactLength, "openai")).toBe(true);
    });
  });

  describe("Anthropic keys", () => {
    it("validates correct Anthropic keys", () => {
      const validKey = "sk-ant-" + "a".repeat(44);
      expect(validateApiKey(validKey, "anthropic")).toBe(true);
    });

    it("rejects short Anthropic keys", () => {
      const shortKey = "sk-ant-short";
      expect(validateApiKey(shortKey, "anthropic")).toBe(false);
    });

    it("rejects keys without sk-ant- prefix", () => {
      const wrongPrefix = "sk-" + "a".repeat(44);
      expect(validateApiKey(wrongPrefix, "anthropic")).toBe(false);
    });

    it("accepts keys with exactly 50 characters", () => {
      const exactLength = "sk-ant-" + "a".repeat(43); // sk-ant- + 43 = 50 total
      expect(validateApiKey(exactLength, "anthropic")).toBe(true);
    });
  });

  describe("Google keys", () => {
    it("validates correct Google keys with minimum length", () => {
      const validKey = "A".repeat(35); // 35 characters
      expect(validateApiKey(validKey, "google")).toBe(true);
    });

    it("validates Google keys with maximum length", () => {
      const validKey = "A".repeat(45); // 45 characters
      expect(validateApiKey(validKey, "google")).toBe(true);
    });

    it("validates Google keys with mixed case and valid characters", () => {
      const validKey = "AbC123_-eFgHiJkLmNoPqRsTuVwXyZ0123456789";
      expect(validateApiKey(validKey, "google")).toBe(true);
    });

    it("rejects keys that are too short", () => {
      const shortKey = "A".repeat(34); // 34 characters
      expect(validateApiKey(shortKey, "google")).toBe(false);
    });

    it("rejects keys that are too long", () => {
      const longKey = "A".repeat(46); // 46 characters
      expect(validateApiKey(longKey, "google")).toBe(false);
    });

    it("rejects keys with invalid characters", () => {
      const invalidChars = "A".repeat(30) + "#$%@!"; // 35 chars but with invalid symbols
      expect(validateApiKey(invalidChars, "google")).toBe(false);
    });
  });

  describe("Custom provider keys", () => {
    it("validates any non-empty key for custom providers", () => {
      expect(validateApiKey("any-key", "custom")).toBe(true);
      expect(validateApiKey("123", "custom")).toBe(true);
      expect(validateApiKey("custom-api-key-123", "custom")).toBe(true);
    });

    it("rejects empty keys for custom providers", () => {
      expect(validateApiKey("", "custom")).toBe(false);
    });
  });

  describe("Invalid provider", () => {
    it("returns false for unknown providers", () => {
      expect(validateApiKey("any-key", "unknown" as Provider)).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("handles empty strings", () => {
      expect(validateApiKey("", "openai")).toBe(false);
      expect(validateApiKey("", "anthropic")).toBe(false);
      expect(validateApiKey("", "google")).toBe(false);
      expect(validateApiKey("", "custom")).toBe(false);
    });

    it("handles whitespace", () => {
      expect(validateApiKey(" ", "custom")).toBe(true);
      expect(validateApiKey("   ", "custom")).toBe(true);
    });
  });
});
