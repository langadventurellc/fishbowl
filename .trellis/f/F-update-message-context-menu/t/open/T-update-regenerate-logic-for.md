---
id: T-update-regenerate-logic-for
title: Update regenerate logic for user messages only
status: open
priority: high
parent: F-update-message-context-menu
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T18:56:11.649Z
updated: 2025-08-31T18:56:11.649Z
---

# Update Regenerate Logic for User Messages Only

## Context

Currently, the context menu shows regenerate option for agent messages (`message.type === "agent"`), but the feature requirements specify that regenerate should only be available for user messages. Agent messages are completed responses that shouldn't be regenerated.

## Current Implementation Analysis

- **File**: `apps/desktop/src/components/layout/ChatContainerDisplay.tsx`
- **Line 160**: `canRegenerate={message.type === "agent"}`
- **Issue**: Logic is reversed - shows regenerate for agents, should show for users only
- **MessageContextMenu**: Already correctly implemented - only shows regenerate when `canRegenerate && onRegenerate` are truthy

## Technical Implementation

### Primary Change Required

Update the `canRegenerate` prop assignment in `ChatContainerDisplay.tsx`:

**Current (incorrect):**

```typescript
canRegenerate={message.type === "agent"}
```

**Required (correct):**

```typescript
canRegenerate={message.type === "user"}
```

### Implementation Steps

1. **Locate the logic**: Find `ChatContainerDisplay.tsx` line ~160 where MessageItem is rendered
2. **Update the condition**: Change `message.type === "agent"` to `message.type === "user"`
3. **Verify context**: Ensure this is the only location where canRegenerate is set based on message type
4. **Review imports**: Ensure no TypeScript import issues

### Files to Modify

- `apps/desktop/src/components/layout/ChatContainerDisplay.tsx` - Update canRegenerate logic

## Acceptance Criteria

### Functional Requirements

- **User messages**: Context menu shows Copy, Delete, and Regenerate options
- **Agent messages**: Context menu shows only Copy and Delete options (no Regenerate)
- **System messages**: No context menu (existing behavior preserved)
- **Positioning**: Context menu positioning logic remains unchanged

### Technical Requirements

- **TypeScript compliance**: No type errors after the change
- **Existing functionality**: Copy and delete behavior remains unchanged
- **Performance**: No impact on rendering performance
- **Accessibility**: ARIA labels and keyboard navigation unchanged

## Testing Requirements

Include unit tests in the same implementation to verify:

1. **User message test**: Verify canRegenerate=true for message.type="user"
2. **Agent message test**: Verify canRegenerate=false for message.type="agent"
3. **System message test**: Verify no context menu for message.type="system"
4. **Integration test**: Verify MessageContextMenu receives correct canRegenerate prop

### Test Cases to Add/Update

```typescript
// Test user message shows regenerate
expect(screen.getByText("Regenerate")).toBeInTheDocument();

// Test agent message does not show regenerate
expect(screen.queryByText("Regenerate")).not.toBeInTheDocument();

// Test both user and agent show copy/delete
expect(screen.getByText("Copy message")).toBeInTheDocument();
expect(screen.getByText("Delete message")).toBeInTheDocument();
```

## Dependencies

- **Prerequisite**: None (this is the foundational logic change)
- **Downstream impact**: This change affects which messages show regenerate option
- **Integration**: MessageContextMenu component already handles the logic correctly

## Security Considerations

- **Input validation**: No security implications for this logic change
- **User permissions**: No authorization changes required
- **Data exposure**: No data exposure risks

## Out of Scope

- MessageContextMenu component changes (already correct)
- MessageItem component changes (already correct)
- Props interface changes (already correct)
- Documentation updates for other components

## Definition of Done

- Logic updated from `message.type === "agent"` to `message.type === "user"`
- Unit tests verify correct canRegenerate values for each message type
- No TypeScript errors
- No regression in existing copy/delete functionality
- All existing tests pass with the updated logic

This task requires approximately 1 hour to complete including testing.
