/**
 * Unit tests for LlmProviderCard component.
 *
 * Tests provider-specific rendering, API key masking, callbacks,
 * accessibility, and React.memo optimization.
 *
 * @module components/settings/llm-setup/__tests__/LlmProviderCard.test
 */
import type { LlmConfigMetadata } from "@fishbowl-ai/shared";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { LlmProviderCard } from "../LlmProviderCard";

describe("LlmProviderCard", () => {
  const mockConfig: LlmConfigMetadata = {
    id: "test-id-1",
    customName: "My OpenAI Config",
    provider: "openai",
    baseUrl: undefined,
    useAuthHeader: false,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Provider Type Rendering", () => {
    it("renders OpenAI configuration correctly", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByText("My OpenAI Config")).toBeInTheDocument();
      expect(screen.getByText("OpenAI")).toBeInTheDocument();
      expect(screen.getByText("sk-...****")).toBeInTheDocument();
      expect(screen.getByText(/just now|minute/)).toBeInTheDocument();
    });

    it("renders Anthropic configuration correctly", () => {
      const anthropicConfig: LlmConfigMetadata = {
        ...mockConfig,
        provider: "anthropic",
        customName: "Claude API",
      };

      render(
        <LlmProviderCard
          configuration={anthropicConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByText("Claude API")).toBeInTheDocument();
      expect(screen.getByText("Anthropic")).toBeInTheDocument();
      expect(screen.getByText("sk-ant-...****")).toBeInTheDocument();
    });

    it("handles unknown provider type", () => {
      const unknownConfig: LlmConfigMetadata = {
        ...mockConfig,
        // @ts-ignore - Testing unknown provider handling
        provider: "unknown",
        customName: "Unknown Provider",
      };

      render(
        <LlmProviderCard
          configuration={unknownConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByText("Unknown Provider")).toBeInTheDocument();
      expect(screen.getByText("Unknown")).toBeInTheDocument();
      expect(screen.getByText("****")).toBeInTheDocument();
    });
  });

  describe("Security - API Key Masking", () => {
    it("masks API keys securely for all providers", () => {
      const providers = ["openai", "anthropic"] as const;
      const expectedMasks = [
        "sk-...****",
        "sk-ant-...****",
        "AIza...****",
        "****...****",
      ];

      providers.forEach((provider, index) => {
        const config: LlmConfigMetadata = {
          ...mockConfig,
          provider,
          customName: `${provider} config`,
        };

        const { unmount } = render(
          <LlmProviderCard
            configuration={config}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />,
        );

        expect(screen.getByText(expectedMasks[index]!)).toBeInTheDocument();

        // Ensure no actual API key patterns are visible
        expect(
          screen.queryByText(/sk-[a-zA-Z0-9]{20,}/),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/AIza[a-zA-Z0-9]{20,}/),
        ).not.toBeInTheDocument();

        unmount();
      });
    });

    it("never displays actual API key values", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      // Should only show masked format
      expect(screen.getByText("sk-...****")).toBeInTheDocument();

      // Should not show any realistic API key patterns
      expect(screen.queryByText(/sk-[a-zA-Z0-9]/)).not.toBeInTheDocument();
      expect(screen.queryByText(/test-api-key/)).not.toBeInTheDocument();
    });
  });

  describe("Callback Functions", () => {
    it("calls onEdit with correct configuration", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const editButton = screen.getByLabelText(
        "Edit My OpenAI Config configuration",
      );
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockConfig);
    });

    it("calls onDelete with correct ID", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const deleteButton = screen.getByLabelText(
        "Delete My OpenAI Config configuration",
      );
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith("test-id-1");
    });

    it("handles multiple rapid clicks correctly", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const editButton = screen.getByLabelText(
        "Edit My OpenAI Config configuration",
      );

      // Simulate rapid clicking
      fireEvent.click(editButton);
      fireEvent.click(editButton);
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(3);
      expect(mockOnEdit).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe("Date and Time Display", () => {
    it("displays 'just now' for recent timestamps", () => {
      const recentConfig: LlmConfigMetadata = {
        ...mockConfig,
        updatedAt: new Date().toISOString(),
      };

      render(
        <LlmProviderCard
          configuration={recentConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByText("Updated just now")).toBeInTheDocument();
    });

    it("displays relative time for older timestamps", () => {
      const oldConfig: LlmConfigMetadata = {
        ...mockConfig,
        updatedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      };

      render(
        <LlmProviderCard
          configuration={oldConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByText(/Updated 2 hours ago/)).toBeInTheDocument();
    });

    it("displays days for very old timestamps", () => {
      const veryOldConfig: LlmConfigMetadata = {
        ...mockConfig,
        updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
      };

      render(
        <LlmProviderCard
          configuration={veryOldConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByText(/Updated 7 days ago/)).toBeInTheDocument();
    });

    it("displays absolute date for very old timestamps", () => {
      const ancientConfig: LlmConfigMetadata = {
        ...mockConfig,
        updatedAt: new Date(Date.now() - 86400000 * 40).toISOString(), // 40 days ago
      };

      render(
        <LlmProviderCard
          configuration={ancientConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      // Should show a formatted date instead of relative time
      const updateText = screen.getByText(/Updated/);
      expect(updateText.textContent).toMatch(/Updated \d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const card = screen.getByRole("article");
      expect(card).toHaveAttribute(
        "aria-label",
        "LLM configuration for My OpenAI Config using OpenAI",
      );

      const editButton = screen.getByLabelText(
        "Edit My OpenAI Config configuration",
      );
      expect(editButton).toBeInTheDocument();

      const deleteButton = screen.getByLabelText(
        "Delete My OpenAI Config configuration",
      );
      expect(deleteButton).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const editButton = screen.getByLabelText(
        "Edit My OpenAI Config configuration",
      );
      const deleteButton = screen.getByLabelText(
        "Delete My OpenAI Config configuration",
      );

      // Buttons should be focusable
      editButton.focus();
      expect(editButton).toHaveFocus();

      deleteButton.focus();
      expect(deleteButton).toHaveFocus();
    });

    it("provides screen reader friendly content structure", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      // Check for proper heading structure
      const title = screen.getByRole("heading", { level: 3 });
      expect(title).toHaveTextContent("My OpenAI Config");

      // Check for article role on card
      expect(screen.getByRole("article")).toBeInTheDocument();
    });
  });

  describe("Performance - React.memo", () => {
    it("does not re-render when props are unchanged", () => {
      const { rerender } = render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const initialEditButton = screen.getByLabelText(
        "Edit My OpenAI Config configuration",
      );

      // Re-render with identical props
      rerender(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const afterEditButton = screen.getByLabelText(
        "Edit My OpenAI Config configuration",
      );

      // Should be the same DOM element (React.memo prevented re-render)
      expect(initialEditButton).toBe(afterEditButton);
    });

    it("re-renders when configuration changes", () => {
      const { rerender } = render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByText("My OpenAI Config")).toBeInTheDocument();

      const updatedConfig = {
        ...mockConfig,
        customName: "Updated Config Name",
        updatedAt: new Date().toISOString(),
      };

      rerender(
        <LlmProviderCard
          configuration={updatedConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByText("Updated Config Name")).toBeInTheDocument();
      expect(screen.queryByText("My OpenAI Config")).not.toBeInTheDocument();
    });

    it("re-renders when className changes", () => {
      const { rerender } = render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          className="initial-class"
        />,
      );

      const card = screen.getByRole("article");
      expect(card).toHaveClass("initial-class");

      rerender(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          className="updated-class"
        />,
      );

      expect(card).toHaveClass("updated-class");
      expect(card).not.toHaveClass("initial-class");
    });
  });

  describe("Visual Design", () => {
    it("applies custom className when provided", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          className="custom-test-class"
        />,
      );

      const card = screen.getByRole("article");
      expect(card).toHaveClass("custom-test-class");
    });

    it("has hover shadow transition class", () => {
      render(
        <LlmProviderCard
          configuration={mockConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const card = screen.getByRole("article");
      expect(card).toHaveClass("hover:shadow-md");
      expect(card).toHaveClass("transition-shadow");
    });

    it("displays provider icons for visual distinction", () => {
      const providers = ["openai", "anthropic"] as const;

      providers.forEach((provider) => {
        const config: LlmConfigMetadata = {
          ...mockConfig,
          provider,
          customName: `${provider} config`,
        };

        const { container, unmount } = render(
          <LlmProviderCard
            configuration={config}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />,
        );

        // Check that SVG icons are present (lucide-react icons render as SVG)
        const svgIcon = container.querySelector("svg");
        expect(svgIcon).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles extremely long custom names", () => {
      const longNameConfig: LlmConfigMetadata = {
        ...mockConfig,
        customName:
          "This is an extremely long custom name that should be truncated properly to prevent layout issues in the user interface",
      };

      render(
        <LlmProviderCard
          configuration={longNameConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      const title = screen.getByRole("heading", { level: 3 });
      expect(title).toHaveClass("truncate");
    });

    it("handles missing optional fields gracefully", () => {
      const minimalConfig: LlmConfigMetadata = {
        id: "minimal-1",
        customName: "Minimal Config",
        provider: "openai",
        // baseUrl is undefined
        useAuthHeader: false,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      };

      render(
        <LlmProviderCard
          configuration={minimalConfig}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />,
      );

      expect(screen.getByText("Minimal Config")).toBeInTheDocument();
      expect(screen.getByText("OpenAI")).toBeInTheDocument();
      expect(screen.queryByText("Base URL:")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Uses authorization header"),
      ).not.toBeInTheDocument();
    });
  });
});
