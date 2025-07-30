---
kind: task
id: T-move-ui-specific-schemas-and
title: Move UI-specific schemas and validation to ui-shared
status: open
priority: normal
prerequisites:
  - T-move-settings-stores-and-ui
created: "2025-07-30T16:31:38.359503"
updated: "2025-07-30T16:31:38.359503"
schema_version: "1.1"
---

## Objective

Move UI-specific form schemas and validation logic from shared package to ui-shared package while keeping core business validation in shared.

## Context

Some schemas in the shared package are specifically for UI forms and should be co-located with UI components, while core business validation schemas should remain with business logic.

## Implementation Requirements

1. Identify and move UI-specific schemas
2. Keep core business validation schemas in shared package
3. Update schema imports and dependencies
4. Ensure validation logic remains functional

## Schemas to Move

From `packages/shared/src/schemas/`:

- `createApiKeysFormSchema.ts` - UI form validation
- Any other form-specific validation schemas

## Schemas to Keep in Shared

- `roleSchema.ts` - Core business validation
- `personalitySchema.ts` - Core business validation
- `agentSchema.ts` - Core business validation
- Any other business entity validation

## Technical Approach

1. Create `packages/ui-shared/src/schemas/` directory
2. Move identified UI form schemas to ui-shared package
3. Update imports within moved schemas:
   - UI types: import from local ui-shared types
   - Business types: import from `@fishbowl-ai/shared`
4. Update `packages/ui-shared/src/index.ts` to export UI schemas
5. Update `packages/shared/src/schemas/index.ts` to remove moved schemas
6. Verify Zod validation continues to work correctly

## Acceptance Criteria

- [ ] UI-specific schemas successfully moved to ui-shared package
- [ ] Core business schemas remain in shared package
- [ ] Moved schemas properly import from correct packages
- [ ] ui-shared package exports all moved schemas
- [ ] shared package only exports business schemas
- [ ] Zod validation functions correctly in new location
- [ ] Schema validation logic remains intact

## Testing Requirements

- Test UI form validation after schema move
- Verify business validation schemas remain functional
- Run schema unit tests to confirm validation works
- Test schema imports resolve correctly from both packages

### Log
