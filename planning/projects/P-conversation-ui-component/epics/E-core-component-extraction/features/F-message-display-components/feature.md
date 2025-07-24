---
kind: feature
id: F-message-display-components
title: Message Display Components
status: in-progress
priority: high
prerequisites:
  - F-atomic-ui-components
created: "2025-07-23T19:07:34.969809"
updated: "2025-07-23T19:07:34.969809"
schema_version: "1.1"
parent: E-core-component-extraction
---

# Message Display Components

## Purpose

Extract UI components responsible for displaying messages in the conversation interface. These are pure display components that render message content, metadata, and visual styling without any interactive functionality.

## Source References

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` (~1326 lines)
- **Theme System**: `packages/ui-theme/src/claymorphism-theme.css`

## Target Components

### MessageItem Component

- **Location in DesignPrototype**: Lines 362-639 (large complex component)
- **Purpose**: Display individual message with agent info, content, timestamp
- **Visual Elements**: Agent color bar, role display, message content, timestamp
- **Styling**: Card-like layout with theme-aware background and text

### MessageContent Component

- **Purpose**: Render message text with proper formatting and overflow handling
- **Props**: content string, type (user/agent/system), truncation settings
- **Styling**: Typography styles, proper line spacing, text selection

### MessageHeader Component

- **Purpose**: Display message metadata (agent name, role, timestamp)
- **Props**: agent info, timestamp, message type
- **Styling**: Flex layout with consistent spacing and color coding

### MessageAvatar Component

- **Purpose**: Visual indicator for message sender (colored circle/pill)
- **Props**: agent color, role, size variant
- **Styling**: Color-coded circles matching agent theme

### SystemMessage Component

- **Purpose**: Special styling for system/notification messages
- **Props**: content, message type, emphasis level
- **Styling**: Distinct visual treatment from user/agent messages

## Acceptance Criteria

✅ **Component Structure**

- Each component in `apps/desktop/src/components/ui/message/` directory
- Props-only architecture with no internal state
- TypeScript interfaces for all props from shared package
- Pure CSS-in-JS styling using theme variables

✅ **Visual Fidelity**

- Exact match with DesignPrototype message appearance
- Agent color coding preserved across components
- Typography hierarchy and spacing maintained
- Theme switching (light/dark) works consistently

✅ **Message Type Support**

- User messages: Right-aligned with user styling
- Agent messages: Left-aligned with agent color coding
- System messages: Centered with distinct styling
- All three types visually distinct and consistent

✅ **Content Handling**

- Text content displays with proper formatting
- Long content handles overflow appropriately
- Whitespace and line breaks preserved
- No text processing or manipulation (display only)

✅ **Showcase Integration** (CRITICAL - Done as components are created)

- Each message component added to ComponentShowcase as it's created
- Different message types and agent colors demonstrated immediately
- Both light and dark theme variants tested in showcase
- Multiple content lengths and edge cases shown in showcase
- Sample message data created for realistic previews

✅ **Code Quality**

- No interactive functionality or event handlers
- Pure display logic only
- Components under 150 lines each
- Consistent styling patterns across message components
- TypeScript strict mode compliance

## Implementation Guidance

**Extraction Strategy:**

1. Identify message-related visual elements in `apps/desktop/src/pages/DesignPrototype.tsx` (lines 362-639)
2. Break down large MessageComponent into smaller display pieces
3. Extract styling objects from DesignPrototype and convert to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
4. Remove all click handlers, state management, context menus
5. Create pure render components with props-based display
6. **Immediately add each component to ComponentShowcase** for visual verification

**Component Composition:**

```
MessageItem
├── MessageHeader (agent, timestamp, role)
├── MessageAvatar (color indicator)
├── MessageContent (text display)
└── MessageFooter (optional metadata)
```

**Styling Approach:**

- Use existing CSS custom properties for theming
- Preserve agent color coding system
- Maintain typography hierarchy from design system
- Extract reusable style objects for message layouts

**File Organization:**

```
apps/desktop/src/components/ui/message/
├── index.ts (barrel export)
├── MessageItem.tsx (main message container)
├── MessageHeader.tsx
├── MessageContent.tsx
├── MessageAvatar.tsx
└── SystemMessage.tsx
```

## Testing Requirements

- Visual verification with multiple message types
- Agent color variations display correctly
- Long and short content renders properly
- Theme switching preserves all styling
- No interactive functionality present

## Dependencies

- F-atomic-ui-components (may use ThinkingIndicator, AgentPill)
- F-foundation-typescript-interfaces (for Message, Agent types)

### Log
