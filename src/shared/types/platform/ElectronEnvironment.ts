/**
 * Electron Environment Type Definition
 *
 * Type representing an Electron runtime environment context.
 * Used for TypeScript type narrowing in Electron-specific code blocks.
 */

/**
 * Type representing an Electron runtime environment context
 */
export interface ElectronEnvironment {
  readonly platform: 'electron';
  readonly electronAPI: unknown;
  readonly isDesktop: true;
}
