import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface ShowcaseLayoutProps {
  children: React.ReactNode;
}

export function ShowcaseLayout({ children }: ShowcaseLayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  const styles = {
    container: {
      width: "100%",
      height: "100vh",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      fontFamily: "var(--font-sans)",
      display: "flex",
      flexDirection: "column" as const,
      transition: "background-color 0.2s, color 0.2s",
    },
    header: {
      height: "64px",
      backgroundColor: "var(--card)",
      borderBottom: `1px solid var(--border)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0,
    },
    navigation: {
      display: "flex",
      gap: "8px",
    },
    navTab: {
      padding: "8px 16px",
      borderRadius: "6px",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "500",
      transition: "background-color 0.15s, color 0.15s",
      border: "none",
      cursor: "pointer",
    },
    navTabActive: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
    },
    navTabInactive: {
      backgroundColor: "transparent",
      color: "var(--muted-foreground)",
    },
    navTabInactiveHover: {
      backgroundColor: "var(--muted)",
      color: "var(--foreground)",
    },
    themeToggle: {
      background: "none",
      border: "none",
      color: "inherit",
      cursor: "pointer",
      padding: "8px 12px",
      borderRadius: "6px",
      fontSize: "14px",
      backgroundColor: "var(--secondary)",
      transition: "background-color 0.15s",
    },
    themeToggleHover: {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
    },
    main: {
      flex: 1,
      overflow: "auto",
    },
  };

  const isComponentsActive = location.pathname === "/showcase/components";
  const isLayoutActive = location.pathname === "/showcase/layout";

  return (
    <div className={isDark ? "dark" : ""} style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.navigation}>
          <Link
            to="/"
            style={{
              ...styles.navTab,
              ...styles.navTabInactive,
            }}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.navTabInactiveHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--muted-foreground)";
            }}
          >
            ← Home
          </Link>
          <Link
            to="/showcase/components"
            style={{
              ...styles.navTab,
              ...(isComponentsActive
                ? styles.navTabActive
                : styles.navTabInactive),
            }}
            onMouseEnter={(e) => {
              if (!isComponentsActive) {
                Object.assign(
                  e.currentTarget.style,
                  styles.navTabInactiveHover,
                );
              }
            }}
            onMouseLeave={(e) => {
              if (!isComponentsActive) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--muted-foreground)";
              }
            }}
          >
            Components
          </Link>
          <Link
            to="/showcase/layout"
            style={{
              ...styles.navTab,
              ...(isLayoutActive ? styles.navTabActive : styles.navTabInactive),
            }}
            onMouseEnter={(e) => {
              if (!isLayoutActive) {
                Object.assign(
                  e.currentTarget.style,
                  styles.navTabInactiveHover,
                );
              }
            }}
            onMouseLeave={(e) => {
              if (!isLayoutActive) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--muted-foreground)";
              }
            }}
          >
            Layout
          </Link>
        </nav>

        <button
          style={styles.themeToggle}
          onClick={() => setIsDark(!isDark)}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.themeToggleHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--secondary)";
            e.currentTarget.style.color = "inherit";
          }}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </header>

      <main style={styles.main}>{children}</main>
    </div>
  );
}
