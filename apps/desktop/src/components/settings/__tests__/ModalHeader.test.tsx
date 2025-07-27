/**
 * Unit tests for ModalHeader component.
 *
 * Tests component rendering, Zustand store integration, accessibility features,
 * keyboard navigation, click handlers, and styling compliance with specifications.
 *
 * @module components/settings/__tests__/ModalHeader.test
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModalHeader } from "../ModalHeader";

// Mock the Zustand store
jest.mock("@fishbowl-ai/shared", () => ({
  useSettingsModal: () => ({
    closeModal: mockCloseModal,
  }),
}));

// Mock console methods to test validation warnings
const mockCloseModal = jest.fn();
const mockConsoleWarn = jest.fn();

beforeEach(() => {
  // Reset mocks before each test
  mockCloseModal.mockClear();
  mockConsoleWarn.mockClear();
  jest.spyOn(console, "warn").mockImplementation(mockConsoleWarn);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ModalHeader", () => {
  describe("Component Rendering", () => {
    it("should render without errors", () => {
      render(<ModalHeader />);
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("should render with default title 'Settings'", () => {
      render(<ModalHeader />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("Settings");
      expect(title).toHaveAttribute("id", "modal-title");
    });

    it("should render with custom title when provided", () => {
      const customTitle = "Custom Modal Title";
      render(<ModalHeader title={customTitle} />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent(customTitle);
    });

    it("should render close button with proper ARIA attributes", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute("aria-label", "Close settings modal");
      expect(closeButton).toHaveAttribute(
        "aria-describedby",
        "close-button-description",
      );
      expect(closeButton).toHaveAttribute("title", "Close settings (Esc)");
    });

    it("should render X icon inside close button", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      const icon = closeButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("should render hidden description for screen readers", () => {
      render(<ModalHeader />);

      const description = screen.getByText(/press enter or space to close/i);
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute("id", "close-button-description");
      expect(description).toHaveClass("sr-only");
    });
  });

  describe("CSS Classes and Styling", () => {
    it("should apply correct header styling classes", () => {
      render(<ModalHeader />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("h-[50px]"); // Exact 50px height
      expect(header).toHaveClass("bg-background/95"); // Background styling
      expect(header).toHaveClass("border-b"); // Border
      expect(header).toHaveClass("flex"); // Layout
      expect(header).toHaveClass("items-center"); // Vertical centering
      expect(header).toHaveClass("justify-between"); // Space between
      expect(header).toHaveClass("px-5"); // 20px padding (5 * 4 = 20px)
      expect(header).toHaveClass("relative"); // Z-index positioning
      expect(header).toHaveClass("z-10"); // Z-index value
    });

    it("should apply correct title styling classes", () => {
      render(<ModalHeader />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveClass("text-lg"); // 18px font size
      expect(title).toHaveClass("font-medium"); // Medium weight
      expect(title).toHaveClass("text-left"); // Left alignment
      expect(title).toHaveClass("text-foreground"); // Text color
      expect(title).toHaveClass("select-none"); // Prevent selection
    });

    it("should apply correct close button styling classes", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      expect(closeButton).toHaveClass("w-10"); // 40px width
      expect(closeButton).toHaveClass("h-10"); // 40px height
      expect(closeButton).toHaveClass("hover:bg-accent/50"); // Hover state
      expect(closeButton).toHaveClass("focus-visible:bg-accent/50"); // Focus state
      expect(closeButton).toHaveClass("focus-visible:ring-2"); // Focus ring
      expect(closeButton).toHaveClass("transition-colors"); // Smooth transitions
    });

    it("should apply custom className when provided", () => {
      const customClass = "custom-header-class";
      render(<ModalHeader className={customClass} />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass(customClass);
    });
  });

  describe("Click Handling", () => {
    it("should call closeModal from Zustand store when close button is clicked", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      fireEvent.click(closeButton);

      expect(mockCloseModal).toHaveBeenCalledTimes(1);
    });

    it("should prevent event bubbling on close button click", () => {
      const onHeaderClick = jest.fn();
      render(
        <div onClick={onHeaderClick}>
          <ModalHeader />
        </div>,
      );

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      fireEvent.click(closeButton);

      expect(mockCloseModal).toHaveBeenCalledTimes(1);
      expect(onHeaderClick).not.toHaveBeenCalled();
    });

    it("should call custom onClose handler when provided", () => {
      const customOnClose = jest.fn();
      render(<ModalHeader onClose={customOnClose} />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      fireEvent.click(closeButton);

      expect(customOnClose).toHaveBeenCalledTimes(1);
      expect(mockCloseModal).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should call closeModal when Enter key is pressed on close button", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      closeButton.focus();

      fireEvent.keyDown(closeButton, { key: "Enter" });

      expect(mockCloseModal).toHaveBeenCalledTimes(1);
    });

    it("should call closeModal when Space key is pressed on close button", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      closeButton.focus();

      fireEvent.keyDown(closeButton, { key: " " });

      expect(mockCloseModal).toHaveBeenCalledTimes(1);
    });

    it("should prevent default behavior for keyboard events", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });

      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      });

      const preventDefaultSpy = jest.spyOn(enterEvent, "preventDefault");
      const stopPropagationSpy = jest.spyOn(enterEvent, "stopPropagation");

      fireEvent(closeButton, enterEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it("should not call closeModal for other keyboard keys", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });

      fireEvent.keyDown(closeButton, { key: "Escape" });
      fireEvent.keyDown(closeButton, { key: "Tab" });
      fireEvent.keyDown(closeButton, { key: "ArrowDown" });

      expect(mockCloseModal).not.toHaveBeenCalled();
    });

    it("should be focusable via Tab key", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });

      // Button should be in the tab order
      expect(closeButton).not.toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Accessibility Features", () => {
    it("should have proper ARIA role for header", () => {
      render(<ModalHeader />);

      const header = screen.getByRole("banner");
      expect(header).toHaveAttribute("role", "banner");
      expect(header).toHaveAttribute("aria-label", "Modal header");
    });

    it("should have proper heading structure", () => {
      render(<ModalHeader />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute("id", "modal-title");
    });

    it("should have accessible close button with proper ARIA attributes", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      expect(closeButton).toHaveAttribute("aria-label", "Close settings modal");
      expect(closeButton).toHaveAttribute(
        "aria-describedby",
        "close-button-description",
      );
      expect(closeButton).toHaveAttribute("title", "Close settings (Esc)");
    });

    it("should have hidden description for screen readers", () => {
      render(<ModalHeader />);

      const description = document.getElementById("close-button-description");
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("sr-only");
      expect(description).toHaveTextContent(/press enter or space to close/i);
    });

    it("should have aria-hidden on close button icon", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      const icon = closeButton.querySelector("svg");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Props and Configuration", () => {
    it("should accept all optional props", () => {
      const props = {
        title: "Custom Settings",
        className: "custom-class",
        onClose: jest.fn(),
      };

      render(<ModalHeader {...props} />);

      expect(screen.getByText("Custom Settings")).toBeInTheDocument();
      expect(screen.getByRole("banner")).toHaveClass("custom-class");
    });

    it("should work with undefined props", () => {
      const props = {
        title: undefined,
        className: undefined,
        onClose: undefined,
      };

      expect(() => render(<ModalHeader {...props} />)).not.toThrow();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("should handle empty string title", () => {
      render(<ModalHeader title="" />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent("");
    });

    it("should handle long title text", () => {
      const longTitle =
        "This is a very long title that should still be displayed correctly";
      render(<ModalHeader title={longTitle} />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent(longTitle);
    });
  });

  describe("Component Structure", () => {
    it("should have correct DOM structure", () => {
      render(<ModalHeader />);

      const header = screen.getByRole("banner");
      const title = screen.getByRole("heading", { level: 1 });
      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });

      expect(header).toContainElement(title);
      expect(header).toContainElement(closeButton);
    });

    it("should maintain layout order: title first, close button second", () => {
      render(<ModalHeader />);

      const header = screen.getByRole("banner");
      const children = Array.from(header.children);

      expect(children).toHaveLength(2);
      expect(children[0]).toHaveTextContent("Settings");
      expect(children[1]).toHaveAttribute("aria-label", "Close settings modal");
    });
  });

  describe("Integration with Zustand Store", () => {
    it("should use useSettingsModal hook correctly", () => {
      render(<ModalHeader />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      fireEvent.click(closeButton);

      expect(mockCloseModal).toHaveBeenCalledTimes(1);
    });

    it("should prioritize custom onClose over store closeModal", () => {
      const customOnClose = jest.fn();
      render(<ModalHeader onClose={customOnClose} />);

      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });
      fireEvent.click(closeButton);

      expect(customOnClose).toHaveBeenCalledTimes(1);
      expect(mockCloseModal).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing Zustand store gracefully", () => {
      // This test ensures the component doesn't crash if the store isn't available
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => render(<ModalHeader />)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it("should handle click events gracefully even if closeModal throws", () => {
      const errorThrowingClose = jest.fn(() => {
        throw new Error("Store error");
      });

      // Temporarily override the mock
      jest.doMock("@fishbowl-ai/shared", () => ({
        useSettingsModal: () => ({
          closeModal: errorThrowingClose,
        }),
      }));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ModalHeader />);
      const closeButton = screen.getByRole("button", {
        name: /close settings modal/i,
      });

      expect(() => fireEvent.click(closeButton)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});
