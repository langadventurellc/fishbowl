---
id: T-create-roles-mock-data
title: Create roles mock data generators
status: done
priority: medium
parent: F-end-to-end-tests-for-roles
prerequisites: []
affectedFiles:
  tests/desktop/helpers/settings/MockRoleData.ts: Created TypeScript interface for mock role data structure
  tests/desktop/helpers/settings/createMockRoleData.ts: Implemented core mock role generator with partial override support
  tests/desktop/helpers/settings/createMinimalRoleData.ts: Created minimal valid role data generator for boundary testing
  tests/desktop/helpers/settings/createInvalidRoleData.ts: Implemented invalid data generator for validation testing
  tests/desktop/helpers/settings/createDuplicateNameRoleData.ts: Created duplicate name generator for uniqueness validation testing
  tests/desktop/helpers/settings/createMockAnalystRole.ts: Implemented specialized data analyst role generator
  tests/desktop/helpers/settings/createMockWriterRole.ts: Implemented specialized creative writer role generator
  tests/desktop/helpers/settings/createMockTechnicalRole.ts: Implemented specialized technical/developer role generator
  tests/desktop/helpers/settings/createLongTextRoleData.ts: Created edge case generator for maximum character limit testing
  tests/desktop/helpers/settings/createSpecialCharRoleData.ts: Implemented special character handling test data generator
  tests/desktop/helpers/index.ts: Updated barrel export to include all new role mock generators and types
log:
  - Implemented comprehensive mock data generation utilities for roles
    end-to-end tests following established patterns from LLM config generators.
    Created 10 generator functions with complete TypeScript typing, unique data
    generation via UUID to prevent test conflicts, and support for all test
    scenarios including validation edge cases. All generators follow the
    one-export-per-file rule and are properly exported through the barrel file.
    Quality checks (lint, format, type-check) all pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-13T18:17:43.386Z
updated: 2025-08-13T18:17:43.386Z
---

# Create Roles Mock Data Generators

Implement mock data generation utilities for roles end-to-end tests to provide consistent, varied test data across all test suites.

## Context

- Feature: End-to-End Tests for Roles Section (`F-end-to-end-tests-for-roles`)
- Reference: `tests/desktop/helpers/settings/createMockAnthropicConfig.ts` and similar files for patterns
- Location: Create files in `tests/desktop/helpers/settings/`
- Data structure: Based on `packages/shared/src/data/defaultRoles.json`

## Implementation Requirements

### Create `createMockRoleData.ts`

Following LLM config patterns, implement role data generators:

**Core Functions:**

- `createMockRoleData(overrides?: Partial<RoleFormData>)` - Generate complete role data
- `createMinimalRoleData()` - Generate minimal required fields only
- `createInvalidRoleData()` - Generate invalid data for validation testing
- `createDuplicateNameRoleData(existingName: string)` - Generate role with duplicate name

**Data Structure Based on Analysis:**

```typescript
interface RoleFormData {
  name: string;
  description: string;
  systemPrompt: string;
}

interface RoleViewModel extends RoleFormData {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
}
```

**Generated Data Patterns:**

- Realistic role names (e.g., "Test Analyst", "Support Specialist")
- Meaningful descriptions (50-150 characters)
- System prompts with appropriate instructions (100-500 characters)
- Unique identifiers for each generation
- Timestamp handling for test scenarios

### Create Specialized Generators

Additional generators for specific test scenarios:

**Role Type Generators:**

- `createMockAnalystRole()` - Data analyst type role
- `createMockWriterRole()` - Creative writer type role
- `createMockTechnicalRole()` - Technical/developer type role

**Validation Test Generators:**

- Empty name scenarios
- Extremely long text scenarios
- Special character handling
- Duplicate name scenarios

## Technical Details

### Expected Implementation Structure

```typescript
import { randomUUID } from "crypto";

export interface MockRoleData {
  name: string;
  description: string;
  systemPrompt: string;
}

export const createMockRoleData = (
  overrides: Partial<MockRoleData> = {},
): MockRoleData => {
  const roleId = randomUUID().slice(0, 8); // Short unique ID

  return {
    name: `Test Role ${roleId}`,
    description: `A test role for automated testing purposes - ${roleId}`,
    systemPrompt: `You are a test assistant role. Help with testing and verification tasks. Always provide clear, actionable responses for test scenarios.`,
    ...overrides,
  };
};
```

### Integration Points

- Used across all test suites for consistent data
- Compatible with roles form data structure
- Works with both creation and editing scenarios
- Handles validation testing needs

### Data Variety Requirements

- Generate unique names to avoid conflicts
- Provide realistic but clearly test-identified data
- Support edge cases for validation testing
- Enable consistent but varied test scenarios

## Acceptance Criteria

- [ ] `createMockRoleData.ts` created with core generator function
- [ ] Support for partial overrides of generated data
- [ ] Realistic but clearly test-identified mock data generated
- [ ] Validation test data generators implemented
- [ ] Proper TypeScript types defined matching role data structure
- [ ] Unique data generation prevents test conflicts
- [ ] Integration-friendly API for test suites
- [ ] Edge case data generators for validation testing
- [ ] Consistent data patterns across different generators
- [ ] Documentation on usage patterns

## Dependencies

- Can be developed in parallel with other infrastructure
- Used by all test suite implementation tasks
- Should align with actual role data structure

## Files to Create

- `tests/desktop/helpers/settings/createMockRoleData.ts`

## Research Required

- Confirm exact role data structure from `@fishbowl-ai/ui-shared` types
- Study existing role form validation requirements
- Understand role name uniqueness constraints
- Check character limits for role fields
