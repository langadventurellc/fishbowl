---
id: E-data-foundation-and-schema-1
title: Data Foundation and Schema Design
status: in-progress
priority: medium
parent: P-implement-personalities
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/personalities/CreatePersonalityForm.tsx:
    Removed localStorage auto-save functionality, draft cleanup, draft recovery,
    and localStorage clearing after save. Updated imports to remove unused
    useEffect and useDebounce. Updated component documentation to remove
    localStorage references.
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
  packages/shared/src/services/storage/utils/validatePersonalitiesData.ts:
    Created personality validation function following the same pattern as
    validateRolesData and validateSettingsData, using existing ValidationResult
    and error handling infrastructure; Created personality validation function
    following the same pattern as validateRolesData and validateSettingsData,
    using existing ValidationResult and error handling infrastructure
  packages/shared/src/services/storage/utils/__tests__/validatePersonalitiesData.test.ts:
    Created comprehensive test suite with 23 test cases covering all validation
    scenarios, error conditions, Big Five trait validation, behavior validation,
    character limits, timestamp validation, and edge cases; Created
    comprehensive test suite with 23 test cases covering all validation
    scenarios, error conditions, Big Five trait validation, behavior validation,
    character limits, timestamp validation, and edge cases
  packages/shared/src/services/storage/utils/personalities/validateSinglePersonality.ts:
    Created main validation function that uses existing Zod schema and
    ValidationResult interface for comprehensive personality validation
  packages/shared/src/services/storage/utils/personalities/index.ts:
    Created barrel export file for personalities validation utilities; Updated
    barrel file to export new validation functions
  packages/shared/src/services/storage/utils/personalities/__tests__/validateSinglePersonality.test.ts:
    Created comprehensive test suite with 37 test cases covering all validation
    scenarios, edge cases, and error conditions
  packages/shared/src/services/storage/utils/personalities/validateBigFiveTraits.ts:
    Main validation function for Big Five traits with comprehensive error
    handling
  packages/shared/src/services/storage/utils/personalities/bigFiveTraits.ts: Constant array of required Big Five trait names
  packages/shared/src/services/storage/utils/personalities/validateBigFiveTrait.ts: Helper function for validating individual trait values
  packages/shared/src/services/storage/utils/personalities/__tests__/validateBigFiveTraits.test.ts: Comprehensive test suite with 21 test cases covering all validation scenarios
log: []
schema: v1.0
childrenIds:
  - F-default-personalities-data
  - F-legacy-code-cleanup-and
  - F-persistence-schema-and-type
  - F-personality-validation
created: 2025-08-15T17:58:56.964Z
updated: 2025-08-15T17:58:56.964Z
---

# Data Foundation and Schema Design

## Purpose and Goals

Establish the data foundation for personalities by creating persistence schemas, default data, and cleaning up the existing non-functional code. This epic mirrors the foundation work done for Roles but adapts it for personality-specific data structures including Big Five traits and behavior sliders.

## Major Components and Deliverables

### Schema Definition (`packages/shared`)

- Create `personalitiesSettingsSchema.ts` with Zod validation
- Define `PersistedPersonalityData` and `PersistedPersonalitiesSettingsData` types
- Implement `createDefaultPersonalitiesSettings` function
- Create `defaultPersonalities.json` with 3-5 example personalities

### Code Cleanup

- Remove existing localStorage usage from personality forms
- Clean up draft saving logic that won't be needed
- Remove tab-related types and props that are being eliminated
- Identify and mark deprecated code for removal

### Validation Utilities

- Create personality-specific validation functions
- Implement Big Five traits validation (0-100 range)
- Add behavior traits validation
- Handle custom instructions validation (max 500 chars)

## Detailed Acceptance Criteria

### Functional Deliverables

- [ ] Persistence schema validates all personality data fields correctly
- [ ] Default personalities JSON file contains 3-5 diverse example personalities
- [ ] Schema supports nullable timestamps for manual JSON editing
- [ ] Big Five traits validate as numbers between 0-100
- [ ] Behavior traits validate as record of string to number (0-100)
- [ ] Custom instructions validate with 500 character limit

### Integration Requirements

- [ ] Schema follows exact pattern from `rolesSettingsSchema.ts`
- [ ] Types export properly for use in ui-shared and desktop packages
- [ ] Default data loads and validates without errors
- [ ] Validation errors provide clear, actionable messages

### Quality Standards

- [ ] Full TypeScript type safety with no `any` types
- [ ] 100% test coverage for schema validation
- [ ] All validation edge cases handled
- [ ] Clear JSDoc comments on all public interfaces

## Technical Considerations

### File Structure

```
packages/shared/src/
├── types/settings/
│   ├── personalitiesSettingsSchema.ts
│   ├── PersistedPersonalityData.ts
│   ├── PersistedPersonalitiesSettingsData.ts
│   └── createDefaultPersonalitiesSettings.ts
├── data/
│   └── defaultPersonalities.json
└── services/storage/utils/personalities/
    ├── validatePersonalitiesData.ts
    └── validateSinglePersonality.ts
```

### Schema Structure

```typescript
const persistedPersonalitySchema = z.object({
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
```

## Dependencies

This epic has no dependencies as it establishes the foundation.

## Estimated Scale

- 3-4 features covering schema creation, default data, validation, and cleanup
- Approximately 6-8 development hours
- Can be developed in parallel with planning other epics

## User Stories

- As a developer, I need a validated schema for personality data so that all persistence operations are type-safe
- As a user, I want default personalities available on first launch so I can see examples and start using the feature immediately
- As a developer, I need clean validation utilities so personality data integrity is maintained
