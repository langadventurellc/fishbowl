---
id: T-create-individual-role-zod
title: Create Individual Role Zod Schema with Validation
status: open
priority: high
parent: F-roles-persistence-schema-and
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T19:42:41.943Z
updated: 2025-08-09T19:42:41.943Z
---

# Create Individual Role Zod Schema with Validation Task

## Context and Background

This task creates the foundational Zod schema for validating individual role objects in the Fishbowl roles settings system. The schema must handle both programmatically created roles and roles manually edited in JSON files, following established patterns from existing settings schemas.

**Related Objects:**

- **Feature**: F-roles-persistence-schema-and (Roles Persistence Schema and Types)
- **Epic**: E-data-foundation-and-schema (Data Foundation and Schema Design)
- **Project**: P-implement-roles-settings-with (Implement Roles Settings with JSON File Persistence)

## Specific Implementation Requirements

### File Creation

Create `packages/shared/src/types/settings/rolesSettingsSchema.ts` with individual role schema implementation.

### Schema Fields to Implement

```typescript
const persistedRoleSchema = z.object({
  id: z.string().min(1, "Role ID cannot be empty"),
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name cannot exceed 100 characters"),
  description: z
    .string()
    .min(1, "Role description is required")
    .max(500, "Role description cannot exceed 500 characters"),
  systemPrompt: z
    .string()
    .min(1, "System prompt is required")
    .max(5000, "System prompt cannot exceed 5000 characters"),
  createdAt: z.string().datetime().nullable().optional(),
  updatedAt: z.string().datetime().nullable().optional(),
});
```

### Technical Approach to Follow

1. **Research Existing Patterns**: Examine `packages/shared/src/types/settings/generalSettingsSchema.ts`, `appearanceSettingsSchema.ts`, and `advancedSettingsSchema.ts` to understand established patterns

2. **Implement Core Schema**:
   - Use Zod's built-in validation methods (.min(), .max(), .datetime())
   - Add custom error messages for better user experience
   - Handle nullable timestamps for direct JSON edits

3. **Export Types and Schema**:
   - Export the schema as `persistedRoleSchema`
   - Export inferred TypeScript type as `PersistedRoleData`
   - Follow existing naming conventions from other settings

4. **Add Helper Functions** (if needed by existing patterns):
   - Type guards or validation helpers following existing settings patterns

## Detailed Acceptance Criteria

### Schema Validation Requirements

- [ ] **Required Fields Validation**:
  - `id` field validates as non-empty string
  - `name` field validates as 1-100 character string
  - `description` field validates as 1-500 character string
  - `systemPrompt` field validates as 1-5000 character string

- [ ] **Optional Fields Validation**:
  - `createdAt` accepts valid ISO datetime string or null/undefined
  - `updatedAt` accepts valid ISO datetime string or null/undefined
  - Schema passes validation when timestamps are missing (for direct JSON edits)

- [ ] **Error Message Quality**:
  - Field-specific error messages reference field names
  - Character limit errors include current and maximum counts
  - Empty field errors clearly identify which field is missing

### TypeScript Type Requirements

- [ ] **Type Export**: `PersistedRoleData` type properly inferred from schema
- [ ] **Type Safety**: No `any` types used in schema definition
- [ ] **Import Compatibility**: Types can be imported by other packages without errors

### Performance and Security Requirements

- [ ] **Validation Performance**: Schema validates typical role data in <5ms
- [ ] **Security**: Field length limits prevent DoS attacks via oversized data
- [ ] **Memory Efficiency**: Schema objects don't consume excessive memory

## Testing Requirements (Include in Same Task)

### Unit Test File: `packages/shared/src/types/settings/__tests__/rolesSettingsSchema.test.ts`

```typescript
// Test categories to implement:

describe("persistedRoleSchema", () => {
  describe("valid data validation", () => {
    // Test complete valid role objects
    // Test valid roles with null timestamps
    // Test valid roles with missing optional fields
  });

  describe("field validation", () => {
    // Test each required field individually
    // Test character limits (minimum and maximum)
    // Test empty string rejection
  });

  describe("error messages", () => {
    // Verify error messages reference field names
    // Check character count information in limit errors
    // Confirm multiple errors are properly collected
  });

  describe("type inference", () => {
    // Verify TypeScript type properly inferred
    // Test type compatibility with existing patterns
  });
});
```

### Test Data to Cover

- **Valid Cases**: Complete role objects, missing timestamps, minimum/maximum character limits
- **Invalid Cases**: Empty required fields, oversized fields, invalid timestamp formats
- **Edge Cases**: Unicode characters, special characters in system prompts

## Dependencies

- **Prerequisites**: None - this is the foundational schema
- **Dependents**: All subsequent tasks in this feature rely on this schema

## Security Considerations

### Input Validation Security

- Validate field lengths to prevent resource exhaustion attacks
- Ensure special characters in role names don't cause injection issues
- System prompt field must accept necessary AI instruction characters safely

### Error Message Security

- Don't expose internal system information in validation error messages
- Ensure error messages can't be used to infer system architecture

## File Structure Context

This task creates the foundation file that other schema components will import:

```
packages/shared/src/types/settings/
├── rolesSettingsSchema.ts          # THIS TASK - Individual role schema
├── createDefaultRolesSettings.ts   # Next task - depends on this
└── index.ts                        # Final task - barrel exports
```

## Success Metrics

- [ ] Individual role schema validates all test cases correctly
- [ ] TypeScript compilation succeeds with proper type inference
- [ ] Error messages provide actionable feedback for validation failures
- [ ] Schema follows established patterns from existing settings schemas
- [ ] Unit tests achieve 100% coverage of schema validation logic
- [ ] Performance benchmarks met for validation speed (<5ms typical data)
