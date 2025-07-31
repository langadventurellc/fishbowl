import { getProviderConfig } from "./getProviderConfig";
import { createProviderFormSchema } from "./validation";
import type { ProviderFormData } from "./providerFormData";
import type { ProviderValidationError } from "./providerValidationError";

/**
 * Validates provider form data against the provider's schema.
 *
 * @param providerId - The provider identifier
 * @param data - Form data to validate
 * @returns Validation result with success/error information
 */
export function validateProviderData(
  providerId: string,
  data: Partial<ProviderFormData>,
):
  | { success: true; data: ProviderFormData }
  | { success: false; error: ProviderValidationError } {
  const provider = getProviderConfig(providerId);

  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  const schema = createProviderFormSchema(provider);
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}
