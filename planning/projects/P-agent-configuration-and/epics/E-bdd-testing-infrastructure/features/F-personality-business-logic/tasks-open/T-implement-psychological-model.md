---
kind: task
id: T-implement-psychological-model
title: Implement psychological model compliance tests
status: open
priority: high
prerequisites:
  - T-set-up-personality-business
created: "2025-07-26T15:54:47.615695"
updated: "2025-07-26T15:54:47.615695"
schema_version: "1.1"
parent: F-personality-business-logic
---

# Implement psychological model compliance tests

## Context

This task implements comprehensive BDD integration tests for psychological model compliance validation. Tests verify that personality configurations claiming Big Five model compliance meet established psychological validity criteria, including factor analysis requirements and statistical validity thresholds.

## Detailed Implementation Requirements

### Primary Test File

- **Location**: `packages/shared/src/__tests__/integration/features/personality-management/personality-psychology-compliance.integration.spec.ts`
- **Testing Focus**: Big Five model compliance validation and psychological validity criteria

### Core Test Scenarios

#### Scenario 1: Factor Analysis Requirements Validation

```typescript
describe("Feature: Psychological Model Compliance", () => {
  describe("Scenario: Factor analysis requirements", () => {
    it("should validate factor analysis requirements for trait independence", async () => {
      // Given - Personality configuration claiming Big Five compliance
      // When - Processing through psychological model validation service
      // Then - Factor analysis requirements are validated for trait independence
    });
  });
});
```

#### Scenario 2: Statistical Validity Threshold Checking

```typescript
describe("Scenario: Statistical validity thresholds", () => {
  it("should ensure personality profiles meet statistical validity thresholds", async () => {
    // Given - Personality profiles requiring statistical validation
    // When - Validating through psychological model compliance service
    // Then - All profiles meet established statistical validity criteria
  });
});
```

#### Scenario 3: Model Compliance Error Handling

```typescript
describe("Scenario: Model compliance error handling", () => {
  it("should provide educational context for model compliance errors", async () => {
    // Given - Personality configuration with model compliance violations
    // When - Processing through compliance validation with error scenarios
    // Then - Compliance errors provide educational context about Big Five requirements
  });
});
```

#### Scenario 4: Research-Backed Constraint Validation

```typescript
describe("Scenario: Research-backed constraint violations", () => {
  it("should identify and explain research-backed constraint violations", async () => {
    // Given - Personality configurations violating psychological research constraints
    // When - Validating through research constraint checking service
    // Then - Violations are clearly identified and explained with research references
  });
});
```

## Technical Approach

### Implementation Strategy

1. **Use psychology model constraints** from fixtures for research-backed validation rules
2. **Mock psychological model service** to test compliance checking without external dependencies
3. **Validate educational error messages** ensure compliance violations provide learning context
4. **Test statistical validity** including factor analysis and threshold checking

### Service Integration Testing

- **PsychologyModelService**: Test Big Five model compliance validation
- **ValidationService**: Test statistical validity threshold checking
- **BusinessRuleService**: Test research-backed constraint enforcement

### Educational Error Context Testing

- Verify compliance errors include psychological education
- Test research reference inclusion in violation explanations
- Validate user-friendly constraint violation messaging

## Detailed Acceptance Criteria

### AC-3: Psychological Model Compliance

- ✅ Factor analysis requirements are validated for trait independence
- ✅ Personality profiles meet statistical validity thresholds (correlation < 0.7 between traits)
- ✅ Model compliance errors provide educational context about Big Five requirements
- ✅ Research-backed constraint violations are clearly identified and explained
- ✅ Compliance validation includes references to psychological research sources

### Performance Requirements

- ✅ Model compliance validation completes within 150ms per personality profile
- ✅ Statistical validity checking executes within 100ms for factor analysis
- ✅ Research constraint validation performs within 200ms for complex rule sets

### Integration Requirements

- ✅ Psychological model services coordinate with validation and business rule services
- ✅ Compliance validation results are properly structured for educational feedback
- ✅ Model validation errors maintain system integrity during processing failures

## Dependencies

- **Prerequisites**: T-set-up-personality-business (test infrastructure and psychology model constraints)
- **Services**: PsychologyModelService, ValidationService, BusinessRuleService
- **Test Data**: psychology-model-constraints.json, research-backed validation rules

## Testing Requirements

- Unit tests for psychological model compliance validation logic
- Integration tests for Big Five model compliance checking across services
- Performance tests for compliance validation timing requirements
- Error handling tests for educational context and research reference inclusion

## File Structure

```
packages/shared/src/__tests__/integration/features/personality-management/
└── personality-psychology-compliance.integration.spec.ts

Test Scenarios Covered:
├── Factor analysis requirements validation
├── Statistical validity threshold checking
├── Model compliance error handling with education
├── Research-backed constraint violation identification
└── Performance and integration validation
```

### Log
