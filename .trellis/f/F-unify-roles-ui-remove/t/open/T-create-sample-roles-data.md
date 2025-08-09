---
id: T-create-sample-roles-data
title: Create sample roles data constants and types
status: in-progress
priority: high
parent: F-unify-roles-ui-remove
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T03:58:05.565Z
updated: 2025-08-09T03:58:05.565Z
---

# Create Sample Roles Data Constants and Types

## Context

This task establishes the foundation for the unified roles UI by creating hard-coded sample data that includes all current predefined roles. The data will be structured to match the existing CustomRoleViewModel interface, allowing seamless integration with the current CustomRolesTab component structure.

## Reference Files

- `/packages/ui-shared/src/data/predefinedRoles.ts` - Current predefined roles data
- `/packages/ui-shared/src/types/settings/CustomRoleViewModel.ts` - Target data structure
- `/packages/ui-shared/src/types/settings/PredefinedRole.ts` - Current predefined structure

## Implementation Requirements

### 1. Create Sample Data File

**Location**: `packages/ui-shared/src/data/sampleRoles.ts`

**Structure**: Create a new constant array containing all current predefined roles transformed to CustomRoleViewModel format:

```typescript
export const SAMPLE_ROLES: CustomRoleViewModel[] = [
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Focus on timelines, coordination, and project organization",
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-01T12:00:00.000Z",
  },
  // ... all other predefined roles
];
```

### 2. Transform All Predefined Roles

Include all 10 current predefined roles:

- Project Manager (management category)
- Technical Advisor (technical category)
- Creative Director (creative category)
- Storyteller (creative category)
- Analyst (analytical category)
- Coach (supportive category)
- Critic (analytical category)
- Business Strategist (strategic category)
- Financial Advisor (strategic category)
- Generalist (general category)

### 3. Data Structure Requirements

- **id**: Use existing predefined role IDs (kebab-case)
- **name**: Exact match to current predefined role names
- **description**: Exact match to current descriptions
- **createdAt/updatedAt**: Use consistent mock timestamps (January 1, 2025)

### 4. Add Category Metadata (Future-Proofing)

Include category information as optional metadata for future grouping:

```typescript
// Optional: Add category as comment or separate export for future use
export const ROLE_CATEGORIES = {
  "project-manager": "management",
  "technical-advisor": "technical",
  // ... etc
} as const;
```

### 5. Update Barrel Exports

**File**: `packages/ui-shared/src/data/index.ts`

- Add export for `SAMPLE_ROLES`
- Keep existing predefined role exports for now (backward compatibility)

## Acceptance Criteria

- [ ] New `sampleRoles.ts` file created with all 10 roles
- [ ] All roles follow CustomRoleViewModel interface exactly
- [ ] Role names and descriptions match current predefined roles
- [ ] Consistent mock timestamps applied to all entries
- [ ] SAMPLE_ROLES exported from data/index.ts
- [ ] No TypeScript compilation errors
- [ ] File follows existing project code style conventions

## Testing Requirements

- **Unit Test**: Create test file `packages/ui-shared/src/data/__tests__/sampleRoles.test.ts`
- **Validation Tests**:
  - Verify all 10 roles are present
  - Confirm each role has required CustomRoleViewModel fields
  - Check ID uniqueness
  - Validate non-empty names and descriptions
- **Type Safety**: Ensure TypeScript compilation passes with strict mode

## Dependencies

- None - This is a foundational task

## Security Considerations

- Static data only - no external inputs
- IDs use safe kebab-case format
- Descriptions are predefined content (no user input)

## Implementation Notes

- Use existing predefinedRoles.ts as reference for names/descriptions
- Maintain alphabetical or category-based ordering
- Consider future extensibility for additional metadata
- Follow existing file structure and naming patterns in the data directory
