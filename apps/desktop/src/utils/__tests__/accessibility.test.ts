/**
 * @jest-environment jsdom
 */

import {
  announceToScreenReader,
  generateDialogAriaIds,
  getAccessibleDescription,
  useAccessibilityAnnouncements,
} from "../index";
import { renderHook, act } from "@testing-library/react";

// Mock timers for testing delayed announcements
jest.useFakeTimers();

describe("Accessibility Utils", () => {
  beforeEach(() => {
    // Clear DOM between tests
    document.body.innerHTML = "";
    jest.clearAllTimers();
  });

  afterEach(() => {
    // Clean up any live regions
    const liveRegions = document.querySelectorAll("[aria-live]");
    liveRegions.forEach((region) => region.remove());
  });

  describe("announceToScreenReader", () => {
    test("creates polite live region and announces message", () => {
      announceToScreenReader("Test message");

      const liveRegion = document.getElementById("aria-live-polite");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");
      expect(liveRegion).toHaveClass("sr-only");

      // Fast-forward timers to trigger the delayed announcement
      act(() => {
        jest.runAllTimers();
      });

      expect(liveRegion).toHaveTextContent("Test message");
    });

    test("creates assertive live region for urgent messages", () => {
      announceToScreenReader("Urgent message", "assertive");

      const liveRegion = document.getElementById("aria-live-assertive");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute("aria-live", "assertive");
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");

      act(() => {
        jest.runAllTimers();
      });

      expect(liveRegion).toHaveTextContent("Urgent message");
    });

    test("reuses existing live region for subsequent announcements", () => {
      announceToScreenReader("First message");
      announceToScreenReader("Second message");

      const liveRegions = document.querySelectorAll("#aria-live-polite");
      expect(liveRegions).toHaveLength(1);

      act(() => {
        jest.runAllTimers();
      });

      expect(liveRegions[0]).toHaveTextContent("Second message");
    });

    test("clears content before setting new message", () => {
      announceToScreenReader("Initial message");

      const liveRegion = document.getElementById("aria-live-polite");
      expect(liveRegion?.textContent).toBe("");

      act(() => {
        jest.runAllTimers();
      });

      expect(liveRegion?.textContent).toBe("Initial message");
    });

    test("handles multiple priority levels simultaneously", () => {
      announceToScreenReader("Polite message", "polite");
      announceToScreenReader("Assertive message", "assertive");

      const politeRegion = document.getElementById("aria-live-polite");
      const assertiveRegion = document.getElementById("aria-live-assertive");

      expect(politeRegion).toBeInTheDocument();
      expect(assertiveRegion).toBeInTheDocument();

      act(() => {
        jest.runAllTimers();
      });

      expect(politeRegion).toHaveTextContent("Polite message");
      expect(assertiveRegion).toHaveTextContent("Assertive message");
    });
  });

  describe("generateDialogAriaIds", () => {
    test("generates consistent ID structure for given base", () => {
      const ids = generateDialogAriaIds("test-modal");

      expect(ids).toEqual({
        titleId: "test-modal-title",
        descriptionId: "test-modal-description",
        contentId: "test-modal-content",
        navigationId: "test-modal-navigation",
        mainId: "test-modal-main",
        announcementId: "test-modal-announcements",
      });
    });

    test("handles different base IDs correctly", () => {
      const settingsIds = generateDialogAriaIds("settings");
      const preferencesIds = generateDialogAriaIds("preferences");

      expect(settingsIds.titleId).toBe("settings-title");
      expect(preferencesIds.titleId).toBe("preferences-title");

      // Ensure they are different
      expect(settingsIds.titleId).not.toBe(preferencesIds.titleId);
    });

    test("works with hyphenated base IDs", () => {
      const ids = generateDialogAriaIds("my-custom-modal");

      expect(ids.titleId).toBe("my-custom-modal-title");
      expect(ids.navigationId).toBe("my-custom-modal-navigation");
    });

    test("generates all required properties", () => {
      const ids = generateDialogAriaIds("test");
      const expectedKeys = [
        "titleId",
        "descriptionId",
        "contentId",
        "navigationId",
        "mainId",
        "announcementId",
      ];

      expectedKeys.forEach((key) => {
        expect(ids).toHaveProperty(key);
        expect(typeof ids[key as keyof typeof ids]).toBe("string");
        expect(ids[key as keyof typeof ids]).toBeTruthy();
      });
    });
  });

  describe("getAccessibleDescription", () => {
    test("returns appropriate description for known sections", () => {
      const descriptions = {
        general: "Configure general application preferences and basic settings",
        "api-keys":
          "Manage API keys for AI model providers and external services",
        appearance:
          "Customize visual appearance, themes, and display preferences",
        agents: "Configure AI agents, their roles, and behavior settings",
        personalities:
          "Define and manage AI agent personality traits and characteristics",
        roles: "Set up agent roles and their specific responsibilities",
        advanced:
          "Access advanced configuration options and developer settings",
      };

      Object.entries(descriptions).forEach(([section, expectedDescription]) => {
        expect(getAccessibleDescription(section)).toBe(expectedDescription);
      });
    });

    test("returns fallback description for unknown sections", () => {
      const unknownSection = "unknown-section";
      const description = getAccessibleDescription(unknownSection);

      expect(description).toBe("Configure unknown-section settings");
    });

    test("includes sub-tab information when provided", () => {
      const baseDescription = getAccessibleDescription("agents");
      const subTabDescription = getAccessibleDescription("agents", "templates");

      expect(baseDescription).toContain("Configure AI agents");
      expect(subTabDescription).toContain("Configure AI agents");
      expect(subTabDescription).toContain("templates subsection");
      expect(subTabDescription).not.toBe(baseDescription);
    });

    test("handles empty and special characters in section names", () => {
      expect(getAccessibleDescription("")).toBe("Configure  settings");
      expect(getAccessibleDescription("test-section_name")).toBe(
        "Configure test-section_name settings",
      );
    });

    test("handles various sub-tab scenarios", () => {
      const section = "appearance";

      expect(getAccessibleDescription(section, "themes")).toContain(
        "themes subsection",
      );
      expect(getAccessibleDescription(section, "colors")).toContain(
        "colors subsection",
      );
      // Empty sub-tab should return base description without subsection suffix
      expect(getAccessibleDescription(section, "")).toBe(
        getAccessibleDescription(section),
      );
    });
  });

  describe("useAccessibilityAnnouncements", () => {
    test("provides announcement functions", () => {
      const { result } = renderHook(() => useAccessibilityAnnouncements());

      expect(result.current).toHaveProperty("announceSection");
      expect(result.current).toHaveProperty("announceStateChange");
      expect(result.current).toHaveProperty("announceError");

      expect(typeof result.current.announceSection).toBe("function");
      expect(typeof result.current.announceStateChange).toBe("function");
      expect(typeof result.current.announceError).toBe("function");
    });

    test("announceSection creates proper announcement", () => {
      const { result } = renderHook(() => useAccessibilityAnnouncements());

      act(() => {
        result.current.announceSection("general");
      });

      act(() => {
        jest.runAllTimers();
      });

      const liveRegion = document.getElementById("aria-live-polite");
      expect(liveRegion?.textContent).toContain(
        "Settings section changed to general",
      );
      expect(liveRegion?.textContent).toContain(
        "Configure general application preferences",
      );
    });

    test("announceSection with sub-tab includes sub-tab information", () => {
      const { result } = renderHook(() => useAccessibilityAnnouncements());

      act(() => {
        result.current.announceSection("agents", "templates");
      });

      act(() => {
        jest.runAllTimers();
      });

      const liveRegion = document.getElementById("aria-live-polite");
      expect(liveRegion?.textContent).toContain(
        "Settings section changed to agents, templates",
      );
      expect(liveRegion?.textContent).toContain("templates subsection");
    });

    test("prevents duplicate announcements", () => {
      const { result } = renderHook(() => useAccessibilityAnnouncements());

      // Make the same announcement twice
      act(() => {
        result.current.announceSection("general");
      });

      act(() => {
        jest.runAllTimers();
      });

      // Clear the live region to test duplicate prevention
      const liveRegion = document.getElementById("aria-live-polite");
      if (liveRegion) liveRegion.textContent = "";

      act(() => {
        result.current.announceSection("general");
      });

      act(() => {
        jest.runAllTimers();
      });

      // Should not announce again for the same section
      expect(document.getElementById("aria-live-polite")?.textContent).toBe("");
    });

    test("announceStateChange uses polite priority", () => {
      const { result } = renderHook(() => useAccessibilityAnnouncements());

      act(() => {
        result.current.announceStateChange("Modal opened");
      });

      act(() => {
        jest.runAllTimers();
      });

      const politeRegion = document.getElementById("aria-live-polite");
      expect(politeRegion?.textContent).toBe("Modal opened");
    });

    test("announceError uses assertive priority", () => {
      const { result } = renderHook(() => useAccessibilityAnnouncements());

      act(() => {
        result.current.announceError("Validation failed");
      });

      act(() => {
        jest.runAllTimers();
      });

      const assertiveRegion = document.getElementById("aria-live-assertive");
      expect(assertiveRegion?.textContent).toBe("Error: Validation failed");
    });

    test("hook functions are stable across re-renders", () => {
      const { result, rerender } = renderHook(() =>
        useAccessibilityAnnouncements(),
      );

      const firstFunctions = {
        announceSection: result.current.announceSection,
        announceStateChange: result.current.announceStateChange,
        announceError: result.current.announceError,
      };

      rerender();

      expect(result.current.announceSection).toBe(
        firstFunctions.announceSection,
      );
      expect(result.current.announceStateChange).toBe(
        firstFunctions.announceStateChange,
      );
      expect(result.current.announceError).toBe(firstFunctions.announceError);
    });
  });
});
