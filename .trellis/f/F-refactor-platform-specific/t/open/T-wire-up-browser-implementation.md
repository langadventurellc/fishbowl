---
id: T-wire-up-browser-implementation
title: Wire up browser implementations in renderer process
status: open
priority: high
parent: F-refactor-platform-specific
prerequisites:
  - T-update-shared-services-for
  - T-extract-browser-crypto
  - T-extract-browser-device-info
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T21:53:25.028Z
updated: 2025-08-15T21:53:25.028Z
---

# Wire Up Browser Implementations in Renderer Process

## Context

Configure the Electron renderer process to create and inject browser/Web API implementations into shared services at startup. This mirrors the main process pattern but uses browser-compatible implementations.

**Target Files:**

- Renderer process startup/initialization code
- Service factory/container setup for renderer
- Export configured services for use throughout renderer process

## Implementation Requirements

### Create Renderer Service Container:

```typescript
// apps/desktop/src/renderer/services/ServiceContainer.ts
export class RendererProcessServices {
  readonly cryptoUtils: BrowserCryptoUtils;
  readonly deviceInfo: BrowserDeviceInfo;
  readonly logger: StructuredLogger;
  // Note: FileSystemBridge not needed in renderer

  constructor() {
    // Initialize browser implementations
    // Wire up services
  }
}
```

### Configure Services at Startup:

1. Create browser implementations (`BrowserCryptoUtils`, `BrowserDeviceInfo`)
2. Inject into shared services (`StructuredLogger`)
3. Handle services not needed in renderer (FileStorageService)
4. Export configured services for renderer process use
5. Set up in renderer process initialization

### Update Renderer Process Code:

- Find existing service initialization in renderer
- Replace with new dependency injection pattern
- Ensure renderer code uses configured services
- Remove any direct imports of shared platform-specific code

## Technical Approach

1. Create service container class for renderer process
2. Initialize browser implementations in container constructor
3. Wire implementations into applicable shared services
4. Update renderer process startup to use container
5. Export services from container for renderer consumption
6. Update existing renderer code to use injected services
7. Write unit tests for service wiring

## Acceptance Criteria

- [ ] Service container created for renderer process
- [ ] Browser implementations properly initialized
- [ ] Shared services receive browser implementations via constructor
- [ ] Renderer process startup configures services correctly
- [ ] All renderer process code uses configured services
- [ ] No direct imports of platform-specific shared code
- [ ] Unit tests verify correct wiring
- [ ] TypeScript compilation succeeds

## Dependencies

- Requires shared services to be updated for injection
- Requires browser implementations to be created

## Security Considerations

- Ensure service container is singleton in renderer process
- Validate browser APIs are available before initialization
- Handle graceful fallbacks for missing Web APIs

## Testing Requirements

- Unit test renderer service container initialization
- Test that correct browser implementations are injected
- Test renderer process can use all needed services
- Verify no shared platform-specific imports remain
- Test fallback behavior for missing browser APIs
