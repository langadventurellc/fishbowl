---
kind: feature
id: F-layout-display-components
title: Layout Display Components
status: done
priority: low
prerequisites:
  - F-message-display-components
  - F-sidebar-display-components
  - F-input-display-components
created: "2025-07-23T19:08:51.180429"
updated: "2025-07-25T04:29:50.973022+00:00"
schema_version: "1.1"
parent: E-core-component-extraction
---

# Layout Display Components

## Purpose

Extract high-level layout components that compose smaller components into screen sections, focusing purely on visual structure and positioning without any added interactive functionality.

## Source References

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` (~1326 lines)
- **Theme System**: `packages/ui-theme/src/claymorphism-theme.css`

## Target Components

### ConversationScreenDisplay Component

- **Purpose**: Root layout component showing overall screen structure
- **Props**: sidebar visible, main content, theme mode, layout variant
- **Styling**: Full-screen layout with proper grid/flex positioning

### MainContentPanelDisplay Component

- **Purpose**: Primary content area layout container
- **Props**: messages, input area, agent labels, scroll state
- **Styling**: Flex column layout with proper spacing and overflow

### ChatContainerDisplay Component

- **Location in DesignPrototype**: Lines 354-361
- **Purpose**: Messages area layout wrapper
- **Props**: messages array, scroll position, empty state
- **Styling**: Scrollable container with proper padding and spacing

### AgentLabelsContainerDisplay Component

- **Purpose**: Top area showing active agents
- **Props**: agents array, layout direction, spacing variant
- **Styling**: Horizontal flex layout with agent pill positioning

### ConversationLayoutDisplay Component

- **Purpose**: Overall conversation interface layout
- **Props**: sidebar component, main content, responsive breakpoints
- **Styling**: Responsive grid layout with sidebar and main areas

## Acceptance Criteria

✅ **Component Structure**

- Each component in `apps/desktop/src/components/layout/` directory
- Pure layout components with no business logic or state
- Props-based composition of child components
- **CRITICAL**: Component props interfaces MUST be created in `packages/shared/src/types/`
- Components themselves are created in `apps/desktop/src/components/layout/`

✅ **Visual Fidelity**

- Exact match with DesignPrototype layout structure
- All spacing, margins, and padding preserved
- Responsive behavior and breakpoints maintained
- Grid and flexbox layouts preserved perfectly

✅ **Layout Composition**

- Components properly compose smaller UI components
- Clean separation between layout and content components
- Consistent spacing and alignment patterns
- Proper overflow and scrolling behavior display

✅ **Responsive Display**

- Mobile and desktop layout variants
- Sidebar collapse/expand layout changes
- Content area responsive behavior
- Proper viewport handling and spacing

✅ **Showcase Integration** (CRITICAL - Done as components are created)

- Each layout component added to ComponentShowcase as it's created
- Different layout configurations demonstrated immediately in showcase
- Responsive breakpoints shown
- Both light and dark theme compatibility tested

✅ **Code Quality**

- No added interactive functionality
- No state management or event handling
- Pure CSS-in-JS styling with theme variables
- Components focused on layout structure only
- TypeScript strict mode compliance

## Implementation Guidance

**Extraction Process:**

1. Identify layout structure patterns in `apps/desktop/src/pages/DesignPrototype.tsx` (lines 354-361 and related sections)
2. Extract CSS Grid and Flexbox layout styling from DesignPrototype
3. Convert styling to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
4. **MUST reuse existing components** from previous features (message, sidebar, input components)
5. **Create component props interfaces in shared package** (`packages/shared/src/types/`)
6. **Immediately add each component to ComponentShowcase** for visual verification

**Component Reuse Requirements:**

- **Chat/Message Components**: Use existing components from `apps/desktop/src/components/chat/`
  - `MessageItem`, `MessageContent`, `MessageHeader`, `MessageAvatar`, `AgentPill`, `ThinkingIndicator`
- **Sidebar Components**: Use existing components from `apps/desktop/src/components/sidebar/`
  - `SidebarContainerDisplay`, `SidebarHeaderDisplay`, `ConversationListDisplay`, `ConversationItemDisplay`, `SidebarToggleDisplay`
- **Input Components**: Use existing components from `apps/desktop/src/components/input/`
  - `InputContainerDisplay`, `MessageInputDisplay`, `SendButtonDisplay`, `ConversationModeToggleDisplay`, `Button`
- **Menu Components**: Use existing components from `apps/desktop/src/components/menu/`
  - `ContextMenuDisplay`, `MenuItemDisplay`, `MenuTriggerDisplay`
- Import and compose these existing components rather than recreating functionality

**Layout Patterns to Preserve:**

- **ConversationScreenDisplay**: Full-screen grid with sidebar and main areas
- **MainContentPanelDisplay**: Vertical flex with header, content, footer
- **ChatContainerDisplay**: Scrollable content area with proper overflow
- **AgentLabelsContainerDisplay**: Horizontal flex with responsive wrapping

**Styling Focus:**

- Preserve exact spacing and positioning from design
- Maintain responsive breakpoints and behavior
- Keep proper z-index layering for overlays
- Use existing theme variables for backgrounds and borders

**File Organization:**

```
# Component Props Interfaces (CRITICAL - Create in shared package)
packages/shared/src/types/
├── layout-display.types.ts (all layout component prop interfaces)

# Layout Components (Create in desktop app)
apps/desktop/src/components/layout/
├── index.ts (barrel export)
├── ConversationScreenDisplay.tsx
├── MainContentPanelDisplay.tsx
├── ChatContainerDisplay.tsx
├── AgentLabelsContainerDisplay.tsx
└── ConversationLayoutDisplay.tsx
```

## Testing Requirements

**NO AUTOMATED TESTING REQUIRED** - All verification will be done manually by the user:

- Visual verification of all layout structures in ComponentShowcase
- Responsive behavior appears correct at different sizes
- Component composition renders properly
- Theme switching preserves all layout styling
- No added interactive behavior present

## Dependencies

- Existing chat components in `apps/desktop/src/components/chat/`
- Existing sidebar components in `apps/desktop/src/components/sidebar/`
- Existing input components in `apps/desktop/src/components/input/`
- Existing menu components in `apps/desktop/src/components/menu/`
- Shared package for TypeScript interfaces (`packages/shared/src/types/`)

### Log
