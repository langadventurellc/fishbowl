/**
 * Form data type for API keys settings
 *
 * @module types/settings/ApiKeysFormData
 */

import { z } from "zod";
import { createApiKeysFormSchema } from "../../schemas";

export type ApiKeysFormData = z.infer<
  ReturnType<typeof createApiKeysFormSchema>
>;
