---
kind: task
id: T-write-integration-tests-and
title: Write integration tests and ensure type compatibility
status: open
priority: low
prerequisites:
  - T-create-directory-structure-and
  - T-create-provider-metadata-and
  - T-create-field-configuration-types
  - T-create-runtime-configuration-and
  - T-create-storage-bridge-interfaces
  - T-create-validation-error-types
  - T-create-type-utilities-and-helper
created: "2025-08-04T19:49:35.562448"
updated: "2025-08-04T19:49:35.562448"
schema_version: "1.1"
parent: F-core-type-definitions
---

## Task Description

Write comprehensive integration tests to verify type compatibility between the new LLM provider types and existing system types. Create compile-time type tests and runtime unit tests.

## Implementation Steps

### 1. **Create Type Test File**:

Create `packages/shared/src/types/llm-providers/__tests__/type-compatibility.test.ts`:

```typescript
import { expectType } from "tsd";
import type { LlmConfigData } from "@fishbowl-ai/ui-shared";
import type { LlmProviderInstance, toLegacyFormat } from "../index";

// Test legacy compatibility
describe("Type Compatibility Tests", () => {
  it("should convert provider instance to legacy format", () => {
    const instance: LlmProviderInstance = {
      id: "test-123",
      providerId: "openai",
      customName: "My OpenAI",
      values: {
        apiKey: "sk-test",
        baseUrl: "https://api.openai.com",
        useAuthHeader: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const legacy = toLegacyFormat(instance);
    expectType<LlmConfigData>(legacy);
  });
});
```

### 2. **Create Runtime Tests**:

Create test files for each type module:

- `provider.types.test.ts` - Test provider type guards and utilities
- `field.types.test.ts` - Test field type guards and discriminated unions
- `configuration.types.test.ts` - Test configuration utilities
- `storage.types.test.ts` - Test storage bridge mock implementation
- `validation.types.test.ts` - Test validation error creation

### 3. **Test Discriminated Union Narrowing**:

```typescript
describe("Field Type Narrowing", () => {
  it("should narrow field types correctly", () => {
    const textField: LlmFieldConfig = {
      type: "text",
      id: "baseUrl",
      label: "Base URL",
      required: false,
      defaultValue: "https://api.example.com",
    };

    if (isTextField(textField)) {
      expect(textField.defaultValue).toBeDefined();
    }
  });
});
```

### 4. **Test JSON Serialization**:

```typescript
describe("JSON Serialization", () => {
  it("should serialize and deserialize correctly", () => {
    const instance: LlmProviderInstance = createTestInstance();
    const json = JSON.stringify(instance);
    const parsed = JSON.parse(json);

    expect(isValidProviderInstance(parsed)).toBe(true);
  });
});
```

### 5. **Create Mock Storage Implementation**:

```typescript
export class MockLlmStorage implements LlmSecureStorageBridge {
  private storage = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.storage.get(key) || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  // ... implement all methods
}
```

### 6. **Test Type Utilities**:

```typescript
describe("Type Utilities", () => {
  it("should create branded types correctly", () => {
    const providerId = createProviderId("openai");
    const instanceId = createInstanceId("inst-123");

    // These should be compile-time type safe
    expectType<ProviderId>(providerId);
    expectType<InstanceId>(instanceId);
  });

  it("should generate unique instance IDs", () => {
    const id1 = generateInstanceId();
    const id2 = generateInstanceId();

    expect(id1).not.toBe(id2);
  });
});
```

## Test Coverage Requirements

- Type guards: 100% coverage
- Utility functions: 100% coverage
- Error classes: Constructor and type guards
- Mock implementations: Basic functionality
- Type compatibility: Compile-time checks

## Acceptance Criteria

- ✓ All type guards have unit tests
- ✓ Legacy compatibility is verified
- ✓ JSON serialization works correctly
- ✓ Discriminated unions narrow properly
- ✓ Mock storage implementation for testing
- ✓ 90%+ code coverage for utilities
- ✓ Compile-time type tests pass
- ✓ Integration with existing types verified

## Dependencies

All other tasks must be completed before running integration tests.

## Notes

- Use Jest for runtime tests
- Consider using `tsd` for compile-time type testing
- Follow existing test patterns from shared package
- Keep test files co-located with source files

### Log
