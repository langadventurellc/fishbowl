---
id: E-desktop-integration-and-1
title: Desktop Integration and Services
status: in-progress
priority: medium
parent: P-implement-personalities
prerequisites:
  - E-persistence-layer-and-state
affectedFiles:
  apps/desktop/src/adapters/desktopPersonalitiesAdapter.ts: Created new adapter
    class implementing PersonalitiesPersistenceAdapter interface with save(),
    load(), and reset() stub methods. Includes proper TypeScript types, JSDoc
    documentation, and exported instance following established patterns.;
    Implemented save() method with proper error handling following
    DesktopRolesAdapter pattern; Implemented load() method with IPC
    communication, proper null handling for missing files, and comprehensive
    error handling that preserves PersonalitiesPersistenceError instances while
    converting generic errors; Implemented reset method with proper error
    handling following exact pattern from DesktopRolesAdapter
  apps/desktop/src/types/electron.d.ts: Added personalities property to
    ElectronAPI interface with load, save, and reset methods
  apps/desktop/src/electron/preload.ts: Added personalities IPC implementation with error handling and logging
  apps/desktop/src/shared/ipc/personalitiesConstants.ts: Created IPC channel constants for personalities operations
  apps/desktop/src/shared/ipc/personalities/loadRequest.ts: Created personalities load request type interface
  apps/desktop/src/shared/ipc/personalities/saveRequest.ts: Created personalities save request type interface
  apps/desktop/src/shared/ipc/personalities/saveResponse.ts: Created personalities save response type interface
  apps/desktop/src/shared/ipc/personalities/loadResponse.ts: Created personalities load response type interface
  apps/desktop/src/shared/ipc/personalities/resetRequest.ts: Created personalities reset request type interface
  apps/desktop/src/shared/ipc/personalities/resetResponse.ts: Created personalities reset response type interface
  apps/desktop/src/shared/ipc/index.ts: Added personalities constants and types to IPC exports
  apps/desktop/src/adapters/__tests__/desktopPersonalitiesAdapter.test.ts:
    Created comprehensive unit tests with 20 test cases covering all error
    scenarios, edge cases, and performance requirements; Added comprehensive
    test suite for load method including 16 test cases covering successful
    operations, null return scenarios, error handling, type validation,
    performance testing, and edge cases; Added comprehensive unit tests for
    reset method including all specified test cases, error handling scenarios,
    and interface compliance tests
  apps/desktop/src/data/repositories/PersonalitiesRepository.ts:
    Created new PersonalitiesRepository class with loadPersonalities,
    savePersonalities, and resetPersonalities methods, following RolesRepository
    pattern with FileStorageService integration
  apps/desktop/src/data/repositories/__tests__/PersonalitiesRepository.test.ts:
    Created comprehensive unit tests with 32 test cases covering all methods,
    error scenarios, validation edge cases, and concurrent operations
  apps/desktop/src/data/repositories/personalitiesRepositoryManager.ts:
    Created PersonalitiesRepositoryManager singleton following
    rolesRepositoryManager pattern with initialize, get, and reset methods;
    Created PersonalitiesRepositoryManager class following
    rolesRepositoryManager pattern exactly - singleton with initialize(), get(),
    and reset() methods
  apps/desktop/src/electron/personalitiesHandlers.ts: Implemented
    setupPersonalitiesHandlers with three IPC handlers (load, save, reset)
    including error handling, logging, and integration with
    PersonalitiesRepository
  apps/desktop/src/electron/__tests__/personalitiesHandlers.test.ts:
    Created comprehensive unit tests with 100% coverage testing all success and
    error paths for each handler
  apps/desktop/src/data/repositories/__tests__/personalitiesRepositoryManager.test.ts:
    Created comprehensive unit tests with 100% coverage - 17 tests covering
    initialization, access control, singleton behavior, error handling, and
    integration
  apps/desktop/src/electron/main.ts: Added personalities repository manager
    initialization with userDataPath and setupPersonalitiesHandlers call during
    app startup, following exact same patterns as roles integration. Includes
    proper error handling and logging for both repository initialization and IPC
    handler registration.
  apps/desktop/src/contexts/PersonalitiesProvider.tsx: Created new
    PersonalitiesProvider component with context, lifecycle management, loading
    states, and error handling following RolesProvider pattern
  packages/ui-shared/src/stores/index.ts: Added export for usePersonalitiesStore
    to make it available for import in desktop app
log: []
schema: v1.0
childrenIds:
  - F-desktop-personalities-adapter
  - F-electron-ipc-personalities
  - F-personalities-file-management
  - F-react-personalities-context
created: 2025-08-15T17:59:56.660Z
updated: 2025-08-15T17:59:56.660Z
---

# Desktop Integration and Services

## Purpose and Goals

Implement the desktop-specific integration layer for personalities, including the Electron IPC handlers, desktop adapter implementation, and React context provider. This epic connects the UI store to the file system through Electron's secure IPC channels, following the proven Roles pattern.

## Major Components and Deliverables

### Desktop Adapter (`apps/desktop`)

- Implement `DesktopPersonalitiesAdapter` class
- Connect to Electron IPC for file operations
- Handle load, save, and reset operations
- Proper error handling and type conversion

### Electron IPC Handlers

- Add personalities IPC channel handlers in main process
- Integrate with existing FileStorageService
- Handle file read/write with proper error handling
- Ensure security with input validation

### Context Provider (`apps/desktop`)

- Create `PersonalitiesProvider` React component
- Initialize store with desktop adapter on mount
- Load initial personalities data
- Handle initialization errors gracefully

### File Operations

- Ensure `personalities.json` created on first run
- Load default personalities if no file exists
- Handle file corruption recovery
- Implement backup before destructive operations

## Detailed Acceptance Criteria

### Functional Deliverables

- [ ] Desktop adapter implements all three methods (save, load, reset)
- [ ] IPC handlers validate all input before file operations
- [ ] Context provider initializes store on application start
- [ ] Default personalities load on first application run
- [ ] File corruption handled with recovery to defaults
- [ ] Backup created before reset operations

### Integration Requirements

- [ ] Adapter integrates with existing FileStorageService
- [ ] IPC channels follow existing naming conventions
- [ ] Context provider works with existing app structure
- [ ] Error messages propagate correctly to UI
- [ ] File operations respect user data directory

### Security Standards

- [ ] IPC input validation prevents injection attacks
- [ ] File paths sanitized before operations
- [ ] No direct file system access from renderer
- [ ] Proper error messages without exposing system paths

### Quality Standards

- [ ] Full TypeScript coverage
- [ ] Unit tests for adapter methods
- [ ] Error scenarios properly tested

## Technical Considerations

### Desktop Adapter Implementation

```typescript
export class DesktopPersonalitiesAdapter
  implements PersonalitiesPersistenceAdapter
{
  async save(personalities: PersistedPersonalitiesSettingsData): Promise<void> {
    await window.electronAPI.personalities.save(personalities);
  }

  async load(): Promise<PersistedPersonalitiesSettingsData | null> {
    return await window.electronAPI.personalities.load();
  }

  async reset(): Promise<void> {
    await window.electronAPI.personalities.reset();
  }
}
```

### IPC Channel Structure

```typescript
// Main process
ipcMain.handle("personalities:save", async (event, data) => {
  // Validate and save using FileStorageService
});

ipcMain.handle("personalities:load", async () => {
  // Load from file or return defaults
});

ipcMain.handle("personalities:reset", async () => {
  // Backup and reset to defaults
});
```

### Context Provider Pattern

```typescript
export const PersonalitiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { initialize } = usePersonalitiesStore();

  useEffect(() => {
    initialize(desktopPersonalitiesAdapter)
      .finally(() => setIsInitializing(false));
  }, []);

  if (isInitializing) return <LoadingSpinner />;

  return (
    <PersonalitiesContext.Provider value={desktopPersonalitiesAdapter}>
      {children}
    </PersonalitiesContext.Provider>
  );
};
```

### File Management

- File path: `app.getPath('userData')/personalities.json`
- Backup path: `app.getPath('userData')/personalities.backup.json`
- Default data loaded from bundled `defaultPersonalities.json`
- File operations atomic with write-rename pattern

## Dependencies

- **E-persistence-layer-and-state**: Requires store and adapter interface

## Estimated Scale

- 3-4 features covering adapter, IPC, provider, and file operations
- Approximately 6-8 development hours
- Enables UI integration to begin

## User Stories

- As a user, I want my personalities to persist between application sessions
- As a user, I want default personalities available on first launch
- As a developer, I need secure IPC communication for file operations
- As a user, I want my data recovered if the file becomes corrupted
