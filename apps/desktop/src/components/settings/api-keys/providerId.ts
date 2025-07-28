import { PROVIDERS } from "./providersConfig";

/**
 * Available provider IDs as a union type for type safety.
 */
export type ProviderId = keyof typeof PROVIDERS;
