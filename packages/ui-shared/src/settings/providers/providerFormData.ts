import { z } from "zod";
import { createProviderFormSchema } from "./validation";

/**
 * Type inference for provider form data based on Zod schema.
 */
export type ProviderFormData = z.infer<
  ReturnType<typeof createProviderFormSchema>
>;
