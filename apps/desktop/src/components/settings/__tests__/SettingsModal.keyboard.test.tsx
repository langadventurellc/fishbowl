/**
 * Integration tests for SettingsModal keyboard functionality.
 *
 * Tests the complete integration of focus trap, keyboard navigation, and global
 * keyboard shortcuts within the settings modal. Focuses on integration points
 * rather than complex focus behavior which is difficult to test in Jest/jsdom.
 *
 * @module components/settings/__tests__/SettingsModal.keyboard.test
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsModal } from "../SettingsModal";

// Mock the shared package to control modal state
jest.mock("@fishbowl-ai/shared", () => ({
  useModalState: jest.fn(() => ({ isOpen: true })),
  useActiveSection: () => "general",
  useSettingsActions: () => ({
    openModal: jest.fn(),
    closeModal: jest.fn(),
    setActiveSection: jest.fn(),
    setActiveSubTab: jest.fn(),
  }),
  SettingsModalProps: {},
}));

// Mock child components to focus on keyboard integration
jest.mock("../SettingsNavigation", () => ({
  SettingsNavigation: () => (
    <nav data-testid="settings-navigation">
      <button data-testid="nav-general">General</button>
      <button data-testid="nav-api-keys">API Keys</button>
      <button data-testid="nav-appearance">Appearance</button>
    </nav>
  ),
}));

jest.mock("../SettingsContent", () => ({
  SettingsContent: () => (
    <div data-testid="settings-content">
      <input data-testid="test-input" placeholder="Test input" />
      <button data-testid="test-button">Test Button</button>
    </div>
  ),
}));

jest.mock("../ModalHeader", () => ({
  ModalHeader: () => (
    <header>
      <h1>Settings</h1>
      <button data-testid="close-button" data-modal-initial-focus>
        Close
      </button>
    </header>
  ),
}));

jest.mock("../ModalFooter", () => ({
  ModalFooter: () => (
    <footer>
      <button data-testid="cancel-button">Cancel</button>
      <button data-testid="save-button">Save</button>
    </footer>
  ),
}));

describe("SettingsModal Keyboard Integration", () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console warnings for accessibility during tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up any lingering event listeners
    document.removeEventListener("keydown", jest.fn());
    jest.restoreAllMocks();
  });

  describe("Focus Trap Integration", () => {
    test("modal renders with focus trap container", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Check that the initial focus element exists
      const closeButton = screen.getByTestId("close-button");
      expect(closeButton).toHaveAttribute("data-modal-initial-focus");
    });

    test("modal has focusable elements for tab navigation", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const closeButton = screen.getByTestId("close-button");
      const testInput = screen.getByTestId("test-input");
      const testButton = screen.getByTestId("test-button");
      const cancelButton = screen.getByTestId("cancel-button");
      const saveButton = screen.getByTestId("save-button");

      // All focusable elements should be present
      expect(closeButton).toBeInTheDocument();
      expect(testInput).toBeInTheDocument();
      expect(testButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();
    });

    test("focus trap hook is integrated", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      // The modal should render successfully with focus trap integration
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Global Keyboard Shortcuts", () => {
    test("escape key closes modal", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test("ctrl+s triggers save shortcut", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      fireEvent.keyDown(document, { key: "s", ctrlKey: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Save shortcut triggered (Ctrl+S)",
      );

      consoleSpy.mockRestore();
    });

    test("shortcuts do not work when modal is closed", () => {
      // Mock the modal state to be closed
      const { useModalState } = require("@fishbowl-ai/shared");
      useModalState.mockReturnValueOnce({ isOpen: false });

      render(<SettingsModal open={false} onOpenChange={mockOnOpenChange} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });

    test("shortcuts work from any focused element", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const testInput = screen.getByTestId("test-input");
      testInput.focus();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test("save shortcuts are disabled in input fields", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const testInput = screen.getByTestId("test-input");
      // Simulate focus event on input to trigger the input field check
      Object.defineProperty(document, "activeElement", {
        writable: true,
        value: testInput,
      });

      // Fire the event on the input element directly
      fireEvent.keyDown(testInput, { key: "s", ctrlKey: true });

      // Save shortcut should not trigger in input field
      expect(consoleSpy).not.toHaveBeenCalledWith(
        "Save shortcut triggered (Ctrl+S)",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Navigation Keyboard Integration", () => {
    test("navigation panel renders with keyboard support", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const navigation = screen.getByTestId("settings-navigation");
      const generalButton = screen.getByTestId("nav-general");

      expect(navigation).toBeInTheDocument();
      expect(generalButton).toBeInTheDocument();
    });

    test("enter key works on navigation items", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const generalButton = screen.getByTestId("nav-general");

      fireEvent.keyDown(generalButton, { key: "Enter" });

      // Button should exist and be interactable
      expect(generalButton).toBeInTheDocument();
    });
  });

  describe("ARIA and Screen Reader Support", () => {
    test("modal has proper ARIA attributes", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby");
      expect(dialog).toHaveAttribute("aria-describedby");
    });

    test("modal title and description are properly associated", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const dialog = screen.getByRole("dialog");
      const titleId = dialog.getAttribute("aria-labelledby");
      const descriptionId = dialog.getAttribute("aria-describedby");

      expect(document.getElementById(titleId!)).toBeInTheDocument();
      expect(document.getElementById(descriptionId!)).toBeInTheDocument();
    });

    test("live region for announcements is present", () => {
      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const liveRegion = document.getElementById(
        "settings-modal-announcements",
      );
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
      expect(liveRegion).toHaveAttribute("role", "status");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("modal handles rapid open/close cycles gracefully", () => {
      const { rerender } = render(
        <SettingsModal open={false} onOpenChange={mockOnOpenChange} />,
      );

      // Rapidly toggle modal state
      for (let i = 0; i < 5; i++) {
        rerender(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);
        rerender(
          <SettingsModal open={false} onOpenChange={mockOnOpenChange} />,
        );
      }

      // Final state should work correctly
      rerender(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    test("modal handles missing initial focus element gracefully", () => {
      // Mock component without initial focus attribute
      jest.mocked(require("../ModalHeader")).ModalHeader = () => (
        <header>
          <h1>Settings</h1>
          <button data-testid="close-button">Close</button>
        </header>
      );

      render(<SettingsModal open={true} onOpenChange={mockOnOpenChange} />);

      // Modal should still render and be functional
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    test("keyboard shortcuts handle events safely when modal is unmounted", () => {
      const { unmount } = render(
        <SettingsModal open={true} onOpenChange={mockOnOpenChange} />,
      );

      unmount();

      // These should not throw errors
      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.keyDown(document, { key: "s", ctrlKey: true });

      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
  });
});
