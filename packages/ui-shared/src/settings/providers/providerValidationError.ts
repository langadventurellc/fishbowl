import { z } from "zod";
import type { ProviderFormData } from "./providerFormData";

/**
 * Provider validation error type for form error handling.
 */
export type ProviderValidationError = z.ZodError<ProviderFormData>;
