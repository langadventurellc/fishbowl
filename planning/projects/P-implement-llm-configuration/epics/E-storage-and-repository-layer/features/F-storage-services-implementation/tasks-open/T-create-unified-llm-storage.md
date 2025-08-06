---
kind: task
id: T-create-unified-llm-storage
title: Create unified LLM storage service with integration tests
status: open
priority: normal
prerequisites:
  - T-implement-llmsecurestorage-class
  - T-implement-file-storage
created: "2025-08-06T15:43:21.824870"
updated: "2025-08-06T15:43:21.824870"
schema_version: "1.1"
parent: F-storage-services-implementation
---

# Create Unified LLM Storage Service

## Context

Create a unified service that combines secure API key storage and configuration metadata storage. This provides a single interface for all LLM storage operations and includes integration tests to verify the services work together correctly.

## Implementation Requirements

### Create `apps/desktop/src/electron/services/LlmStorageService.ts`

Implement a service that coordinates both secure and file storage:

```typescript
import { LlmSecureStorage } from "./LlmSecureStorage";
import { LlmFileStorage } from "./LlmFileStorage";
import { LlmConfigMetadata, StorageResult } from "../../types/llmStorage";
import { generateId } from "@fishbowl-ai/shared";

export class LlmStorageService {
  private secureStorage: LlmSecureStorage;
  private fileStorage: LlmFileStorage;

  constructor() {
    // Initialize both storage services
  }

  saveConfiguration(
    config: Omit<LlmConfigMetadata, "id" | "createdAt" | "updatedAt">,
    apiKey: string,
  ): StorageResult<string> {
    // Generate ID using existing generateId utility
    // Save API key to secure storage
    // Save metadata to file storage
    // Return configuration ID
  }

  updateConfiguration(
    id: string,
    updates: Partial<LlmConfigMetadata>,
    newApiKey?: string,
  ): StorageResult<void> {
    // Update metadata in file storage
    // Update API key in secure storage if provided
  }

  getConfiguration(id: string): StorageResult<LlmConfigMetadata | null> {
    // Load metadata from file storage
    // Verify API key exists in secure storage
  }

  getAllConfigurations(): StorageResult<LlmConfigMetadata[]> {
    // Load all configurations from file storage
    // Verify each has corresponding API key
  }

  deleteConfiguration(id: string): StorageResult<void> {
    // Remove from both secure and file storage
    // Ensure cleanup is complete
  }

  isSecureStorageAvailable(): boolean {
    // Check if secure storage is available
  }
}
```

## Technical Approach

1. **Coordinate storage operations** - Ensure metadata and API keys stay in sync
2. **Use existing generateId** - Import from `@fishbowl-ai/shared` for UUID generation
3. **Handle partial failures** - If one storage fails, clean up the other
4. **Provide unified interface** - Single service for all LLM storage operations
5. **Add timestamps** - Automatically set createdAt and updatedAt fields

## Implementation Steps

1. **Create coordinated save operation** - Generate ID, save to both storages atomically
2. **Implement update operations** - Handle partial updates to metadata and API keys
3. **Add retrieval methods** - Load configurations with validation
4. **Implement cleanup** - Ensure delete removes from both storages
5. **Add error handling** - Graceful handling of storage failures

## Acceptance Criteria

- ✓ `saveConfiguration()` generates ID and saves to both storages
- ✓ `updateConfiguration()` handles metadata and API key updates
- ✓ `getConfiguration()` returns complete configuration data
- ✓ `getAllConfigurations()` returns all stored configurations
- ✓ `deleteConfiguration()` removes from both storages completely
- ✓ Uses `generateId()` utility for UUID generation
- ✓ Automatically sets createdAt and updatedAt timestamps
- ✓ Handles storage failures gracefully with proper cleanup
- ✓ Provides consistent StorageResult response format

## Testing Requirements

Create integration tests in `apps/desktop/src/electron/services/__tests__/LlmStorageService.test.ts`:

- Test complete save and retrieve cycle
- Test update operations for both metadata and API keys
- Test delete operations clean up both storages
- Test error handling when one storage fails
- Test behavior when secure storage is unavailable
- Verify ID generation and timestamp setting

## Dependencies

- T-implement-llmsecurestorage-class (LlmSecureStorage)
- T-implement-file-storage (LlmFileStorage)
- `generateId()` utility from `@fishbowl-ai/shared`

## Files to Create

- `apps/desktop/src/electron/services/LlmStorageService.ts`
- `apps/desktop/src/electron/services/__tests__/LlmStorageService.test.ts`

## Integration Considerations

- **Atomic operations** - Ensure both storages are updated or neither
- **Consistency checks** - Verify metadata and API keys stay synchronized
- **Graceful degradation** - Handle cases where secure storage is unavailable
- **Performance** - Minimize file I/O operations where possible

### Log
