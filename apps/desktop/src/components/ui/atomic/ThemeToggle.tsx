import React from "react";
import { ThemeToggleProps } from "@fishbowl-ai/shared";

/**
 * ThemeToggle component provides a visual toggle button for light/dark theme switching.
 *
 * Extracted from DesignPrototype.tsx to create a reusable atomic component
 * that displays a sun/moon icon based on current theme and handles theme
 * switching through a callback prop.
 */
export function ThemeToggle({
  currentTheme,
  onToggle,
  className,
}: ThemeToggleProps) {
  const styles = {
    themeToggle: {
      background: "none",
      border: "none",
      color: "inherit",
      cursor: "pointer",
      padding: "6px 10px",
      borderRadius: "6px",
      fontSize: "14px",
      backgroundColor: "var(--secondary)",
      transition: "background-color 0.15s",
      fontFamily: "var(--font-sans)",
    } as const,
  };

  const handleClick = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    onToggle(newTheme);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = "0.8";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.opacity = "1";
  };

  return (
    <button
      style={{
        ...styles.themeToggle,
        ...(className && { className }),
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`Switch to ${currentTheme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${currentTheme === "light" ? "dark" : "light"} theme`}
    >
      {currentTheme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
