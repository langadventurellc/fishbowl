import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProviderCard } from "../ProviderCard";

const mockProvider = {
  id: "openai",
  name: "OpenAI",
  defaultBaseUrl: "https://api.openai.com/v1",
};

const defaultProps = {
  provider: mockProvider,
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  status: "untested" as const,
  showApiKey: false,
  showAdvanced: false,
  onApiKeyChange: jest.fn(),
  onBaseUrlChange: jest.fn(),
  onToggleApiKey: jest.fn(),
  onToggleAdvanced: jest.fn(),
  onTest: jest.fn(),
  errors: undefined,
  isValidating: false,
};

describe("ProviderCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders provider card without errors", () => {
      expect(() => {
        render(<ProviderCard {...defaultProps} />);
      }).not.toThrow();
    });

    it("displays provider name in header", () => {
      render(<ProviderCard {...defaultProps} />);

      expect(screen.getByText("OpenAI")).toBeInTheDocument();
      expect(screen.getByText("OpenAI").tagName).toBe("H3");
    });

    it("renders card with proper responsive structure", () => {
      render(<ProviderCard {...defaultProps} />);

      // Check for card container with responsive classes
      const card = screen.getByText("OpenAI").closest(".w-full.border");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        "w-full",
        "border",
        "border-border",
        "rounded-lg",
      );
    });

    it("applies correct responsive header typography", () => {
      render(<ProviderCard {...defaultProps} />);

      const header = screen.getByText("OpenAI");
      expect(header).toHaveClass("text-base", "sm:text-lg", "font-semibold");
    });
  });

  describe("API Key Input", () => {
    it("renders API key input field with mobile-optimized attributes", () => {
      render(<ProviderCard {...defaultProps} />);

      const input = screen.getByLabelText("API Key");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("autoComplete", "off");
      expect(input).toHaveAttribute("autoCapitalize", "none");
      expect(input).toHaveAttribute("autoCorrect", "off");
      expect(input).toHaveAttribute("spellCheck", "false");
      expect(input).toHaveAttribute("inputMode", "text");
    });

    it("displays API key input as password type by default", () => {
      render(<ProviderCard {...defaultProps} />);

      const input = screen.getByLabelText("API Key");
      expect(input).toHaveAttribute("type", "password");
    });

    it("displays API key value when provided", () => {
      render(<ProviderCard {...defaultProps} apiKey="test-api-key-123" />);

      const input = screen.getByLabelText("API Key") as HTMLInputElement;
      expect(input.value).toBe("test-api-key-123");
    });

    it("calls onApiKeyChange when input value changes", () => {
      const onApiKeyChange = jest.fn();
      render(
        <ProviderCard {...defaultProps} onApiKeyChange={onApiKeyChange} />,
      );

      const input = screen.getByLabelText("API Key");
      fireEvent.change(input, { target: { value: "new-api-key" } });

      expect(onApiKeyChange).toHaveBeenCalledWith("new-api-key");
    });

    it("has proper accessibility attributes for API key input", () => {
      render(<ProviderCard {...defaultProps} />);

      const input = screen.getByLabelText("API Key");
      expect(input).toHaveAttribute("id", "openai-api-key");
      expect(input).toHaveAttribute(
        "aria-describedby",
        "openai-api-key-description",
      );
    });
  });

  describe("Show/Hide API Key Toggle", () => {
    it("renders show/hide toggle button with touch-friendly sizing", () => {
      render(<ProviderCard {...defaultProps} />);

      const toggleButton = screen.getByLabelText("Show API key");
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveClass(
        "min-h-[var(--dt-touch-min-mobile)]",
        "min-w-[var(--dt-touch-min-mobile)]",
        "sm:min-h-[var(--dt-touch-min-desktop)]",
        "sm:min-w-[var(--dt-touch-min-desktop)]",
      );
    });

    it("displays eye icon when API key is hidden", () => {
      render(<ProviderCard {...defaultProps} showApiKey={false} />);

      const toggleButton = screen.getByLabelText("Show API key");
      expect(toggleButton.querySelector("svg")).toBeInTheDocument();
    });

    it("displays eye-off icon when API key is visible", () => {
      render(<ProviderCard {...defaultProps} showApiKey={true} />);

      const toggleButton = screen.getByLabelText("Hide API key");
      expect(toggleButton.querySelector("svg")).toBeInTheDocument();
    });

    it("changes input type to text when showApiKey is true", () => {
      render(<ProviderCard {...defaultProps} showApiKey={true} />);

      const input = screen.getByLabelText("API Key");
      expect(input).toHaveAttribute("type", "text");
    });

    it("calls onToggleApiKey when toggle button is clicked", () => {
      const onToggleApiKey = jest.fn();
      render(
        <ProviderCard {...defaultProps} onToggleApiKey={onToggleApiKey} />,
      );

      const toggleButton = screen.getByLabelText("Show API key");
      fireEvent.click(toggleButton);

      expect(onToggleApiKey).toHaveBeenCalledTimes(1);
    });

    it("updates ARIA live region when visibility changes", () => {
      const { rerender } = render(
        <ProviderCard {...defaultProps} showApiKey={false} />,
      );

      let liveRegion = screen.getByText("API key is hidden");
      expect(liveRegion).toHaveAttribute("aria-live", "polite");

      rerender(<ProviderCard {...defaultProps} showApiKey={true} />);

      liveRegion = screen.getByText("API key is visible");
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Status Indicator", () => {
    it("displays connected status with green checkmark", () => {
      render(<ProviderCard {...defaultProps} status="connected" />);

      expect(screen.getByText("Connected")).toBeInTheDocument();
      const checkIcon = screen.getByText("Connected").previousElementSibling;
      expect(checkIcon).toHaveClass("text-green-600");
    });

    it("displays error status with red X", () => {
      render(<ProviderCard {...defaultProps} status="error" />);

      expect(screen.getByText("Not connected")).toBeInTheDocument();
      const errorIcon =
        screen.getByText("Not connected").previousElementSibling;
      expect(errorIcon).toHaveClass("text-red-600");
    });

    it("displays untested status with gray X", () => {
      render(<ProviderCard {...defaultProps} status="untested" />);

      expect(screen.getByText("Not connected")).toBeInTheDocument();
      const untestedIcon =
        screen.getByText("Not connected").previousElementSibling;
      expect(untestedIcon).toHaveClass("text-gray-400");
    });

    it("applies proper color coding to status text", () => {
      const { rerender } = render(
        <ProviderCard {...defaultProps} status="connected" />,
      );
      expect(screen.getByText("Connected")).toHaveClass("text-green-600");

      rerender(<ProviderCard {...defaultProps} status="error" />);
      expect(screen.getByText("Not connected")).toHaveClass("text-red-600");

      rerender(<ProviderCard {...defaultProps} status="untested" />);
      expect(screen.getByText("Not connected")).toHaveClass("text-gray-400");
    });
  });

  describe("Test Button", () => {
    it("renders test button with responsive sizing and touch targets", () => {
      render(<ProviderCard {...defaultProps} />);

      const testButton = screen.getByText("Test");
      expect(testButton).toBeInTheDocument();
      expect(testButton).toHaveClass(
        "w-20",
        "h-9",
        "sm:w-[80px]",
        "sm:h-10",
        "min-h-[var(--dt-touch-min-mobile)]",
        "sm:min-h-[var(--dt-touch-min-desktop)]",
      );
    });

    it("has secondary variant styling", () => {
      render(<ProviderCard {...defaultProps} />);

      const testButton = screen.getByText("Test");
      expect(testButton).toHaveAttribute("type", "button");
    });

    it("calls onTest when clicked", () => {
      const onTest = jest.fn();
      render(<ProviderCard {...defaultProps} onTest={onTest} />);

      const testButton = screen.getByText("Test");
      fireEvent.click(testButton);

      expect(onTest).toHaveBeenCalledTimes(1);
    });

    it("has proper accessibility attributes", () => {
      render(<ProviderCard {...defaultProps} />);

      const testButton = screen.getByText("Test");
      expect(testButton).toHaveAttribute(
        "aria-describedby",
        "openai-test-description",
      );

      const description = screen.getByText("Test connection to OpenAI API");
      expect(description).toHaveAttribute("id", "openai-test-description");
      expect(description).toHaveClass("sr-only");
    });
  });

  describe("Collapsible Base URL Section", () => {
    it("renders advanced settings trigger with touch-friendly sizing", () => {
      render(<ProviderCard {...defaultProps} />);

      const trigger = screen.getByText("Base URL (Advanced)");
      expect(trigger).toBeInTheDocument();

      const button = trigger.closest("button");
      expect(button).toHaveClass(
        "min-h-[var(--dt-touch-min-mobile)]",
        "sm:min-h-auto",
      );
    });

    it("displays chevron-right when collapsed", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={false} />);

      const trigger = screen.getByText("Base URL (Advanced)");
      const button = trigger.closest("button");
      expect(button).toBeInTheDocument();
      expect(button?.querySelector("svg")).toBeInTheDocument();
    });

    it("displays chevron-down when expanded", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={true} />);

      const trigger = screen.getByText("Base URL (Advanced)");
      const button = trigger.closest("button");
      expect(button).toBeInTheDocument();
      expect(button?.querySelector("svg")).toBeInTheDocument();
    });

    it("calls onToggleAdvanced when trigger is clicked", () => {
      const onToggleAdvanced = jest.fn();
      render(
        <ProviderCard {...defaultProps} onToggleAdvanced={onToggleAdvanced} />,
      );

      const trigger = screen.getByText("Base URL (Advanced)");
      fireEvent.click(trigger);

      expect(onToggleAdvanced).toHaveBeenCalledTimes(1);
    });

    it("shows base URL input with mobile-optimized attributes when expanded", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={true} />);

      const baseUrlInput = screen.getByLabelText("Base URL");
      expect(baseUrlInput).toBeInTheDocument();
      expect(baseUrlInput).toHaveAttribute("inputMode", "url");
      expect(baseUrlInput).toHaveAttribute("autoComplete", "url");
      expect(baseUrlInput).toHaveAttribute("autoCapitalize", "none");
      expect(baseUrlInput).toHaveAttribute("autoCorrect", "off");
      expect(baseUrlInput).toHaveAttribute("spellCheck", "false");
      expect(
        screen.getByPlaceholderText("https://api.openai.com/v1"),
      ).toBeInTheDocument();
    });

    it("hides base URL input when collapsed", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={false} />);

      expect(screen.queryByLabelText("Base URL")).not.toBeInTheDocument();
    });

    it("displays base URL value when provided", () => {
      render(
        <ProviderCard
          {...defaultProps}
          showAdvanced={true}
          baseUrl="https://custom.api.com/v1"
        />,
      );

      const input = screen.getByLabelText("Base URL") as HTMLInputElement;
      expect(input.value).toBe("https://custom.api.com/v1");
    });

    it("calls onBaseUrlChange when base URL changes", () => {
      const onBaseUrlChange = jest.fn();
      render(
        <ProviderCard
          {...defaultProps}
          showAdvanced={true}
          onBaseUrlChange={onBaseUrlChange}
        />,
      );

      const input = screen.getByLabelText("Base URL");
      fireEvent.change(input, { target: { value: "https://new.api.com/v1" } });

      expect(onBaseUrlChange).toHaveBeenCalledWith("https://new.api.com/v1");
    });

    it("has proper ARIA attributes for collapsible content", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={true} />);

      const trigger = screen.getByText("Base URL (Advanced)");
      expect(trigger.closest("button")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      expect(trigger.closest("button")).toHaveAttribute(
        "aria-controls",
        "openai-advanced-settings",
      );

      const content = screen.getByLabelText("Base URL").closest("div");
      expect(content).toHaveAttribute("id", "openai-advanced-settings");
    });

    it("includes helper text for base URL field", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={true} />);

      expect(
        screen.getByText(
          "The base URL for API requests. Must use HTTPS for security.",
        ),
      ).toBeInTheDocument();

      const helperText = screen.getByText(
        "The base URL for API requests. Must use HTTPS for security.",
      );
      expect(helperText).toHaveAttribute("id", "openai-base-url-description");
      expect(helperText).toHaveClass("text-xs", "text-muted-foreground");
    });
  });

  describe("Accessibility", () => {
    it("provides proper labels for all form elements", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={true} />);

      expect(screen.getByLabelText("API Key")).toBeInTheDocument();
      expect(screen.getByLabelText("Base URL")).toBeInTheDocument();
    });

    it("includes screen reader descriptions for interactive elements", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={true} />);

      // API key description
      expect(screen.getByText("API key is hidden")).toHaveClass("sr-only");

      // Test button description
      expect(screen.getByText("Test connection to OpenAI API")).toHaveClass(
        "sr-only",
      );

      // Base URL description
      expect(
        screen.getByText(
          "The base URL for API requests. Must use HTTPS for security.",
        ),
      ).toBeInTheDocument();
    });

    it("maintains proper focus management", () => {
      render(<ProviderCard {...defaultProps} />);

      const apiKeyInput = screen.getByLabelText("API Key");
      const toggleButton = screen.getByLabelText("Show API key");
      const testButton = screen.getByText("Test");
      const advancedTrigger = screen.getByText("Base URL (Advanced)");

      // All interactive elements should be focusable
      expect(apiKeyInput).not.toHaveAttribute("tabindex", "-1");
      expect(toggleButton).not.toHaveAttribute("tabindex", "-1");
      expect(testButton).not.toHaveAttribute("tabindex", "-1");
      expect(advancedTrigger).not.toHaveAttribute("tabindex", "-1");
    });
  });

  describe("Different Providers", () => {
    it("adapts content for Anthropic provider", () => {
      const anthropicProvider = {
        id: "anthropic",
        name: "Anthropic",
        defaultBaseUrl: "https://api.anthropic.com/v1",
      };

      render(
        <ProviderCard
          {...defaultProps}
          provider={anthropicProvider}
          showAdvanced={true}
        />,
      );

      expect(screen.getByText("Anthropic")).toBeInTheDocument();
      // Placeholder text may be mobile-friendly, so check input exists
      expect(screen.getByLabelText("API Key")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("https://api.anthropic.com/v1"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Test connection to Anthropic API"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "The base URL for API requests. Must use HTTPS for security.",
        ),
      ).toBeInTheDocument();
    });

    it("generates unique IDs for different providers", () => {
      const anthropicProvider = {
        id: "anthropic",
        name: "Anthropic",
        defaultBaseUrl: "https://api.anthropic.com/v1",
      };

      render(
        <ProviderCard
          {...defaultProps}
          provider={anthropicProvider}
          showAdvanced={true}
        />,
      );

      expect(screen.getByLabelText("API Key")).toHaveAttribute(
        "id",
        "anthropic-api-key",
      );
      expect(screen.getByLabelText("Base URL")).toHaveAttribute(
        "id",
        "anthropic-base-url",
      );
    });
  });

  describe("Component Props Interface", () => {
    it("accepts all required props without TypeScript errors", () => {
      // This test ensures the component interface matches the specified props
      const testProps = {
        provider: {
          id: "test-provider",
          name: "Test Provider",
          defaultBaseUrl: "https://test.api.com/v1",
        },
        apiKey: "test-key",
        baseUrl: "https://custom.test.com/v1",
        status: "connected" as const,
        showApiKey: true,
        showAdvanced: true,
        onApiKeyChange: jest.fn(),
        onBaseUrlChange: jest.fn(),
        onToggleApiKey: jest.fn(),
        onToggleAdvanced: jest.fn(),
        onTest: jest.fn(),
      };

      expect(() => {
        render(<ProviderCard {...testProps} />);
      }).not.toThrow();
    });
  });

  describe("Validation Error Display", () => {
    describe("API Key Validation Errors", () => {
      it("displays API key error message when validation fails", () => {
        render(
          <ProviderCard
            {...defaultProps}
            errors={{ apiKey: "API key must be at least 20 characters" }}
          />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
          "API key must be at least 20 characters",
        );
      });

      it("applies error styling to API key input when validation fails", () => {
        render(
          <ProviderCard
            {...defaultProps}
            errors={{ apiKey: "Invalid API key format" }}
          />,
        );

        const input = screen.getByLabelText("API Key");
        expect(input).toHaveClass(
          "border-red-500",
          "focus:border-red-500",
          "focus:ring-red-200",
        );
      });

      it("sets aria-invalid attribute when API key has errors", () => {
        render(
          <ProviderCard
            {...defaultProps}
            errors={{ apiKey: "Invalid API key" }}
          />,
        );

        const input = screen.getByLabelText("API Key");
        expect(input).toHaveAttribute("aria-invalid", "true");
      });

      it("associates error message with API key input via aria-describedby", () => {
        render(
          <ProviderCard
            {...defaultProps}
            errors={{ apiKey: "Invalid API key" }}
          />,
        );

        const input = screen.getByLabelText("API Key");
        expect(input).toHaveAttribute(
          "aria-describedby",
          "openai-api-key-error openai-api-key-description",
        );

        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toHaveAttribute("id", "openai-api-key-error");
      });

      it("displays error with alert triangle icon", () => {
        render(
          <ProviderCard
            {...defaultProps}
            errors={{ apiKey: "Invalid API key" }}
          />,
        );

        const errorMessage = screen.getByRole("alert");
        expect(errorMessage.querySelector("svg")).toBeInTheDocument();
        expect(errorMessage).toHaveClass("text-red-600");
      });

      it("does not display error message when no API key error", () => {
        render(<ProviderCard {...defaultProps} />);

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    describe("Base URL Validation Errors", () => {
      it("displays base URL error message when validation fails", () => {
        render(
          <ProviderCard
            {...defaultProps}
            showAdvanced={true}
            errors={{ baseUrl: "URL must use HTTPS for security" }}
          />,
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
          "URL must use HTTPS for security",
        );
      });

      it("applies error styling to base URL input when validation fails", () => {
        render(
          <ProviderCard
            {...defaultProps}
            showAdvanced={true}
            errors={{ baseUrl: "Invalid URL format" }}
          />,
        );

        const input = screen.getByLabelText("Base URL");
        expect(input).toHaveClass(
          "border-red-500",
          "focus:border-red-500",
          "focus:ring-red-200",
        );
      });

      it("sets aria-invalid attribute when base URL has errors", () => {
        render(
          <ProviderCard
            {...defaultProps}
            showAdvanced={true}
            errors={{ baseUrl: "Invalid URL" }}
          />,
        );

        const input = screen.getByLabelText("Base URL");
        expect(input).toHaveAttribute("aria-invalid", "true");
      });

      it("associates error message with base URL input via aria-describedby", () => {
        render(
          <ProviderCard
            {...defaultProps}
            showAdvanced={true}
            errors={{ baseUrl: "Invalid URL" }}
          />,
        );

        const input = screen.getByLabelText("Base URL");
        expect(input).toHaveAttribute(
          "aria-describedby",
          "openai-base-url-error openai-base-url-description",
        );

        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toHaveAttribute("id", "openai-base-url-error");
      });

      it("displays updated helper text for base URL security", () => {
        render(<ProviderCard {...defaultProps} showAdvanced={true} />);

        expect(
          screen.getByText(
            "The base URL for API requests. Must use HTTPS for security.",
          ),
        ).toBeInTheDocument();
      });
    });

    describe("Multiple Validation Errors", () => {
      it("displays both API key and base URL errors simultaneously", () => {
        render(
          <ProviderCard
            {...defaultProps}
            showAdvanced={true}
            errors={{
              apiKey: "API key too short",
              baseUrl: "Invalid URL format",
            }}
          />,
        );

        const alerts = screen.getAllByRole("alert");
        expect(alerts).toHaveLength(2);
        expect(alerts[0]).toHaveTextContent("API key too short");
        expect(alerts[1]).toHaveTextContent("Invalid URL format");
      });

      it("applies error styling to both inputs when both have errors", () => {
        render(
          <ProviderCard
            {...defaultProps}
            showAdvanced={true}
            errors={{
              apiKey: "API key error",
              baseUrl: "Base URL error",
            }}
          />,
        );

        const apiKeyInput = screen.getByLabelText("API Key");
        const baseUrlInput = screen.getByLabelText("Base URL");

        expect(apiKeyInput).toHaveClass("border-red-500");
        expect(baseUrlInput).toHaveClass("border-red-500");
      });
    });
  });

  describe("Test Button Validation Enhancement", () => {
    it("disables test button when API key has validation errors", () => {
      render(
        <ProviderCard
          {...defaultProps}
          errors={{ apiKey: "Invalid API key" }}
        />,
      );

      const testButton = screen.getByRole("button", { name: /test/i });
      expect(testButton).toBeDisabled();
    });

    it("disables test button when base URL has validation errors", () => {
      render(
        <ProviderCard {...defaultProps} errors={{ baseUrl: "Invalid URL" }} />,
      );

      const testButton = screen.getByRole("button", { name: /test/i });
      expect(testButton).toBeDisabled();
    });

    it("disables test button when both inputs have validation errors", () => {
      render(
        <ProviderCard
          {...defaultProps}
          errors={{
            apiKey: "API key error",
            baseUrl: "Base URL error",
          }}
        />,
      );

      const testButton = screen.getByRole("button", { name: /test/i });
      expect(testButton).toBeDisabled();
    });

    it("enables test button when no validation errors exist", () => {
      render(<ProviderCard {...defaultProps} />);

      const testButton = screen.getByRole("button", { name: /test/i });
      expect(testButton).not.toBeDisabled();
    });

    it("does not call onTest when button is clicked with validation errors", () => {
      const onTest = jest.fn();
      render(
        <ProviderCard
          {...defaultProps}
          onTest={onTest}
          errors={{ apiKey: "Invalid API key" }}
        />,
      );

      const testButton = screen.getByRole("button", { name: /test/i });
      fireEvent.click(testButton);

      expect(onTest).not.toHaveBeenCalled();
    });
  });

  describe("Validation Loading State", () => {
    it("disables test button when validation is in progress", () => {
      render(<ProviderCard {...defaultProps} isValidating={true} />);

      const testButton = screen.getByRole("button", { name: /validating/i });
      expect(testButton).toBeDisabled();
    });

    it("displays validating text and spinner when validation is in progress", () => {
      render(<ProviderCard {...defaultProps} isValidating={true} />);

      const testButton = screen.getByRole("button", {
        name: /testing|validating/i,
      });
      expect(testButton).toHaveTextContent(/Testing|Validating/);
      expect(testButton.querySelector("svg")).toBeInTheDocument(); // Loader2 spinner
    });

    it("shows normal test button when not validating", () => {
      render(<ProviderCard {...defaultProps} isValidating={false} />);

      const testButton = screen.getByRole("button", { name: /test/i });
      expect(testButton).toHaveTextContent("Test");
      expect(testButton).not.toBeDisabled();
    });
  });

  describe("Accessibility Enhancements", () => {
    it("includes live region for error announcements", () => {
      render(
        <ProviderCard
          {...defaultProps}
          errors={{ apiKey: "Invalid API key format" }}
        />,
      );

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveAttribute("aria-live", "polite");
    });

    it("maintains proper focus order with error messages", () => {
      render(
        <ProviderCard
          {...defaultProps}
          showAdvanced={true}
          errors={{
            apiKey: "API key error",
            baseUrl: "Base URL error",
          }}
        />,
      );

      const apiKeyInput = screen.getByLabelText("API Key");
      const baseUrlInput = screen.getByLabelText("Base URL");
      const testButton = screen.getByRole("button", { name: /test/i });

      // Error messages should not interfere with tab order
      expect(apiKeyInput).not.toHaveAttribute("tabindex", "-1");
      expect(baseUrlInput).not.toHaveAttribute("tabindex", "-1");
      expect(testButton).not.toHaveAttribute("tabindex", "-1");
    });

    it("provides descriptive error messages for screen readers", () => {
      render(
        <ProviderCard
          {...defaultProps}
          errors={{ apiKey: "API key must be at least 20 characters long" }}
        />,
      );

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveTextContent(
        "API key must be at least 20 characters long",
      );
      expect(errorMessage).toHaveClass("text-red-600");
    });
  });
});
