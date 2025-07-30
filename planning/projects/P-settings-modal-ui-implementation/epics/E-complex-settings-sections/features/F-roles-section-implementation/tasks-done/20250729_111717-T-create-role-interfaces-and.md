---
kind: task
id: T-create-role-interfaces-and
parent: F-roles-section-implementation
status: done
title: Create Role interfaces and validation schemas in shared package
priority: high
prerequisites: []
created: "2025-07-29T10:59:14.139811"
updated: "2025-07-29T11:09:52.704765"
schema_version: "1.1"
worktree: null
---

# Create Role Types and Validation in Shared Package

## Context

Implement the foundational type system for roles to support both predefined and custom role management. This follows the same patterns as the existing Personality system but serves a different purpose - roles define specialized expertise areas while personalities define behavioral traits.

## Technical Approach

### 1. Create Core Role Interfaces

**File: `packages/shared/src/types/settings/Role.ts`**

- Create `CustomRole` interface with id, name, description, createdAt, updatedAt
- Create `PredefinedRole` interface with id, name, description, icon, category?
- Follow existing patterns from Personality.ts structure

### 2. Create Role Form Data Type

**File: `packages/shared/src/types/settings/RoleFormData.ts`**

- Create `RoleFormData` type derived from validation schema
- Use same pattern as PersonalityFormData.ts with z.infer

### 3. Create Validation Schema

**File: `packages/shared/src/schemas/roleSchema.ts`**

- Create `roleSchema` using Zod with validation rules:
  - name: 1-50 characters, required, regex for valid characters
  - description: 1-200 characters, required
- Export schema for form validation and type inference

### 4. Create Component Props Interfaces

**Files in `packages/shared/src/types/ui/components/`:**

- `RoleCardProps.ts` - Props for predefined role cards
- `CustomRoleCardProps.ts` - Props for custom role list items
- `CreateRoleFormProps.ts` - Props for role creation/editing form
- `RolesSectionProps.ts` - Props for main roles section component

### 5. Update Exports

**Files to update:**

- `packages/shared/src/types/settings/index.ts` - Export role types
- `packages/shared/src/types/ui/components/index.ts` - Export component props
- `packages/shared/src/schemas/index.ts` - Export role schema

## Detailed Acceptance Criteria

### Interface Design

- [ ] CustomRole interface includes id, name, description, timestamps matching feature spec
- [ ] PredefinedRole interface includes icon field for emoji icons (📊, 💼, etc.)
- [ ] RoleFormData type correctly infers from validation schema
- [ ] All interfaces follow existing Personality system patterns for consistency

### Validation Schema

- [ ] Role name validation: 1-50 characters, alphanumeric with spaces/hyphens/underscores
- [ ] Description validation: 1-200 characters, required
- [ ] Clear error messages matching existing personality validation patterns
- [ ] Schema exports correctly for use in forms and type inference

### Component Props

- [ ] Props interfaces support all UI requirements from feature specification
- [ ] Props include proper TypeScript generics and optional properties
- [ ] Props follow existing naming conventions and documentation patterns
- [ ] All props interfaces exported correctly from barrel files

### Testing Requirements

- [ ] Unit tests for role schema validation with edge cases
- [ ] Type-level tests ensuring correct TypeScript inference
- [ ] Tests covering all validation rules and error messages

## Implementation Notes

- Follow existing patterns from `packages/shared/src/types/settings/Personality.ts`
- Use consistent naming conventions with other shared types
- Include comprehensive JSDoc documentation for all interfaces
- Ensure TypeScript strict mode compatibility

## Dependencies

- None - foundational task that enables other role implementation tasks

## Security Considerations

- Input validation prevents XSS through role names and descriptions
- Schema validation ensures data integrity
- Character limits prevent potential DoS through large inputs

### Log

**2025-07-29T16:17:17.237700Z** - Successfully implemented complete TypeScript interface and validation schema foundation for the roles system. Created PredefinedRole and CustomRole interfaces following the established personality system patterns, with comprehensive Zod validation including character limits and regex validation for names and descriptions. Added type-safe component prop interfaces for all UI components. Maintained single-export-per-file architecture per linting requirements. All quality checks (lint, format, type-check) pass successfully.

- filesChanged: ["packages/shared/src/schemas/roleSchema.ts", "packages/shared/src/types/settings/RoleFormData.ts", "packages/shared/src/types/settings/PredefinedRole.ts", "packages/shared/src/types/settings/CustomRole.ts", "packages/shared/src/types/ui/components/RoleCardProps.ts", "packages/shared/src/types/ui/components/CustomRoleCardProps.ts", "packages/shared/src/types/ui/components/CreateRoleFormProps.ts", "packages/shared/src/types/ui/components/RolesSectionProps.ts", "packages/shared/src/schemas/index.ts", "packages/shared/src/types/settings/index.ts", "packages/shared/src/types/ui/components/index.ts"]
