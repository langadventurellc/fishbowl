---
id: F-message-context-control
title: Message Context Control Integration
status: in-progress
priority: medium
parent: E-chat-ui-integration
prerequisites: []
affectedFiles:
  apps/desktop/src/components/chat/MessageItem.tsx: "Enhanced MessageItem
    component with complete useUpdateMessage hook integration including:
    imported useUpdateMessage hook, implemented optimistic state management
    using useState with boolean|null type, replaced handleToggleContext with
    async database persistence logic, added loading state visualization
    (hourglass icon, disabled state), implemented error handling with visual
    feedback and rollback mechanism, updated checkbox styling to show loading
    states, added renderInclusionError function for error display, updated
    accessibility labels for all interaction states, and maintained existing
    functionality while adding database persistence"
  apps/desktop/src/components/chat/__tests__/MessageItem.test.tsx:
    "Added comprehensive unit tests for checkbox integration including: mock
    setup for useUpdateMessage hook with proper TypeScript typing, test cases
    for updateInclusion calls with correct parameters, loading state validation
    (disabled button, hourglass icon, updating labels), error display
    verification with inline error messages, optimistic update behavior testing,
    error rollback scenarios, state synchronization validation, and
    accessibility testing for all interaction states - 8 new test cases covering
    complete checkbox integration workflow with all 33 tests passing"
  packages/ui-shared/src/types/chat/ContextStatisticsProps.ts:
    Created new interface for ContextStatistics component props with
    comprehensive TypeScript definitions including messages array, display
    variants (default/compact/minimal), optional warning icon display, and
    styling customization. Includes detailed documentation and examples
    following project conventions.
  packages/ui-shared/src/types/chat/index.ts: Added export for
    ContextStatisticsProps interface to make it available for import through the
    chat types barrel file.
  apps/desktop/src/components/chat/ContextStatistics.tsx: Implemented complete
    ContextStatistics component with message counting logic, warning states,
    multiple display variants, accessibility features (ARIA labels, role=status,
    aria-live=polite), responsive design, and theme-aware styling. Uses
    lucide-react icons (AlertTriangle, MessageCircle) and follows established
    component patterns.
  apps/desktop/src/components/chat/index.ts: Added export for ContextStatistics
    component to make it available for import from the chat components barrel
    file.
  apps/desktop/src/components/chat/__tests__/ContextStatistics.test.tsx:
    "Created comprehensive unit test suite with 24 test cases covering: message
    counting logic with various scenarios, warning state display and styling,
    all display variants (default/compact/minimal), component props handling,
    accessibility features (ARIA labels, screen reader support), and styling
    integration. All tests pass successfully."
  apps/desktop/src/components/layout/ChatContainerDisplay.tsx:
    Integrated ContextStatistics component above message list with conditional
    rendering, compact variant styling, and proper layout structure. Added
    import for ContextStatistics component. Modified return structure to include
    statistics header area with border separator and maintained scrollable
    message area functionality.
  apps/desktop/src/components/layout/__tests__/ChatContainerDisplay.test.tsx:
    "Added comprehensive unit test suite for ContextStatistics integration
    including 8 new test cases covering: component rendering with messages,
    conditional rendering for empty states, message inclusion count updates,
    proper props passing, DOM positioning, and styling verification. Updated
    existing tests to accommodate new component structure changes. Added
    ContextStatistics mock for isolated testing. All 24 tests passing
    successfully."
log: []
schema: v1.0
childrenIds:
  - T-enhance-checkbox-styling-and
  - T-integrate-context-statistics
  - T-add-context-statistics
  - T-wire-messageitem-checkboxes
created: 2025-08-30T03:49:24.640Z
updated: 2025-08-30T03:49:24.640Z
---

# Message Context Control Integration

## Purpose and Functionality

Implement message inclusion checkbox functionality that allows users to control which messages are included in the context sent to agents for future responses. This feature wires the inclusion checkboxes to the useUpdateMessage hook and provides visual feedback about context impact and message inclusion status.

## Key Components to Implement

- **Message Inclusion Checkboxes**: Wire to useUpdateMessage hook
- **Visual Context Indicators**: Show included vs excluded message styling
- **Context Impact Display**: Show how many messages are included in context
- **Immediate Updates**: Real-time inclusion status changes
- **Default Inclusion**: New messages default to included state
- **Batch Operations**: Enable/disable multiple messages efficiently

## Detailed Acceptance Criteria

### Message Inclusion Control

- **GIVEN** users need to control message history context
- **WHEN** managing message inclusion
- **THEN** it should:
  - Display checkbox for each message to control inclusion in context
  - Connect to useUpdateMessage hook for inclusion changes
  - Default new messages to included (true)
  - Provide visual indicator of included vs excluded messages
  - Update inclusion status immediately on checkbox change
  - Show context impact (e.g., "X messages included in context")

### Visual Context Feedback

- **GIVEN** messages with different inclusion states
- **WHEN** displaying the conversation
- **THEN** it should:
  - Apply distinct styling for included vs excluded messages
  - Use subtle visual cues (opacity, border, background color)
  - Show inclusion checkboxes clearly on all messages
  - Provide hover states for checkbox interaction
  - Display context summary information prominently

### Inclusion State Management

- **GIVEN** checkbox interactions on messages
- **WHEN** users toggle inclusion status
- **THEN** it should:
  - Update message inclusion immediately via useUpdateMessage
  - Show loading state during update if applicable
  - Handle update errors gracefully with rollback
  - Maintain checkbox state consistency across page refreshes
  - Prevent accidental exclusion of important messages with confirmation

### Context Impact Visualization

- **GIVEN** conversation with mixed inclusion states
- **WHEN** displaying context information
- **THEN** it should:
  - Show total count of included messages
  - Display context size or token estimation if available
  - Provide clear indication when no messages are included
  - Show warning when context is empty or minimal
  - Update context statistics in real-time as inclusions change

### Bulk Operations (Nice to Have)

- **GIVEN** conversations with many messages
- **WHEN** users need to manage inclusion efficiently
- **THEN** it should:
  - Provide "include all" / "exclude all" options
  - Allow selection of message ranges for bulk operations
  - Show confirmation for bulk exclusion operations
  - Handle bulk operations efficiently without UI blocking
  - Provide undo functionality for accidental bulk changes

## Technical Requirements

- **Component Integration**: Enhance existing MessageItem components with checkboxes
- **Hook Usage**: Utilize existing `useUpdateMessage` hook for inclusion updates
- **State Management**: Manage checkbox states efficiently
- **Performance**: Optimize for conversations with many messages
- **Accessibility**: Proper labeling and keyboard navigation for checkboxes
- **Visual Design**: Consistent with existing message styling

## Dependencies on Other Features

- **Chat Display Integration**: Builds on message display functionality
- **Message Input Integration**: New messages respect default inclusion settings
- **Requires**: Existing useUpdateMessage hook and message persistence

## Implementation Guidance

- Add inclusion checkboxes to existing MessageItem component
- Use subtle visual styling to indicate inclusion status
- Implement optimistic UI updates with error rollback
- Follow existing form control patterns for checkbox styling
- Consider performance with large message counts
- Ensure consistent behavior across different message types

## Testing Requirements

- **Checkbox Functionality**: Inclusion checkboxes toggle message included status
- **Visual Feedback**: Included/excluded messages display with correct styling
- **State Persistence**: Inclusion state persists across page refreshes
- **Error Handling**: Update failures handled gracefully with user feedback
- **Context Statistics**: Accurate count of included messages displayed
- **Performance**: Smooth operation with 100+ message conversations
- **Accessibility**: Screen readers can identify and control inclusion state

## Security Considerations

- **Data Validation**: Validate inclusion status before sending to backend
- **Authorization**: Ensure user can modify messages they have access to
- **Privacy**: No sensitive information in inclusion status indicators
- **Audit Trail**: Consider logging inclusion changes for debugging

## Performance Requirements

- **Immediate Updates**: Checkbox changes reflect instantly in UI
- **Efficient Updates**: Bulk operations complete without blocking UI
- **Memory Usage**: Efficient handling of inclusion state for large conversations
- **Network Efficiency**: Minimize API calls for inclusion updates
- **Scalability**: Handle conversations with 500+ messages smoothly
