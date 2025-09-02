import type { Provider } from "../../../types/llmConfig/Provider";
import type { LlmProvider } from "../interfaces/LlmProvider";
import { OpenAIProvider } from "../providers/OpenAIProvider";
import { AnthropicProvider } from "../providers/AnthropicProvider";

/**
 * Creates a production LLM provider instance based on the provider type.
 *
 * @param provider - The provider type ("openai" | "anthropic")
 * @returns A new instance of the specified provider
 * @throws Error when the provider type is not supported
 */
export function createProvider(provider: Provider): LlmProvider {
  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    case "anthropic":
      return new AnthropicProvider();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
