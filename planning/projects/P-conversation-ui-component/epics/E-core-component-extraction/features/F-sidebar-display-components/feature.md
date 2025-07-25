---
kind: feature
id: F-sidebar-display-components
title: Sidebar Display Components
status: in-progress
priority: normal
prerequisites:
  - F-atomic-ui-components
created: "2025-07-23T19:08:13.689425"
updated: "2025-07-23T19:08:13.689425"
schema_version: "1.1"
parent: E-core-component-extraction
---

# Sidebar Display Components

## Purpose

Extract UI components related to the conversation sidebar, focusing on pure visual display without added interactive functionality. These components show the visual structure and styling of sidebar elements.

## Source References

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` (~1326 lines)
- **Theme System**: `packages/ui-theme/src/claymorphism-theme.css`

## Target Components

### ConversationItemDisplay Component

- **Location in DesignPrototype**: Lines 274-306
- **Purpose**: Visual representation of conversation list items
- **Props**: conversation data, active state, timestamp, unread indicator
- **Styling**: List item layout with hover states and selection styling
- **Context Menu Integration**: Use the existing `ContextMenu` component from `apps/desktop/src/components/menu/ContextMenu.tsx` with ellipses trigger that appears on hover. Clicking the ellipses opens the context menu. The ContextMenu component provides keyboard support, click-outside-to-close, and flexible positioning

### SidebarToggleDisplay Component

- **Location in DesignPrototype**: Lines 615-638
- **Purpose**: Visual representation of sidebar collapse/expand button
- **Props**: collapsed state, direction indicator, size variant
- **Styling**: Icon button with rotation animation styling

### ConversationListDisplay Component

- **Purpose**: Container for conversation list items
- **Props**: conversations array, active conversation, scroll state
- **Styling**: Scrollable container with proper spacing and borders

### SidebarHeaderDisplay Component

- **Purpose**: Top section of sidebar with title and controls
- **Props**: title text, show controls, collapsed state
- **Styling**: Header layout with consistent typography and spacing

### SidebarContainerDisplay Component

- **Purpose**: Main sidebar layout wrapper
- **Props**: collapsed state, width variant, border visibility
- **Styling**: Collapsible container with transition styling

## Acceptance Criteria

✅ **Component Structure**

- Each component in `apps/desktop/src/components/sidebar/` directory
- Pure display components with no click handlers or state
- Props-based visual configuration
- TypeScript interfaces for all props from shared package

✅ **Visual Fidelity**

- Exact match with DesignPrototype sidebar appearance
- All visual states preserved (collapsed, expanded, hover)
- Conversation selection styling maintained
- Proper spacing and typography from design system

✅ **State Visualization**

- Collapsed vs expanded visual states
- Active conversation highlighting
- Hover state appearance (without actual hover behavior)
- Unread indicator and timestamp display

✅ **Layout Preservation**

- Sidebar width and responsive behavior
- Conversation list scrolling appearance
- Header and toggle button positioning
- Border and shadow styling maintained

✅ **Showcase Integration** (CRITICAL - Done as components are created)

- Each sidebar component added to ComponentShowcase as it's created
- Different states and configurations demonstrated immediately in showcase
- Both collapsed and expanded states shown
- Light and dark theme compatibility tested

✅ **Code Quality**

- No added interactive functionality
- No event handlers or state management
- Pure CSS-in-JS styling with theme variables
- Components under 120 lines each
- TypeScript strict mode compliance

## Implementation Guidance

**Extraction Process:**

1. Identify sidebar visual elements in `apps/desktop/src/pages/DesignPrototype.tsx` (lines 274-306, 615-638)
2. Extract conversation list item styling and layout from DesignPrototype
3. Convert styling to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
4. Remove all onClick, onToggle, selection handlers
5. Create pure display components showing visual states
6. **For ConversationItemDisplay**: Integrate with existing `ContextMenu` component using ellipses trigger that appears on hover (from `apps/desktop/src/components/menu/ContextMenu.tsx`)
7. **Immediately add each component to ComponentShowcase** for visual verification

**Visual States to Support:**

- **ConversationItemDisplay**: active, inactive, unread, hover appearance
- **SidebarToggleDisplay**: collapsed, expanded visual states
- **ConversationListDisplay**: empty, populated, scrolled states
- **SidebarContainerDisplay**: collapsed, expanded width states

**Layout Focus:**

- Preserve responsive sidebar behavior appearance
- Maintain consistent spacing between conversation items
- Keep proper alignment and typography
- Use existing theme variables for colors and borders

**File Organization:**

```
apps/desktop/src/components/sidebar/
├── index.ts (barrel export)
├── ConversationItemDisplay.tsx
├── SidebarToggleDisplay.tsx
├── ConversationListDisplay.tsx
├── SidebarHeaderDisplay.tsx
└── SidebarContainerDisplay.tsx
```

## Testing Requirements

- Visual verification of all display states
- Collapsed and expanded states render correctly
- Different conversation data displays properly
- Theme switching preserves all styling
- No added interactive behavior present

## Dependencies

- F-atomic-ui-components (may use Button variants for toggle)
- F-foundation-typescript-interfaces (for Conversation type definitions)

### Log
