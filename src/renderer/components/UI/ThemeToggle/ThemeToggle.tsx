import React from 'react';
import { useTheme } from '../../../hooks';
import styles from './ThemeToggle.module.css';

export const ThemeToggle: React.FC = () => {
  const { effectiveTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggleButton}
      aria-label={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span className={styles.icon}>{effectiveTheme === 'light' ? '🌙' : '☀️'}</span>
      <span className={styles.label}>{effectiveTheme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
};
