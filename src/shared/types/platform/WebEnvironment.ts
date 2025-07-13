/**
 * Web Environment Type Definition
 *
 * Type representing a Web browser runtime environment context.
 * Used for TypeScript type narrowing in Web-specific code blocks.
 */

/**
 * Type representing a Web browser runtime environment context
 */
export interface WebEnvironment {
  readonly platform: 'web';
  readonly navigator: unknown;
  readonly isBrowser: true;
  readonly hasDOM: true;
}
