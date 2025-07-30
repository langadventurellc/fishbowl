---
kind: task
id: T-remove-performance-micro
status: done
title: Remove performance micro-benchmark and timing-specific tests
priority: high
prerequisites: []
created: "2025-07-29T11:37:59.116561"
updated: "2025-07-29T12:14:38.687685"
schema_version: "1.1"
worktree: null
---

# Remove Performance Micro-Benchmark and Timing-Specific Tests

## Context

Many test files contain specific timing requirements (50ms, 100ms, 300ms) and performance micro-benchmarks that are implementation details rather than business requirements. These tests are brittle and focus on exact millisecond requirements instead of reasonable performance.

## Tests to Remove or Modify

### Files with Performance Micro-Benchmarks

Review and remove timing-specific tests from these files (keep the files if they have other valid tests):

#### Role Management Tests

- `packages/shared/src/__tests__/integration/features/role-management/role-custom-capabilities.integration.spec.ts`
  - Remove: "validate custom capability definition with technical constraints within 200ms"
  - Remove: "enforce capability constraints during role configuration within 100ms"
  - Remove: "integrate custom role permissions with authorization services within 150ms"
  - Remove: "detect capability conflicts with system requirements within 300ms"

- `packages/shared/src/__tests__/integration/features/role-management/role-custom-crud.integration.spec.ts`
  - Remove: "create custom role through service integration within 500ms"
  - Remove: "retrieve custom role with complete data within 50ms"
  - Remove: "update custom role with validation within 500ms"
  - Remove: "delete custom role with dependency validation within 300ms"

- `packages/shared/src/__tests__/integration/features/role-management/role-custom-templates.integration.spec.ts`
  - Remove: "create custom role using predefined template through service integration within 300ms"
  - Remove: "maintain template reference tracking for custom roles within 50ms"
  - Remove: "ensure template data copying prevents reference sharing within 100ms"
  - Remove: "validate template version compatibility during custom role creation within 150ms"

- `packages/shared/src/__tests__/integration/features/role-management/role-custom-validation.integration.spec.ts`
  - Remove: "validate custom role schema through ValidationService integration within 100ms"
  - Remove: "validate custom role against business rules through service integration within 200ms"
  - Remove: "validate role constraints for feasibility and enforceability within 150ms"
  - Remove: "validate role ecosystem to detect conflicts between custom roles within 500ms"

#### Personality Management Tests

- `packages/shared/src/__tests__/integration/features/personality-management/personality-management-validation.integration.spec.ts`
  - Remove: "validate single personality validation performance within 50ms threshold"

#### Agent Configuration Tests

- `packages/shared/src/__tests__/integration/features/agent-configuration/agent-references-cross-service.integration.spec.ts`
  - Remove: "meet 300ms performance requirement for cross-service reference validation"

## Approach

1. **Review each file** to distinguish between timing tests and functional tests
2. **Remove only timing-specific assertions** while preserving functional validation
3. **Keep files that have other valid business logic tests**
4. **Replace specific timing requirements** with general "reasonable performance" if needed

## Acceptance Criteria

- [ ] All micro-benchmark timing assertions are removed (50ms, 100ms, etc.)
- [ ] Functional tests remain intact in the same files
- [ ] Test suite runs successfully
- [ ] Performance is still tested at a reasonable level without specific millisecond requirements

### Log

**2025-07-29T17:29:34.764090Z** - Successfully removed performance micro-benchmark and timing-specific tests from all 6 integration test files. Eliminated brittle timing assertions (50ms-500ms) that tested implementation details rather than business requirements. All functional test logic preserved, code quality maintained, and test suite remains operational.

- filesChanged: ["packages/shared/src/__tests__/integration/features/role-management/role-custom-capabilities.integration.spec.ts", "packages/shared/src/__tests__/integration/features/role-management/role-custom-crud.integration.spec.ts", "packages/shared/src/__tests__/integration/features/role-management/role-custom-templates.integration.spec.ts", "packages/shared/src/__tests__/integration/features/role-management/role-custom-validation.integration.spec.ts", "packages/shared/src/__tests__/integration/features/personality-management/personality-management-validation.integration.spec.ts", "packages/shared/src/__tests__/integration/features/agent-configuration/agent-references-cross-service.integration.spec.ts"]
