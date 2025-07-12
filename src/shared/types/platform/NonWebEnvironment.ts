/**
 * Non-Web Environment Type Definition
 *
 * Type representing a non-Web runtime environment context.
 * Used for TypeScript type narrowing in conditional code blocks.
 */

/**
 * Type representing a non-Web runtime environment context
 */
export interface NonWebEnvironment {
  readonly platform: 'electron' | 'capacitor' | 'unknown';
  readonly isBrowser: false;
  readonly hasDOM: boolean;
}
