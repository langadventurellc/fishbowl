---
id: T-create-integrated-message
title: Create integrated message input container with state management
status: done
priority: high
parent: F-message-input-integration
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/chat/MessageInputContainerProps.ts:
    Created new interface for MessageInputContainer props with comprehensive
    TypeScript definitions and documentation
  packages/ui-shared/src/types/chat/index.ts: Added export for
    MessageInputContainerProps interface to make it available for import
  apps/desktop/src/components/input/MessageInputContainer.tsx:
    Implemented integrated message input container component with state
    management, form validation, error handling, keyboard shortcuts, and proper
    integration with useCreateMessage and useChatStore hooks
  apps/desktop/src/components/input/__tests__/MessageInputContainer.test.tsx:
    Created comprehensive unit tests covering rendering, form state management,
    message sending, keyboard shortcuts, loading states, error display, and
    accessibility features
  apps/desktop/src/components/input/index.ts: Added export for
    MessageInputContainer component to make it available for import from the
    input components barrel file
log:
  - Implemented MessageInputContainer component with complete state integration
    for message sending functionality. The component connects
    MessageInputDisplay and SendButtonDisplay with useCreateMessage hook and
    useChatStore to provide form state management, validation, loading states,
    error display, and keyboard shortcuts (Enter to send, Shift+Enter for new
    line). Added comprehensive unit tests covering all functionality including
    form state, message submission, loading states, error handling, keyboard
    shortcuts, and accessibility features. All quality checks pass with proper
    TypeScript integration.
schema: v1.0
childrenIds: []
created: 2025-08-30T03:54:19.592Z
updated: 2025-08-30T03:54:19.592Z
---

# Create Integrated Message Input Container with State Management

## Context

Wire the existing `MessageInputDisplay` and `SendButtonDisplay` components with the `useCreateMessage` hook and `useChatStore` to enable complete message sending functionality. The current `InputContainerDisplay` only passes static props - this task creates a new integrated container that manages form state, validation, and chat orchestration.

## Specific Implementation Requirements

### Create New Integrated Container Component

- **File**: `apps/desktop/src/components/input/MessageInputContainer.tsx`
- **Purpose**: Replace static `InputContainerDisplay` with state-integrated version
- **Pattern**: Follow the established pattern in similar integrated components in the codebase

### State Management Integration

- **Form State**: Use React `useState` for local input field state (`content`, `error`)
- **Chat State**: Connect to `useChatStore` for `sendingMessage` and global chat state
- **Message Creation**: Connect to `useCreateMessage` hook for submission logic
- **Validation**: Leverage existing validation in `useCreateMessage` hook (empty content check already implemented)

### Component Behavior

- **Input Field**:
  - Two-way binding with local state
  - Clear field after successful message creation
  - Allow typing during multi-agent processing
  - Show validation errors below input field with red styling
- **Send Button**:
  - Disable when `sendingMessage` is true (from `useChatStore`)
  - Show loading state during processing
  - Re-enable automatically when processing completes
- **Keyboard Shortcuts**:
  - Enter to send message
  - Shift+Enter for new line

### Technical Implementation Details

- **Props Interface**: Accept `conversationId` and optional override props for child components
- **Error Display**: Add error message display below input field
- **Accessibility**: Maintain existing aria-labels and screen reader support
- **Styling**: Use existing component variants and Tailwind classes
- **Performance**: Use `useCallback` for event handlers to prevent unnecessary re-renders

## Detailed Acceptance Criteria

### Form State Management

- **GIVEN** user types in the message input
- **WHEN** the input value changes
- **THEN** the local component state should update immediately

### Message Sending Flow

- **GIVEN** user has typed a non-empty message
- **WHEN** user clicks send button or presses Enter
- **THEN** it should:
  - Call `useCreateMessage.createMessage()` with proper input
  - Clear the input field on successful creation
  - Handle validation errors from the hook (empty content is already validated)
  - Show loading state during submission

### Loading State Management

- **GIVEN** message is being sent to agents
- **WHEN** `useChatStore.sendingMessage` is true
- **THEN** it should:
  - Disable the send button
  - Show loading spinner/text on button
  - Allow continued typing in input field
  - Automatically re-enable when processing completes

### Error Handling

- **GIVEN** message creation fails or validation fails
- **WHEN** `useCreateMessage.error` is set
- **THEN** it should:
  - Display error message below input field
  - Keep user's input content (don't clear on error)
  - Clear error when user starts typing again
  - Style error message with red text

### Keyboard Interaction

- **GIVEN** user is typing in the input field
- **WHEN** user presses Enter key
- **THEN** it should send the message (unless Shift is held)
- **WHEN** user presses Shift+Enter
- **THEN** it should add a new line without sending

## Dependencies on Other Tasks

- **None** - This is the foundational task that enables all other input functionality

## Testing Requirements (Include in Same Task)

- **Unit tests** for the integrated container component:
  - Form state management (input changes, clearing)
  - Message submission integration with useCreateMessage
  - Loading state management with useChatStore
  - Error display and clearing
  - Keyboard shortcuts (Enter/Shift+Enter)
- **Test file**: `apps/desktop/src/components/input/__tests__/MessageInputContainer.test.tsx`
- **Test approach**: Use `@testing-library/react` and mock the hooks

## Out of Scope

- **Modification of existing display components** - Use existing `MessageInputDisplay` and `SendButtonDisplay` as-is
- **No agents handling** - Handled in separate task
- **Advanced validation** - Use existing validation in `useCreateMessage` hook
- **Message context control** - Different feature entirely

## Security Considerations

- **Input sanitization** is handled by the existing `useCreateMessage` hook
- **XSS prevention** through proper React rendering (no dangerouslySetInnerHTML)
- **Validation** uses existing server-side validation via IPC

## Files to Create/Modify

- **Create**: `apps/desktop/src/components/input/MessageInputContainer.tsx`
- **Create**: `apps/desktop/src/components/input/__tests__/MessageInputContainer.test.tsx`
- **Update**: `apps/desktop/src/components/input/index.ts` (add export)
