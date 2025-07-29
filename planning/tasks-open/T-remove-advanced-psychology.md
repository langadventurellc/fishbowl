---
kind: task
id: T-remove-advanced-psychology
title: Remove advanced psychology validation and research-level tests
status: open
priority: high
prerequisites: []
created: "2025-07-29T11:38:24.875253"
updated: "2025-07-29T11:38:24.875253"
schema_version: "1.1"
---

# Remove Advanced Psychology Validation and Research-Level Tests

## Context

Several tests focus on research-level psychology features rather than essential functionality for an agent configuration system. These tests implement academic psychology validation that's beyond the scope of a functional agent configuration system.

## Tests to Remove

### Advanced Psychology Model Compliance

From `packages/shared/src/__tests__/integration/features/personality-management/personality-management-validation.integration.spec.ts`:

#### Research-Level Psychology Tests

- "validate trait combinations based on psychological research correlations"
- "detect statistically improbable trait combinations with confidence scoring"
- "validate age-appropriate trait development patterns"
- "validate cultural sensitivity in trait interpretation"

#### Advanced Psychological Model Tests

- Tests for psychological model compliance validation
- Statistical improbability detection
- Cultural adaptation features
- Age-appropriate development pattern validation

### Over-Engineered Validation Tests

- Complex constraint violations with detailed validation context
- Comprehensive data sanitization with attack pattern detection
- Advanced psychological model compliance validation

## Supporting Files to Review

Check these files for psychology research content that may need removal:

### Fixtures

- `packages/shared/src/__tests__/integration/fixtures/psychology-model-constraints.json`
- `packages/shared/src/__tests__/integration/fixtures/personality-trait-combinations.json`

### Test Utils

- `packages/shared/src/test-utils/personality-management/TraitInteractionTester.ts`
- `packages/shared/src/test-utils/personality-management/TeamDynamicsTester.ts`
- `packages/shared/src/test-utils/personality-management/PersonalityScoringTester.ts`
- `packages/shared/src/test-utils/personality-management/BusinessRuleServiceMock.ts`

## Keep Essential Psychology Tests

Retain basic validation tests that serve business purposes:

- Big Five traits within 0-100 range validation
- Required field presence validation
- Basic trait combination validation for obvious conflicts
- Data type and format validation

## Rationale

The core business need is "configure agent personalities with reasonable validation," not "implement research-grade psychological assessment tools." These advanced psychology features are:

- Beyond the scope of an agent configuration system
- Academically complex without business justification
- Over-engineered for the actual use case

## Acceptance Criteria

- [ ] All research-level psychology tests are removed
- [ ] Basic personality validation tests remain
- [ ] Psychology research fixtures are removed if unused
- [ ] Advanced psychology test utilities are removed if unused
- [ ] Test suite runs successfully with essential personality validation intact

### Log
