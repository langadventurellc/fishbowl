---
kind: task
id: T-create-messageheader-component
title: Create MessageHeader component with showcase integration
status: open
priority: high
prerequisites:
  - T-create-messageavatar-component
created: "2025-07-24T14:10:20.620239"
updated: "2025-07-24T14:10:20.620239"
schema_version: "1.1"
parent: F-message-display-components
---

# Create MessageHeader Component

## Context

Extract message metadata display from DesignPrototype.tsx to create a component that shows agent name, role, and timestamp information with proper spacing and typography.

## Implementation Requirements

- **Location**: `apps/desktop/src/components/ui/chat/MessageHeader.tsx`
- **Props Interface**: agent info, timestamp, message type from shared types
- **Pure Component**: Display only, no interactive functionality
- **Visual Elements**: Agent name, role, timestamp with consistent layout
- **Styling**: Typography hierarchy, flex layout, theme variables

## Technical Approach

1. Extract header logic from DesignPrototype.tsx messageHeader styling (lines ~365-373)
2. Create props interface for agent, timestamp, and message type
3. Implement flex layout with consistent spacing (8px gap, 4px margin-bottom)
4. Use typography styles: 12px font, 500 weight for metadata
5. Integrate MessageAvatar component for visual consistency
6. Write unit tests for different agent types and timestamp formats

## Showcase Integration (CRITICAL)

**IMMEDIATELY** after creating the component:

1. Add MessageHeader to ComponentShowcase.tsx with examples:
   - Different agent names and roles
   - Various timestamp formats
   - User vs agent vs system message types
   - Both light and dark theme variants
2. Verify layout matches DesignPrototype spacing and typography
3. Test with long agent names and roles for overflow handling

## Dependencies

- Requires MessageAvatar component for visual consistency
- Uses existing Agent and Message types from shared package

## Acceptance Criteria

- ✅ Displays agent name, role, and timestamp with proper typography
- ✅ Flex layout with consistent spacing (8px gap, 4px bottom margin)
- ✅ Integrates MessageAvatar for visual consistency
- ✅ Handles different message types (user/agent/system)
- ✅ Typography matches DesignPrototype (12px, 500 weight)
- ✅ Added to ComponentShowcase with comprehensive examples
- ✅ Unit tests cover layout and content display
- ✅ Theme switching works correctly
- ✅ Component under 150 lines of code

### Log
