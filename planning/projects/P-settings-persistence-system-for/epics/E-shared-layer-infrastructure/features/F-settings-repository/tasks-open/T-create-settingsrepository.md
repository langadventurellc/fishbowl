---
kind: task
id: T-create-settingsrepository
title: Create SettingsRepository interface and base implementation
status: open
priority: high
prerequisites: []
created: "2025-07-31T19:00:22.811706"
updated: "2025-07-31T19:00:22.811706"
schema_version: "1.1"
parent: F-settings-repository
---

# Create SettingsRepository Interface and Base Implementation

## Context

Implement the core SettingsRepository class that coordinates between the existing FileStorageService and Zod schema validation to provide a clean API for settings persistence. This follows the repository pattern and builds on the established infrastructure:

- **Existing Types**: `PersistedSettings` interface in `packages/shared/src/types/settings/PersistedSettings.ts`
- **Existing Schemas**: `persistedSettingsSchema` in `packages/shared/src/types/settings/persistedSettingsSchema.ts`
- **Existing Storage**: `FileStorageService` in `packages/shared/src/services/storage/FileStorageService.ts`
- **Existing Defaults**: `createDefaultPersistedSettings()` in `packages/shared/src/types/settings/createDefaultPersistedSettings.ts`

## Implementation Requirements

### 1. Create Interface Definition

Create `packages/shared/src/services/settings/SettingsRepositoryInterface.ts`:

```typescript
export interface SettingsRepositoryInterface {
  loadSettings(): Promise<PersistedSettings>;
  saveSettings(settings: Partial<PersistedSettings>): Promise<void>;
  getDefaultSettings(): PersistedSettings;
  validateSettings(settings: unknown): PersistedSettings;
}
```

### 2. Create SettingsRepository Class

Create `packages/shared/src/services/settings/SettingsRepository.ts`:

- Implement `SettingsRepositoryInterface`
- Constructor accepting `FileStorageService<PersistedSettings>` and optional settings file path
- Dependency injection for file storage service for testability
- Default settings path should be `"./preferences.json"`

### 3. Constructor Implementation

```typescript
constructor(
  private fileStorage: FileStorageService<PersistedSettings>,
  private settingsPath: string = "./preferences.json"
) {}
```

### 4. Implement getDefaultSettings() Method

- Return result of `createDefaultPersistedSettings()` directly
- No I/O operations - must be synchronous and fast
- Include comprehensive JSDoc documentation

### 5. Create Custom Error Types

Create `packages/shared/src/services/settings/errors/SettingsValidationError.ts`:

```typescript
export class SettingsValidationError extends Error {
  constructor(
    message: string,
    public readonly validationErrors: string[],
    public readonly originalData?: unknown,
  ) {
    super(message);
    this.name = "SettingsValidationError";
  }
}
```

### 6. Create Barrel Export

Create `packages/shared/src/services/settings/index.ts` exporting:

- `SettingsRepository`
- `SettingsRepositoryInterface`
- `SettingsValidationError`

## Detailed Acceptance Criteria

### Functional Requirements

- ✓ SettingsRepository class implements SettingsRepositoryInterface correctly
- ✓ Constructor accepts FileStorageService and optional settings path
- ✓ `getDefaultSettings()` returns complete default settings instantly
- ✓ `getDefaultSettings()` performs no I/O operations
- ✓ Custom SettingsValidationError includes validation details and context
- ✓ All methods have comprehensive JSDoc documentation
- ✓ Clean barrel export provides public API surface

### Code Quality Requirements

- ✓ Follow existing code patterns from FileStorageService implementation
- ✓ Use TypeScript strict mode with complete type annotations
- ✓ Include comprehensive JSDoc for all public methods
- ✓ Follow repository pattern best practices
- ✓ No UI dependencies (React, DOM, etc.)

### Unit Testing Requirements

Include unit tests in `packages/shared/src/services/settings/__tests__/SettingsRepository.test.ts`:

- ✓ Constructor properly initializes with default and custom paths
- ✓ `getDefaultSettings()` returns valid default settings object
- ✓ `getDefaultSettings()` returns same reference/values on multiple calls
- ✓ SettingsValidationError properly formats error messages and context
- ✓ All JSDoc examples work correctly
- ✓ Mock FileStorageService dependency properly in test setup

### Integration Points

- ✓ Compatible with existing FileStorageService API
- ✓ Uses existing PersistedSettings types correctly
- ✓ Leverages existing createDefaultPersistedSettings function
- ✓ Follows shared package architecture patterns

## Technical Notes

### File Locations

- Main class: `packages/shared/src/services/settings/SettingsRepository.ts`
- Interface: `packages/shared/src/services/settings/SettingsRepositoryInterface.ts`
- Errors: `packages/shared/src/services/settings/errors/SettingsValidationError.ts`
- Tests: `packages/shared/src/services/settings/__tests__/SettingsRepository.test.ts`
- Barrel: `packages/shared/src/services/settings/index.ts`

### Dependencies to Import

```typescript
import { FileStorageService } from "../storage/FileStorageService";
import { PersistedSettings } from "../../types/settings/PersistedSettings";
import { createDefaultPersistedSettings } from "../../types/settings/createDefaultPersistedSettings";
```

This task creates the foundation for the repository with proper architecture and testing setup.

### Log
