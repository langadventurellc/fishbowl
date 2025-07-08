/**
 * React hooks for IPC communication with the main process
 */

import { useEffect, useCallback, useState } from 'react';
import type { SystemInfo, ConfigKey, ConfigValue } from '../../shared/types';

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Custom hook for window controls
const useWindowControls = () => {
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

  return { minimize, maximize, close };
};

// Custom hook for system information
const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemInfo = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const info = await window.electronAPI.getSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSystemInfo();
  }, [fetchSystemInfo]);

  return { systemInfo, loading, error, refetch: fetchSystemInfo };
};

// Custom hook for configuration management
const useConfig = <K extends ConfigKey>(key: K) => {
  const [value, setValue] = useState<ConfigValue[K] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const configValue = await window.electronAPI.getConfig(key);
      setValue(configValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch config');
    } finally {
      setLoading(false);
    }
  }, [key]);

  const updateConfig = useCallback(
    async (newValue: ConfigValue[K]) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return;
      }

      try {
        setError(null);
        await window.electronAPI.setConfig(key, newValue);
        setValue(newValue);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update config');
      }
    },
    [key],
  );

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  return { value, loading, error, updateConfig, refetch: fetchConfig };
};

// Custom hook for theme management
const useElectronTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const currentTheme = await window.electronAPI.getTheme();
      setTheme(currentTheme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch theme');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTheme = useCallback(async (newTheme: 'light' | 'dark' | 'system') => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return;
    }

    try {
      setError(null);
      await window.electronAPI.setTheme(newTheme);
      setTheme(newTheme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme');
    }
  }, []);

  useEffect(() => {
    void fetchTheme();
  }, [fetchTheme]);

  // Listen for theme changes from main process
  useEffect(() => {
    if (!isElectronAPIAvailable()) return;

    return window.electronAPI.onThemeChange(newTheme => {
      setTheme(newTheme);
    });
  }, []);

  return { theme, loading, error, updateTheme, refetch: fetchTheme };
};

// Custom hook for window events
const useWindowEvents = () => {
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

// Custom hook for window resize events
const useWindowResize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!isElectronAPIAvailable()) return;

    return window.electronAPI.onWindowResize(size => {
      setWindowSize(size);
    });
  }, []);

  return windowSize;
};

// Custom hook for application version
const useAppVersion = () => {
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersion = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const appVersion = await window.electronAPI.getVersion();
      setVersion(appVersion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch version');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVersion();
  }, [fetchVersion]);

  return { version, loading, error, refetch: fetchVersion };
};

// Custom hook for development tools
const useDevTools = () => {
  const [isDev, setIsDev] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevStatus = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const devStatus = await window.electronAPI.isDev();
      setIsDev(devStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dev status');
    } finally {
      setLoading(false);
    }
  }, []);

  const openDevTools = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return;
    }

    try {
      setError(null);
      await window.electronAPI.openDevTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open dev tools');
    }
  }, []);

  const closeDevTools = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return;
    }

    try {
      setError(null);
      await window.electronAPI.closeDevTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close dev tools');
    }
  }, []);

  useEffect(() => {
    void fetchDevStatus();
  }, [fetchDevStatus]);

  return { isDev, loading, error, openDevTools, closeDevTools, refetch: fetchDevStatus };
};

// Custom hook for platform information
const usePlatformInfo = () => {
  const [platformInfo, setPlatformInfo] = useState({
    platform: '' as NodeJS.Platform,
    arch: '',
    version: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatformInfo = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [platform, arch, version] = await Promise.all([
        window.electronAPI.platform(),
        window.electronAPI.arch(),
        window.electronAPI.version(),
      ]);
      setPlatformInfo({ platform, arch, version });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch platform info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlatformInfo();
  }, [fetchPlatformInfo]);

  return { platformInfo, loading, error, refetch: fetchPlatformInfo };
};

// Custom hook for IPC error handling
const useIpcErrorHandler = () => {
  const [errors, setErrors] = useState<Array<{ id: string; message: string; timestamp: number }>>(
    [],
  );

  const addError = useCallback((message: string) => {
    const error = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      timestamp: Date.now(),
    };
    setErrors(prev => [...prev, error]);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return { errors, addError, removeError, clearErrors };
};

export {
  useWindowControls,
  useSystemInfo,
  useConfig,
  useElectronTheme,
  useWindowEvents,
  useWindowResize,
  useAppVersion,
  useDevTools,
  usePlatformInfo,
  useIpcErrorHandler,
};
