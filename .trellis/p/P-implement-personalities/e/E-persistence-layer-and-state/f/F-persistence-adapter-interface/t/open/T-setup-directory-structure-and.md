---
id: T-setup-directory-structure-and
title: Setup directory structure and barrel exports for personalities persistence
status: open
priority: medium
parent: F-persistence-adapter-interface
prerequisites:
  - T-create-personalitiespersistenc
  - T-create-personalitiespersistenc-1
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-16T21:04:12.980Z
updated: 2025-08-16T21:04:12.980Z
---

# Setup Directory Structure and Barrel Exports

## Context

Create the proper directory structure and export files to make the personalities persistence types accessible throughout the ui-shared package. This follows the established pattern from the roles persistence structure.

## Implementation Requirements

### Directory Structure

Create the following directory structure:

```
packages/ui-shared/src/types/personalities/
├── persistence/
│   ├── __tests__/
│   ├── PersonalitiesPersistenceAdapter.ts
│   ├── PersonalitiesPersistenceError.ts
│   └── index.ts
└── index.ts
```

### Persistence Index File

Create `packages/ui-shared/src/types/personalities/persistence/index.ts`:

```typescript
export type { PersonalitiesPersistenceAdapter } from "./PersonalitiesPersistenceAdapter";
export { PersonalitiesPersistenceError } from "./PersonalitiesPersistenceError";
```

### Personalities Index File

Create `packages/ui-shared/src/types/personalities/index.ts`:

```typescript
export * from "./persistence";
```

### Update Main Types Index

Add to `packages/ui-shared/src/types/index.ts`:

```typescript
export * from "./personalities";
```

## Technical Approach

1. **Follow Roles Pattern**: Mirror the exact structure from `packages/ui-shared/src/types/roles/`
2. **Type vs Class Exports**: Export interface as `type`, export class directly
3. **Barrel Exports**: Use re-exports to create clean import paths
4. **Directory Structure**: Create `__tests__` directory for future test files

## Implementation Steps

1. Create `packages/ui-shared/src/types/personalities/` directory
2. Create `packages/ui-shared/src/types/personalities/persistence/` directory
3. Create `packages/ui-shared/src/types/personalities/persistence/__tests__/` directory
4. Create persistence index.ts with proper exports
5. Create personalities index.ts with re-exports
6. Update main types index.ts to include personalities

## Acceptance Criteria

- [ ] Directory structure matches roles pattern exactly
- [ ] All index.ts files use proper export syntax
- [ ] Interface exported as type, class exported directly
- [ ] Barrel exports enable clean imports like `import { PersonalitiesPersistenceAdapter } from "@fishbowl-ai/ui-shared"`
- [ ] TypeScript compilation passes without errors
- [ ] No circular import issues
- [ ] **tests** directory is created for future test files

## Import Verification

After implementation, verify these imports work:

```typescript
// From other packages
import {
  PersonalitiesPersistenceAdapter,
  PersonalitiesPersistenceError,
} from "@fishbowl-ai/ui-shared";

// From within ui-shared
import { PersonalitiesPersistenceAdapter } from "../../types/personalities";
```

## Dependencies

- Requires completed PersonalitiesPersistenceAdapter interface
- Requires completed PersonalitiesPersistenceError class

## Testing Requirements

- Verify TypeScript compilation succeeds
- Test import statements work from different package locations
- No integration or performance tests required
