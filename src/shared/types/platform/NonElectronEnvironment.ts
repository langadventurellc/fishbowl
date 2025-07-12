/**
 * Non-Electron Environment Type Definition
 *
 * Type representing a non-Electron runtime environment context.
 * Used for TypeScript type narrowing in conditional code blocks.
 */

/**
 * Type representing a non-Electron runtime environment context
 */
export interface NonElectronEnvironment {
  readonly platform: 'capacitor' | 'web' | 'unknown';
  readonly isDesktop: false;
}
