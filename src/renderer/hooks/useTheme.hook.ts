import { useStore } from '../store';
import { selectThemeState } from '../store/selectors';
import type { ThemeContextType } from './ThemeContext.types';

export const useTheme = (): ThemeContextType => {
  const themeState = useStore(selectThemeState);

  return {
    // For backward compatibility, return effective theme when theme is 'system'
    theme: themeState.theme === 'system' ? themeState.effectiveTheme : themeState.theme,
    setTheme: themeState.setTheme,
    toggleTheme: themeState.toggleTheme,
  };
};
