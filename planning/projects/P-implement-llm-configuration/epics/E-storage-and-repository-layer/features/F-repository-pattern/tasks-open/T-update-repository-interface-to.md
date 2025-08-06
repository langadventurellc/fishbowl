---
kind: task
id: T-update-repository-interface-to
title: Update repository interface to return complete LlmConfig objects
status: open
priority: high
prerequisites:
  - T-add-complete-llmconfig-types-and
created: "2025-08-06T17:02:28.594768"
updated: "2025-08-06T17:02:28.594768"
schema_version: "1.1"
parent: F-repository-pattern
---

# Update Repository Interface to Return Complete LlmConfig Objects

## Context

The current repository implementation only works with `LlmConfigMetadata` (without API keys), but the feature specification requires methods that return complete `LlmConfig` objects with decrypted API keys. The interface needs to match the specification exactly.

## Current vs Required Interface

**Current Interface:**

```typescript
getConfiguration(id: string): Promise<StorageResult<LlmConfigMetadata | null>>;
saveConfiguration(config: Omit<LlmConfigMetadata, "id">, apiKey: string): Promise<StorageResult<string>>;
```

**Required Interface (from specification):**

```typescript
create(config: LlmConfigInput): Promise<LlmConfig>;
read(id: string): Promise<LlmConfig | null>;
update(id: string, updates: Partial<LlmConfigInput>): Promise<LlmConfig>;
delete(id: string): Promise<void>;
list(): Promise<LlmConfigMetadata[]>;
exists(id: string): Promise<boolean>;
```

## Implementation Requirements

### 1. Update Repository Interface

Modify `packages/shared/src/repositories/llmConfig/LlmConfigRepositoryInterface.ts`:

```typescript
export interface LlmConfigRepositoryInterface {
  create(config: LlmConfigInput): Promise<LlmConfig>;
  read(id: string): Promise<LlmConfig | null>;
  update(id: string, updates: Partial<LlmConfigInput>): Promise<LlmConfig>;
  delete(id: string): Promise<void>;
  list(): Promise<LlmConfigMetadata[]>;
  exists(id: string): Promise<boolean>;

  // Keep existing method for backward compatibility
  isSecureStorageAvailable(): boolean;
}
```

### 2. Update Repository Implementation

Modify `packages/shared/src/repositories/llmConfig/LlmConfigRepository.ts`:

- **Add `read()` method**: Retrieves complete config with decrypted API key
- **Add `create()` method**: Creates new config and returns complete object
- **Add `update()` method**: Updates config and returns complete updated object
- **Add `list()` method**: Returns metadata only (no API keys for security)
- **Add `exists()` method**: Checks if configuration exists
- **Maintain existing methods**: Keep current methods for backward compatibility

### 3. Implement API Key Decryption Logic

The `read()` method must:

- Load metadata from file storage
- Retrieve encrypted API key from secure storage
- Combine into complete `LlmConfig` object
- Handle cases where API key is missing (return null)

### 4. Add Input Validation

Use Zod schemas to validate:

- `LlmConfigInput` data before storage operations
- Return validation errors with clear messages
- Ensure data integrity before persistence

## Acceptance Criteria

- ✓ Repository interface matches specification exactly
- ✓ `create()` method validates input and returns complete config
- ✓ `read()` method retrieves complete config with decrypted API key
- ✓ `update()` method atomically updates both storages and returns updated config
- ✓ `delete()` method removes from both storages
- ✓ `list()` method returns metadata only (security - no API keys)
- ✓ `exists()` method checks configuration existence
- ✓ Input validation using Zod schemas with clear error messages
- ✓ Backward compatibility maintained with existing methods
- ✓ Atomic operations maintain data consistency
- ✓ Graceful handling when API key missing from secure storage

## Files to Modify

- `packages/shared/src/repositories/llmConfig/LlmConfigRepositoryInterface.ts`
- `packages/shared/src/repositories/llmConfig/LlmConfigRepository.ts`

## Testing Requirements

- Unit tests for all new repository methods
- Test complete config retrieval with API key decryption
- Test atomic update operations across both storages
- Test validation error handling with invalid input
- Test graceful handling of missing API keys

### Log
