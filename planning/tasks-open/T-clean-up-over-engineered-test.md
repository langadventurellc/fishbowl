---
kind: task
id: T-clean-up-over-engineered-test
title: Clean up over-engineered test-utils and personality management helpers
status: open
priority: normal
prerequisites:
  - T-remove-advanced-psychology
  - T-remove-unused-test-fixtures-and
created: "2025-07-29T11:39:14.422784"
updated: "2025-07-29T11:39:14.422784"
schema_version: "1.1"
---

# Clean Up Over-Engineered Test-Utils and Personality Management Helpers

## Context

The `packages/shared/src/test-utils/personality-management/` directory contains numerous over-engineered utilities that were built to support the advanced psychology research tests. After removing those tests, many of these utilities are likely unused and should be cleaned up.

## Files to Review and Potentially Remove

### Advanced Psychology Test Utilities

- `packages/shared/src/test-utils/personality-management/TraitInteractionTester.ts`
- `packages/shared/src/test-utils/personality-management/TeamDynamicsTester.ts`
- `packages/shared/src/test-utils/personality-management/PersonalityScoringTester.ts`
- `packages/shared/src/test-utils/personality-management/TraitInteractionValidationResult.ts`
- `packages/shared/src/test-utils/personality-management/TeamCompatibilityResult.ts`
- `packages/shared/src/test-utils/personality-management/PersonalityScoringResult.ts`

### Business Rule and Scoring Services

- `packages/shared/src/test-utils/personality-management/BusinessRuleServiceMock.ts`
- `packages/shared/src/test-utils/personality-management/ScoringServiceMock.ts`
- `packages/shared/src/test-utils/personality-management/BusinessRuleServiceMockConfig.ts`
- `packages/shared/src/test-utils/personality-management/ScoringServiceMockConfig.ts`
- `packages/shared/src/test-utils/personality-management/BusinessRuleValidationResult.ts`

### Complex Validation Utilities

- `packages/shared/src/test-utils/personality-management/TraitInteractionTestConfig.ts`
- `packages/shared/src/test-utils/personality-management/TraitInteractionWarning.ts`
- `packages/shared/src/test-utils/personality-management/TraitInteractionError.ts`

### Mirror Files in Alternative Location

Also check the duplicate files in:

- `packages/shared/packages/shared/src/test-utils/personality-management/`

## Files to Likely Keep

Basic utilities that support essential functionality:

- `packages/shared/src/test-utils/personality-management/base-setup.ts`
- `packages/shared/src/test-utils/personality-management/ServiceMockFactory.ts`
- `packages/shared/src/test-utils/personality-management/ValidationServiceMock.ts`
- `packages/shared/src/test-utils/personality-management/ValidationServiceMockConfig.ts`

## Implementation Approach

1. **Search for usage** of each utility across the remaining test files
2. **Remove unused utilities** that were only supporting deleted psychology tests
3. **Update index.ts files** to remove exports for deleted utilities
4. **Clean up imports** in remaining test files
5. **Verify** that essential personality validation tests still work

## Acceptance Criteria

- [ ] All unused personality management test utilities are removed
- [ ] Essential utilities for basic personality validation remain
- [ ] No broken imports or references in remaining tests
- [ ] Index files are updated to remove deleted exports
- [ ] Test suite runs successfully
- [ ] Duplicate utility files in packages/shared/packages/ are also cleaned up

### Log
