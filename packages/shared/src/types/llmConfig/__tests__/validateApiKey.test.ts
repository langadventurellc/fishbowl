import type { Provider } from "../Provider";
import { validateApiKey } from "../validateApiKey";

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

  describe("Invalid provider", () => {
    it("returns false for unknown providers", () => {
      expect(validateApiKey("any-key", "unknown" as Provider)).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("handles empty strings", () => {
      expect(validateApiKey("", "openai")).toBe(false);
      expect(validateApiKey("", "anthropic")).toBe(false);
    });
  });
});
