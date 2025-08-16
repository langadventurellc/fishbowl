---
id: T-create-core-zod-schemas-for
title: Create core Zod schemas for personality persistence
status: done
priority: high
parent: F-persistence-schema-and-type
prerequisites: []
affectedFiles:
  packages/shared/src/types/settings/personalitiesSettingsSchema.ts:
    Created new Zod schema file with persistedPersonalitySchema and
    persistedPersonalitiesSettingsSchema including schema versioning,
    comprehensive validation rules, security limits, and clear error messages
    following rolesSettingsSchema.ts pattern
  packages/shared/src/types/settings/__tests__/personalitiesSettingsSchema.test.ts:
    Created comprehensive unit test suite with 82 tests covering valid data
    validation, field validation for all properties, error message validation,
    type inference, passthrough functionality, malformed data handling, and
    complete file structure validation
log:
  - Successfully implemented core Zod schemas for personality persistence
    following the exact pattern from rolesSettingsSchema.ts. Created both
    persistedPersonalitySchema and persistedPersonalitiesSettingsSchema with
    comprehensive validation including Big Five personality traits (0-100
    range), behaviors record validation, and custom instructions with 500
    character limit. Implemented 82 comprehensive unit tests covering all
    validation cases, edge cases, error messages, type inference, and future
    compatibility. All quality checks pass with proper TypeScript types,
    linting, and formatting.
schema: v1.0
childrenIds: []
created: 2025-08-15T18:05:59.242Z
updated: 2025-08-15T18:05:59.242Z
---

# Create Core Zod Schemas for Personality Persistence

## Context

This task establishes the foundational Zod schemas for personality data persistence. Follow the exact pattern from `packages/shared/src/types/settings/rolesSettingsSchema.ts` to ensure consistency with the existing roles implementation.

## Implementation Requirements

### File: `packages/shared/src/types/settings/personalitiesSettingsSchema.ts`

Create the main schema file with:

1. **persistedPersonalitySchema** - Individual personality validation
2. **persistedPersonalitiesSettingsSchema** - Complete file structure validation
3. Proper exports for type inference

### Schema Structure

```typescript
export const persistedPersonalitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  bigFive: z.object({
    openness: z.number().min(0).max(100),
    conscientiousness: z.number().min(0).max(100),
    extraversion: z.number().min(0).max(100),
    agreeableness: z.number().min(0).max(100),
    neuroticism: z.number().min(0).max(100),
  }),
  behaviors: z.record(z.string(), z.number().min(0).max(100)),
  customInstructions: z.string().max(500),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});

export const persistedPersonalitiesSettingsSchema = z.object({
  schemaVersion: z.string(),
  personalities: z.array(persistedPersonalitySchema),
  lastUpdated: z.string().datetime(),
});
```

## Acceptance Criteria

- [ ] File created at exact path: `packages/shared/src/types/settings/personalitiesSettingsSchema.ts`
- [ ] Both schemas export correctly with proper Zod validation
- [ ] ID validates as non-empty string
- [ ] Name validates between 1-50 characters
- [ ] All Big Five traits validate as numbers 0-100
- [ ] Behaviors validate as record of string to number (0-100)
- [ ] Custom instructions validate with 500 character limit
- [ ] Timestamps accept ISO datetime strings or null
- [ ] Schema follows exact naming patterns from rolesSettingsSchema.ts
- [ ] Clear JSDoc documentation on all exports
- [ ] Unit tests cover all validation cases including edge cases
- [ ] No TypeScript errors or warnings

## Dependencies

- Review `packages/shared/src/types/settings/rolesSettingsSchema.ts` for pattern consistency
- Ensure Zod is properly imported and available

## Testing Requirements (include in this task)

Create comprehensive unit tests covering:

- Valid personality data passes validation
- Invalid ID/name values rejected with clear messages
- Big Five traits out of range (negative, >100, non-numeric) rejected
- Behaviors validation (empty object, invalid values, wrong types)
- Custom instructions over 500 characters rejected
- Null vs invalid timestamp handling
- Schema version validation
- Complete file structure validation
