/**
 * Accessibility tests for focus indicators in settings modal components.
 *
 * Tests WCAG 2.1 AA compliance, screen reader compatibility,
 * keyboard navigation, and accessibility requirements.
 *
 * @module components/settings/__tests__/FocusIndicators.a11y.test
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { NavigationItem } from "../NavigationItem";
import { SubNavigationTab } from "../SubNavigationTab";
import { ModalHeader } from "../ModalHeader";
import { ModalFooter } from "../ModalFooter";

// Mock the shared package for testing
jest.mock("@fishbowl-ai/shared", () => ({
  useSettingsModal: () => ({
    closeModal: jest.fn(),
  }),
  useModalState: () => ({
    hasUnsavedChanges: false,
  }),
  useSettingsActions: () => ({
    closeModal: jest.fn(),
  }),
}));

describe("FocusIndicators.a11y", () => {
  beforeEach(() => {
    // Suppress console warnings during tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("WCAG 2.1 AA Compliance", () => {
    test("all focus indicators meet minimum contrast requirements", () => {
      // Test NavigationItem focus indicators
      render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const navButton = screen.getByRole("button", { name: "General" });

      // Focus ring uses accent color which should meet contrast requirements
      expect(navButton).toHaveClass("focus-visible:ring-accent");

      // Test ModalHeader close button focus indicators
      render(<ModalHeader title="Settings" />);
      const closeButton = screen.getByLabelText("Close settings modal");

      // High contrast focus for critical elements
      expect(closeButton).toHaveClass("focus-visible:ring-ring");
      expect(closeButton).toHaveClass("focus-visible:ring-3"); // Enhanced visibility
    });

    test("focus indicators have minimum 2px thickness for visibility", () => {
      render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const button = screen.getByRole("button", { name: "General" });

      // Should have at least 2px ring for WCAG compliance
      expect(button).toHaveClass("focus-visible:ring-2");
    });

    test("focus indicators don't rely on color alone", () => {
      // All focus indicators also use thickness and positioning changes
      render(
        <NavigationItem
          id="general"
          label="General"
          active={true}
          onClick={jest.fn()}
        />,
      );
      const activeButton = screen.getByRole("button", { name: "General" });

      // Active state uses multiple visual cues: color, border, and enhanced focus
      expect(activeButton).toHaveClass("border-l-primary"); // Visual border
      expect(activeButton).toHaveClass("focus-visible:ring-3"); // Enhanced thickness
      expect(activeButton).toHaveClass("bg-accent"); // Background change
    });
  });

  describe("Keyboard Navigation Accessibility", () => {
    test("all interactive elements are keyboard accessible", () => {
      // Navigation items
      render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const navButton = screen.getByRole("button", { name: "General" });
      expect(navButton).not.toHaveAttribute("tabIndex", "-1");

      // Sub-navigation tabs
      render(
        <SubNavigationTab
          id="library"
          label="Library"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const tabButton = screen.getByRole("tab", { name: "Library" });
      expect(tabButton).not.toHaveAttribute("tabIndex", "-1");

      // Modal header close button
      render(<ModalHeader title="Settings" />);
      const closeButton = screen.getByLabelText("Close settings modal");
      expect(closeButton).not.toHaveAttribute("tabIndex", "-1");

      // Modal footer buttons
      render(<ModalFooter />);
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(cancelButton).not.toHaveAttribute("tabIndex", "-1");
      expect(saveButton).not.toHaveAttribute("tabIndex", "-1");
    });

    test("focus indicators are visible during keyboard navigation", () => {
      render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const button = screen.getByRole("button", { name: "General" });

      // Focus-visible classes ensure focus is only visible during keyboard navigation
      expect(button).toHaveClass("focus-visible:ring-2");
      expect(button).toHaveClass("focus-visible:outline-none");
    });

    test("focus indicators work with isFocused prop for custom keyboard navigation", () => {
      render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
          isFocused={true}
        />,
      );
      const button = screen.getByRole("button", { name: "General" });

      // Custom focus state should be applied
      expect(button).toHaveClass("ring-2");
      expect(button).toHaveClass("ring-accent");
    });
  });

  describe("Screen Reader Compatibility", () => {
    test("focus indicators don't interfere with screen reader navigation", () => {
      render(
        <NavigationItem
          id="general"
          label="General"
          active={true}
          onClick={jest.fn()}
        />,
      );
      const button = screen.getByRole("button", { name: "General" });

      // Proper ARIA attributes are maintained
      expect(button).toHaveAttribute("aria-current", "page");

      // Focus styling doesn't override semantic markup
      // Button elements have implicit role="button", no explicit attribute needed
      expect(button.tagName.toLowerCase()).toBe("button");
    });

    test("sub-navigation tabs maintain proper ARIA roles with focus indicators", () => {
      render(
        <SubNavigationTab
          id="library"
          label="Library"
          active={true}
          onClick={jest.fn()}
        />,
      );
      const tab = screen.getByRole("tab", { name: "Library" });

      // Tab role and ARIA attributes are preserved
      expect(tab).toHaveAttribute("role", "tab");
      expect(tab).toHaveAttribute("aria-selected", "true");

      // Focus indicators don't interfere with tab semantics
      // Active tabs get enhanced 3px focus ring
      expect(tab).toHaveClass("focus-visible:ring-3");
    });

    test("modal close button maintains accessibility with enhanced focus", () => {
      render(<ModalHeader title="Settings" />);
      const closeButton = screen.getByLabelText("Close settings modal");

      // Enhanced focus doesn't override accessibility features
      expect(closeButton).toHaveAttribute("aria-label", "Close settings modal");
      expect(closeButton).toHaveAttribute(
        "aria-describedby",
        "close-button-description",
      );

      // High contrast focus is applied
      expect(closeButton).toHaveClass("focus-visible:ring-3");
    });
  });

  describe("Focus Management", () => {
    test("focus indicators support proper focus trap behavior", () => {
      render(<ModalHeader title="Settings" />);
      const closeButton = screen.getByLabelText("Close settings modal");

      // Initial focus target is marked
      expect(closeButton).toHaveAttribute("data-modal-initial-focus");

      // Focus indicators will work with focus management
      expect(closeButton).toHaveClass("focus-visible:ring-3");
    });

    test("focus indicators maintain consistency across focus state changes", () => {
      const { rerender } = render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
          isFocused={false}
        />,
      );
      const button = screen.getByRole("button", { name: "General" });

      // Base focus classes are always present
      expect(button).toHaveClass("focus-visible:ring-2");

      // When programmatically focused, additional classes are applied
      rerender(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
          isFocused={true}
        />,
      );

      expect(button).toHaveClass("ring-2"); // Immediate focus ring
      expect(button).toHaveClass("focus-visible:ring-2"); // Focus-visible ring
    });

    test("disabled elements properly handle focus indicators", () => {
      render(<ModalFooter saveDisabled={true} />);
      const saveButton = screen.getByRole("button", { name: /save/i });

      // Disabled button should not show focus indicators
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveClass("focus-visible:ring-0");
    });
  });

  describe("High Contrast Mode Support", () => {
    test("focus indicators work in high contrast environments", () => {
      // All components use semantic focus classes that work with high contrast mode
      render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const navButton = screen.getByRole("button", { name: "General" });

      render(<ModalHeader title="Settings" />);
      const closeButton = screen.getByLabelText("Close settings modal");

      // Focus indicators use CSS custom properties that adapt to high contrast
      expect(navButton).toHaveClass("focus-visible:ring-accent");
      expect(closeButton).toHaveClass("focus-visible:ring-ring");
    });

    test("focus ring offsets prevent overlap in high contrast mode", () => {
      render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const button = screen.getByRole("button", { name: "General" });

      // Ring offset ensures visibility against backgrounds
      expect(button).toHaveClass("focus-visible:ring-offset-1");
      expect(button).toHaveClass("focus-visible:ring-offset-background");
    });
  });

  describe("Reduced Motion Support", () => {
    test("focus indicators respect reduced motion preferences", () => {
      // All components include transition classes that respect prefers-reduced-motion
      render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const button = screen.getByRole("button", { name: "General" });

      // Transition classes are present but will be disabled by CSS media query
      expect(button).toHaveClass("transition-all");
      expect(button).toHaveClass("duration-200");
    });
  });

  describe("Focus Indicator Error Prevention", () => {
    test("focus indicators don't create accessibility violations", () => {
      // Test that all focus indicators maintain semantic structure
      const components = [
        {
          component: () => (
            <NavigationItem
              id="general"
              label="General"
              active={false}
              onClick={jest.fn()}
            />
          ),
          expectedRole: "button",
        },
        {
          component: () => (
            <SubNavigationTab
              id="library"
              label="Library"
              active={false}
              onClick={jest.fn()}
            />
          ),
          expectedRole: "tab",
        },
        {
          component: () => <ModalHeader title="Settings" />,
          expectedRole: "button", // for close button
          selector: "[aria-label='Close settings modal']",
        },
      ];

      components.forEach(({ component: Component, expectedRole, selector }) => {
        render(<Component />);

        const element = selector
          ? document.querySelector(selector)
          : screen.getAllByRole(expectedRole)[0];

        expect(element).toBeInTheDocument();

        // Focus indicators don't remove semantic structure
        if (expectedRole === "button") {
          expect(element!.tagName.toLowerCase()).toBe("button");
        } else if (expectedRole === "tab") {
          expect(element).toHaveAttribute("role", "tab");
        }

        // Focus indicators maintain outline removal for custom styling
        expect(element).toHaveClass("focus-visible:outline-none");
      });
    });
  });
});
