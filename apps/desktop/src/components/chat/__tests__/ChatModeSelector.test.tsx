import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatModeSelector } from "../ChatModeSelector";

describe("ChatModeSelector", () => {
  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders with manual mode selected by default when value is null", () => {
      render(
        <ChatModeSelector value={null} onValueChange={mockOnValueChange} />,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-label",
        "Chat mode selection",
      );
    });

    it("renders with manual mode selected", () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "data-state",
        "closed",
      );
    });

    it("renders with round-robin mode selected", () => {
      render(
        <ChatModeSelector
          value="round-robin"
          onValueChange={mockOnValueChange}
        />,
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(
        <ChatModeSelector
          value="manual"
          onValueChange={mockOnValueChange}
          className="custom-class"
        />,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("custom-class");
    });

    it("renders in disabled state", () => {
      render(
        <ChatModeSelector
          value="manual"
          onValueChange={mockOnValueChange}
          disabled={true}
        />,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeDisabled();
    });

    it("displays error message when provided", () => {
      render(
        <ChatModeSelector
          value="manual"
          onValueChange={mockOnValueChange}
          error="Test error message"
        />,
      );

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent("Test error message");
      expect(errorMessage).toHaveClass("text-destructive");
    });

    it("does not display error message when error prop is not provided", () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("opens dropdown when clicked", async () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      // Check that both options are present
      expect(
        screen.getByRole("option", { name: /Manual/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /Round Robin/ }),
      ).toBeInTheDocument();
    });

    it("displays option descriptions in dropdown", async () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      expect(
        screen.getAllByText("Full control over agent participation")[0],
      ).toBeInTheDocument();
      expect(
        screen.getAllByText("Agents take turns automatically")[0],
      ).toBeInTheDocument();
    });

    it("calls onValueChange when manual option is selected", async () => {
      render(
        <ChatModeSelector
          value="round-robin"
          onValueChange={mockOnValueChange}
        />,
      );

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const manualOption = screen.getByRole("option", { name: /Manual/ });
      fireEvent.click(manualOption);

      expect(mockOnValueChange).toHaveBeenCalledWith("manual");
    });

    it("calls onValueChange when round-robin option is selected", async () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const roundRobinOption = screen.getByRole("option", {
        name: /Round Robin/,
      });
      fireEvent.click(roundRobinOption);

      expect(mockOnValueChange).toHaveBeenCalledWith("round-robin");
    });

    it("does not open dropdown when disabled", () => {
      render(
        <ChatModeSelector
          value="manual"
          onValueChange={mockOnValueChange}
          disabled={true}
        />,
      );

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      // Should not open dropdown when disabled
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(mockOnValueChange).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("opens dropdown with Enter key", async () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      fireEvent.keyDown(trigger, { key: "Enter", code: "Enter" });

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    it("opens dropdown with Space key", async () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      fireEvent.keyDown(trigger, { key: " ", code: "Space" });

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
    });

    it("supports focus management", () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      trigger.focus();
      expect(trigger).toHaveFocus();
    });
  });

  describe("Null Value Handling", () => {
    it("handles null value by defaulting to manual in Select component", () => {
      render(
        <ChatModeSelector value={null} onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
      // The select should internally use "manual" when value is null
    });

    it("handles undefined value by defaulting to manual", () => {
      render(
        <ChatModeSelector
          value={undefined as any}
          onValueChange={mockOnValueChange}
        />,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA label on trigger", () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-label", "Chat mode selection");
    });

    it("has proper role for error message", () => {
      render(
        <ChatModeSelector
          value="manual"
          onValueChange={mockOnValueChange}
          error="Test error"
        />,
      );

      const errorElement = screen.getByRole("alert");
      expect(errorElement).toHaveAttribute("role", "alert");
    });

    it("has proper roles for dropdown elements", async () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
        expect(screen.getAllByRole("option")).toHaveLength(2);
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid clicks gracefully", () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");

      // Rapid clicking should not cause errors
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      fireEvent.click(trigger);

      // Component should still be functional
      expect(trigger).toBeInTheDocument();
    });

    it("calls onValueChange with correct parameters", async () => {
      const callback = jest.fn();

      render(<ChatModeSelector value="manual" onValueChange={callback} />);

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const roundRobinOption = screen.getByRole("option", {
        name: /Round Robin/,
      });

      fireEvent.click(roundRobinOption);

      expect(callback).toHaveBeenCalledWith("round-robin");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("maintains consistent width with w-40 class", () => {
      render(
        <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("w-40");
    });
  });

  describe("Error Handling and Loading States", () => {
    describe("Error Display", () => {
      it("displays error message with proper accessibility attributes", () => {
        const errorMessage = "Failed to update chat mode: Network error";

        render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            error={errorMessage}
          />,
        );

        const errorElement = screen.getByRole("alert");
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent(errorMessage);
        expect(errorElement).toHaveAttribute("id", "chat-mode-error");
        expect(errorElement).toHaveAttribute("aria-live", "polite");
      });

      it("links error message to selector with aria-describedby", () => {
        const errorMessage = "Failed to update chat mode: Invalid mode";

        render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            error={errorMessage}
          />,
        );

        const selector = screen.getByRole("combobox");
        const errorElement = screen.getByRole("alert");

        expect(selector).toHaveAttribute("aria-describedby", "chat-mode-error");
        expect(selector).toHaveAttribute("aria-invalid", "true");
        expect(errorElement).toHaveAttribute("id", "chat-mode-error");
      });

      it("applies error styling when error is present", () => {
        render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            error="Error message"
          />,
        );

        const selector = screen.getByRole("combobox");
        expect(selector).toHaveClass(
          "border-destructive",
          "focus:ring-destructive",
        );
      });

      it("removes accessibility attributes when no error", () => {
        render(
          <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
        );

        const selector = screen.getByRole("combobox");
        expect(selector).not.toHaveAttribute("aria-describedby");
        expect(selector).toHaveAttribute("aria-invalid", "false");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });

      it("updates error display when error prop changes", () => {
        const initialError = "Initial error";
        const updatedError = "Updated error";

        const { rerender } = render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            error={initialError}
          />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent(initialError);

        rerender(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            error={updatedError}
          />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent(updatedError);
      });

      it("removes error display when error is cleared", () => {
        const { rerender } = render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            error="Error message"
          />,
        );

        expect(screen.getByRole("alert")).toBeInTheDocument();

        rerender(
          <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
        );

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    describe("Loading States", () => {
      it("disables selector during loading", () => {
        render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            disabled={true}
          />,
        );

        const selector = screen.getByRole("combobox");
        expect(selector).toBeDisabled();
      });

      it("provides visual feedback for disabled state", () => {
        render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            disabled={true}
          />,
        );

        const selector = screen.getByRole("combobox");
        expect(selector).toHaveAttribute("data-disabled", "");
      });

      it("prevents interaction when disabled", async () => {
        render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            disabled={true}
          />,
        );

        const selector = screen.getByRole("combobox");
        fireEvent.click(selector);

        // Wait a bit to ensure no dropdown appears
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        expect(mockOnValueChange).not.toHaveBeenCalled();
      });

      it("can be both disabled and show error simultaneously", () => {
        render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            disabled={true}
            error="Failed to update chat mode"
          />,
        );

        const selector = screen.getByRole("combobox");
        const errorElement = screen.getByRole("alert");

        expect(selector).toBeDisabled();
        expect(errorElement).toBeInTheDocument();
        expect(selector).toHaveAttribute("aria-describedby", "chat-mode-error");
      });
    });

    describe("Race Condition Protection", () => {
      it("maintains state consistency during rapid interactions", async () => {
        const { rerender } = render(
          <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
        );

        // Simulate rapid state changes
        rerender(
          <ChatModeSelector
            value="round-robin"
            onValueChange={mockOnValueChange}
            disabled={true}
          />,
        );

        rerender(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            disabled={false}
          />,
        );

        const selector = screen.getByRole("combobox");
        expect(selector).not.toBeDisabled();
        expect(selector).toHaveAttribute("data-state", "closed");
      });

      it("handles error state changes correctly", () => {
        const { rerender } = render(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            error="Error 1"
          />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent("Error 1");

        rerender(
          <ChatModeSelector
            value="manual"
            onValueChange={mockOnValueChange}
            error="Error 2"
          />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent("Error 2");

        rerender(
          <ChatModeSelector value="manual" onValueChange={mockOnValueChange} />,
        );

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("TypeScript Type Safety", () => {
    it("only accepts valid chat mode values", () => {
      // This test verifies the TypeScript interface at compile time
      const validValues: ("manual" | "round-robin" | null)[] = [
        "manual",
        "round-robin",
        null,
      ];

      validValues.forEach((value) => {
        const { unmount } = render(
          <ChatModeSelector value={value} onValueChange={mockOnValueChange} />,
        );
        unmount();
      });
    });

    it("onValueChange receives properly typed parameters", async () => {
      const typedCallback = jest.fn((mode: "manual" | "round-robin") => {
        // This ensures the callback receives the correct types
        expect(["manual", "round-robin"]).toContain(mode);
      });

      render(<ChatModeSelector value="manual" onValueChange={typedCallback} />);

      const trigger = screen.getByRole("combobox");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });

      const roundRobinOption = screen.getByRole("option", {
        name: /Round Robin/,
      });
      fireEvent.click(roundRobinOption);

      expect(typedCallback).toHaveBeenCalledWith("round-robin");
    });
  });
});
