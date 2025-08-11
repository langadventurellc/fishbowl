---
id: T-implement-roles-repository
title: Implement roles repository with file operations
status: open
priority: high
parent: F-desktop-adapter-implementation
prerequisites:
  - T-create-roles-ipc-constants
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-11T03:14:36.699Z
updated: 2025-08-11T03:14:36.699Z
---

# Implement Roles Repository with File Operations

## Context

Create the repository layer that handles file system operations for roles persistence, following the same pattern as the existing settings repository.

## Implementation Requirements

Create `apps/desktop/src/data/repositories/RolesRepository.ts`:

### Core Repository Class

```typescript
export class RolesRepository {
  private readonly logger = createLogger("RolesRepository");
  private readonly filePath: string;

  constructor(dataPath: string) {
    this.filePath = path.join(dataPath, "roles.json");
  }

  async loadRoles(): Promise<PersistedRolesSettingsData | null>;
  async saveRoles(roles: PersistedRolesSettingsData): Promise<void>;
  async resetRoles(): Promise<void>;
}
```

### File Operations

- **loadRoles()**: Read from roles.json, return null if file doesn't exist
- **saveRoles()**: Atomic write using temp files, create directory if needed
- **resetRoles()**: Delete roles.json file safely

### Error Handling

- Map file system errors to appropriate responses
- Handle ENOENT (file not found) as null return for load
- Handle EPERM/EACCES as permission errors
- Handle JSON parse errors with recovery attempts
- Never expose file system paths in error messages

### Repository Manager

Create `apps/desktop/src/data/repositories/rolesRepositoryManager.ts`:

```typescript
class RolesRepositoryManager {
  private repository: RolesRepository | null = null;

  initialize(dataPath: string): void;
  get(): RolesRepository;
}

export const rolesRepositoryManager = new RolesRepositoryManager();
```

## Acceptance Criteria

- [ ] RolesRepository implements all three methods (load, save, reset)
- [ ] Uses atomic writes with temporary files for data integrity
- [ ] Creates directory structure if it doesn't exist
- [ ] Returns null for missing files (not error) in loadRoles
- [ ] Proper error mapping for file system operations
- [ ] Repository manager provides singleton access
- [ ] Follows exact same patterns as SettingsRepository
- [ ] Includes comprehensive unit tests with mocked fs operations
- [ ] Tests cover all error scenarios (permissions, JSON parse, etc.)

## Dependencies

- T-create-roles-ipc-constants (for types)

## Testing Requirements

- Mock file system operations using jest
- Test successful load/save/reset operations
- Test file not found scenarios (should return null)
- Test permission errors and disk full scenarios
- Test JSON parsing errors and recovery
- Test atomic write operations
- Test directory creation
- Verify repository manager singleton behavior
