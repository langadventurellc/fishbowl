import type { SettingsSection, SettingsSubTab } from "@fishbowl-ai/ui-shared";
import { act, renderHook } from "@testing-library/react";
import type { NavigationKeyboardOptions } from "../types/NavigationKeyboardOptions";
import { useNavigationKeyboard } from "../useNavigationKeyboard";

// Mock keyboard events helper
const createKeyboardEvent = (
  key: string,
  options: Partial<KeyboardEvent> = {},
): any => ({
  key,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...options,
});

describe("useNavigationKeyboard", () => {
  const mockSections = [
    { id: "general" as SettingsSection, label: "General", hasSubTabs: false },
    {
      id: "llm-setup" as SettingsSection,
      label: "API Keys",
      hasSubTabs: false,
    },
    {
      id: "agents" as SettingsSection,
      label: "Agents",
      hasSubTabs: true,
      subTabs: [
        { id: "library" as SettingsSubTab, label: "Library" },
        { id: "templates" as SettingsSubTab, label: "Templates" },
        { id: "defaults" as SettingsSubTab, label: "Defaults" },
      ],
    },
  ] as const;

  const mockOnSectionChange = jest.fn();
  const mockOnSubTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultOptions: NavigationKeyboardOptions = {
    sections: mockSections,
    activeSection: "general",
    activeSubTab: null,
    onSectionChange: mockOnSectionChange,
    onSubTabChange: mockOnSubTabChange,
  };

  describe("initialization", () => {
    it("should provide flattened navigation items", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard(defaultOptions),
      );
      const flatItems = result.current.getFlatItems();

      expect(flatItems).toHaveLength(3); // Only main sections when no active section with sub-tabs
      expect(flatItems[0]).toEqual({
        id: "general",
        type: "section",
        label: "General",
      });
      expect(flatItems[1]).toEqual({
        id: "llm-setup",
        type: "section",
        label: "API Keys",
      });
      expect(flatItems[2]).toEqual({
        id: "agents",
        type: "section",
        label: "Agents",
      });
    });

    it("should include sub-tabs when section is active", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "agents",
        }),
      );
      const flatItems = result.current.getFlatItems();

      expect(flatItems).toHaveLength(6); // 3 sections + 3 sub-tabs
      expect(flatItems[3]).toEqual({
        id: "library",
        type: "subtab",
        parentId: "agents",
        label: "Library",
      });
      expect(flatItems[4]).toEqual({
        id: "templates",
        type: "subtab",
        parentId: "agents",
        label: "Templates",
      });
      expect(flatItems[5]).toEqual({
        id: "defaults",
        type: "subtab",
        parentId: "agents",
        label: "Defaults",
      });
    });
  });

  describe("focus tracking", () => {
    it("should identify focused section correctly", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard(defaultOptions),
      );

      expect(result.current.isItemFocused("general", "section")).toBe(true);
      expect(result.current.isItemFocused("llm-setup", "section")).toBe(false);
    });

    it("should identify focused sub-tab correctly", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "agents",
          activeSubTab: "library",
        }),
      );

      expect(result.current.isItemFocused("library", "subtab")).toBe(true);
      expect(result.current.isItemFocused("templates", "subtab")).toBe(false);
    });

    it("should prioritize sub-tab focus over section focus", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "agents",
          activeSubTab: "library",
        }),
      );

      expect(result.current.isItemFocused("agents", "section")).toBe(false);
      expect(result.current.isItemFocused("library", "subtab")).toBe(true);
    });
  });

  describe("section navigation", () => {
    it("should navigate between main sections with arrow keys", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard(defaultOptions),
      );
      const event = createKeyboardEvent("ArrowDown");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnSectionChange).toHaveBeenCalledWith("llm-setup");
      expect(mockOnSubTabChange).not.toHaveBeenCalled();
    });

    it("should navigate from sub-tab to section with ArrowUp", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "agents",
          activeSubTab: "templates", // Start from templates sub-tab
        }),
      );

      // ArrowUp from templates should go to library (previous sub-tab)
      const event = createKeyboardEvent("ArrowUp");

      act(() => {
        result.current.handleKeyDown(event);
      });

      // Should navigate to previous sub-tab (library)
      expect(mockOnSubTabChange).toHaveBeenCalledWith("library");
    });

    it("should activate section on Enter key", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "general",
        }),
      );
      const event = createKeyboardEvent("Enter");

      act(() => {
        result.current.handleKeyDown(event);
      });

      // Should not change section since already active, and general has no sub-tabs
      expect(mockOnSectionChange).not.toHaveBeenCalled();
      expect(mockOnSubTabChange).not.toHaveBeenCalled();
    });

    it("should expand sub-tabs when activating section with sub-tabs", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "agents",
          activeSubTab: null,
        }),
      );
      const event = createKeyboardEvent("Enter");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnSubTabChange).toHaveBeenCalledWith("library");
    });
  });

  describe("sub-tab navigation", () => {
    it("should navigate between sub-tabs with arrow keys", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "agents",
          activeSubTab: "library",
        }),
      );
      const event = createKeyboardEvent("ArrowDown");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnSubTabChange).toHaveBeenCalledWith("templates");
      expect(mockOnSectionChange).not.toHaveBeenCalled();
    });

    it("should activate sub-tab on Enter key", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "agents",
          activeSubTab: "library",
        }),
      );
      const event = createKeyboardEvent("Enter");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnSubTabChange).toHaveBeenCalledWith("library");
    });

    it("should navigate from last sub-tab to next section", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "agents",
          activeSubTab: "defaults",
        }),
      );
      const event = createKeyboardEvent("ArrowDown");

      act(() => {
        result.current.handleKeyDown(event);
      });

      // Should wrap around to first section or handle boundary appropriately
      expect(mockOnSectionChange).toHaveBeenCalled();
    });
  });

  describe("Home and End navigation", () => {
    it("should jump to first item on Home key", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "agents",
          activeSubTab: "templates",
        }),
      );
      const event = createKeyboardEvent("Home");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnSectionChange).toHaveBeenCalledWith("general");
      expect(mockOnSubTabChange).toHaveBeenCalledWith(null);
    });

    it("should jump to last item on End key", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "general",
        }),
      );
      const event = createKeyboardEvent("End");

      act(() => {
        result.current.handleKeyDown(event);
      });

      // Should navigate to last available item
      expect(mockOnSectionChange).toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("should not respond to keyboard events when disabled", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          disabled: true,
        }),
      );
      const event = createKeyboardEvent("ArrowDown");

      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnSectionChange).not.toHaveBeenCalled();
      expect(mockOnSubTabChange).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty sections array", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          sections: [],
        }),
      );

      const flatItems = result.current.getFlatItems();
      expect(flatItems).toHaveLength(0);

      const event = createKeyboardEvent("ArrowDown");
      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(mockOnSectionChange).not.toHaveBeenCalled();
    });

    it("should handle section without sub-tabs properly", () => {
      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          activeSection: "general",
        }),
      );
      const event = createKeyboardEvent("Enter");

      act(() => {
        result.current.handleKeyDown(event);
      });

      // Should not attempt to activate sub-tabs for sections that don't have them
      expect(mockOnSubTabChange).not.toHaveBeenCalled();
    });

    it("should filter out null sub-tab IDs", () => {
      const sectionsWithNull = [
        {
          id: "general" as SettingsSection,
          label: "Test",
          hasSubTabs: true,
          subTabs: [
            { id: "library" as SettingsSubTab, label: "Valid" },
            { id: null as SettingsSubTab, label: "Invalid" },
          ],
        },
      ] as const;

      const { result } = renderHook(() =>
        useNavigationKeyboard({
          ...defaultOptions,
          sections: sectionsWithNull,
          activeSection: "general",
        }),
      );

      const flatItems = result.current.getFlatItems();
      const subTabs = flatItems.filter((item) => item.type === "subtab");

      expect(subTabs).toHaveLength(1);
      expect(subTabs[0]?.id).toBe("library");
    });
  });

  describe("focus management integration", () => {
    it("should update focused index when switching between sections and sub-tabs", () => {
      const { result, rerender } = renderHook(
        (props) => useNavigationKeyboard(props),
        { initialProps: defaultOptions },
      );

      // Initially focused on general section
      expect(result.current.focusedIndex).toBe(0);

      // Switch to agents section with sub-tabs
      rerender({
        ...defaultOptions,
        activeSection: "agents",
        activeSubTab: "library",
      });

      // Should now be focused on library sub-tab (index 3 in flattened list)
      expect(result.current.focusedIndex).toBe(3);
    });
  });
});
