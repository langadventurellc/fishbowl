import type { ThemeMode } from "@fishbowl-ai/shared";

/**
 * Applies the specified theme to the document root element.
 * Handles light, dark, and system theme preferences.
 *
 * @param theme - The theme to apply
 */
export function applyTheme(theme: ThemeMode): void {
  const root = document.documentElement;

  // Determine effective theme
  let effectiveTheme: "light" | "dark";
  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    effectiveTheme = systemTheme;
  } else {
    effectiveTheme = theme;
  }

  // Apply theme class
  root.classList.remove("light", "dark");
  root.classList.add(effectiveTheme);

  // Store theme preference for consistency
  root.setAttribute("data-theme", theme);
}
