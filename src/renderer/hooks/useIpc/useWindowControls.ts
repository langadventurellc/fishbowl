/**
 * React hook for window controls
 */
import { useCallback, useMemo } from 'react';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const useWindowControls = () => {
  const minimize = useCallback(async () => {
    if (isElectronAPIAvailable()) {
      await window.electronAPI.minimize();
    }
  }, []);

  const maximize = useCallback(async () => {
    if (isElectronAPIAvailable()) {
      await window.electronAPI.maximize();
    }
  }, []);

  const close = useCallback(async () => {
    if (isElectronAPIAvailable()) {
      await window.electronAPI.close();
    }
  }, []);

  return useMemo(() => ({ minimize, maximize, close }), [minimize, maximize, close]);
};
