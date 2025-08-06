---
kind: task
id: T-add-unit-tests-for-repository
title: Add unit tests for repository pattern implementation
status: open
priority: normal
prerequisites:
  - T-update-llmstorageservice-to-use
created: "2025-08-06T17:03:07.336235"
updated: "2025-08-06T17:03:07.336235"
schema_version: "1.1"
parent: F-repository-pattern
---

# Add Unit Tests for Repository Pattern Implementation

## Context

Add focused unit tests for the repository pattern implementation to ensure core functionality works correctly. Following the user's guidance, these will be simple unit tests only - no integration tests or performance tests.

## Testing Scope

### 1. Repository Unit Tests

Test file: `packages/shared/src/repositories/llmConfig/__tests__/LlmConfigRepository.test.ts`

**Test the new interface methods:**

- `create()` - successful config creation with valid input
- `read()` - retrieval of complete config with API key
- `update()` - atomic updates return updated config
- `delete()` - removal from both storages
- `list()` - returns metadata only (no API keys)
- `exists()` - correctly identifies existing configs

**Test error scenarios:**

- Invalid input data (Zod validation failures)
- Missing API key in secure storage
- File storage failures
- Secure storage unavailability

### 2. Zod Schema Unit Tests

Test file: `packages/shared/src/types/llmConfig/__tests__/llmConfigSchema.test.ts`

**Test validation with:**

- Valid complete configuration data
- Invalid data (missing required fields)
- Invalid URL formats for baseUrl
- Empty strings for required fields
- Type mismatches

### 3. Storage Service Unit Tests

Test file: `apps/desktop/src/electron/services/__tests__/LlmStorageService.test.ts`

**Test service layer:**

- Service methods use new repository interface correctly
- Error handling maintains StorageResult format
- API keys excluded from metadata responses
- Backward compatibility with existing signatures

## Implementation Requirements

### Mock Strategy

- Mock `FileStorageService` and `SecureStorageInterface`
- Use simple Jest mocks, no complex testing frameworks
- Focus on behavior verification, not implementation details

### Test Structure

```typescript
describe("LlmConfigRepository", () => {
  describe("create()", () => {
    it("creates config with valid input", () => {});
    it("validates input using Zod schema", () => {});
    it("stores in both file and secure storage", () => {});
  });

  describe("read()", () => {
    it("returns complete config with API key", () => {});
    it("returns null for non-existent config", () => {});
    it("handles missing API key gracefully", () => {});
  });

  // Similar structure for other methods
});
```

### Validation Testing

```typescript
describe("llmConfigSchema", () => {
  it("validates complete valid config", () => {});
  it("rejects missing required fields", () => {});
  it("validates URL format for baseUrl", () => {});
  it("handles optional fields correctly", () => {});
});
```

## Acceptance Criteria

- ✓ Unit tests cover all new repository methods
- ✓ Zod schema validation thoroughly tested
- ✓ Error scenarios properly tested
- ✓ Service layer backward compatibility verified
- ✓ API key security verified (excluded from metadata)
- ✓ Tests use simple Jest mocks, no complex frameworks
- ✓ All tests are focused unit tests (not integration)
- ✓ Test coverage is adequate but not excessive

## Files to Create

- `packages/shared/src/repositories/llmConfig/__tests__/LlmConfigRepository.test.ts`
- `packages/shared/src/types/llmConfig/__tests__/llmConfigSchema.test.ts`
- `apps/desktop/src/electron/services/__tests__/LlmStorageService.test.ts`

## Testing Requirements

- Tests must pass with `pnpm test`
- No external dependencies required for tests
- Mock all external services and dependencies
- Keep tests simple and focused on core functionality

### Log
