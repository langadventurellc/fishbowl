---
id: T-extract-browser-device-info
title: Extract browser device info to renderer process
status: open
priority: medium
parent: F-refactor-platform-specific
prerequisites:
  - T-create-directory-structure
  - T-extract-node-device-info-to
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T21:52:40.644Z
updated: 2025-08-15T21:52:40.644Z
---

# Extract Browser Device Info to Renderer Process

## Context

Extract browser/Electron renderer device info collection logic from the shared `getDeviceInfo.ts` file and create a clean browser implementation for the renderer process.

**Source File:** `packages/shared/src/logging/utils/getDeviceInfo.ts` - Browser parts only
**Target:** `apps/desktop/src/renderer/utils/BrowserDeviceInfo.ts`

## Implementation Requirements

### Create BrowserDeviceInfo Service:

```typescript
export class BrowserDeviceInfo implements DeviceInfoInterface {
  async getDeviceInfo(): Promise<LogContext>;
}
```

### Extract Browser-Specific Logic:

- Move `getWebInfo()` function
- Move `getScreenInfo()` helper function
- Move `getBrowserMetadata()` helper function
- Remove platform detection - assume browser/renderer environment
- Add Electron renderer specific metadata if available

### Simplify Implementation:

- Use direct access to `navigator`, `screen`, `window` globals
- Remove typeof checks - assume browser environment
- Focus only on browser/renderer device info collection
- Clean up Electron renderer detection logic

## Technical Approach

1. Implement `BrowserDeviceInfo` using `DeviceInfoInterface`
2. Extract and clean up browser device info functions
3. Use direct access to browser APIs (navigator, screen, etc.)
4. Add Electron renderer metadata (if window.process.versions.electron exists)
5. Remove all platform detection logic
6. Structure as service class
7. Write unit tests mocking browser APIs
8. Export from barrel file

## Acceptance Criteria

- [ ] `BrowserDeviceInfo` implements `DeviceInfoInterface`
- [ ] Uses direct browser API access only
- [ ] No typeof checks or platform detection
- [ ] Collects screen, memory, and connection info where available
- [ ] Includes Electron renderer metadata when appropriate
- [ ] Unit tests with mocked browser APIs pass
- [ ] TypeScript compilation succeeds
- [ ] Proper exports in barrel files

## Dependencies

- Requires T-create-directory-structure
- Requires T-extract-node-device-info-to (for interface)

## Security Considerations

- Don't collect sensitive browser fingerprinting data
- Handle cases where browser APIs are restricted
- Avoid accessing sensitive navigator properties

## Testing Requirements

- Unit test device info collection with mocked browser APIs
- Test screen info collection
- Test browser metadata gathering
- Test Electron renderer detection
- Verify output format matches LogContext interface
