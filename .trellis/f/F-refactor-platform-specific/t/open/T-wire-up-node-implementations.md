---
id: T-wire-up-node-implementations
title: Wire up Node implementations in main process
status: open
priority: high
parent: F-refactor-platform-specific
prerequisites:
  - T-update-shared-services-for
  - T-extract-node-crypto-utilities
  - T-extract-node-device-info-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T21:53:12.006Z
updated: 2025-08-15T21:53:12.006Z
---

# Wire Up Node Implementations in Main Process

## Context

Configure the Electron main process to create and inject Node.js implementations into shared services at startup. This establishes the dependency injection pattern and ensures the main process uses Node.js-specific implementations.

**Target Files:**

- Main process startup/initialization code
- Service factory/container setup
- Export configured services for use throughout main process

## Implementation Requirements

### Create Service Container:

```typescript
// apps/desktop/src/main/services/ServiceContainer.ts
export class MainProcessServices {
  readonly fileSystem: NodeFileSystemBridge;
  readonly cryptoUtils: NodeCryptoUtils;
  readonly deviceInfo: NodeDeviceInfo;
  readonly fileStorage: FileStorageService;
  readonly logger: StructuredLogger;

  constructor() {
    // Initialize implementations
    // Wire up services
  }
}
```

### Configure Services at Startup:

1. Create Node.js implementations (`NodeFileSystemBridge`, `NodeCryptoUtils`, `NodeDeviceInfo`)
2. Inject into shared services (`FileStorageService`, `StructuredLogger`)
3. Export configured services for main process use
4. Set up in main process initialization

### Update Main Process Code:

- Find existing service initialization code
- Replace with new dependency injection pattern
- Ensure all main process code uses configured services
- Remove any direct imports of shared platform-specific code

## Technical Approach

1. Create service container class for main process
2. Initialize Node implementations in container constructor
3. Wire implementations into shared services
4. Update main process startup to use container
5. Export services from container for main process consumption
6. Update existing main process code to use injected services
7. Write unit tests for service wiring

## Acceptance Criteria

- [ ] Service container created for main process
- [ ] Node implementations properly initialized
- [ ] Shared services receive Node implementations via constructor
- [ ] Main process startup configures services correctly
- [ ] All main process code uses configured services
- [ ] No direct imports of platform-specific shared code
- [ ] Unit tests verify correct wiring
- [ ] TypeScript compilation succeeds

## Dependencies

- Requires shared services to be updated for injection
- Requires Node implementations to be created

## Security Considerations

- Ensure service container is singleton in main process
- Validate all implementations before injection
- Secure initialization of crypto services

## Testing Requirements

- Unit test service container initialization
- Test that correct implementations are injected
- Test main process can use all services
- Verify no shared platform-specific imports remain
