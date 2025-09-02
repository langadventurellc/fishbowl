---
id: T-update-personality-schema-to
title: Update personality schema to use discrete values and unified structure
status: done
priority: high
parent: F-discrete-value-system
prerequisites: []
affectedFiles:
  packages/ui-shared/src/schemas/personalitySchema.ts: Updated schema to use
    discrete values and unified behaviors structure with Zod refinement
    validation
  packages/ui-shared/src/schemas/__tests__/personalitySchema.test.ts:
    Created comprehensive test suite covering discrete value validation, edge
    cases, and real-world usage scenarios
log:
  - >-
    Successfully updated personality schema to use discrete values and unified
    structure. 


    Key changes:

    - Replaced separate bigFive and behaviors fields with single behaviors
    Record<string, DiscreteValue>  

    - Added discrete value validation using Zod refinement with isDiscreteValue
    function

    - Imported discrete utilities from @fishbowl-ai/shared

    - Added .strict() to reject unknown fields

    - Created comprehensive test suite covering all validation scenarios

    - All tests pass and quality checks successful


    The schema now validates only discrete values (0, 20, 40, 60, 80, 100) and
    provides clear error messages. Breaking changes are expected and will be
    handled by subsequent tasks in the epic.
schema: v1.0
childrenIds: []
created: 2025-08-27T17:42:35.917Z
updated: 2025-08-27T17:42:35.917Z
---

# Update Personality Schema for Discrete Values

## Context

The discrete value utilities are implemented in `packages/shared/src/utils/discreteValues.ts`, but the personality schema in `packages/ui-shared/src/schemas/personalitySchema.ts` still uses continuous 0-100 values and has separate `bigFive` and `behaviors` fields. According to the epic requirements, the schema needs to be updated to use discrete values and a unified structure.

## Implementation Requirements

### Schema Structure Updates

1. **Unify into single behaviors record**: Replace separate `bigFive` and `behaviors` fields with a single `behaviors: Record<string, DiscreteValue>` field
2. **Add discrete value validation**: Use Zod's `refine()` method with `isDiscreteValue` to ensure only discrete values (0, 20, 40, 60, 80, 100) are accepted
3. **Maintain permissive keys**: Keep trait keys as `Record<string, DiscreteValue>` to support dynamic trait definitions from JSON
4. **Import discrete utilities**: Import `isDiscreteValue` and `DiscreteValue` from `@fishbowl-ai/shared`

### Implementation Steps

1. Import discrete value utilities from `@fishbowl-ai/shared/utils/discreteValues`
2. Replace the separate `bigFive` and `behaviors` fields with unified `behaviors` field
3. Add Zod refinement using `isDiscreteValue` for discrete value validation
4. Update error messages to reference discrete values
5. Ensure all existing imports of `personalitySchema` continue to work

### Expected Schema Structure

```typescript
import { z } from "zod";
import { isDiscreteValue, type DiscreteValue } from "@fishbowl-ai/shared";

const discreteNumber = z
  .number()
  .min(0)
  .max(100)
  .refine(isDiscreteValue, "Must be one of 0, 20, 40, 60, 80, 100");

export const personalitySchema = z.object({
  name: z
    .string()
    .min(1, "Personality name is required")
    .max(50, "Name must be 50 characters or less")
    .min(2, "Name must be at least 2 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Name can only contain letters, numbers, spaces, hyphens, and underscores",
    )
    .refine((val) => val.trim().length > 0, "Name cannot be only whitespace"),
  behaviors: z.record(z.string(), discreteNumber),
  customInstructions: z.string().max(500, "Instructions too long"),
});
```

## Acceptance Criteria

- [ ] Schema validates only discrete values (0, 20, 40, 60, 80, 100) for all traits
- [ ] Single `behaviors` record replaces separate `bigFive` and `behaviors` fields
- [ ] Error messages clearly indicate discrete value requirements
- [ ] All existing imports and usages continue to work without modification
- [ ] Type definitions properly reflect DiscreteValue usage
- [ ] Schema changes are backward compatible for existing form data

## Testing Requirements

- [ ] Test schema validation with valid discrete values (0, 20, 40, 60, 80, 100)
- [ ] Test schema rejection of invalid values (1, 15, 37, 99, 150, -10)
- [ ] Test unified behaviors field with both Big Five and custom trait keys
- [ ] Verify error messages are helpful and specific
- [ ] Test type safety with TypeScript compilation

## Files to Modify

- `packages/ui-shared/src/schemas/personalitySchema.ts` - Update schema structure and validation
- Unit tests should be included in this same task

## Dependencies

- Requires `packages/shared/src/utils/discreteValues.ts` (already complete)
- Must complete before any form component updates that depend on the new schema structure

## Out of Scope

- Form component updates (separate tasks will handle UI changes)
- Default personality value updates (separate task)
- UI component changes (handled by other tasks in the epic)
