/**
 * Visual focus indicator tests for settings modal components.
 *
 * Tests visual focus requirements including CSS classes, thickness,
 * theme compatibility, and consistency across all interactive elements.
 *
 * @module components/settings/__tests__/FocusIndicators.visual.test
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { NavigationItem } from "../NavigationItem";
import { SubNavigationTab } from "../SubNavigationTab";
import { ModalHeader } from "../ModalHeader";
import { ModalFooter } from "../ModalFooter";
import type { SettingsSection, SettingsSubTab } from "@fishbowl-ai/shared";

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

describe("FocusIndicators.visual", () => {
  beforeEach(() => {
    // Suppress console warnings during tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("NavigationItem Focus Indicators", () => {
    const defaultProps = {
      id: "general" as SettingsSection,
      label: "General",
      active: false,
      onClick: jest.fn(),
    };

    test("navigation item has correct focus indicator classes", () => {
      render(<NavigationItem {...defaultProps} />);

      const button = screen.getByRole("button", { name: "General" });

      // Check for focus indicator classes
      expect(button).toHaveClass("focus-visible:ring-2");
      expect(button).toHaveClass("focus-visible:ring-accent");
      expect(button).toHaveClass("focus-visible:ring-offset-1");
      expect(button).toHaveClass("focus-visible:outline-none");
      expect(button).toHaveClass("focus-visible:ring-offset-background");
    });

    test("active navigation item has enhanced focus indicators", () => {
      render(<NavigationItem {...defaultProps} active={true} />);

      const button = screen.getByRole("button", { name: "General" });

      // Active items should have enhanced focus (3px ring)
      expect(button).toHaveClass("focus-visible:ring-accent");
      expect(button).toHaveClass("focus-visible:ring-3");
    });

    test("focus indicators have minimum thickness requirements", () => {
      const { rerender } = render(<NavigationItem {...defaultProps} />);

      const button = screen.getByRole("button", { name: "General" });

      // Check for minimum 2px ring width classes
      expect(button).toHaveClass("focus-visible:ring-2");

      // For active items, should have 3px (enhanced)
      rerender(<NavigationItem {...defaultProps} active={true} />);

      const activeButton = screen.getByRole("button", { name: "General" });
      expect(activeButton).toHaveClass("focus-visible:ring-3");
    });

    test("focus indicators have proper offset to avoid obscuring content", () => {
      render(<NavigationItem {...defaultProps} />);

      const button = screen.getByRole("button", { name: "General" });

      // Ring offset should prevent overlap with content
      expect(button).toHaveClass("focus-visible:ring-offset-1");
      expect(button).toHaveClass("focus-visible:ring-offset-background");
    });
  });

  describe("SubNavigationTab Focus Indicators", () => {
    const defaultProps = {
      id: "library" as SettingsSubTab,
      label: "Library",
      active: false,
      onClick: jest.fn(),
    };

    test("sub-navigation tab has correct focus indicator classes", () => {
      render(<SubNavigationTab {...defaultProps} />);

      const button = screen.getByRole("tab", { name: "Library" });

      // Check for focus indicator classes with tighter offset for sub-tabs
      expect(button).toHaveClass("focus-visible:ring-2");
      expect(button).toHaveClass("focus-visible:ring-accent");
      expect(button).toHaveClass("focus-visible:ring-offset-1");
      expect(button).toHaveClass("focus-visible:outline-none");
    });

    test("active sub-navigation tab has enhanced focus indicators", () => {
      render(<SubNavigationTab {...defaultProps} active={true} />);

      const button = screen.getByRole("tab", { name: "Library" });

      // Active sub-tabs should have enhanced focus
      expect(button).toHaveClass("focus-visible:ring-accent");
      expect(button).toHaveClass("focus-visible:ring-3");
    });

    test("sub-navigation tab focus indicators have appropriate thickness", () => {
      render(<SubNavigationTab {...defaultProps} />);

      const button = screen.getByRole("tab", { name: "Library" });

      // Should have 2px minimum thickness
      expect(button).toHaveClass("focus-visible:ring-2");

      // Tighter offset for smaller sub-navigation elements
      expect(button).toHaveClass("focus-visible:ring-offset-1");
    });
  });

  describe("ModalHeader Focus Indicators", () => {
    test("close button has high contrast focus indicators", () => {
      render(<ModalHeader title="Settings" />);

      const closeButton = screen.getByLabelText("Close settings modal");

      // High contrast focus for critical close button
      expect(closeButton).toHaveClass("focus-visible:ring-3");
      expect(closeButton).toHaveClass("focus-visible:ring-ring");
      expect(closeButton).toHaveClass("focus-visible:ring-offset-2");
      expect(closeButton).toHaveClass("focus-visible:outline-none");
    });

    test("close button focus indicator enhances opacity", () => {
      render(<ModalHeader title="Settings" />);

      const closeButton = screen.getByLabelText("Close settings modal");

      // Should have enhanced opacity for better visibility
      expect(closeButton).toHaveClass("focus-visible:opacity-100");
    });

    test("close button focus works with modal background", () => {
      render(<ModalHeader title="Settings" />);

      const closeButton = screen.getByLabelText("Close settings modal");

      // Should have background offset for proper contrast against modal
      expect(closeButton).toHaveClass("focus-visible:ring-offset-background");
    });
  });

  describe("ModalFooter Focus Indicators", () => {
    test("cancel button has secondary button focus indicators", () => {
      render(<ModalFooter />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      // Secondary button focus styling
      expect(cancelButton).toHaveClass("focus-visible:ring-2");
      expect(cancelButton).toHaveClass("focus-visible:ring-ring/60");
      expect(cancelButton).toHaveClass("focus-visible:ring-offset-2");
      expect(cancelButton).toHaveClass("focus-visible:outline-none");
    });

    test("save button has primary button focus indicators when enabled", () => {
      // Override the mock to have unsaved changes, which enables the save button
      const originalMock = require("@fishbowl-ai/shared").useModalState;
      require("@fishbowl-ai/shared").useModalState = jest.fn(() => ({
        hasUnsavedChanges: true,
      }));

      render(<ModalFooter />);

      const saveButton = screen.getByRole("button", { name: /save/i });

      // Primary button focus styling when enabled
      expect(saveButton).toHaveClass("focus-visible:ring-2");
      expect(saveButton).toHaveClass("focus-visible:ring-ring");
      expect(saveButton).toHaveClass("focus-visible:ring-offset-2");
      expect(saveButton).toHaveClass("focus-visible:outline-none");
      expect(saveButton).not.toBeDisabled();

      // Restore original mock
      require("@fishbowl-ai/shared").useModalState = originalMock;
    });

    test("disabled save button doesn't show focus indicators", () => {
      render(<ModalFooter saveDisabled={true} />);

      const saveButton = screen.getByRole("button", { name: /save/i });

      // Should have disabled focus class
      expect(saveButton).toHaveClass("focus-visible:ring-0");
      expect(saveButton).toBeDisabled();
    });
  });

  describe("Focus Indicator Consistency", () => {
    test("all components use consistent focus transition duration", () => {
      const { container: navContainer } = render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );

      const { container: subNavContainer } = render(
        <SubNavigationTab
          id="library"
          label="Library"
          active={false}
          onClick={jest.fn()}
        />,
      );

      const { container: headerContainer } = render(
        <ModalHeader title="Settings" />,
      );

      const { container: footerContainer } = render(<ModalFooter />);

      // All should have consistent transition classes
      const transitionClass = "transition-all duration-200 ease-in-out";

      expect(navContainer.querySelector("button")).toHaveClass(transitionClass);
      expect(subNavContainer.querySelector("button")).toHaveClass(
        transitionClass,
      );
      expect(headerContainer.querySelector("button")).toHaveClass(
        transitionClass,
      );
      expect(footerContainer.querySelector("button")).toHaveClass(
        transitionClass,
      );
    });

    test("all components remove default browser outline", () => {
      const { container: navContainer } = render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );

      const { container: subNavContainer } = render(
        <SubNavigationTab
          id="library"
          label="Library"
          active={false}
          onClick={jest.fn()}
        />,
      );

      const { container: headerContainer } = render(
        <ModalHeader title="Settings" />,
      );

      const { container: footerContainer } = render(<ModalFooter />);

      // All should remove default outline
      const outlineClass = "focus-visible:outline-none";

      expect(navContainer.querySelector("button")).toHaveClass(outlineClass);
      expect(subNavContainer.querySelector("button")).toHaveClass(outlineClass);
      expect(headerContainer.querySelector("button")).toHaveClass(outlineClass);
      expect(footerContainer.querySelector("button")).toHaveClass(outlineClass);
    });

    test("focus indicators maintain consistency across component types", () => {
      const { container: navContainer } = render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );

      const { container: subNavContainer } = render(
        <SubNavigationTab
          id="library"
          label="Library"
          active={false}
          onClick={jest.fn()}
        />,
      );

      // Both navigation components should use accent color for focus
      expect(navContainer.querySelector("button")).toHaveClass(
        "focus-visible:ring-accent",
      );
      expect(subNavContainer.querySelector("button")).toHaveClass(
        "focus-visible:ring-accent",
      );

      // Both should have proper background offset
      expect(navContainer.querySelector("button")).toHaveClass(
        "focus-visible:ring-offset-background",
      );
      expect(subNavContainer.querySelector("button")).toHaveClass(
        "focus-visible:ring-offset-background",
      );
    });
  });

  describe("Focus Ring Thickness Validation", () => {
    test("all focus indicators meet minimum 2px thickness requirement", () => {
      // Test NavigationItem
      const { container: navContainer } = render(
        <NavigationItem
          id="general"
          label="General"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const navButton = navContainer.querySelector("button");
      const navHasMinimumRing =
        navButton?.classList.contains("focus-visible:ring-2") ||
        navButton?.classList.contains("focus-visible:ring-3");
      expect(navHasMinimumRing).toBe(true);

      // Test SubNavigationTab
      const { container: subNavContainer } = render(
        <SubNavigationTab
          id="library"
          label="Library"
          active={false}
          onClick={jest.fn()}
        />,
      );
      const subNavButton = subNavContainer.querySelector("button");
      const subNavHasMinimumRing =
        subNavButton?.classList.contains("focus-visible:ring-2") ||
        subNavButton?.classList.contains("focus-visible:ring-3");
      expect(subNavHasMinimumRing).toBe(true);

      // Test ModalHeader
      const { container: headerContainer } = render(
        <ModalHeader title="Settings" />,
      );
      const headerButton = headerContainer.querySelector("button");
      const headerHasMinimumRing =
        headerButton?.classList.contains("focus-visible:ring-2") ||
        headerButton?.classList.contains("focus-visible:ring-3");
      expect(headerHasMinimumRing).toBe(true);

      // Test ModalFooter
      const { container: footerContainer } = render(<ModalFooter />);
      const footerButton = footerContainer.querySelector("button");
      const footerHasMinimumRing =
        footerButton?.classList.contains("focus-visible:ring-2") ||
        footerButton?.classList.contains("focus-visible:ring-3");
      expect(footerHasMinimumRing).toBe(true);
    });

    test("high-priority elements use enhanced 3px focus rings", () => {
      // Close button should have 3px ring for enhanced visibility
      render(<ModalHeader title="Settings" />);
      const closeButton = screen.getByLabelText("Close settings modal");
      expect(closeButton).toHaveClass("focus-visible:ring-3");

      // Active navigation items should have 3px ring
      render(
        <NavigationItem
          id="general"
          label="General"
          active={true}
          onClick={jest.fn()}
        />,
      );
      const activeNavButton = screen.getByRole("button", { name: "General" });
      expect(activeNavButton).toHaveClass("focus-visible:ring-3");
    });
  });
});
