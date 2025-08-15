---
id: E-data-foundation-and-schema-1
title: Data Foundation and Schema Design
status: open
priority: medium
parent: P-implement-personalities
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
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
