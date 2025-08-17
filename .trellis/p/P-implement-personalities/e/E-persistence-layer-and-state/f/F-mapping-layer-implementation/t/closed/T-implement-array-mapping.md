---
id: T-implement-array-mapping
title: Implement array mapping functions and comprehensive unit tests
status: done
priority: medium
parent: F-mapping-layer-implementation
prerequisites:
  - T-setup-directory-structure-and-1
affectedFiles:
  packages/ui-shared/src/mapping/personalities/mapPersonalitiesPersistenceToUI.ts:
    Created array mapping function to transform persisted personalities data to
    UI view model format, handling null/undefined input gracefully
  packages/ui-shared/src/mapping/personalities/mapPersonalitiesUIToPersistence.ts:
    Created array mapping function to transform UI personality view models to
    persistence format with schema validation
  packages/ui-shared/src/mapping/personalities/index.ts: Updated barrel exports to include new array mapping functions
  packages/ui-shared/src/mapping/personalities/__tests__/mapPersonalitiesPersistenceToUI.test.ts:
    Created comprehensive test suite covering transformation scenarios, edge
    cases, large datasets, unicode handling, and data integrity verification
  packages/ui-shared/src/mapping/personalities/__tests__/mapPersonalitiesUIToPersistence.test.ts:
    Created comprehensive test suite covering validation, field processing,
    performance, error handling, and round-trip data integrity
log:
  - Successfully implemented array mapping functions for personalities data
    transformation between persistence and UI formats, following the established
    roles mapping pattern. Created comprehensive test suites covering all
    functionality including edge cases, validation, and data integrity. All
    quality checks passed.
schema: v1.0
childrenIds: []
created: 2025-08-16T21:27:22.662Z
updated: 2025-08-16T21:27:22.662Z
---

# Implement Array Mapping Functions and Comprehensive Unit Tests

## Context

Create the main array mapping functions that convert collections of personalities between persistence and UI formats, using the single mapping functions created in the previous task. Follow the exact pattern from `packages/ui-shared/src/mapping/roles/`.

## Technical Approach

Follow the established pattern from roles mapping:

- Look at `packages/ui-shared/src/mapping/roles/mapRolesPersistenceToUI.ts` and `mapRolesUIToPersistence.ts` as templates
- Use the single mapping functions created in the previous task
- Handle null/undefined input gracefully

## Specific Implementation Requirements

### 1. Array Persistence-to-UI Mapping

Create `mapPersonalitiesPersistenceToUI.ts`:

- Import `PersistedPersonalitiesSettingsData` from `@fishbowl-ai/shared`
- Import `PersonalityViewModel` from `@fishbowl-ai/ui-shared`
- Import `mapSinglePersonalityPersistenceToUI` from local file
- Handle null/undefined input by returning empty array
- Map each personality using the single mapper
- Return properly typed array of `PersonalityViewModel[]`

### 2. Array UI-to-Persistence Mapping

Create `mapPersonalitiesUIToPersistence.ts`:

- Import `PersonalityViewModel` from `@fishbowl-ai/ui-shared`
- Import `PersistedPersonalitiesSettingsData` from `@fishbowl-ai/shared`
- Import `mapSinglePersonalityUIToPersistence` from local file
- Map array of UI personalities to persistence format
- Return complete `PersistedPersonalitiesSettingsData` structure

### 3. Update Barrel Exports

Update `index.ts` to export the new array mapping functions

### 4. Comprehensive Unit Tests

Create complete test suites for all mapping functions:

- Test files in `__tests__/` directory
- Cover happy path scenarios
- Test edge cases (null, undefined, empty arrays)
- Test complete round-trip data integrity
- Test Big Five traits and behaviors preservation
- Test timestamp conversion accuracy
- Test ID generation for missing IDs

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] `mapPersonalitiesPersistenceToUI` converts persisted settings to UI format
- [ ] `mapPersonalitiesUIToPersistence` converts UI array to persistence format
- [ ] Null/undefined input handled gracefully (returns empty array or default structure)
- [ ] Empty arrays handled correctly
- [ ] All personalities in array processed correctly
- [ ] Complete round-trip maintains data integrity

### Integration Requirements

- [ ] Array functions use single mapping functions correctly
- [ ] Type compatibility with persistence adapter interface
- [ ] Proper integration with existing codebase patterns
- [ ] Barrel exports work for all functions

### Testing Requirements

- [ ] Unit tests for `mapPersonalitiesPersistenceToUI`
- [ ] Unit tests for `mapPersonalitiesUIToPersistence`
- [ ] Unit tests verify single mapper integration
- [ ] Edge case tests (null, undefined, empty arrays)
- [ ] Round-trip tests verify no data loss
- [ ] Big Five and behaviors structure preservation tests
- [ ] Timestamp handling tests
- [ ] ID generation tests

### Quality Standards

- [ ] Full TypeScript coverage with proper types
- [ ] Clean, readable code following established patterns
- [ ] Comprehensive error handling
- [ ] No side effects in mapping functions
- [ ] Performance efficient for up to 100 personalities

## Dependencies

- T-setup-directory-structure-and-1 (single mapping functions)
- Types from `@fishbowl-ai/shared` and `@fishbowl-ai/ui-shared`

## Files to Create/Modify

- `packages/ui-shared/src/mapping/personalities/mapPersonalitiesPersistenceToUI.ts`
- `packages/ui-shared/src/mapping/personalities/mapPersonalitiesUIToPersistence.ts`
- `packages/ui-shared/src/mapping/personalities/index.ts` (update exports)
- `packages/ui-shared/src/mapping/personalities/__tests__/mapPersonalitiesPersistenceToUI.test.ts`
- `packages/ui-shared/src/mapping/personalities/__tests__/mapPersonalitiesUIToPersistence.test.ts`
- Additional test files for comprehensive coverage

## Implementation Notes

- Keep functions simple - they should just delegate to single mappers
- Handle edge cases gracefully without throwing errors
- Ensure complete type safety throughout
- Follow exact naming conventions from roles implementation
- Test extensively but avoid integration/performance tests as specified
- Focus on data transformation accuracy and type safety
