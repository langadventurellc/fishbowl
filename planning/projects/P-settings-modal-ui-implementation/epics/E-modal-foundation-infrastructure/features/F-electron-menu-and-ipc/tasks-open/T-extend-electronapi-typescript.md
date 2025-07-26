---
kind: task
id: T-extend-electronapi-typescript
title: Extend ElectronAPI TypeScript interfaces for IPC methods
status: open
priority: high
prerequisites: []
created: "2025-07-26T17:18:26.471623"
updated: "2025-07-26T17:18:26.471623"
schema_version: "1.1"
parent: F-electron-menu-and-ipc
---

# Extend ElectronAPI TypeScript Interfaces for IPC Methods

## Context

The current `ElectronAPI` interface in `apps/desktop/src/types/electron.d.ts` only exposes platform and version information. We need to extend it to support IPC methods for opening the settings modal from Electron menu items and keyboard shortcuts.

## Technical Approach

Extend the existing TypeScript interface following Electron security best practices with proper IPC method signatures that will be implemented in subsequent tasks.

## Implementation Requirements

### Update `apps/desktop/src/types/electron.d.ts`:

- Add IPC method signatures for settings modal control
- Follow secure IPC patterns from Electron documentation
- Include callback types for event listeners
- Add proper JSDoc documentation for methods
- Ensure TypeScript strict mode compatibility

### Required Interface Extensions:

```typescript
export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  // New IPC methods for settings modal
  onOpenSettings: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}
```

## Acceptance Criteria

- [ ] `ElectronAPI` interface extended with `onOpenSettings` method signature
- [ ] `removeAllListeners` method added for cleanup
- [ ] Proper TypeScript types for callback functions
- [ ] JSDoc documentation added for all new methods
- [ ] Interface maintains backward compatibility with existing code
- [ ] No TypeScript compilation errors
- [ ] Follows existing project TypeScript conventions and patterns

## Dependencies

- Must complete before IPC channel infrastructure task
- Provides type safety for subsequent IPC implementation

## Security Considerations

- Interface design follows principle of least privilege
- Only exposes necessary IPC functionality to renderer process
- Method signatures prevent arbitrary IPC message sending

## Testing Requirements

- Include TypeScript compilation check as part of implementation
- Verify interface works with existing code
- Add type tests if project uses them

## Files to Modify

- `apps/desktop/src/types/electron.d.ts` - Primary interface extension

### Log
