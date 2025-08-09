---
id: T-update-roleviewmodel-and
title: Update RoleViewModel and roleSchema to align with new architecture
status: open
priority: high
parent: F-legacy-roles-code-cleanup
prerequisites:
  - T-remove-localstorage
  - T-remove-role-category
  - T-remove-custom-vs-predefined
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T21:55:11.235Z
updated: 2025-08-09T21:55:11.235Z
---

# Task: Update RoleViewModel and roleSchema to Align with New Architecture

## Context

The RoleViewModel type and roleSchema need to be updated to match the new simplified roles architecture. The new model should include id, name, description, systemPrompt, and nullable timestamps.

## Files to Update

- `packages/ui-shared/src/types/settings/RoleViewModel.ts`
- `packages/ui-shared/src/schemas/roleSchema.ts`
- `packages/ui-shared/src/types/settings/RoleFormData.ts` (verify compatibility)

## Implementation Steps

1. **Update roleSchema.ts**
   - Add `systemPrompt` field to the schema
   - Ensure validation rules are appropriate

   ```typescript
   export const roleSchema = z.object({
     name: z.string()
       .min(1, "Role name is required")
       .max(50, "Name must be 50 characters or less")
       // ... existing validation
     description: z.string()
       .min(1, "Role description is required")
       .max(200, "Description must be 200 characters or less")
       // ... existing validation
     systemPrompt: z.string()
       .min(1, "System prompt is required")
       .max(2000, "System prompt must be 2000 characters or less")
       .optional() // Make optional initially for backward compatibility
   });
   ```

2. **Update RoleViewModel.ts**
   - Remove any obsolete fields (category, isPredefined, etc.)
   - Ensure timestamps are properly typed as nullable/optional
   - Add systemPrompt if not already present

   ```typescript
   export interface RoleViewModel {
     id: string;
     name: string;
     description: string;
     systemPrompt?: string; // Optional for backward compatibility
     createdAt?: string; // Nullable
     updatedAt?: string; // Nullable
   }
   ```

3. **Verify RoleFormData Compatibility**
   - Check that RoleFormData type (derived from roleSchema) works correctly
   - Ensure it doesn't include fields that no longer exist

4. **Update rolesStore for New Fields**
   - Update createRole method to handle systemPrompt
   - Update updateRole method to handle systemPrompt
   - Ensure timestamps are handled correctly (nullable)

5. **Write Unit Tests**
   - Test that roleSchema validates correctly with systemPrompt
   - Test that RoleViewModel can be created with all fields
   - Test backward compatibility (roles without systemPrompt)
   - Test timestamp handling (null/undefined values)

## Acceptance Criteria

- [ ] roleSchema includes systemPrompt field with proper validation
- [ ] RoleViewModel type updated with correct field structure
- [ ] No obsolete fields remain (category, isPredefined, etc.)
- [ ] Timestamps are properly nullable/optional
- [ ] rolesStore handles new schema correctly
- [ ] Unit tests pass for schema validation
- [ ] TypeScript compilation succeeds
- [ ] Backward compatibility maintained for existing roles

## Technical Approach

```typescript
// Final RoleViewModel structure
export interface RoleViewModel {
  /** Unique identifier for the role */
  id: string;
  /** Display name of the role */
  name: string;
  /** Brief description of the role's purpose */
  description: string;
  /** System prompt that defines the role's behavior */
  systemPrompt?: string;
  /** When the role was created (nullable) */
  createdAt?: string;
  /** When the role was last updated (nullable) */
  updatedAt?: string;
}

// Updated schema with systemPrompt
const roleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  systemPrompt: z.string().min(1).max(2000).optional(),
});
```

## Testing Requirements

- Create unit tests for the updated schema
- Test validation with and without systemPrompt
- Test that existing roles without systemPrompt still work
- Verify TypeScript types are correctly inferred
- Run `pnpm type-check` and `pnpm test`

## Dependencies

- Prerequisites: Cleanup tasks must be complete to avoid conflicts

## Notes

- systemPrompt is made optional initially for backward compatibility
- Timestamps should be nullable to support roles without creation dates
- This aligns with the new database-backed persistence model

## Estimated Time

1.5 hours - Requires careful type updates and thorough testing
