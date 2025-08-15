---
id: T-create-default-personalities
title: Create default personalities settings factory function
status: open
priority: medium
parent: F-persistence-schema-and-type
prerequisites:
  - T-create-typescript-type
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T18:06:33.813Z
updated: 2025-08-15T18:06:33.813Z
---

# Create Default Personalities Settings Factory Function

## Context

Create the factory function that generates initial personalities settings structure, following the pattern from `createDefaultRolesSettings.ts`. This function will be used to initialize the personalities file on first launch.

## Implementation Requirements

### File: `packages/shared/src/types/settings/createDefaultPersonalitiesSettings.ts`

Create factory function with:

```typescript
import { PersistedPersonalitiesSettingsData } from "./PersistedPersonalitiesSettingsData";

/**
 * Creates the default personalities settings structure
 * Used for initial file creation and reset operations
 * @returns Default personalities settings with empty personalities array
 */
export function createDefaultPersonalitiesSettings(): PersistedPersonalitiesSettingsData {
  return {
    schemaVersion: "1.0.0",
    personalities: [],
    lastUpdated: new Date().toISOString(),
  };
}
```

### Key Requirements

- Return type must match `PersistedPersonalitiesSettingsData`
- Schema version should be '1.0.0' for initial implementation
- Empty personalities array for clean start
- Current timestamp for lastUpdated field
- Function must be pure (no side effects)

## Acceptance Criteria

- [ ] File created at: `packages/shared/src/types/settings/createDefaultPersonalitiesSettings.ts`
- [ ] Function returns valid `PersistedPersonalitiesSettingsData` structure
- [ ] Schema version set to '1.0.0'
- [ ] Empty personalities array by default
- [ ] Current ISO timestamp for lastUpdated
- [ ] Comprehensive JSDoc documentation
- [ ] Function is pure with no side effects
- [ ] Unit tests verify correct structure and validation
- [ ] Follows exact pattern from roles implementation

## Dependencies

- Requires T-create-typescript-type to be completed first
- Review `createDefaultRolesSettings.ts` for pattern consistency

## Testing Requirements (include in this task)

- Test function returns valid structure that passes schema validation
- Test default values are correct
- Test function purity (multiple calls return equivalent structures)
- Test schema version is correctly set
