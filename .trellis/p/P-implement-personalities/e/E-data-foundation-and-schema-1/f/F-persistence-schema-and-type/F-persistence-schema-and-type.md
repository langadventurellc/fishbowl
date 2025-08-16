---
id: F-persistence-schema-and-type
title: Persistence Schema and Type Definitions
status: done
priority: medium
parent: E-data-foundation-and-schema-1
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
  packages/shared/src/types/settings/PersistedPersonalityData.ts:
    Created TypeScript type definition for individual personality data, inferred
    from Zod schema with comprehensive JSDoc documentation
  packages/shared/src/types/settings/PersistedPersonalitiesSettingsData.ts:
    Created TypeScript type definition for complete personalities settings file
    structure including schema version and metadata
  packages/shared/src/types/settings/__tests__/personalityTypeDefinitions.test.ts:
    Created comprehensive unit tests covering type correctness, schema
    compatibility, edge cases, and export functionality with 11 test cases
  packages/shared/src/types/settings/index.ts: Updated to export both new
    personality types and schema constants following established patterns
  packages/shared/src/types/settings/createDefaultPersonalitiesSettings.ts:
    Created factory function that generates default personalities settings
    structure with empty personalities array, schema version 1.0.0, and current
    timestamp
  packages/shared/src/types/settings/__tests__/createDefaultPersonalitiesSettings.test.ts:
    Added comprehensive unit tests with 31 test cases covering basic
    functionality, schema validation, timestamp generation, function purity,
    error handling, and edge cases
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-create-core-zod-schemas-for
  - T-create-default-personalities
  - T-create-typescript-type
created: 2025-08-15T18:02:56.211Z
updated: 2025-08-15T18:02:56.211Z
---

# Persistence Schema and Type Definitions

## Purpose

Create the foundational persistence schema and type definitions for personality data using Zod validation, following the exact pattern established by the roles feature.

## Key Components to Implement

### Schema Files (`packages/shared/src/types/settings/`)

- `personalitiesSettingsSchema.ts` - Main Zod schema for persistence validation
- `PersistedPersonalityData.ts` - Individual personality data type
- `PersistedPersonalitiesSettingsData.ts` - Complete file structure type
- `createDefaultPersonalitiesSettings.ts` - Factory function for initial data

### Schema Structure Requirements

- `persistedPersonalitySchema` with all required fields (id, name, bigFive, behaviors, customInstructions, timestamps)
- Big Five traits object with 5 properties (openness, conscientiousness, extraversion, agreeableness, neuroticism)
- Behaviors as record of string to number (0-100 range)
- Custom instructions with 500 character limit
- Nullable timestamps for manual JSON editing support
- Schema version tracking

## Detailed Acceptance Criteria

### Schema Validation

- [ ] ID field validates as non-empty string
- [ ] Name field validates between 1-50 characters
- [ ] Big Five traits validate as numbers between 0-100
- [ ] Behaviors validate as record of string to number (0-100)
- [ ] Custom instructions validate with 500 character max
- [ ] createdAt/updatedAt accept ISO datetime strings or null
- [ ] Schema version field included for future migrations

### Type Definitions

- [ ] `PersistedPersonalityData` type exports correctly
- [ ] `PersistedPersonalitiesSettingsData` type includes personalities array and metadata
- [ ] All types have proper JSDoc documentation
- [ ] No `any` types used anywhere in definitions

### Integration Requirements

- [ ] Schema follows exact pattern from `rolesSettingsSchema.ts`
- [ ] Types export properly for use in ui-shared and desktop packages
- [ ] Factory function creates valid default structure
- [ ] All validation errors provide clear, actionable messages

## Implementation Guidance

### File Structure Pattern

```typescript
// personalitiesSettingsSchema.ts
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

### Dependencies

- Mirror rolesSettingsSchema.ts structure exactly
- Use consistent naming patterns
- Follow established error message formats

## Testing Requirements

- [ ] Unit tests for all schema validations
- [ ] Test all edge cases for number ranges
- [ ] Test string length limits
- [ ] Test null timestamp handling
- [ ] Test invalid data rejection
- [ ] 100% test coverage for schema validation

## Security Considerations

- Input validation through Zod prevents malformed data
- Custom instructions field sanitization
- No sensitive data stored in personality definitions
- Proper type checking prevents injection attacks

## Performance Requirements

- Schema validation completes within 10ms for single personality
- Efficient validation for arrays of up to 100 personalities
- Memory-efficient type definitions
