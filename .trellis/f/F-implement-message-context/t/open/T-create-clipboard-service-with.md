---
id: T-create-clipboard-service-with
title: Create clipboard service with platform abstraction
status: open
priority: high
parent: F-implement-message-context
prerequisites:
  - T-remove-regenerate-functionalit
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T19:26:48.387Z
updated: 2025-08-31T19:26:48.387Z
---

# Create Clipboard Service with Platform Abstraction

## Context

Create a clipboard service following the existing platform abstraction pattern (similar to FileSystemBridge, DatabaseBridge) to handle copying message content to the system clipboard. This service will support both desktop renderer and main processes with appropriate implementations.

## Implementation Requirements

### 1. Create Clipboard Bridge Interface

**File**: `packages/shared/src/services/clipboard/ClipboardBridge.ts`

- Create `ClipboardBridge` interface with `writeText(text: string): Promise<void>` method
- Add JSDoc documentation with usage examples
- Follow existing bridge interface patterns from DatabaseBridge and FileSystemBridge

### 2. Create Browser Clipboard Implementation

**File**: `apps/desktop/src/renderer/clipboard/BrowserClipboardService.ts`

- Implement `ClipboardBridge` interface for browser/renderer environment
- Use modern Clipboard API (`navigator.clipboard.writeText()`)
- Add fallback for older browsers using `document.execCommand('copy')`
- Handle clipboard API permissions and security restrictions
- Throw appropriate errors for failed operations

### 3. Create Node Clipboard Implementation

**File**: `apps/desktop/src/main/clipboard/NodeClipboardService.ts`

- Implement `ClipboardBridge` interface for Node.js/Electron main process
- Research and use appropriate Node.js clipboard library (e.g., `clipboardy` or Electron's clipboard API)
- Handle platform-specific clipboard access (Windows, macOS, Linux)
- Throw appropriate errors for failed operations

### 4. Create Message Actions Service

**File**: `packages/shared/src/services/messaging/MessageActionsService.ts`

- Create service class that accepts `ClipboardBridge` via dependency injection
- Add `copyMessageContent(content: string): Promise<void>` method
- Sanitize content before copying (remove markdown, extra whitespace)
- Handle different message content types appropriately
- Add proper error handling with meaningful error messages

### 5. Update Service Exports

**File**: `packages/shared/src/services/index.ts`

- Export new clipboard and messaging services
- Follow existing export patterns

## Technical Approach

1. **Platform Abstraction**: Follow existing bridge pattern for cross-platform compatibility
2. **Dependency Injection**: Services accept bridge implementations in constructor
3. **Error Handling**: Use consistent error types and messages across implementations
4. **Content Sanitization**: Clean message content before clipboard operations
5. **Browser Compatibility**: Provide fallbacks for older clipboard APIs

## Acceptance Criteria

- ✅ `ClipboardBridge` interface created with proper documentation
- ✅ Browser clipboard service implements interface with modern API + fallback
- ✅ Node.js clipboard service implements interface with appropriate library
- ✅ `MessageActionsService` uses dependency injection pattern
- ✅ Content sanitization removes markdown and normalizes whitespace
- ✅ All services include comprehensive unit tests
- ✅ Error handling provides meaningful messages for failure cases
- ✅ TypeScript compilation succeeds without errors
- ✅ Services exported from appropriate index files

## Testing Requirements

- Unit tests for ClipboardBridge interface contract
- Unit tests for browser clipboard service with mocked Clipboard API
- Unit tests for Node.js clipboard service with mocked dependencies
- Unit tests for MessageActionsService with mocked clipboard bridge
- Test content sanitization with various message content types
- Test error scenarios (clipboard unavailable, permissions denied, etc.)

## Dependencies

- Requires completion of regenerate removal task for clean interfaces

## Security Considerations

- **Input Validation**: Sanitize message content before clipboard operations
- **Permission Handling**: Handle clipboard permission requests gracefully
- **Content Safety**: Ensure no sensitive data leaks through clipboard operations
- **Cross-Platform Security**: Respect platform clipboard security policies

## Performance Requirements

- Copy operations complete within 100ms for typical message sizes
- Memory efficient content processing for large messages
- No blocking operations on UI thread

## Out of Scope

- Do not implement delete functionality in this task
- Do not modify existing message UI components
- Do not integrate with parent components yet (separate task)
