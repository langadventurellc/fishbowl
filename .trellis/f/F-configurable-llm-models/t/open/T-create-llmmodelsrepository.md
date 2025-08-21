---
id: T-create-llmmodelsrepository
title: Create LlmModelsRepository for file operations
status: open
priority: medium
parent: F-configurable-llm-models
prerequisites:
  - T-create-llm-models-default
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T19:37:52.282Z
updated: 2025-08-21T19:37:52.282Z
---

## Context

Create the LlmModelsRepository class that handles file operations for the LLM models configuration file. This follows the exact pattern established by PersonalitiesRepository and RolesRepository.

The repository handles atomic file operations, validation, error handling, and default initialization following established patterns in `apps/desktop/src/data/repositories/PersonalitiesRepository.ts`.

## Specific Implementation Requirements

### 1. Create LlmModelsRepository Class (`apps/desktop/src/data/repositories/LlmModelsRepository.ts`)

Follow the exact structure and patterns from PersonalitiesRepository:

```typescript
import * as path from "path";
import {
  PersistedLlmModelsSettingsData,
  persistedLlmModelsSettingsSchema,
  createLoggerSync,
  FileStorageService,
  FileStorageError,
  createDefaultLlmModelsSettings,
} from "@fishbowl-ai/shared";
import { NodeFileSystemBridge } from "../../main/services/NodeFileSystemBridge";
import { NodeCryptoUtils } from "../../main/utils/NodeCryptoUtils";
import { NodePathUtils } from "../../main/utils/NodePathUtils";

export class LlmModelsRepository {
  private static readonly DEFAULT_LLM_MODELS_FILE_NAME = "llmModels.json";
  // ... rest of implementation following PersonalitiesRepository pattern
}
```

### 2. Implement Core Methods

Following PersonalitiesRepository, implement these methods:

**`loadLlmModels(): Promise<PersistedLlmModelsSettingsData>`**

- Load models from storage file
- Create default models if file doesn't exist
- Automatically save defaults for future loads
- Handle file system errors gracefully

**`saveLlmModels(models: PersistedLlmModelsSettingsData): Promise<void>`**

- Save models to storage with atomic write
- Validate data before saving
- Update timestamp during save
- Create directory if needed

**`resetLlmModels(): Promise<void>`**

- Reset models by loading defaults and saving them
- Use createDefaultLlmModelsSettings for defaults
- Handle reset operation errors

### 3. Private Helper Methods

**`validateLlmModels(models: unknown): PersistedLlmModelsSettingsData`**

- Validate and parse unknown data into typed models settings
- Use persistedLlmModelsSettingsSchema for validation
- Provide clear error messages for validation failures

**`mapError(error: unknown, operation: string): Error`**

- Map file system errors to appropriate error types
- Hide internal file paths from error messages for security
- Handle common error codes (ENOENT, EPERM, ENOSPC, etc.)

### 4. Constructor and Dependencies

- Accept `dataPath` parameter for file operations
- Initialize FileStorageService with required bridges
- Set up logger with component context
- Create file path using path.join with DEFAULT_LLM_MODELS_FILE_NAME

## Technical Approach

1. **Copy PersonalitiesRepository**: Use as exact template for structure
2. **Replace Domain Logic**: Change personalities-specific code to LLM models
3. **Maintain Error Patterns**: Keep same error handling and logging
4. **Preserve Method Signatures**: Match async/await patterns and return types
5. **Include Documentation**: Copy JSDoc patterns with updated descriptions
6. **Use Same Dependencies**: FileStorageService, bridges, and utilities

## Detailed Acceptance Criteria

### File Operations Requirements

- ✅ loadLlmModels() creates defaults if file doesn't exist
- ✅ saveLlmModels() performs atomic writes with FileStorageService
- ✅ resetLlmModels() loads and saves default configuration
- ✅ All operations handle file system errors gracefully
- ✅ Directory creation is handled automatically

### Data Validation Requirements

- ✅ All input data is validated against llmModelsSchema
- ✅ Validation errors provide clear, helpful messages
- ✅ Invalid data triggers fallback to defaults (no crashes)
- ✅ Schema evolution is supported through passthrough

### Error Handling Requirements

- ✅ File not found errors trigger default creation
- ✅ Permission errors are properly mapped and reported
- ✅ Disk space errors are handled gracefully
- ✅ Error messages hide internal file paths for security
- ✅ All operations log appropriate debug/error information

### Security Requirements

- ✅ File operations use atomic writes to prevent corruption
- ✅ Input validation prevents injection attacks
- ✅ Error messages don't expose sensitive file system information
- ✅ File permissions are handled by underlying FileStorageService

### Testing Requirements

- ✅ Include comprehensive unit tests for all methods
- ✅ Test successful file operations (load, save, reset)
- ✅ Test error conditions (file not found, permissions, invalid data)
- ✅ Test validation edge cases and schema compliance
- ✅ Mock FileStorageService for isolated testing
- ✅ Test atomic write operations and error recovery

## Dependencies

Requires T-create-llm-models-default for default settings creation functions and schemas.

## Security Considerations

- **Atomic Operations**: File operations are atomic to prevent corruption
- **Input Validation**: All data validated before persistence
- **Error Isolation**: File system errors don't crash the application
- **Path Security**: File paths are properly constructed and validated

## Files Created

- `apps/desktop/src/data/repositories/LlmModelsRepository.ts` - Main repository class
- Unit test file for comprehensive testing

## Files Referenced

- `apps/desktop/src/data/repositories/PersonalitiesRepository.ts` - Pattern template
- Shared types and utilities from prerequisite tasks
