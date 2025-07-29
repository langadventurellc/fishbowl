import { useCallback, useRef } from "react";
import { announceToScreenReader } from "./announceToScreenReader";
import { getAccessibleDescription } from "./getAccessibleDescription";

/**
 * Custom hook for managing accessibility announcements
 * Provides functions for announcing section changes, state changes, and errors
 */
export function useAccessibilityAnnouncements() {
  const lastAnnouncementRef = useRef<string>("");

  const announceSection = useCallback((section: string, subTab?: string) => {
    const description = getAccessibleDescription(section, subTab);
    const announcement = `Settings section changed to ${section}${subTab ? `, ${subTab}` : ""}. ${description}`;

    // Avoid duplicate announcements to prevent spam
    if (announcement !== lastAnnouncementRef.current) {
      announceToScreenReader(announcement);
      lastAnnouncementRef.current = announcement;
    }
  }, []);

  const announceStateChange = useCallback((message: string) => {
    announceToScreenReader(message);
  }, []);

  const announceError = useCallback((error: string) => {
    announceToScreenReader(`Error: ${error}`, "assertive");
  }, []);

  return {
    announceSection,
    announceStateChange,
    announceError,
  };
}
