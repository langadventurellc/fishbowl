import { z } from "zod";
import type { ProviderConfig } from "./providerConfig";

/**
 * Custom Zod validator for HTTPS URLs with detailed error messages.
 * Ensures all API endpoints use secure connections.
 */
const httpsUrlSchema = z
  .string()
  .min(1, "URL is required")
  .url("Must be a valid URL")
  .refine(
    (url) => url.startsWith("https://"),
    "URL must use HTTPS for security",
  )
  .refine((url) => {
    try {
      const parsed = new globalThis.URL(url);
      return parsed.hostname.length > 0;
    } catch {
      return false;
    }
  }, "URL must have a valid hostname");

/**
 * API Key validation schema with provider-specific rules.
 * Validates against the provider's specific requirements.
 */
const createApiKeySchema = (provider: ProviderConfig) =>
  z
    .string()
    .min(1, "API key is required")
    .min(
      provider.apiKeyValidation.minLength,
      `API key must be at least ${provider.apiKeyValidation.minLength} characters`,
    )
    .refine(
      (key) =>
        !provider.apiKeyValidation.pattern ||
        provider.apiKeyValidation.pattern.test(key),
      `Invalid ${provider.name} API key format`,
    );

/**
 * Provider form data validation schema.
 * Validates complete provider configuration including API key and base URL.
 */
export const createProviderFormSchema = (provider: ProviderConfig) =>
  z
    .object({
      apiKey: createApiKeySchema(provider),
      baseUrl: httpsUrlSchema,
      providerId: z.literal(provider.id),
    })
    .superRefine((data, ctx) => {
      // Ensure base URL is not empty or just whitespace
      if (!data.baseUrl.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Base URL cannot be empty",
          path: ["baseUrl"],
        });
      }

      // Validate API key is not just whitespace
      if (!data.apiKey.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "API key cannot be empty",
          path: ["apiKey"],
        });
      }
    });
