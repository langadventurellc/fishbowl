---
id: F-desktop-adapter-implementation
title: Desktop Adapter Implementation
status: done
priority: medium
parent: E-file-persistence-and-state
prerequisites:
  - F-roles-persistence-adapter
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-10T21:35:35.247Z
updated: 2025-08-10T21:35:35.247Z
---

# Desktop Adapter Implementation

## Purpose and Functionality

Implement the desktop-specific RolesPersistenceAdapter that uses Electron's IPC mechanisms to save and load roles data from the file system. This adapter handles the platform-specific details of file operations while conforming to the adapter interface.

## Key Components to Implement

### Desktop Adapter (`apps/desktop/src/adapters/`)

- **DesktopRolesAdapter Class**: Implements RolesPersistenceAdapter interface
- **IPC Integration**: Uses window.electronAPI for file operations
- **Error Handling**: Maps Electron errors to RolesPersistenceError
- **Singleton Export**: Provides ready-to-use adapter instance

### Context Provider (`apps/desktop/src/contexts/`)

- **RolesProvider Component**: Provides adapter to component tree
- **useRolesAdapter Hook**: Access adapter from components
- **Context Type Definitions**: Proper TypeScript support

### Electron API Integration

- **Roles IPC Handlers**: Main process file operations
- **Security Validation**: Path traversal prevention
- **File Permissions**: Proper file access controls

## Detailed Acceptance Criteria

### Adapter Implementation

- [ ] Implements all RolesPersistenceAdapter methods
- [ ] save() writes to roles.json in user data directory
- [ ] load() reads from roles.json, returns null if not found
- [ ] reset() deletes roles.json file
- [ ] All methods handle Electron IPC errors properly
- [ ] Errors wrapped in RolesPersistenceError with context

### IPC Communication

- [ ] Uses window.electronAPI.roles namespace
- [ ] Implements proper request/response handling
- [ ] Handles IPC timeouts gracefully
- [ ] Validates responses from main process
- [ ] Implements retry logic for transient failures

### Context Provider Requirements

- [ ] RolesProvider wraps component tree
- [ ] Provides singleton adapter instance
- [ ] useRolesAdapter hook throws if used outside provider
- [ ] Context properly typed with TypeScript
- [ ] Follows same pattern as SettingsProvider

### File Operations

- [ ] Saves to app.getPath('userData')/roles.json
- [ ] Creates directory if it doesn't exist
- [ ] Implements atomic writes with temp files
- [ ] Handles file permission errors
- [ ] Validates JSON structure after read
- [ ] Implements file locking for concurrent access

### Error Handling

- [ ] Maps "file not found" to null return (not error)
- [ ] Maps permission errors to RolesPersistenceError
- [ ] Maps JSON parse errors with recovery attempt
- [ ] Includes detailed error context for debugging
- [ ] Never exposes file system paths in errors

## Technical Requirements

### File Structure

```
apps/desktop/src/
├── adapters/
│   ├── desktopRolesAdapter.ts
│   └── __tests__/
│       └── desktopRolesAdapter.test.ts
├── contexts/
│   ├── RolesProvider.tsx
│   └── index.ts (updated exports)
└── main/
    └── ipc/
        └── roles.ts (IPC handlers)
```

### Implementation Pattern

```typescript
class DesktopRolesAdapter implements RolesPersistenceAdapter {
  async save(roles: PersistedRolesSettingsData): Promise<void> {
    try {
      await window.electronAPI.roles.save(roles);
    } catch (error) {
      // Error mapping logic
      throw new RolesPersistenceError(message, "save", error);
    }
  }
  // ... other methods
}
```

### Electron Main Process

- Register IPC handlers for roles operations
- Implement file system operations safely
- Validate all inputs from renderer process
- Use electron-store or direct fs operations
- Follow security best practices

## Dependencies

- Requires F-roles-persistence-adapter (interface to implement)
- Uses Electron IPC mechanisms
- Integrates with existing desktop infrastructure
- Follows existing desktop adapter patterns

## Testing Requirements

- Unit tests with mocked Electron API
- Integration tests with test file system
- Error scenario tests (permissions, disk full)
- Concurrent operation tests
- Context provider tests
- Hook usage tests

## Security Considerations

- Validate all file paths to prevent traversal
- Sanitize data before writing to disk
- Use Electron's contextBridge safely
- Never expose file system paths to renderer
- Implement proper CSP for file operations
- Validate JSON structure to prevent injection

## Performance Requirements

- File operations complete in < 50ms
- Use async I/O to prevent blocking
- Implement caching for frequent reads
- Batch writes when possible
- Handle large role lists (100+ roles) efficiently
