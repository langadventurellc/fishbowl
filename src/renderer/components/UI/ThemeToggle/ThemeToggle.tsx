import React from 'react';
import { useTheme } from '../../../hooks';
import styles from './ThemeToggle.module.css';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggleButton}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span className={styles.icon}>{theme === 'light' ? '🌙' : '☀️'}</span>
      <span className={styles.label}>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
};
