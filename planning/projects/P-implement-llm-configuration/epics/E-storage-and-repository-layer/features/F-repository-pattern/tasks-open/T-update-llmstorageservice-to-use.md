---
kind: task
id: T-update-llmstorageservice-to-use
title: Update LlmStorageService to use new repository interface
status: open
priority: normal
prerequisites:
  - T-update-repository-interface-to
created: "2025-08-06T17:02:46.790026"
updated: "2025-08-06T17:02:46.790026"
schema_version: "1.1"
parent: F-repository-pattern
---

# Update LlmStorageService to Use New Repository Interface

## Context

The `LlmStorageService` in the desktop app currently uses the old repository methods. It needs to be updated to use the new interface methods (`create`, `read`, `update`, etc.) while maintaining the same public API for IPC handlers.

## Current Implementation

The service currently wraps repository methods like:

- `saveConfiguration()` → should use `create()`
- `getConfiguration()` → should use `read()`
- `updateConfiguration()` → should use `update()`

## Implementation Requirements

### 1. Update Service Methods

Modify `apps/desktop/src/electron/services/LlmStorageService.ts`:

```typescript
/**
 * Save a new LLM configuration with secure API key storage.
 */
async saveConfiguration(
  config: Omit<LlmConfigMetadata, "id" | "createdAt" | "updatedAt">,
  apiKey: string,
): Promise<StorageResult<string>> {
  try {
    const input: LlmConfigInput = { ...config, apiKey };
    const createdConfig = await this.repository.create(input);
    return { success: true, data: createdConfig.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get a specific LLM configuration by ID.
 */
async getConfiguration(
  id: string,
): Promise<StorageResult<LlmConfigMetadata | null>> {
  try {
    const config = await this.repository.read(id);
    if (!config) {
      return { success: true, data: null };
    }

    // Convert to metadata (remove API key for security)
    const { apiKey, ...metadata } = config;
    return { success: true, data: metadata };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 2. Add New Service Methods

Add methods that expose complete configurations when needed:

```typescript
/**
 * Get complete configuration with decrypted API key (for internal use).
 */
async getCompleteConfiguration(
  id: string,
): Promise<StorageResult<LlmConfig | null>> {
  try {
    const config = await this.repository.read(id);
    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 3. Update Error Handling

- Wrap repository errors in StorageResult format
- Maintain existing error handling patterns
- Add validation error handling for Zod schema errors

### 4. Maintain Backward Compatibility

- Keep existing method signatures unchanged
- Ensure IPC handlers continue to work without changes
- Internal implementation uses new repository methods

## Acceptance Criteria

- ✓ Service uses new repository interface methods internally
- ✓ Public service API remains unchanged for backward compatibility
- ✓ Error handling maintains existing StorageResult format
- ✓ Validation errors from Zod schemas are properly handled
- ✓ API keys are excluded from metadata responses for security
- ✓ New complete configuration method available for internal use
- ✓ All existing functionality preserved
- ✓ Performance maintained with new interface

## Files to Modify

- `apps/desktop/src/electron/services/LlmStorageService.ts`

## Testing Requirements

- Unit tests for updated service methods
- Verify backward compatibility with existing IPC handlers
- Test error handling with new repository interface
- Test API key security (excluded from metadata responses)

### Log
