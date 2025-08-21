---
id: T-create-llmmodelsrepositorymana
title: Create LlmModelsRepositoryManager singleton
status: done
priority: medium
parent: F-configurable-llm-models
prerequisites:
  - T-create-llmmodelsrepository
affectedFiles:
  apps/desktop/src/data/repositories/llmModelsRepositoryManager.ts:
    Created LlmModelsRepositoryManager singleton class with initialize(), get(),
    and reset() methods following PersonalitiesRepositoryManager pattern exactly
  apps/desktop/src/data/repositories/__tests__/llmModelsRepositoryManager.test.ts:
    Created comprehensive unit tests with 17 test cases covering initialization,
    access control, error handling, singleton behavior, edge cases, and
    integration with LlmModelsRepository
log:
  - Successfully implemented LlmModelsRepositoryManager singleton following the
    exact pattern from PersonalitiesRepositoryManager. The manager provides
    application-wide access to the LlmModelsRepository instance with proper
    singleton behavior, initialization lifecycle management, and error handling.
    Created comprehensive unit tests covering all functionality including
    initialization, access control, error handling, singleton behavior, and
    integration scenarios. All 17 test cases pass with 100% coverage, and all
    quality checks (linting, formatting, and type checking) pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-21T19:38:22.543Z
updated: 2025-08-21T19:38:22.543Z
---

## Context

Create the LlmModelsRepositoryManager singleton that provides application-wide access to the LlmModelsRepository instance. This follows the exact pattern established by PersonalitiesRepositoryManager.

The manager handles singleton access, initialization lifecycle, and error handling following the pattern in `apps/desktop/src/data/repositories/personalitiesRepositoryManager.ts`.

## Specific Implementation Requirements

### 1. Create Repository Manager (`apps/desktop/src/data/repositories/llmModelsRepositoryManager.ts`)

Follow the exact structure from personalitiesRepositoryManager:

```typescript
import { LlmModelsRepository } from "./LlmModelsRepository";

// Repository instance shared across the application
let repository: LlmModelsRepository | null = null;

/**
 * LLM models repository manager providing singleton access to LlmModelsRepository.
 * Follows the same pattern as personalitiesRepositoryManager for consistency.
 */
class LlmModelsRepositoryManager {
  /**
   * Initialize the LLM models repository with the provided data path.
   * Called during application initialization in main.ts.
   *
   * @param dataPath - Path to the directory where llmModels.json should be stored
   * @throws {Error} If repository is already initialized
   */
  initialize(dataPath: string): void {
    if (repository) {
      throw new Error("LLM models repository already initialized");
    }
    repository = new LlmModelsRepository(dataPath);
  }

  /**
   * Get the initialized LLM models repository instance.
   *
   * @returns The LLM models repository instance
   * @throws {Error} If repository is not initialized
   */
  get(): LlmModelsRepository {
    if (!repository) {
      throw new Error("LLM models repository not initialized");
    }
    return repository;
  }

  /**
   * Reset the repository manager to uninitialized state.
   * Used primarily for testing to ensure clean state between tests.
   */
  reset(): void {
    repository = null;
  }
}

export const llmModelsRepositoryManager = new LlmModelsRepositoryManager();
```

### 2. Create Comprehensive Unit Tests

Create test file `apps/desktop/src/data/repositories/__tests__/llmModelsRepositoryManager.test.ts` following the exact pattern from personalitiesRepositoryManager.test.ts:

**Test Categories:**

- Initialization functionality
- Access control and error handling
- Reset functionality
- Singleton behavior verification
- Edge cases and error conditions
- Integration behavior with LlmModelsRepository

**Key Test Cases:**

- Should initialize repository with provided data path
- Should throw error if already initialized
- Should allow reinitialization after reset
- Should return repository instance after initialization
- Should throw error if not initialized
- Should return same instance on multiple calls
- Should clear repository instance on reset
- Should handle edge cases (empty paths, special characters)

### 3. Follow Exact Testing Patterns

Copy the test structure from personalitiesRepositoryManager.test.ts:

- Mock LlmModelsRepository using Jest
- Test all public methods (initialize, get, reset)
- Test error conditions and edge cases
- Verify singleton behavior
- Test integration scenarios

## Technical Approach

1. **Copy PersonalitiesRepositoryManager**: Use as exact template
2. **Replace Domain References**: Change personalities to llmModels throughout
3. **Maintain Method Signatures**: Keep exact same interface patterns
4. **Preserve Error Messages**: Use consistent error message format
5. **Copy Test Structure**: Replicate all test categories and cases
6. **Use Same Patterns**: Jest mocking, describe blocks, test organization

## Detailed Acceptance Criteria

### Singleton Behavior Requirements

- ✅ initialize() creates single repository instance with provided path
- ✅ get() returns the same repository instance on multiple calls
- ✅ reset() clears the repository instance for testing
- ✅ Only one repository instance exists per application lifecycle

### Error Handling Requirements

- ✅ initialize() throws error if already initialized
- ✅ get() throws error if not initialized
- ✅ Error messages are clear and consistent with other managers
- ✅ Edge cases (empty paths, special characters) are handled gracefully

### Integration Requirements

- ✅ Manager creates LlmModelsRepository with correct data path
- ✅ Repository instance is accessible through manager after initialization
- ✅ Manager integrates cleanly with main.ts initialization pattern
- ✅ Follows same patterns as existing repository managers

### Testing Requirements

- ✅ Comprehensive unit tests covering all functionality
- ✅ Mock LlmModelsRepository for isolated testing
- ✅ Test all public methods and error conditions
- ✅ Verify singleton behavior and lifecycle management
- ✅ Test edge cases and integration scenarios
- ✅ Achieve >95% code coverage

### Code Quality Requirements

- ✅ TypeScript types are correctly defined
- ✅ JSDoc documentation follows established patterns
- ✅ Error handling is consistent with other managers
- ✅ Code style matches existing repository managers

## Dependencies

Requires T-create-llmmodelsrepository for the LlmModelsRepository class.

## Security Considerations

- **Access Control**: Singleton pattern prevents unauthorized repository access
- **Initialization Control**: Strict lifecycle management prevents double initialization
- **Error Isolation**: Repository errors are contained and properly reported
- **Type Safety**: TypeScript ensures compile-time validation

## Files Created

- `apps/desktop/src/data/repositories/llmModelsRepositoryManager.ts` - Manager singleton
- `apps/desktop/src/data/repositories/__tests__/llmModelsRepositoryManager.test.ts` - Unit tests

## Files Referenced

- `apps/desktop/src/data/repositories/personalitiesRepositoryManager.ts` - Pattern template
- `apps/desktop/src/data/repositories/__tests__/personalitiesRepositoryManager.test.ts` - Test template
