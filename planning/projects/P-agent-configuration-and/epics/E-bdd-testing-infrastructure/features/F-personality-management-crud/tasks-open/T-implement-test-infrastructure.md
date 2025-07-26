---
kind: task
id: T-implement-test-infrastructure
title: Implement test infrastructure and support utilities for personality management
status: open
priority: normal
prerequisites: []
created: "2025-07-26T14:12:13.295971"
updated: "2025-07-26T14:12:13.295971"
schema_version: "1.1"
parent: F-personality-management-crud
---

# Implement Test Infrastructure and Support Utilities for Personality Management

## Context

Create the essential test infrastructure and support utilities needed for personality management integration tests. This task establishes test data builders, mock factories, temporary directory management, and custom Jest matchers to support complex personality testing scenarios.

## Implementation Requirements

### Test Data Builders

Create fluent builder pattern for personality configurations:

- **PersonalityDataBuilder**: Generate realistic Big Five personality configurations
- **TraitCombinationBuilder**: Create valid and invalid trait combinations for testing
- **PersonalityTemplateBuilder**: Build template personalities for various testing scenarios
- **ValidationErrorBuilder**: Generate expected validation error scenarios

### Mock Factories

Implement consistent mocking for external dependencies:

- **DatabaseMockFactory**: Mock database operations with realistic responses
- **ValidationServiceMockFactory**: Mock validation service with configurable responses
- **PersistenceServiceMockFactory**: Mock persistence operations with error simulation
- **ExternalApiMockFactory**: Mock external personality-related API calls

### Test Utilities and Helpers

Create specialized utilities for personality testing:

- **TemporaryDirectoryManager**: Manage isolated file operations for configuration tests
- **PersonalityMatchers**: Custom Jest matchers for personality-specific assertions
- **TestDataFixtures**: Realistic personality examples in JSON format
- **ConcurrencyTestHelper**: Utilities for testing concurrent personality operations

## Specific Implementation Approach

### Fluent Builder Pattern Implementation

```typescript
// Example builder pattern for test data
class PersonalityDataBuilder {
  private personality: PersonalityData = {};

  withOpenness(value: number): PersonalityDataBuilder {
    this.personality.openness = value;
    return this;
  }

  withValidBigFiveTraits(): PersonalityDataBuilder {
    return this.withOpenness(75)
      .withConscientiousness(80)
      .withExtraversion(60)
      .withAgreeableness(85)
      .withNeuroticism(40);
  }

  build(): PersonalityData {
    return { ...this.personality };
  }
}
```

### Custom Jest Matchers

Create personality-specific assertions:

- `toHaveValidBigFiveTraits()`: Validate complete Big Five trait structure
- `toHaveTraitInRange(trait, min, max)`: Validate specific trait ranges
- `toBeValidPersonalityConfiguration()`: Comprehensive personality validation
- `toHavePsychologicallyConsistentTraits()`: Validate trait combinations

### Mock Strategy Implementation

Implement consistent external dependency mocking:

- Database operations return realistic IDs and handle constraint violations
- File system operations use temporary directories with automatic cleanup
- External API calls are intercepted with configurable response scenarios
- Service coordination mocks maintain realistic timing and response patterns

## Detailed Acceptance Criteria

### AC-1: Test Data Builder Implementation

- ✅ PersonalityDataBuilder supports fluent API for trait configuration
- ✅ Builder methods enable rapid creation of valid and invalid personality scenarios
- ✅ Template builders provide common personality archetypes for consistent testing
- ✅ Validation error builders generate expected error scenarios for negative testing

### AC-2: Mock Factory Consistency

- ✅ DatabaseMockFactory provides realistic database operation responses
- ✅ Service mock factories enable configurable success and failure scenarios
- ✅ External API mocks handle network simulation and response timing
- ✅ Mock coordination maintains realistic service interaction patterns

### AC-3: Custom Jest Matchers

- ✅ Personality-specific matchers simplify complex assertions
- ✅ Trait validation matchers provide clear failure messages
- ✅ Configuration matchers validate complete personality structures
- ✅ Psychological consistency matchers validate trait relationships

### AC-4: Test Utility Infrastructure

- ✅ Temporary directory manager provides isolated file operation testing
- ✅ Concurrency test helpers enable reliable multi-threaded testing
- ✅ Test data fixtures provide realistic personality examples
- ✅ Cleanup mechanisms prevent test state leakage between test runs

## Testing Requirements

Include comprehensive utilities to support:

- **Complex Scenario Testing**: Builder patterns for elaborate personality configurations
- **Error Simulation**: Mock factories that generate realistic error conditions
- **Performance Testing**: Utilities for load and concurrency testing
- **Isolation Testing**: Temporary directories and state management for test independence

## Security Considerations

Implement utilities that support:

- Secure test data generation without exposing sensitive information
- Mock implementations that respect authorization boundaries
- Test data cleanup to prevent information leakage
- Audit trail simulation for compliance testing scenarios

## Performance Requirements

Create utilities that support:

- Rapid test data generation for performance testing scenarios
- Memory-efficient mock implementations for large-scale testing
- Concurrent test execution without resource contention
- Cleanup operations that don't impact test execution time

## Dependencies

- **Internal**: Jest testing framework, Node.js file system utilities
- **External**: Temporary directory management libraries, test fixture management
- **Integration**: PersonalityService, ValidationService, PersistenceService interfaces
- **Test Infrastructure**: Jest custom matchers API, mock implementation patterns

## Files to Create/Modify

- `packages/shared/src/__tests__/integration/support/test-helpers.ts`
- `packages/shared/src/__tests__/integration/support/test-data-builders.ts`
- `packages/shared/src/__tests__/integration/support/mock-factories.ts`
- `packages/shared/src/__tests__/integration/support/temp-directory-manager.ts`
- `packages/shared/src/__tests__/integration/support/custom-matchers.ts`
- `packages/shared/src/__tests__/integration/fixtures/personality-examples.json`

### Log
