/**
 * React hook for window events
 */
import { useEffect, useState } from 'react';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const useWindowEvents = () => {
  const [windowState, setWindowState] = useState({
    focused: true,
    maximized: false,
    minimized: false,
    fullscreen: false,
  });

  useEffect(() => {
    if (!isElectronAPIAvailable()) return;

    const cleanupFocus = window.electronAPI.onWindowFocus(() => {
      setWindowState(prev => ({ ...prev, focused: true }));
    });

    const cleanupBlur = window.electronAPI.onWindowBlur(() => {
      setWindowState(prev => ({ ...prev, focused: false }));
    });

    const cleanupMaximize = window.electronAPI.onWindowMaximize(() => {
      setWindowState(prev => ({ ...prev, maximized: true }));
    });

    const cleanupUnmaximize = window.electronAPI.onWindowUnmaximize(() => {
      setWindowState(prev => ({ ...prev, maximized: false }));
    });

    const cleanupMinimize = window.electronAPI.onWindowMinimize(() => {
      setWindowState(prev => ({ ...prev, minimized: true }));
    });

    const cleanupRestore = window.electronAPI.onWindowRestore(() => {
      setWindowState(prev => ({ ...prev, minimized: false }));
    });

    return () => {
      cleanupFocus();
      cleanupBlur();
      cleanupMaximize();
      cleanupUnmaximize();
      cleanupMinimize();
      cleanupRestore();
    };
  }, []);

  return windowState;
};
