---
id: T-create-typescript-type
title: Create TypeScript type definitions from schemas
status: open
priority: high
parent: F-persistence-schema-and-type
prerequisites:
  - T-create-core-zod-schemas-for
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T18:06:20.745Z
updated: 2025-08-15T18:06:20.745Z
---

# Create TypeScript Type Definitions from Schemas

## Context

Create clean TypeScript type definitions derived from the Zod schemas, following the pattern established in the roles implementation. These types will be used throughout the ui-shared and desktop packages.

## Implementation Requirements

### File: `packages/shared/src/types/settings/PersistedPersonalityData.ts`

Create individual personality type definition:

```typescript
import { z } from "zod";
import { persistedPersonalitySchema } from "./personalitiesSettingsSchema";

/**
 * Type definition for a single persisted personality
 * Derived from Zod schema for type safety
 */
export type PersistedPersonalityData = z.infer<
  typeof persistedPersonalitySchema
>;
```

### File: `packages/shared/src/types/settings/PersistedPersonalitiesSettingsData.ts`

Create complete file structure type:

```typescript
import { z } from "zod";
import { persistedPersonalitiesSettingsSchema } from "./personalitiesSettingsSchema";

/**
 * Type definition for the complete personalities settings file structure
 * Includes schema version, personalities array, and metadata
 */
export type PersistedPersonalitiesSettingsData = z.infer<
  typeof persistedPersonalitiesSettingsSchema
>;
```

## Acceptance Criteria

- [ ] Both type files created at exact paths in `packages/shared/src/types/settings/`
- [ ] Types properly inferred from Zod schemas using `z.infer<typeof schema>`
- [ ] Comprehensive JSDoc documentation on all exported types
- [ ] No `any` types used anywhere
- [ ] Types export correctly for import in other packages
- [ ] TypeScript compilation successful with no errors
- [ ] Follow exact naming patterns from roles implementation
- [ ] Unit tests verify type correctness and schema compatibility

## Dependencies

- Requires T-create-core-zod-schemas-for to be completed first
- Review corresponding files in roles implementation for pattern consistency

## Testing Requirements (include in this task)

- Test that types match schema validation exactly
- Verify type exports work correctly
- Test type compatibility with expected data structures
- Ensure no TypeScript errors when using types
