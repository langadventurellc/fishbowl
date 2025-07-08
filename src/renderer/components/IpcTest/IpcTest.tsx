/**
 * IPC Test Component
 * Tests all IPC communication functionality and security
 */

import React, { useEffect, useState } from 'react';
import {
  useAppVersion,
  useConfig,
  useDevTools,
  useElectronTheme,
  useIpcErrorHandler,
  usePlatformInfo,
  useSystemInfo,
  useWindowControls,
  useWindowEvents,
  useWindowResize,
} from '../../hooks';
import { Button } from '../UI/Button';
import styles from './IpcTest.module.css';

const IpcTest: React.FC = () => {
  const [testResults, setTestResults] = useState<
    Array<{ name: string; status: 'pass' | 'fail' | 'pending'; message: string }>
  >([]);
  const [isRunning, setIsRunning] = useState(false);

  // IPC hooks
  const { minimize, maximize } = useWindowControls();
  const { systemInfo, loading: systemLoading, error: systemError } = useSystemInfo();
  const { value: themeConfig, updateConfig: updateThemeConfig } = useConfig('theme');
  const { theme, updateTheme } = useElectronTheme();
  const windowState = useWindowEvents();
  const windowSize = useWindowResize();
  const { version } = useAppVersion();
  const { isDev, openDevTools, closeDevTools } = useDevTools();
  const { platformInfo } = usePlatformInfo();
  const { errors, clearErrors } = useIpcErrorHandler();

  // Helper to handle async button click
  const handleRunTests = () => {
    void runTests();
  };

  // Individual test functions
  const testWindowControls = async (): Promise<{
    name: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  }> => {
    try {
      await minimize();
      await new Promise(resolve => setTimeout(resolve, 100));
      await maximize();
      return {
        name: 'Window Controls',
        status: 'pass',
        message: 'Minimize and maximize work',
      };
    } catch (error) {
      return {
        name: 'Window Controls',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testSystemInfo = (): {
    name: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  } => {
    try {
      if (systemInfo) {
        return {
          name: 'System Info',
          status: 'pass',
          message: `Platform: ${systemInfo.platform}, Arch: ${systemInfo.arch}`,
        };
      } else if (systemError) {
        return { name: 'System Info', status: 'fail', message: systemError };
      } else {
        return { name: 'System Info', status: 'pending', message: 'Loading...' };
      }
    } catch (error) {
      return {
        name: 'System Info',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testConfiguration = async (): Promise<{
    name: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  }> => {
    try {
      if (themeConfig) {
        await updateThemeConfig('dark');
        await new Promise(resolve => setTimeout(resolve, 100));
        await updateThemeConfig('light');
        return {
          name: 'Configuration',
          status: 'pass',
          message: 'Theme config updated successfully',
        };
      } else {
        return {
          name: 'Configuration',
          status: 'fail',
          message: 'Theme config not available',
        };
      }
    } catch (error) {
      return {
        name: 'Configuration',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testThemeManagement = async (): Promise<{
    name: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  }> => {
    try {
      await updateTheme('dark');
      await new Promise(resolve => setTimeout(resolve, 100));
      await updateTheme('light');
      return {
        name: 'Theme Management',
        status: 'pass',
        message: 'Theme updated successfully',
      };
    } catch (error) {
      return {
        name: 'Theme Management',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testVersionInfo = (): {
    name: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  } => {
    try {
      if (version) {
        return { name: 'Version Info', status: 'pass', message: `Version: ${version}` };
      } else {
        return { name: 'Version Info', status: 'fail', message: 'Version not available' };
      }
    } catch (error) {
      return {
        name: 'Version Info',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testPlatformInfo = (): {
    name: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  } => {
    try {
      if (platformInfo.platform) {
        return {
          name: 'Platform Info',
          status: 'pass',
          message: `Platform: ${platformInfo.platform}`,
        };
      } else {
        return {
          name: 'Platform Info',
          status: 'fail',
          message: 'Platform info not available',
        };
      }
    } catch (error) {
      return {
        name: 'Platform Info',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testDevTools = async (): Promise<{
    name: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  } | null> => {
    if (!isDev) return null;

    try {
      await openDevTools();
      await new Promise(resolve => setTimeout(resolve, 500));
      await closeDevTools();
      return {
        name: 'Dev Tools',
        status: 'pass',
        message: 'Dev tools opened and closed successfully',
      };
    } catch (error) {
      return {
        name: 'Dev Tools',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const testSecurity = (): {
    name: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  } => {
    try {
      interface WindowWithPossibleNodeAccess {
        require?: unknown;
        process?: unknown;
        Buffer?: unknown;
      }

      const windowWithNodeAccess = window as WindowWithPossibleNodeAccess;
      const hasNodeAccess =
        typeof windowWithNodeAccess.require !== 'undefined' ||
        typeof windowWithNodeAccess.process !== 'undefined' ||
        typeof windowWithNodeAccess.Buffer !== 'undefined';

      if (hasNodeAccess) {
        return {
          name: 'Security Test',
          status: 'fail',
          message: 'Node.js APIs are exposed to renderer',
        };
      } else {
        return {
          name: 'Security Test',
          status: 'pass',
          message: 'Node.js APIs are properly isolated',
        };
      }
    } catch (error) {
      return {
        name: 'Security Test',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  // Main test runner
  const runTests = async () => {
    setIsRunning(true);
    clearErrors();

    const results: Array<{ name: string; status: 'pass' | 'fail' | 'pending'; message: string }> =
      [];

    const asyncResults = (
      await Promise.all([
        testWindowControls(),
        testConfiguration(),
        testThemeManagement(),
        testDevTools(),
      ])
    ).filter(
      (result): result is { name: string; status: 'pass' | 'fail' | 'pending'; message: string } =>
        result !== null,
    );

    const syncResults = [testSystemInfo(), testVersionInfo(), testPlatformInfo(), testSecurity()];

    results.push(...asyncResults, ...syncResults);

    setTestResults(results);
    setIsRunning(false);
  };

  // Test window event listeners
  useEffect(() => {
    // Window state changed - for debugging only
    // eslint-disable-next-line no-console
    console.log('Window state changed:', windowState);
  }, [windowState]);

  useEffect(() => {
    if (windowSize.width > 0) {
      // Window resized - for debugging only
      // eslint-disable-next-line no-console
      console.log('Window resized:', windowSize);
    }
  }, [windowSize]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>IPC Communication Test</h2>
        <p>Test all IPC functionality and security measures</p>
      </div>

      <div className={styles.controls}>
        <Button onClick={handleRunTests} disabled={isRunning} variant='primary'>
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
        <Button onClick={clearErrors} variant='secondary'>
          Clear Errors
        </Button>
      </div>

      <div className={styles.results}>
        <h3>Test Results</h3>
        {testResults.length === 0 ? (
          <p>No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div className={styles.testList}>
            {testResults.map(result => (
              <div
                key={`test-${result.name}`}
                className={`${styles.testItem} ${styles[result.status]}`}
              >
                <div className={styles.testName}>{result.name}</div>
                <div className={styles.testStatus}>{result.status.toUpperCase()}</div>
                <div className={styles.testMessage}>{result.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.systemInfo}>
        <h3>System Information</h3>
        {systemLoading ? (
          <p>Loading system information...</p>
        ) : systemError ? (
          <p className={styles.error}>Error: {systemError}</p>
        ) : systemInfo ? (
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <strong>Platform:</strong> {systemInfo.platform}
            </div>
            <div className={styles.infoItem}>
              <strong>Architecture:</strong> {systemInfo.arch}
            </div>
            <div className={styles.infoItem}>
              <strong>OS Version:</strong> {systemInfo.version}
            </div>
            <div className={styles.infoItem}>
              <strong>App Version:</strong> {systemInfo.appVersion}
            </div>
            <div className={styles.infoItem}>
              <strong>Electron Version:</strong> {systemInfo.electronVersion}
            </div>
            <div className={styles.infoItem}>
              <strong>Chrome Version:</strong> {systemInfo.chromeVersion}
            </div>
            <div className={styles.infoItem}>
              <strong>Node Version:</strong> {systemInfo.nodeVersion}
            </div>
            <div className={styles.infoItem}>
              <strong>Memory Used:</strong> {Math.round(systemInfo.memory.used / 1024 / 1024)} MB
            </div>
            <div className={styles.infoItem}>
              <strong>Memory Total:</strong> {Math.round(systemInfo.memory.total / 1024 / 1024)} MB
            </div>
          </div>
        ) : (
          <p>No system information available</p>
        )}
      </div>

      <div className={styles.windowInfo}>
        <h3>Window Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Focused:</strong> {windowState.focused ? 'Yes' : 'No'}
          </div>
          <div className={styles.infoItem}>
            <strong>Maximized:</strong> {windowState.maximized ? 'Yes' : 'No'}
          </div>
          <div className={styles.infoItem}>
            <strong>Minimized:</strong> {windowState.minimized ? 'Yes' : 'No'}
          </div>
          <div className={styles.infoItem}>
            <strong>Fullscreen:</strong> {windowState.fullscreen ? 'Yes' : 'No'}
          </div>
          <div className={styles.infoItem}>
            <strong>Size:</strong> {windowSize.width} × {windowSize.height}
          </div>
        </div>
      </div>

      <div className={styles.themeInfo}>
        <h3>Theme Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Current Theme:</strong> {theme}
          </div>
          <div className={styles.infoItem}>
            <strong>Config Theme:</strong> {themeConfig ?? 'Loading...'}
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className={styles.errors}>
          <h3>IPC Errors</h3>
          {errors.map(error => (
            <div key={error.id} className={styles.errorItem}>
              <span className={styles.errorMessage}>{error.message}</span>
              <span className={styles.errorTime}>
                {new Date(error.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IpcTest;
