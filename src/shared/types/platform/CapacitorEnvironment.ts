/**
 * Capacitor Environment Type Definition
 *
 * Type representing a Capacitor runtime environment context.
 * Used for TypeScript type narrowing in Capacitor-specific code blocks.
 */

/**
 * Type representing a Capacitor runtime environment context
 */
export interface CapacitorEnvironment {
  readonly platform: 'capacitor';
  readonly capacitorAPI: unknown;
  readonly isMobile: true;
  readonly isNative: true;
}
