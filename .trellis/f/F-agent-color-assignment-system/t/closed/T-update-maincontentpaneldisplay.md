---
id: T-update-maincontentpaneldisplay
title: Update MainContentPanelDisplay to use agent colors in messages
status: done
priority: medium
parent: F-agent-color-assignment-system
prerequisites:
  - T-update-agentlabelscontainerdis
affectedFiles:
  apps/desktop/src/components/layout/MainContentPanelDisplay.tsx:
    Updated color assignment logic to use conversationAgent.color || "--agent-1"
    instead of hardcoded personality-based colors, ensuring consistent message
    header/avatar colors with agent pills
  apps/desktop/src/components/layout/__tests__/MainContentPanelDisplay.test.tsx:
    Created comprehensive unit tests for agent color mapping functionality,
    testing color assignment, fallback handling, and different agent scenarios
log:
  - Successfully updated MainContentPanelDisplay component to use persisted
    agent colors from database instead of hardcoded personality-based colors.
    Replaced the conditional personality logic (lines 56-68) with direct access
    to conversationAgent.color field, maintaining fallback to "--agent-1" for
    consistency. This ensures message colors now match the agent pill colors,
    providing consistent visual identification throughout the conversation
    interface. All quality checks pass (lint, format, type-check).
schema: v1.0
childrenIds: []
created: 2025-09-11T19:07:30.108Z
updated: 2025-09-11T19:07:30.108Z
---

## Context

This task updates the message display logic to use persisted agent colors in message headers and avatars, ensuring consistent color association between agent pills and their messages.

Reference: F-agent-color-assignment-system
Prerequisite: T-update-agentlabelscontainerdis

## Specific Implementation Requirements

Update the MainContentPanelDisplay component to map conversation agent colors to message display, replacing any personality-based or hardcoded color logic.

**File to Modify:**

- `/apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`

**Technical Approach:**

1. Identify current message-to-agent color mapping logic
2. Update mapping to use conversationAgent.color field
3. Ensure MessageHeader and MessageAvatar receive agent colors
4. Remove any personality-based color assignment
5. Add unit tests for color mapping

## Detailed Acceptance Criteria

**Message Color Mapping:**

- ✅ Messages display using agent's persisted color from database
- ✅ MessageHeader component receives agent color
- ✅ MessageAvatar component receives agent color
- ✅ Consistent color between agent pills and message headers
- ✅ CSS variable format preserved (--agent-1, --agent-2, etc.)

**Component Integration:**

- ✅ Message mapping includes color field from conversation agent
- ✅ Color passed to MessageHeader props
- ✅ Color passed to MessageAvatar props
- ✅ Remove personality-based color logic (if exists)

**Expected Data Flow:**

```typescript
// Message mapping should include:
const messageViewModel = {
  // ... existing fields
  agentColor: conversationAgent.color, // Use persisted color
};
```

**Fallback Handling:**

- ✅ Provide fallback color if agent color missing
- ✅ Use consistent fallback with other components
- ✅ Handle edge cases gracefully

## Testing Requirements

**Unit Tests:**

- Test message color mapping from conversation agent
- Test MessageHeader receives correct color
- Test MessageAvatar receives correct color
- Test fallback color when agent color missing
- Verify color consistency across message components

**Integration Tests:**

- Messages from same agent use same color as agent pill
- Different agents show different message colors
- Colors persist across conversation scrolling

## Security Considerations

- Validate color values are safe CSS variables
- Prevent CSS injection through message color field
- Use only trusted database color values

## Dependencies

- ConversationAgent data must include color field
- MessageHeader/MessageAvatar must support color props (already implemented)
- Conversation agent color assignment must be working

## Out of Scope

- MessageHeader component changes (already supports agentColor prop)
- MessageAvatar component changes (already supports agentColor prop)
- Message storage changes (colors stored in conversation_agents table)
