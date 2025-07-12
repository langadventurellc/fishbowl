/**
 * Type guard to check if electronAPI is available
 */
export const isElectronAPIAvailable = (): boolean => {
  try {
    if (typeof globalThis === 'undefined') {
      return false;
    }

    const globalWindow = (globalThis as Record<string, unknown>).window;
    if (typeof globalWindow !== 'object' || globalWindow === null) {
      return false;
    }

    return (
      'electronAPI' in globalWindow &&
      (globalWindow as Record<string, unknown>).electronAPI !== undefined
    );
  } catch {
    return false;
  }
};
