---
id: T-setup-directory-structure-and-1
title: Setup directory structure and implement single personality mapping functions
status: done
priority: high
parent: F-mapping-layer-implementation
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/settings/PersonalityViewModel.ts:
    Created new PersonalityViewModel interface extending PersonalityFormData
    with id and timestamp fields, following RoleViewModel pattern
  packages/ui-shared/src/types/settings/index.ts: Added export for PersonalityViewModel type
  packages/ui-shared/src/mapping/personalities/mapSinglePersonalityPersistenceToUI.ts:
    Implemented function to convert persisted personality data to UI format with
    null timestamp handling, ID generation, and Big Five/behaviors preservation
  packages/ui-shared/src/mapping/personalities/mapSinglePersonalityUIToPersistence.ts:
    Implemented function to convert UI personality data to persistence format
    with timestamp generation and field preservation
  packages/ui-shared/src/mapping/personalities/index.ts: Created barrel exports for both mapping functions
  packages/ui-shared/src/mapping/personalities/__tests__/mapSinglePersonalityPersistenceToUI.test.ts:
    Created comprehensive unit tests covering complete transformations,
    timestamp handling, ID generation, Big Five traits, behaviors, field
    defaults, and edge cases
  packages/ui-shared/src/mapping/personalities/__tests__/mapSinglePersonalityUIToPersistence.test.ts:
    Created comprehensive unit tests covering complete transformations,
    timestamp handling, ID generation, field preservation, and return type
    validation
log:
  - Successfully implemented single personality mapping functions following the
    established roles mapping pattern. Created complete directory structure,
    implemented bidirectional mapping between persisted personality data and UI
    view models, added PersonalityViewModel type, and created comprehensive unit
    tests. All mapping functions handle null timestamps gracefully, generate IDs
    when missing using nanoid, preserve Big Five traits and behaviors structures
    exactly, and include proper TypeScript types. All quality checks passing
    with 27 unit tests covering edge cases, field validation, and round-trip
    data integrity.
schema: v1.0
childrenIds: []
created: 2025-08-16T21:26:58.405Z
updated: 2025-08-16T21:26:58.405Z
---

# Setup Directory Structure and Implement Single Personality Mapping Functions

## Context

Implement the core single personality mapping functions following the established pattern from `packages/ui-shared/src/mapping/roles/`. This task creates the foundation for bidirectional mapping between persisted personality data and UI view models.

## Technical Approach

Follow the exact pattern established in the roles mapping:

- Look at `packages/ui-shared/src/mapping/roles/mapSingleRolePersistenceToUI.ts` and `mapSingleRoleUIToPersistence.ts` as templates
- Use existing `handleNullTimestamps` utility from `packages/ui-shared/src/mapping/utils/transformers/handleNullTimestamps.ts`
- Create similar structure for personalities

## Specific Implementation Requirements

### 1. Directory Setup

Create directory structure:

```
packages/ui-shared/src/mapping/personalities/
├── index.ts (barrel exports)
├── mapSinglePersonalityPersistenceToUI.ts
├── mapSinglePersonalityUIToPersistence.ts
└── __tests__/ (to be created in next task)
```

### 2. Single Personality Persistence-to-UI Mapping

Create `mapSinglePersonalityPersistenceToUI.ts`:

- Import types: `PersistedPersonalityData` from `@fishbowl-ai/shared`
- Import types: `PersonalityViewModel` from `@fishbowl-ai/ui-shared`
- Import `handleNullTimestamps` utility
- Handle ID generation using nanoid if ID is missing
- Convert ISO timestamp strings to Date objects
- Preserve Big Five traits object structure exactly
- Preserve behaviors Record<string, number> exactly
- Handle null/undefined values gracefully

### 3. Single Personality UI-to-Persistence Mapping

Create `mapSinglePersonalityUIToPersistence.ts`:

- Convert Date objects to ISO timestamp strings
- Set updatedAt to current timestamp
- Set createdAt to current timestamp if null
- Preserve Big Five and behaviors structures
- Generate ID using nanoid if missing

### 4. Barrel Exports

Create `index.ts` with exports for both mapping functions

## Detailed Acceptance Criteria

### Functional Requirements

- [ ] `mapSinglePersonalityPersistenceToUI` converts persisted data to UI format
- [ ] `mapSinglePersonalityUIToPersistence` converts UI data to persistence format
- [ ] Timestamp conversion works bidirectionally (ISO string ↔ Date object)
- [ ] Big Five traits object structure preserved during mapping
- [ ] Behaviors record maintained exactly as stored
- [ ] Null timestamps handled gracefully (converts to current Date)
- [ ] Missing IDs generate new nanoid IDs
- [ ] Functions are pure with no side effects

### Technical Requirements

- [ ] TypeScript types are properly imported and used
- [ ] Functions follow exact pattern from roles mapping
- [ ] Proper error handling for edge cases
- [ ] Clean, readable code with proper imports
- [ ] Barrel exports work correctly

### Testing Requirements

- [ ] Unit tests for `mapSinglePersonalityPersistenceToUI`
- [ ] Unit tests for `mapSinglePersonalityUIToPersistence`
- [ ] Test null timestamp handling
- [ ] Test missing ID generation
- [ ] Test Big Five and behaviors preservation
- [ ] Test round-trip data integrity

## Dependencies

- F-persistence-adapter-interface (completed - provides type imports)
- Existing `handleNullTimestamps` utility
- nanoid library for ID generation

## Files to Create/Modify

- `packages/ui-shared/src/mapping/personalities/index.ts`
- `packages/ui-shared/src/mapping/personalities/mapSinglePersonalityPersistenceToUI.ts`
- `packages/ui-shared/src/mapping/personalities/mapSinglePersonalityUIToPersistence.ts`
- `packages/ui-shared/src/mapping/personalities/__tests__/mapSinglePersonalityPersistenceToUI.test.ts`
- `packages/ui-shared/src/mapping/personalities/__tests__/mapSinglePersonalityUIToPersistence.test.ts`

## Implementation Notes

- Keep mapping simple and straightforward - map field by field
- Don't try to be clever with spreads if it complicates types
- Handle edge cases: null timestamps, missing fields, undefined values
- Do not add validation - that's handled elsewhere
- Follow the established roles pattern exactly for consistency
