---
id: T-update-messageitem-integration
title: Update MessageItem integration tests for new regenerate behavior
status: open
priority: medium
parent: F-update-message-context-menu
prerequisites:
  - T-update-regenerate-logic-for
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T18:57:19.659Z
updated: 2025-08-31T18:57:19.659Z
---

# Update MessageItem Integration Tests for New Regenerate Behavior

## Context

With the regenerate logic updated to show only for user messages, the existing MessageItem integration tests need to be updated to reflect this new behavior. Current tests may expect regenerate on agent messages, which is now incorrect.

## Current State Analysis

- **Test File**: `apps/desktop/src/components/chat/__tests__/MessageItem.test.tsx`
- **Current Logic**: Tests likely expect canRegenerate=true for agent messages
- **New Logic**: canRegenerate should only be true for user messages
- **Integration Point**: Tests verify MessageItem passes correct props to MessageContextMenu

## Technical Implementation

### Test Updates Required

Review and update existing MessageItem tests for:

1. **Agent Message Tests**
   - Remove expectations for regenerate option on agent messages
   - Verify only copy and delete options are available
   - Update mock MessageContextMenu to reflect canRegenerate=false

2. **User Message Tests**
   - Add/update expectations for regenerate option on user messages
   - Verify copy, delete, and regenerate options are all available
   - Update mock MessageContextMenu to reflect canRegenerate=true

3. **System Message Tests**
   - Verify no context menu appears (existing behavior)
   - Ensure no regression in system message display

### Test Case Updates

**Agent Message Test Updates:**

```typescript
it("should not show regenerate option for agent messages", () => {
  const props = createMockProps({
    message: createMockMessage({ type: "agent" }),
    canRegenerate: false, // Updated expectation
  });
  // Test expects no regenerate button
});
```

**User Message Test Updates:**

```typescript
it("should show regenerate option for user messages", () => {
  const props = createMockProps({
    message: createMockMessage({ type: "user" }),
    canRegenerate: true, // New expectation
  });
  // Test expects regenerate button to be present
});
```

## Files to Update

- `apps/desktop/src/components/chat/__tests__/MessageItem.test.tsx` - Update existing tests

## Acceptance Criteria

### Test Update Requirements

- **Agent message tests**: Remove regenerate expectations, verify copy/delete only
- **User message tests**: Add regenerate expectations alongside copy/delete
- **System message tests**: Preserve existing no-context-menu behavior
- **Props verification**: Ensure correct canRegenerate values passed to MessageContextMenu mock

### Test Quality Standards

- **No breaking changes**: Existing test structure preserved where possible
- **Clear descriptions**: Update test names to reflect new behavior
- **Comprehensive coverage**: All message type scenarios covered
- **Mock consistency**: MessageContextMenu mock reflects real component interface

## Testing Requirements

Update integration tests to verify:

1. **Context Menu Prop Passing**
   - User messages: canRegenerate=true passed to MessageContextMenu
   - Agent messages: canRegenerate=false passed to MessageContextMenu
   - System messages: No MessageContextMenu rendered

2. **User Interaction Tests**
   - Copy action works for user and agent messages
   - Delete action works for user and agent messages
   - Regenerate action only works for user messages

3. **Edge Cases**
   - canRegenerate prop override behavior (if supported)
   - Missing onContextMenuAction handler behavior
   - Message type validation

## Dependencies

- **Prerequisite**: T-update-regenerate-logic-for (logic change must be complete)
- **Test Dependencies**: Existing MessageItem test infrastructure
- **Mock Dependencies**: MessageContextMenu mock needs updates

## Security Considerations

- **No security implications**: Test updates only
- **Validation**: Ensure tests don't accidentally validate incorrect security assumptions

## Performance Requirements

- **Test execution**: Updated tests run in similar time to existing tests
- **Memory usage**: No additional memory overhead from test updates

## Out of Scope

- Adding new test scenarios not related to regenerate behavior
- Refactoring existing test infrastructure unless necessary
- Performance testing of message rendering
- Testing actual context menu UI behavior (covered by MessageContextMenu tests)

## Implementation Notes

- **Backward compatibility**: Preserve existing test patterns and naming
- **Mock updates**: Ensure MessageContextMenu mock reflects new canRegenerate logic
- **Test data**: Update mock message creation helpers if needed

## Definition of Done

- All existing MessageItem tests pass with updated logic
- Test descriptions accurately reflect new regenerate behavior
- No regression in test coverage percentage
- Updated tests follow existing project testing patterns
- Mock components properly simulate new canRegenerate behavior

This task requires approximately 1 hour to complete including test analysis and updates.
