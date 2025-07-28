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

    it("renders card with proper structure", () => {
      render(<ProviderCard {...defaultProps} />);

      // Check for card container
      const card = screen.getByText("OpenAI").closest(".border");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("border", "border-border", "rounded-lg");
    });

    it("applies correct header typography", () => {
      render(<ProviderCard {...defaultProps} />);

      const header = screen.getByText("OpenAI");
      expect(header).toHaveClass("text-lg", "font-semibold");
    });
  });

  describe("API Key Input", () => {
    it("renders API key input field", () => {
      render(<ProviderCard {...defaultProps} />);

      expect(screen.getByLabelText("API Key")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your OpenAI API key"),
      ).toBeInTheDocument();
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
    it("renders show/hide toggle button", () => {
      render(<ProviderCard {...defaultProps} />);

      const toggleButton = screen.getByLabelText("Show API key");
      expect(toggleButton).toBeInTheDocument();
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
    it("renders test button with correct width", () => {
      render(<ProviderCard {...defaultProps} />);

      const testButton = screen.getByText("Test");
      expect(testButton).toBeInTheDocument();
      expect(testButton).toHaveClass("w-20"); // 80px width
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
    it("renders advanced settings trigger", () => {
      render(<ProviderCard {...defaultProps} />);

      expect(screen.getByText("Advanced")).toBeInTheDocument();
    });

    it("displays chevron-right when collapsed", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={false} />);

      const trigger = screen.getByText("Advanced");
      expect(trigger.querySelector("svg")).toBeInTheDocument();
    });

    it("displays chevron-down when expanded", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={true} />);

      const trigger = screen.getByText("Advanced");
      expect(trigger.querySelector("svg")).toBeInTheDocument();
    });

    it("calls onToggleAdvanced when trigger is clicked", () => {
      const onToggleAdvanced = jest.fn();
      render(
        <ProviderCard {...defaultProps} onToggleAdvanced={onToggleAdvanced} />,
      );

      const trigger = screen.getByText("Advanced");
      fireEvent.click(trigger);

      expect(onToggleAdvanced).toHaveBeenCalledTimes(1);
    });

    it("shows base URL input when expanded", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={true} />);

      expect(screen.getByLabelText("Base URL")).toBeInTheDocument();
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

      const trigger = screen.getByText("Advanced");
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(trigger).toHaveAttribute(
        "aria-controls",
        "openai-advanced-settings",
      );

      const content = screen.getByLabelText("Base URL").closest("div");
      expect(content).toHaveAttribute("id", "openai-advanced-settings");
    });

    it("includes helper text for base URL field", () => {
      render(<ProviderCard {...defaultProps} showAdvanced={true} />);

      expect(
        screen.getByText("Override the default API endpoint URL for OpenAI"),
      ).toBeInTheDocument();

      const helperText = screen.getByText(
        "Override the default API endpoint URL for OpenAI",
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
        screen.getByText("Override the default API endpoint URL for OpenAI"),
      ).toBeInTheDocument();
    });

    it("maintains proper focus management", () => {
      render(<ProviderCard {...defaultProps} />);

      const apiKeyInput = screen.getByLabelText("API Key");
      const toggleButton = screen.getByLabelText("Show API key");
      const testButton = screen.getByText("Test");
      const advancedTrigger = screen.getByText("Advanced");

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
      expect(
        screen.getByPlaceholderText("Enter your Anthropic API key"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("https://api.anthropic.com/v1"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Test connection to Anthropic API"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Override the default API endpoint URL for Anthropic"),
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
});
