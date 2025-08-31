---
id: T-implement-copy-functionality
title: Implement copy functionality with clipboard integration
status: open
priority: high
parent: F-implement-message-context
prerequisites:
  - T-create-clipboard-service-with
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T19:31:08.587Z
updated: 2025-08-31T19:31:08.587Z
---

# Implement Copy Functionality with Clipboard Integration

## Context

Implement the functional copy behavior by integrating the clipboard service with the message context menu. This task connects the UI components with the clipboard service to provide working copy functionality for message content.

## Implementation Requirements

### 1. Update MainContentPanelDisplay Context Menu Handler

**File**: `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`

- Replace empty `onContextMenuAction={() => {}}` with real implementation
- Add copy action case that uses clipboard service to copy message content
- Import and use appropriate services (clipboard, message actions)

### 2. Integrate Services in Application

**File**: Research existing service integration patterns, likely in `apps/desktop/src/renderer/services/` or similar

- Instantiate clipboard service with appropriate platform implementation
- Instantiate message actions service with clipboard dependency injection
- Wire services into component context or service container

### 3. Create Service Integration Hook

**File**: `apps/desktop/src/hooks/services/useMessageActions.ts`

- Create React hook that provides access to message actions service
- Handle service initialization and lifecycle
- Provide methods for copy operations with proper error handling
- Follow existing hook patterns in the codebase

### 4. Handle Copy Operation Flow

- Implement complete copy workflow:
  1. User clicks "Copy message" from context menu
  2. Extract message content and sanitize for clipboard
  3. Attempt clipboard write operation

### 5. Content Processing for Copy

- Strip markdown formatting from message content
- Normalize whitespace and line endings
- Handle different message types (user, agent, system) appropriately
- Preserve essential text structure while removing UI-specific formatting

## Technical Approach

1. **Service Integration**: Wire clipboard services into component hierarchy
2. **Error Boundaries**: Graceful error handling with user feedback
3. **Content Processing**: Clean text preparation for clipboard operations
4. **User Experience**: Immediate feedback for copy operations
5. **Performance**: Asynchronous operations don't block UI

## Acceptance Criteria

- ✅ Copy context menu action copies message content to system clipboard
- ✅ Message content is properly sanitized before copying
- ✅ Copy operation works for all message types (user, agent, system)
- ✅ Copy functionality includes comprehensive unit tests
- ✅ Integration with existing service architecture
- ✅ TypeScript compilation succeeds without errors
- ✅ Copy operation completes within 100ms performance requirement

## Dependencies

- Requires clipboard service with platform abstraction
- Requires regenerate removal for clean component interfaces

## Security Considerations

- **Content Sanitization**: Remove any potentially harmful content before clipboard
- **Permission Validation**: Handle clipboard permission denials gracefully
- **Data Protection**: Ensure copied content doesn't expose sensitive information
- **Cross-Site Security**: Prevent clipboard operations from being misused

## Performance Requirements

- Copy operation completes within 100ms
- Content processing is memory efficient for large messages
- No UI blocking during asynchronous clipboard operations
- Minimal performance impact on message rendering

## Out of Scope

- Do not implement delete functionality in this task
- Do not modify MessageContextMenu or MessageItem components
- Do not implement advanced clipboard features (rich text, images, etc.)
- Delete operation integration is handled in separate task
