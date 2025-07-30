/**
 * Form data type for API keys settings
 *
 * @module types/ui/settings/ApiKeysFormData
 */

import { z } from "zod";
import { createApiKeysFormSchema } from "../../../schemas";

export type ApiKeysFormData = z.infer<
  ReturnType<typeof createApiKeysFormSchema>
>;
