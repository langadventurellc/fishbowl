---
id: F-mapping-layer-implementation
title: Mapping Layer Implementation
status: in-progress
priority: medium
parent: E-persistence-layer-and-state
prerequisites:
  - F-persistence-adapter-interface
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
log: []
schema: v1.0
childrenIds:
  - T-implement-array-mapping
  - T-setup-directory-structure-and-1
created: 2025-08-16T20:58:40.449Z
updated: 2025-08-16T20:58:40.449Z
---

# Mapping Layer Implementation

## Purpose

Implement bidirectional mapping functions to convert between persisted personality data format and UI view model format. This ensures data integrity when saving to and loading from file storage while handling edge cases like null timestamps.

## Key Components

- `mapPersonalitiesPersistenceToUI` function - converts from file format to UI format
- `mapPersonalitiesUIToPersistence` function - converts from UI format to file format
- Timestamp conversion utilities
- Big Five traits and behaviors mapping

## Acceptance Criteria

- [ ] Maps all personality fields correctly without data loss
- [ ] Handles null timestamps gracefully (for manual JSON edits)
- [ ] Preserves Big Five object structure during mapping
- [ ] Maintains behaviors record exactly as stored
- [ ] Converts ISO strings to Date objects and vice versa
- [ ] Generates IDs using nanoid for new personalities without IDs
- [ ] Both mapping functions are pure with no side effects

## Technical Requirements

- Create in `packages/ui-shared/src/mapping/personalities/`
- Import types from both shared and ui-shared packages
- Use nanoid for ID generation when needed
- Handle undefined/null values gracefully
- Return properly typed arrays of mapped data

## Implementation Guidance

**IMPORTANT**: Keep the mapping simple and straightforward.

- Look at `packages/ui-shared/src/mapping/roles/` for the pattern
- Map field by field - don't try to be clever with spreads if it complicates types
- For timestamps: ISO string ↔ Date object conversion
- For Big Five: preserve the nested object structure
- For behaviors: keep as a Record<string, number>
- Handle edge cases: null timestamps, missing fields
- Do not add validation - that's handled elsewhere

## Testing Requirements

- Unit tests for both mapping functions
- Test null timestamp handling
- Test complete data round-trip
- No integration or performance tests
- Edge case coverage (missing fields, null values)

## Dependencies

- F-persistence-adapter-interface (for type imports)
