---
kind: feature
id: F-storage-services-implementation
title: Storage Services Implementation
status: in-progress
priority: high
prerequisites: []
created: "2025-08-06T15:35:54.216870"
updated: "2025-08-06T15:35:54.216870"
schema_version: "1.1"
parent: E-storage-and-repository-layer
---

# Storage Services Implementation

## Purpose and Functionality

Implement the core storage services for securely storing LLM API keys and configuration metadata. This feature provides the foundational storage layer with Electron's safeStorage for API keys and JSON file storage for non-sensitive metadata.

## Key Components to Implement

### 1. Secure Storage Service (`LlmSecureStorage.ts`)

- Class implementing secure API key storage using Electron's safeStorage API
- Methods for encrypting and decrypting API keys
- Store/retrieve operations by configuration ID
- Initialization and availability checks
- Cleanup methods for removing keys

### 2. File Storage Integration

- Integration with existing FileStorageService
- JSON schema for `llm_config.json` structure
- Helper methods for file path resolution
- File permissions setting (0600)
- Read/write operations for configuration metadata

### 3. Storage Types and Interfaces

- TypeScript interfaces for storage operations
- Configuration metadata types
- Error types for storage failures
- Storage response types

## Detailed Acceptance Criteria

### Secure Storage Operations

- ✓ Can encrypt and store API key with a given ID
- ✓ Can retrieve and decrypt API key by ID
- ✓ Can delete API key by ID
- ✓ Can check if safeStorage is available
- ✓ Returns null for non-existent keys (no errors)
- ✓ Handles storage unavailability gracefully

### File Storage Operations

- ✓ Can save configuration metadata to `llm_config.json`
- ✓ Can load all configuration metadata from file
- ✓ Creates file with 0600 permissions on first write
- ✓ File stored in correct userData directory
- ✓ Handles missing file gracefully (returns empty array)
- ✓ Validates JSON structure on read

### Integration Requirements

- ✓ Uses existing `generateId()` utility for ID creation
- ✓ Integrates with existing FileStorageService patterns
- ✓ Follows existing error handling patterns
- ✓ Uses existing logger for debugging

## Technical Requirements

### Implementation Structure

```typescript
// LlmSecureStorage.ts
class LlmSecureStorage {
  isAvailable(): boolean;
  store(id: string, apiKey: string): void;
  retrieve(id: string): string | null;
  delete(id: string): void;
}

// File storage integration
interface LlmConfigMetadata {
  id: string;
  customName: string;
  provider: string;
  baseUrl?: string;
  authHeaderType?: string;
  createdAt: string;
  updatedAt: string;
}
```

### File Structure

```
apps/desktop/src/
├── electron/
│   └── services/
│       └── LlmSecureStorage.ts
└── types/
    └── llmStorage.ts
```

### Configuration File Location

- Path: `{userData}/llm_config.json`
- Same directory as `preferences.json`
- Created on first configuration save

## Dependencies on Other Features

None - this is the foundational storage layer.

## Implementation Guidance

1. **Start with type definitions** - Define interfaces for storage operations and data structures
2. **Implement LlmSecureStorage** - Focus on simple CRUD operations using Electron's safeStorage
3. **Integrate FileStorageService** - Use existing patterns from preferences handling
4. **Use existing utilities** - Leverage generateId() for UUID generation
5. **Keep it simple** - No complex error handling frameworks, just basic try/catch
6. **Follow existing patterns** - Look at how preferences.json is handled for guidance

## Testing Requirements

- Manual testing with Electron app running
- Verify encryption/decryption works correctly
- Confirm file permissions are set properly
- Test with missing files and storage unavailability
- Verify no plain text API keys in logs

## Security Considerations

- Never log API key values
- Ensure file has 0600 permissions
- Handle safeStorage unavailability (e.g., Linux without secret service)
- Validate data before storage operations
- No API keys in error messages

## Performance Requirements

- Storage operations should complete synchronously
- File reads should be cached if accessed multiple times
- No blocking operations on app startup
- Efficient JSON parsing and serialization

### Log
