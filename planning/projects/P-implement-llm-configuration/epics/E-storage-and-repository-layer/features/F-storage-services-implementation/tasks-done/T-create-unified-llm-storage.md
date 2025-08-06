---
kind: task
id: T-create-unified-llm-storage
title: Create unified LLM storage service with shared architecture
status: done
priority: normal
prerequisites:
  - T-implement-llmsecurestorage-class
  - T-implement-file-storage
created: "2025-08-06T15:43:21.824870"
updated: "2025-08-06T21:30:00.000000"
schema_version: "1.1"
parent: F-storage-services-implementation
---

# Create Unified LLM Storage Service

## Context

**COMPLETED**: Refactored LLM storage architecture to use shared package following proper separation of concerns. Removed duplicate functionality and implemented clean repository pattern using existing `FileStorageService`.

## Implementation Completed

### Shared Package Architecture (`packages/shared/src/`)

1. **SecureStorageInterface** (`services/storage/SecureStorageInterface.ts`)
   - Platform-agnostic interface for secure storage operations
   - Implemented by Electron-specific `LlmSecureStorage`

2. **LlmConfigRepository** (`repositories/llmConfig/LlmConfigRepository.ts`)
   - Repository pattern following `SettingsRepository` architecture
   - Uses existing `FileStorageService` for metadata storage
   - Coordinates secure API key storage with configuration metadata
   - Atomic operations and proper cleanup

3. **Types** (`types/llmConfig/`)
   - `LlmConfigMetadata` interface
   - `StorageResult<T>` generic response type
   - Properly exported through shared package

4. **Utilities** (`utils/generateId.ts`)
   - UUID generation using Node.js crypto.randomBytes
   - Fallback to timestamp-based IDs for compatibility

### Desktop Implementation (`apps/desktop/src/electron/services/`)

**Created unified service using shared architecture:**

```typescript
// LlmStorageService.ts - Uses shared repository
import {
  LlmConfigRepository,
  FileStorageService,
  NodeFileSystemBridge,
  type LlmConfigMetadata,
  type StorageResult,
} from "@fishbowl-ai/shared";
import { LlmSecureStorage } from "./LlmSecureStorage";

export class LlmStorageService {
  private repository: LlmConfigRepository;

  constructor() {
    // Initialize file storage using existing FileStorageService
    const fileStorage = new FileStorageService<LlmConfigMetadata[]>(
      new NodeFileSystemBridge(),
    );

    // Initialize Electron secure storage
    const secureStorage = new LlmSecureStorage();

    // Create repository with userData path
    const configPath = path.join(app.getPath("userData"), "llm_config.json");
    this.repository = new LlmConfigRepository(
      fileStorage,
      secureStorage,
      configPath,
    );
  }

  // All methods delegate to repository
  async saveConfiguration(config, apiKey) {
    return this.repository.saveConfiguration(config, apiKey);
  }
  // ... other methods
}
```

## Architecture Benefits Achieved

1. **Eliminated duplication** - Removed custom `LlmFileStorage` in favor of existing `FileStorageService`
2. **Proper separation of concerns** - Shared package contains business logic, desktop app only has UI and platform-specific code
3. **Repository pattern** - Clean abstraction over storage implementations
4. **Platform abstraction** - `SecureStorageInterface` allows different implementations (Electron, mobile, etc.)
5. **Atomic operations** - Repository ensures data consistency between metadata and API key storage
6. **Error handling** - Comprehensive error handling with cleanup on partial failures

## Refactoring Completed

### Removed Duplicated Files

- `apps/desktop/src/electron/services/LlmFileStorage.ts` ❌
- `apps/desktop/src/electron/services/__tests__/LlmFileStorage.test.ts` ❌
- `apps/desktop/src/types/llmStorage/` (entire directory) ❌

### Updated Files

- `apps/desktop/src/electron/services/LlmSecureStorage.ts` ✅ (now implements `SecureStorageInterface`)
- `apps/desktop/src/electron/services/__tests__/LlmSecureStorage.test.ts` ✅ (updated to use Error instead of StorageError)
- `apps/desktop/src/types/__tests__/llmStorage.test.ts` ✅ (updated imports to use shared package)

## Acceptance Criteria ✅

- ✅ **Repository pattern implemented** following `SettingsRepository` architecture
- ✅ **Shared package properly structured** with types, interfaces, and repository
- ✅ **SecureStorageInterface abstraction** allows platform-specific implementations
- ✅ **Uses existing FileStorageService** instead of duplicating functionality
- ✅ **Atomic operations** with proper cleanup on failures
- ✅ **UUID generation** using Node.js crypto with fallback
- ✅ **Timestamps automatically managed** (createdAt, updatedAt)
- ✅ **Comprehensive error handling** with StorageResult pattern
- ✅ **All quality checks pass** (lint, format, type-check)

## Files Created

**Shared Package (`packages/shared/src/`):**

- `services/storage/SecureStorageInterface.ts`
- `repositories/llmConfig/LlmConfigRepository.ts`
- `repositories/llmConfig/LlmConfigRepositoryInterface.ts`
- `repositories/llmConfig/index.ts`
- `types/llmConfig/LlmConfigMetadata.ts`
- `types/llmConfig/StorageResult.ts`
- `types/llmConfig/index.ts`
- `utils/generateId.ts`
- `utils/index.ts`

**Desktop App (`apps/desktop/src/electron/services/`):**

- `LlmStorageService.ts` (unified service using shared repository)

### Log

**2025-08-06 21:30** - Completed architectural refactoring to use shared package with repository pattern, eliminated duplication, all quality checks passing.
