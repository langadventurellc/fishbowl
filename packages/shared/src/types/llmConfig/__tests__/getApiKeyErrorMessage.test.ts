import { getApiKeyErrorMessage } from "../getApiKeyErrorMessage";
import type { Provider } from "../Provider";

describe("getApiKeyErrorMessage", () => {
  it("returns correct error message for OpenAI", () => {
    const message = getApiKeyErrorMessage("openai");
    expect(message).toBe(
      "OpenAI API key must start with 'sk-' and be longer than 40 characters",
    );
  });

  it("returns correct error message for Anthropic", () => {
    const message = getApiKeyErrorMessage("anthropic");
    expect(message).toBe(
      "Anthropic API key must start with 'sk-ant-' and be longer than 50 characters",
    );
  });

  it("returns correct error message for Google", () => {
    const message = getApiKeyErrorMessage("google");
    expect(message).toBe(
      "Google API key must be a valid format (39 characters starting with 'AIza')",
    );
  });

  it("returns correct error message for custom provider", () => {
    const message = getApiKeyErrorMessage("custom");
    expect(message).toBe("API key is required");
  });

  it("returns default error message for unknown provider", () => {
    const message = getApiKeyErrorMessage("unknown" as Provider);
    expect(message).toBe("Invalid API key format for the selected provider");
  });
});
