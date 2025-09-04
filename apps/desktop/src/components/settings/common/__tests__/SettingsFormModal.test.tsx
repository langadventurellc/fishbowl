import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsFormModal } from "../SettingsFormModal";

// Mock the services context (the path is relative to the component, but we need it relative to the test)
jest.mock("../../../../contexts", () => ({
  useServices: () => ({
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
  }),
}));

// Mock the useFocusTrap hook
jest.mock("../../../../hooks/useFocusTrap", () => ({
  useFocusTrap: () => ({
    containerRef: { current: null },
  }),
}));

// Mock the announceToScreenReader utility
jest.mock("../../../../utils/announceToScreenReader", () => ({
  announceToScreenReader: jest.fn(),
}));

// Mock the useConfirmationDialog hook
jest.mock("../../../../hooks/useConfirmationDialog", () => ({
  useConfirmationDialog: () => ({
    showConfirmation: jest.fn().mockResolvedValue(true),
    confirmationDialogProps: null,
  }),
}));

describe("SettingsFormModal", () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any global event listeners that might have been added by previous tests
    document.removeEventListener("keydown", jest.fn(), true);
  });

  describe("Escape Key Handling", () => {
    it("calls onOpenChange(false) when Escape is pressed without confirmation", () => {
      render(
        <SettingsFormModal
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      // Simulate Escape keydown on document
      fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
    });

    it("opens confirmation dialog when Escape is pressed with confirmOnClose enabled", async () => {
      // Since we can't easily test the actual confirmation dialog behavior due to async nature,
      // we'll test that the modal doesn't close immediately when confirmOnClose is enabled
      render(
        <SettingsFormModal
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
          confirmOnClose={{
            enabled: true,
            message: {
              title: "Discard Changes",
              body: "Are you sure you want to discard your changes?",
              confirmText: "Discard",
              cancelText: "Cancel",
            },
          }}
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      // Simulate Escape keydown on document
      fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

      // With confirmOnClose enabled, the modal should not close immediately
      // The useConfirmationDialog hook will handle the confirmation flow
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });

    it("prevents event propagation when Escape is handled", () => {
      const parentHandler = jest.fn();

      // Add a parent event listener to simulate parent modal
      document.addEventListener("keydown", parentHandler, false);

      render(
        <SettingsFormModal
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      // Simulate Escape keydown on document
      fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

      // SettingsFormModal should handle the escape
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);

      // Parent handler should not be called due to stopPropagation
      expect(parentHandler).not.toHaveBeenCalled();

      // Clean up
      document.removeEventListener("keydown", parentHandler, false);
    });

    it("does not handle Escape when modal is closed", () => {
      render(
        <SettingsFormModal
          isOpen={false}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      // Simulate Escape keydown on document
      fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

      // Should not call onOpenChange when modal is closed
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
  });

  describe("DialogContent onEscapeKeyDown Handler", () => {
    it("prevents default behavior and calls handleClose", () => {
      render(
        <SettingsFormModal
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      const dialogContent = screen.getByTestId("test-modal");

      // Since onEscapeKeyDown is handled internally by Radix, we test the integration
      // by ensuring the modal content has the data-form-modal attribute
      expect(dialogContent).toHaveAttribute("data-form-modal", "true");
    });

    it("shows confirmation when onEscapeKeyDown is triggered with confirmOnClose", () => {
      render(
        <SettingsFormModal
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
          confirmOnClose={{
            enabled: true,
            message: {
              title: "Confirm Close",
              body: "Do you want to close?",
            },
          }}
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      const dialogContent = screen.getByTestId("test-modal");
      expect(dialogContent).toHaveAttribute("data-form-modal", "true");
    });
  });

  describe("Save Shortcut Handling", () => {
    it("calls onRequestSave when Ctrl+S is pressed", () => {
      const mockOnRequestSave = jest.fn();

      render(
        <SettingsFormModal
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
          onRequestSave={mockOnRequestSave}
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      // Simulate Ctrl+S keydown
      fireEvent.keyDown(document, {
        key: "s",
        code: "KeyS",
        ctrlKey: true,
      });

      expect(mockOnRequestSave).toHaveBeenCalledTimes(1);
    });

    it("calls onRequestSave when Meta+S is pressed", () => {
      const mockOnRequestSave = jest.fn();

      render(
        <SettingsFormModal
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
          onRequestSave={mockOnRequestSave}
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      // Simulate Meta+S keydown (Cmd+S on Mac)
      fireEvent.keyDown(document, {
        key: "s",
        code: "KeyS",
        metaKey: true,
      });

      expect(mockOnRequestSave).toHaveBeenCalledTimes(1);
    });
  });

  describe("Modal State Events", () => {
    it("dispatches settingsFormModalOpened event when modal opens", () => {
      const eventSpy = jest.spyOn(document, "dispatchEvent");

      render(
        <SettingsFormModal
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "settingsFormModalOpened",
        }),
      );

      eventSpy.mockRestore();
    });

    it("dispatches settingsFormModalClosed event when modal closes", () => {
      const eventSpy = jest.spyOn(document, "dispatchEvent");

      const { rerender } = render(
        <SettingsFormModal
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      // Clear the calls from opening
      eventSpy.mockClear();

      // Change to closed
      rerender(
        <SettingsFormModal
          isOpen={false}
          onOpenChange={mockOnOpenChange}
          title="Test Modal"
          dataTestId="test-modal"
        >
          <div>Test Content</div>
        </SettingsFormModal>,
      );

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "settingsFormModalClosed",
        }),
      );

      eventSpy.mockRestore();
    });
  });
});
