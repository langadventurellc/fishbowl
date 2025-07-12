/**
 * Type guard to check if electronAPI is available
 */
export const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};
