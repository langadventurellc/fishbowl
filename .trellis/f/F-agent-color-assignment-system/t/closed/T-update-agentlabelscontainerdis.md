---
id: T-update-agentlabelscontainerdis
title: Update AgentLabelsContainerDisplay to use persisted colors
status: done
priority: medium
parent: F-agent-color-assignment-system
prerequisites:
  - T-update-conversation-store-to
affectedFiles:
  apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx:
    Updated color assignment logic to use conversationAgent.color field instead
    of hardcoded values. Added fallback to --agent-1 for edge cases. Changed
    lines 240 and 270 to use dynamic color values from persisted conversation
    agent data.
log:
  - Updated AgentLabelsContainerDisplay component to use persisted colors from
    conversation agent data instead of hardcoded blue colors. Removed hardcoded
    "#3b82f6" values and implemented proper fallback handling with "--agent-1"
    as default. The component now correctly uses conversationAgent.color field
    from database which contains CSS variable references (--agent-1 through
    --agent-8) for theme-flexible color assignment.
schema: v1.0
childrenIds: []
created: 2025-09-11T19:07:13.089Z
updated: 2025-09-11T19:07:13.089Z
---

## Context

This task removes hardcoded colors from the AgentLabelsContainerDisplay component and updates it to use the persisted colors from conversation agent data.

Reference: F-agent-color-assignment-system
Prerequisite: T-update-conversation-store-to

## Specific Implementation Requirements

Update the component to use actual color values from conversation agents instead of hardcoded blue colors.

**File to Modify:**

- `/apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`

**Technical Approach:**

1. Remove hardcoded `color: "#3b82f6"` assignments
2. Use `conversationAgent.color` from database data
3. Handle CSS variable resolution for styling
4. Add fallback color handling for edge cases
5. Update unit tests to verify color usage

## Detailed Acceptance Criteria

**Color Usage Updates:**

- ✅ Remove hardcoded color assignments (lines ~240, ~270)
- ✅ Use `conversationAgent.color` field from database
- ✅ AgentPillViewModel populated with actual colors
- ✅ CSS variable format preserved (--agent-1, --agent-2, etc.)

**Component Changes:**
Current hardcoded approach:

```typescript
const agentViewModel: AgentPillViewModel = {
  name: agentConfig?.name || "Unknown Agent",
  role: agentConfig?.role || "unknown",
  color: "#3b82f6", // Remove this hardcoded value
  // ...
};
```

Updated approach:

```typescript
const agentViewModel: AgentPillViewModel = {
  name: agentConfig?.name || "Unknown Agent",
  role: agentConfig?.role || "unknown",
  color: conversationAgent.color, // Use persisted color
  // ...
};
```

**Fallback Handling:**

- ✅ Provide fallback color if conversationAgent.color is missing
- ✅ Use "--agent-1" as default fallback
- ✅ Log warning if color field missing (for debugging)

**CSS Variable Support:**

- ✅ Component passes CSS variable strings to AgentPill
- ✅ AgentPill component handles CSS variable resolution
- ✅ Colors work in both light and dark themes

## Testing Requirements

**Unit Tests:**

- Test color assignment from conversation agent data
- Test fallback color when field missing
- Test CSS variable format preservation
- Verify AgentPill receives correct color values

**Visual Testing:**

- Verify different agents show different colors
- Confirm colors match CSS theme variables
- Test color consistency across theme switches

## Security Considerations

- Validate color values are safe CSS variable names
- Prevent CSS injection through color field
- Use trusted color values from database only

## Dependencies

- Conversation store must provide color field
- ConversationAgent data must include colors
- Backend color assignment must be working

## Out of Scope

- AgentPill component changes (already supports color prop)
- CSS theme modifications (colors already defined)
- Color assignment logic (handled in modal task)
