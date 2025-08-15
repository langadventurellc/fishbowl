---
id: T-extract-node-crypto-utilities
title: Extract Node crypto utilities to main process
status: done
priority: high
parent: F-refactor-platform-specific
prerequisites:
  - T-create-directory-structure
affectedFiles:
  packages/shared/src/utils/CryptoUtilsInterface.ts: Created interface for
    platform-agnostic crypto operations with randomBytes, generateId, and
    getByteLength methods
  packages/shared/src/utils/index.ts: Added export for CryptoUtilsInterface
  apps/desktop/src/main/utils/NodeCryptoUtils.ts: Implemented NodeCryptoUtils
    class with direct Node.js crypto imports, no dynamic imports or eval
    statements
  apps/desktop/src/main/utils/index.ts: Added export for NodeCryptoUtils class
  apps/desktop/src/main/utils/__tests__/NodeCryptoUtils.test.ts:
    Created comprehensive unit tests covering all crypto utility functions,
    interface compliance, and error handling
log:
  - Successfully extracted Node.js-specific crypto implementations from shared
    package and created clean Node.js implementations in the main process.
    Implemented NodeCryptoUtils class with direct Node.js crypto/buffer imports,
    removing all platform detection and dynamic imports. Created comprehensive
    CryptoUtilsInterface for platform-agnostic crypto operations. All crypto
    utilities (randomBytes, generateId, getByteLength) work correctly with
    cryptographically secure implementations. Added extensive unit tests
    covering various input sizes, edge cases, UUID v4 compliance, and error
    handling. All quality checks pass including linting, formatting, and type
    checking.
schema: v1.0
childrenIds: []
created: 2025-08-15T21:51:58.132Z
updated: 2025-08-15T21:51:58.132Z
---

# Extract Node Crypto Utilities to Main Process

## Context

Extract Node.js-specific crypto implementations from the shared package's mixed-platform utilities and create clean Node.js implementations in the main process.

**Source Files:**

- `packages/shared/src/utils/randomBytes.ts` - Node.js parts only
- `packages/shared/src/utils/generateId.ts` - Node.js parts only
- `packages/shared/src/utils/getByteLength.ts` - Node.js parts only

**Target:** `apps/desktop/src/main/utils/NodeCryptoUtils.ts`

## Implementation Requirements

### Create NodeCryptoUtils Service:

```typescript
export class NodeCryptoUtils {
  async randomBytes(size: number): Promise<Uint8Array>;
  generateId(): string;
  async getByteLength(str: string): Promise<number>;
}
```

### Extract Node.js-Specific Logic:

1. **randomBytes**: Use `crypto.randomBytes()` directly (no dynamic import)
2. **generateId**: Use `crypto.randomBytes()` directly (no eval/dynamic require)
3. **getByteLength**: Use `Buffer.byteLength()` directly (no dynamic import)

### Interface Definition:

Create `CryptoUtilsInterface` in shared package:

```typescript
export interface CryptoUtilsInterface {
  randomBytes(size: number): Promise<Uint8Array>;
  generateId(): string;
  getByteLength(str: string): Promise<number>;
}
```

## Technical Approach

1. Create interface in `packages/shared/src/interfaces/CryptoUtilsInterface.ts`
2. Implement `NodeCryptoUtils` class with direct Node.js imports
3. Remove all platform detection and dynamic imports
4. Use standard Node.js crypto module throughout
5. Write comprehensive unit tests
6. Export from barrel file

## Acceptance Criteria

- [ ] `CryptoUtilsInterface` created in shared package
- [ ] `NodeCryptoUtils` class implements interface correctly
- [ ] No dynamic imports or eval statements
- [ ] Direct Node.js crypto/buffer imports only
- [ ] All crypto operations work correctly
- [ ] Unit tests pass with good coverage
- [ ] TypeScript compilation succeeds
- [ ] Proper exports in barrel files

## Dependencies

- Requires T-create-directory-structure

## Security Considerations

- Use only cryptographically secure Node.js crypto APIs
- Maintain UUID v4 format for generateId
- Preserve error handling for crypto operations

## Testing Requirements

- Unit test each crypto utility function
- Test with various input sizes and edge cases
- Verify cryptographic strength of outputs
- Test error handling for invalid inputs
