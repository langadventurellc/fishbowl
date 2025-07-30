/**
 * Create comprehensive validation schema for all API key providers
 *
 * @module schemas/createApiKeysFormSchema
 */

import { z } from "zod";
import { PROVIDERS, createProviderFormSchema } from "../settings/providers";

export const createApiKeysFormSchema = () => {
  const providerSchemas = Object.values(PROVIDERS).reduce(
    (acc, provider) => {
      acc[provider.id] = createProviderFormSchema(provider);
      return acc;
    },
    {} as Record<string, z.ZodSchema>,
  );

  return z.object(providerSchemas);
};
