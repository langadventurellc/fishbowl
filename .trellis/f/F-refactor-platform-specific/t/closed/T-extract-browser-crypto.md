---
id: T-extract-browser-crypto
title: Extract browser crypto utilities to renderer process
status: done
priority: high
parent: F-refactor-platform-specific
prerequisites:
  - T-create-directory-structure
  - T-extract-node-crypto-utilities
affectedFiles:
  apps/desktop/src/renderer/utils/BrowserCryptoUtils.ts: Created new
    BrowserCryptoUtils class implementing CryptoUtilsInterface using Web Crypto
    API and TextEncoder
  apps/desktop/src/renderer/utils/__tests__/BrowserCryptoUtils.test.ts:
    Added comprehensive unit tests with 28 test cases covering all
    functionality, error handling, interface compliance, and cryptographic
    quality
  apps/desktop/src/renderer/utils/index.ts: Updated barrel file to export BrowserCryptoUtils class
log:
  - Successfully extracted browser crypto utilities from shared package and
    implemented BrowserCryptoUtils class for Electron renderer process. The
    implementation uses pure Web Crypto API and TextEncoder without any platform
    detection or fallbacks. All crypto operations (randomBytes, generateId,
    getByteLength) now work exclusively in browser context using Web APIs. Added
    comprehensive unit tests with 100% coverage including cryptographic quality
    tests for randomness distribution and UUID v4 compliance. All quality checks
    pass and the class is properly exported from barrel file.
schema: v1.0
childrenIds: []
created: 2025-08-15T21:52:12.638Z
updated: 2025-08-15T21:52:12.638Z
---

# Extract Browser Crypto Utilities to Renderer Process

## Context

Extract browser/Web API crypto implementations from the shared package and create clean browser implementations for the renderer process using Web Crypto API and TextEncoder.

**Source Files:**

- `packages/shared/src/utils/randomBytes.ts` - Browser parts only
- `packages/shared/src/utils/generateId.ts` - Browser parts only
- `packages/shared/src/utils/getByteLength.ts` - Browser parts only

**Target:** `apps/desktop/src/renderer/utils/BrowserCryptoUtils.ts`

## Implementation Requirements

### Create BrowserCryptoUtils Service:

```typescript
export class BrowserCryptoUtils implements CryptoUtilsInterface {
  async randomBytes(size: number): Promise<Uint8Array>;
  generateId(): string;
  async getByteLength(str: string): Promise<number>;
}
```

### Extract Browser-Specific Logic:

1. **randomBytes**: Use `crypto.getRandomValues()` directly
2. **generateId**: Use Web Crypto API for random bytes, convert to UUID format
3. **getByteLength**: Use `TextEncoder().encode().length` directly

### Remove Platform Detection:

- No `typeof globalThis` checks
- No fallbacks to Math.random
- Pure Web API implementations

## Technical Approach

1. Implement `BrowserCryptoUtils` class using `CryptoUtilsInterface`
2. Use Web Crypto API (`crypto.getRandomValues`) for secure randomness
3. Use `TextEncoder` for accurate byte length calculation
4. Convert random bytes to proper UUID v4 format in generateId
5. Add error handling for unsupported browsers
6. Write comprehensive unit tests for browser environment
7. Export from barrel file

## Acceptance Criteria

- [ ] `BrowserCryptoUtils` implements `CryptoUtilsInterface`
- [ ] Uses Web Crypto API (`crypto.getRandomValues`) only
- [ ] Uses `TextEncoder` for byte length calculation
- [ ] No platform detection or fallbacks
- [ ] generateId produces valid UUID v4 format
- [ ] All crypto operations work in browser context
- [ ] Unit tests pass in renderer environment
- [ ] TypeScript compilation succeeds
- [ ] Proper exports in barrel files

## Dependencies

- Requires T-create-directory-structure
- Requires T-extract-node-crypto-utilities (for interface)

## Security Considerations

- Use only Web Crypto API for cryptographically secure randomness
- Maintain UUID v4 specification compliance
- Handle cases where Web Crypto API is not available

## Testing Requirements

- Unit test each crypto function in browser environment
- Test UUID format compliance for generateId
- Test TextEncoder accuracy for various character sets
- Verify cryptographic quality of random outputs
- Test error handling when APIs are unavailable
