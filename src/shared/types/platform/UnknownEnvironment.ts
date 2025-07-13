/**
 * Unknown Environment Type Definition
 *
 * Type representing an unknown runtime environment context.
 * Used for TypeScript type narrowing when platform detection fails.
 */

/**
 * Type representing an unknown runtime environment context
 */
export interface UnknownEnvironment {
  readonly platform: 'unknown';
  readonly isKnown: false;
}
