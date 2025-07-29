---
kind: task
id: T-remove-unused-test-fixtures-and
title: Remove unused test fixtures and helpers for deleted tests
status: open
priority: high
prerequisites:
  - T-remove-over-engineered-service
  - T-remove-file-system
created: "2025-07-29T11:37:22.120672"
updated: "2025-07-29T11:37:22.120672"
schema_version: "1.1"
---

# Remove Unused Test Fixtures and Helpers

## Context

After removing over-engineered test files, many supporting fixtures, helpers, and utilities will become unused. These need to be identified and removed to clean up the test infrastructure.

## Approach

1. **Analyze remaining test files** to identify which fixtures and helpers are still in use
2. **Remove unused support files** that were only supporting the deleted tests
3. **Clean up imports** in remaining files that reference deleted utilities

## Potential Files for Removal

### Service Coordination Fixtures

- `packages/shared/src/__tests__/integration/fixtures/service-coordination/workflow-coordination-scenarios.json`
- `packages/shared/src/__tests__/integration/fixtures/service-coordination/consistency-scenarios.json`
- `packages/shared/src/__tests__/integration/fixtures/service-coordination/communication-patterns.json`
- `packages/shared/src/__tests__/integration/fixtures/service-coordination/multi-service-workflows.json`

### Complex Configuration Fixtures

- `packages/shared/src/__tests__/integration/fixtures/configuration-service/transaction-consistency-tests.json`
- `packages/shared/src/__tests__/integration/fixtures/configuration-service/lifecycle-management-cases.json`

### Advanced Test Helpers

- `packages/shared/src/__tests__/integration/support/WorkflowCoordinationHelpers.ts`
- `packages/shared/src/__tests__/integration/support/TransactionTestHelpers.ts`
- `packages/shared/src/__tests__/integration/support/workflow-coordination-validation.test.ts`
- `packages/shared/src/__tests__/integration/utilities/FileLifecycleManager.ts`
- `packages/shared/src/__tests__/integration/utilities/TemporaryDirectoryManager.ts`

### Over-Engineered Mock Factories

- `packages/shared/src/__tests__/integration/support/BackupServiceMockFactory.ts`
- `packages/shared/src/__tests__/integration/support/DependencyServiceMockFactory.ts`
- `packages/shared/src/__tests__/integration/support/AuthorizationServiceMockFactory.ts`
- `packages/shared/src/__tests__/integration/support/CapabilityServiceMockFactory.ts`

## Implementation Steps

1. Use grep/search to find all references to each file
2. Remove files that are only referenced by deleted test files
3. Update import statements in remaining files
4. Remove unused exports from barrel files (index.ts)

## Acceptance Criteria

- [ ] All unused fixtures and helpers are identified and removed
- [ ] No broken imports remain in test files
- [ ] Essential test utilities are preserved
- [ ] Test suite runs successfully
- [ ] No dead code warnings or unused file warnings

### Log
