/**
 * Non-Capacitor Environment Type Definition
 *
 * Type representing a non-Capacitor runtime environment context.
 * Used for TypeScript type narrowing in conditional code blocks.
 */

/**
 * Type representing a non-Capacitor runtime environment context
 */
export interface NonCapacitorEnvironment {
  readonly platform: 'electron' | 'web' | 'unknown';
  readonly isMobile: false;
  readonly isNative: false;
}
