import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks';
import styles from './DevTools.module.css';

// TypeScript interface for performance memory (Chrome-specific)
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface DevToolsProps {
  isVisible?: boolean;
}

export const DevTools: React.FC<DevToolsProps> = ({ isVisible = false }) => {
  const [isOpen, setIsOpen] = useState(isVisible);
  const [windowInfo, setWindowInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    userAgent: navigator.userAgent,
    platform:
      (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ??
      (navigator.userAgent.includes('Win')
        ? 'Windows'
        : navigator.userAgent.includes('Mac')
          ? 'macOS'
          : navigator.userAgent.includes('Linux')
            ? 'Linux'
            : 'Unknown'),
  });
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setWindowInfo(prev => ({
        ...prev,
        width: window.innerWidth,
        height: window.innerHeight,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle DevTools with Ctrl/Cmd + Shift + D
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        className={styles.devToolsToggle}
        onClick={() => setIsOpen(true)}
        title='Open DevTools (Ctrl/Cmd + Shift + D)'
      >
        🔧
      </button>
    );
  }

  return (
    <div className={styles.devToolsPanel}>
      <div className={styles.devToolsHeader}>
        <h3>Development Tools</h3>
        <button
          className={styles.closeButton}
          onClick={() => setIsOpen(false)}
          title='Close DevTools'
        >
          ×
        </button>
      </div>

      <div className={styles.devToolsContent}>
        <section className={styles.section}>
          <h4>Theme</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Current Theme:</span>
              <span className={styles.value}>{theme}</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h4>Window Information</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Width:</span>
              <span className={styles.value}>{windowInfo.width}px</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Height:</span>
              <span className={styles.value}>{windowInfo.height}px</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Platform:</span>
              <span className={styles.value}>{windowInfo.platform}</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h4>Environment</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>NODE_ENV:</span>
              <span className={styles.value}>{process.env.NODE_ENV}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>React Version:</span>
              <span className={styles.value}>{React.version}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Hot Module Reload:</span>
              <span className={styles.value}>
                {process.env.NODE_ENV === 'development' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h4>Performance</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Memory Usage:</span>
              <span className={styles.value}>
                {'memory' in performance && performance.memory
                  ? `${Math.round((performance.memory as PerformanceMemory).usedJSHeapSize / 1024 / 1024)}MB`
                  : 'N/A'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Page Load Time:</span>
              <span className={styles.value}>{Math.round(performance.now())}ms</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h4>Shortcuts</h4>
          <div className={styles.shortcuts}>
            <div className={styles.shortcut}>
              <kbd>Ctrl/Cmd + Shift + D</kbd>
              <span>Toggle DevTools</span>
            </div>
            <div className={styles.shortcut}>
              <kbd>F12</kbd>
              <span>Open Electron DevTools</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
