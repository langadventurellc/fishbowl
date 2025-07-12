/**
 * React hook for window resize events
 */
import { useEffect, useState } from 'react';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const useWindowResize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!isElectronAPIAvailable()) return;

    return window.electronAPI.onWindowResize((size: { width: number; height: number }) => {
      setWindowSize(size);
    });
  }, []);

  return windowSize;
};
