---
id: F-update-message-context-menu
title: Update Message Context Menu Actions
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T18:49:27.723Z
updated: 2025-08-31T18:49:27.723Z
---

# Update Message Context Menu Actions

## Overview

Update the message context menu functionality to ensure user and agent messages have consistent copy and delete capabilities, while removing the regenerate option from agent messages as it's not applicable to completed agent responses. System messages remain informational-only with no context menu actions.

## Current State Analysis

- MessageContextMenu component exists with copy, delete, and regenerate actions
- Copy and delete handlers are already implemented in MessageItem
- Context menu is currently available on user and agent messages only
- System messages are display-only without interactive elements
- Regenerate is currently available based on `canRegenerate` prop and needs refinement

## Functionality Requirements

### Copy Action

- **Scope**: Available for user and agent message types only
- **Behavior**: Copy message content to system clipboard
- **User Experience**: Immediate feedback via system clipboard

### Delete Action

- **Scope**: Available for user and agent message types only
- **Behavior**: Remove message from conversation with confirmation if needed
- **User Experience**: Destructive action styling with appropriate confirmation flow

### Regenerate Action Restrictions

- **Remove from**: Agent messages (type="agent") - completed responses shouldn't be regenerated
- **Keep for**: User messages (type="user") - allows users to regenerate their input
- **Not applicable**: System messages (type="system") - no context menu at all

### System Messages

- **No context menu**: System messages remain display-only for informational purposes
- **Current behavior preserved**: Simple centered text display without interactive elements
- **Rationale**: System messages are informational (join notifications, errors) and don't need user actions

## Technical Implementation

### MessageContextMenu Component Updates

- Update the `canRegenerate` logic to properly filter based on message type
- Ensure regenerate option only appears for user messages (type="user")
- Maintain existing copy and delete functionality for user and agent messages
- No changes needed for system message handling (already excluded)

### MessageItem Integration

- Review the `canRegenerate` prop passing to ensure correct message type filtering
- Verify copy and delete handlers work consistently for user and agent message types
- Confirm system messages continue to render without context menu
- Ensure proper accessibility labeling for all context menu actions

### Props Interface Validation

- Verify MessageContextMenuProps interface supports the required functionality
- Ensure proper TypeScript typing for all action handlers
- Validate positioning logic works correctly for user and agent message layouts

## Acceptance Criteria

### Functional Requirements

- **Copy functionality**: User and agent messages display copy option in context menu
- **Delete functionality**: User and agent messages display delete option with destructive styling
- **Regenerate restriction**: Only user messages show regenerate option
- **Agent messages**: Context menu shows only copy and delete options
- **System messages**: No context menu displayed (current behavior preserved)
- **Menu positioning**: Context menu positions correctly above/below based on viewport location

### User Experience Requirements

- **Consistent access**: User and agent messages show context menu trigger (three dots)
- **Visual feedback**: Hover and focus states work properly for menu trigger
- **Keyboard navigation**: Context menu accessible via keyboard for user and agent messages
- **Action confirmation**: Destructive actions (delete) provide appropriate user confirmation
- **System message clarity**: System messages remain visually distinct as informational-only

### Technical Requirements

- **TypeScript compliance**: All components maintain strict TypeScript typing
- **Accessibility**: ARIA labels and keyboard navigation work for all menu items
- **Theme integration**: Context menu styling follows shadcn/ui theme patterns
- **Error handling**: Graceful handling of failed copy/delete operations

## Implementation Approach

### Phase 1: Logic Updates

1. Update MessageContextMenu component to respect message type restrictions
2. Modify the regenerate visibility logic to exclude agent messages
3. Ensure copy and delete remain available for user and agent message types only

### Phase 2: Integration Testing

1. Verify context menu behavior for user and agent messages in MessageItem
2. Confirm system messages continue to display without context menu
3. Test keyboard accessibility and screen reader compatibility
4. Validate menu positioning logic in various viewport configurations

### Phase 3: User Experience Validation

1. Confirm copy functionality works reliably across user and agent message content types
2. Test delete confirmation flow provides appropriate user safeguards
3. Verify no regenerate option appears for agent messages
4. Validate system messages remain clearly informational without interactive elements

## Dependencies

- Existing MessageContextMenu component functionality
- MessageItem context menu integration logic for user and agent messages
- SharedUI types for MessageContextMenuProps interface
- ContextMenu positioning and accessibility features

## Testing Strategy

- **Unit tests**: Test MessageContextMenu with user and agent message types and prop combinations
- **Integration tests**: Verify MessageItem properly passes props and handles menu actions for interactive message types
- **Accessibility tests**: Confirm keyboard navigation and screen reader announcements for user and agent messages
- **User testing**: Validate intuitive context menu behavior across interactive message types

## Security Considerations

- **Clipboard access**: Copy functionality should handle clipboard API permissions gracefully
- **Content sanitization**: Ensure copied content doesn't expose sensitive information
- **Action authorization**: Verify users can only delete/copy messages they have permission to access

## Performance Requirements

- **Menu rendering**: Context menu should appear within 100ms of trigger interaction
- **Copy operation**: Clipboard copy should complete within 200ms for typical message sizes
- **Delete operation**: Message removal should provide immediate UI feedback while processing

This feature ensures consistent, intuitive context menu behavior for interactive message types (user and agent) while properly restricting regenerate functionality and preserving the informational-only nature of system messages.
