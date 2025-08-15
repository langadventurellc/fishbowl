---
id: T-update-shared-services-for
title: Update shared services for constructor injection
status: open
priority: high
parent: F-refactor-platform-specific
prerequisites:
  - T-move-nodefilesystembridge-to
  - T-extract-node-crypto-utilities
  - T-extract-node-device-info-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T21:52:55.725Z
updated: 2025-08-15T21:52:55.725Z
---

# Update Shared Services for Constructor Injection

## Context

Modify shared package services to accept platform-specific implementations via constructor injection instead of creating them internally. This enables the services to remain platform-agnostic while using the appropriate implementations.

**Affected Services:**

- `FileStorageService` - needs `FileSystemBridge` injection
- `StructuredLogger` - needs `DeviceInfoInterface` and `CryptoUtilsInterface` injection
- Any other services using the moved utilities

## Implementation Requirements

### Update FileStorageService:

```typescript
export class FileStorageService {
  constructor(
    private fileSystem: FileSystemBridge,
    private options?: FileStorageOptions,
  ) {}
  // Remove internal NodeFileSystemBridge creation
}
```

### Update StructuredLogger:

```typescript
export class StructuredLogger {
  constructor(
    private deviceInfo: DeviceInfoInterface,
    private cryptoUtils: CryptoUtilsInterface,
    private config: LogConfig,
  ) {}
  // Remove internal device info and crypto logic
}
```

### Update Service Factory Functions:

- Modify `createLogger()` to accept implementations
- Update any factory functions that internally create platform-specific code
- Maintain backward compatibility where possible

## Technical Approach

1. Identify all services that use platform-specific implementations
2. Add constructor parameters for interface dependencies
3. Remove internal platform-specific code creation
4. Update factory functions to accept implementations
5. Maintain existing public APIs where possible
6. Update unit tests to use mock implementations
7. Update type definitions and exports

## Acceptance Criteria

- [ ] All shared services accept implementations via constructor
- [ ] No platform-specific code created internally in shared services
- [ ] Factory functions updated to accept implementations
- [ ] Existing public APIs maintained where possible
- [ ] Unit tests updated with mock implementations
- [ ] TypeScript compilation succeeds
- [ ] Interface contracts clearly defined

## Dependencies

- Requires platform implementations to be moved first
- Requires interfaces to be defined

## Security Considerations

- Validate injected implementations implement required interfaces
- Maintain existing security validations in services
- Ensure dependency injection doesn't expose internals

## Testing Requirements

- Unit test services with mock implementations
- Test constructor parameter validation
- Test that services work with both Node and browser implementations
- Verify existing functionality is preserved
