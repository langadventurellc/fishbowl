---
kind: feature
id: F-layout-display-components
title: Layout Display Components
status: in-progress
priority: low
prerequisites:
  - F-message-display-components
  - F-sidebar-display-components
  - F-input-display-components
created: "2025-07-23T19:08:51.180429"
updated: "2025-07-23T19:08:51.180429"
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

- Each component in `apps/desktop/src/components/ui/layout/` directory
- Pure layout components with no business logic or state
- Props-based composition of child components
- TypeScript interfaces for all props from shared package

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
4. **Immediately add each component to ComponentShowcase** for visual verification

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
apps/desktop/src/components/ui/layout/
├── index.ts (barrel export)
├── ConversationScreenDisplay.tsx
├── MainContentPanelDisplay.tsx
├── ChatContainerDisplay.tsx
├── AgentLabelsContainerDisplay.tsx
└── ConversationLayoutDisplay.tsx
```

## Testing Requirements

- Visual verification of all layout structures
- Responsive behavior appears correct at different sizes
- Component composition renders properly
- Theme switching preserves all layout styling
- No added interactive behavior present

## Dependencies

- F-message-display-components (composes message components)
- F-sidebar-display-components (composes sidebar components)
- F-input-display-components (composes input components)
- F-foundation-typescript-interfaces (for layout-related prop types)

### Log
