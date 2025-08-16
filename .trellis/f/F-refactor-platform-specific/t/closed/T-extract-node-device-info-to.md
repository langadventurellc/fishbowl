---
id: T-extract-node-device-info-to
title: Extract Node device info to main process
status: done
priority: medium
parent: F-refactor-platform-specific
prerequisites:
  - T-create-directory-structure
affectedFiles:
  packages/shared/src/logging/DeviceInfoInterface.ts: Created interface for device info collection services
  packages/shared/src/logging/index.ts: Added export for DeviceInfoInterface
  apps/desktop/src/main/utils/NodeDeviceInfo.ts:
    Implemented Node.js/Electron main
    process device info service with direct imports and hostname sanitization
  apps/desktop/src/main/utils/index.ts: Added export for NodeDeviceInfo class
  apps/desktop/src/main/utils/__tests__/NodeDeviceInfo.test.ts:
    Comprehensive unit tests with mocked electron and os modules covering all
    functionality and error cases
log:
  - Successfully extracted Node.js device info logic from shared package into a
    dedicated main process implementation. Created DeviceInfoInterface for clean
    abstraction, implemented NodeDeviceInfo class with direct imports (no eval
    statements), and comprehensive unit tests with mocked dependencies. All
    quality checks pass.
schema: v1.0
childrenIds: []
created: 2025-08-15T21:52:27.390Z
updated: 2025-08-15T21:52:27.390Z
---

# Extract Node Device Info to Main Process

## Context

Extract the Node.js/Electron main process device info collection logic from the complex shared `getDeviceInfo.ts` file and create a clean Node.js implementation.

**Source File:** `packages/shared/src/logging/utils/getDeviceInfo.ts` - Node.js parts only
**Target:** `apps/desktop/src/main/utils/NodeDeviceInfo.ts`

## Implementation Requirements

### Create NodeDeviceInfo Service:

```typescript
export class NodeDeviceInfo implements DeviceInfoInterface {
  async getDeviceInfo(): Promise<LogContext>;
}
```

### Extract Node-Specific Logic:

- Move `getElectronMainInfo()` function
- Use direct `os` module imports (no dynamic imports)
- Use direct `electron` imports where needed
- Remove platform detection - assume Electron main environment

### Simplify Implementation:

- Remove eval statements for electron access
- Use standard imports for os and electron modules
- Focus only on main process device info collection
- Remove fallback logic for other platforms

## Technical Approach

1. Create `DeviceInfoInterface` in `packages/shared/src/logging/DeviceInfoInterface.ts`
2. Extract and clean up `getElectronMainInfo` logic
3. Use direct imports for `os` and `electron` modules
4. Remove all platform detection and dynamic imports
5. Structure as service class implementing interface
6. Write unit tests mocking os/electron modules
7. Export from barrel file

## Acceptance Criteria

- [ ] `DeviceInfoInterface` created in shared package
- [ ] `NodeDeviceInfo` implements interface correctly
- [ ] Uses direct `os` and `electron` imports only
- [ ] No eval statements or dynamic imports
- [ ] Collects comprehensive main process device info
- [ ] Unit tests with mocked dependencies pass
- [ ] TypeScript compilation succeeds
- [ ] Proper exports in barrel files

## Dependencies

- Requires T-create-directory-structure

## Security Considerations

- Avoid collecting sensitive system information
- Sanitize hostname and other potentially identifying data
- Handle os module access errors gracefully

## Testing Requirements

- Unit test device info collection with mocked os module
- Test electron app version retrieval
- Test error handling when electron APIs unavailable
- Verify output format matches LogContext interface
