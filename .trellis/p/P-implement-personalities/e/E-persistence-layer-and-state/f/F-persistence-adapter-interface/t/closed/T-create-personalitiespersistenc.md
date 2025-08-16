---
id: T-create-personalitiespersistenc
title: Create PersonalitiesPersistenceAdapter interface with comprehensive JSDoc
status: done
priority: high
parent: F-persistence-adapter-interface
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/personalities/persistence/PersonalitiesPersistenceAdapter.ts:
    Created new interface with save(), load(), and reset() methods,
    comprehensive JSDoc with personality-specific examples
  packages/ui-shared/src/types/personalities/persistence/index.ts: Added export for PersonalitiesPersistenceAdapter interface
log:
  - Created PersonalitiesPersistenceAdapter interface with comprehensive JSDoc
    documentation following the exact pattern from RolesPersistenceAdapter.
    Interface defines three methods (save, load, reset) with proper Promise
    return types and error handling annotations. Added realistic personality
    examples in JSDoc showing Big Five traits, behaviors, and custom
    instructions. Updated barrel exports to make interface available throughout
    the codebase.
schema: v1.0
childrenIds: []
created: 2025-08-16T21:03:25.359Z
updated: 2025-08-16T21:03:25.359Z
---

# Create PersonalitiesPersistenceAdapter Interface

## Context

Create the adapter interface that defines the contract between the personalities UI store and platform-specific storage implementations. This follows the exact pattern established by `RolesPersistenceAdapter`.

## Implementation Requirements

### File Location

- Create `packages/ui-shared/src/types/personalities/persistence/PersonalitiesPersistenceAdapter.ts`
- Follow exact naming convention from roles pattern

### Interface Definition

```typescript
export interface PersonalitiesPersistenceAdapter {
  save(personalities: PersistedPersonalitiesSettingsData): Promise<void>;
  load(): Promise<PersistedPersonalitiesSettingsData | null>;
  reset(): Promise<void>;
}
```

### Required Imports

- Import `PersistedPersonalitiesSettingsData` from `@fishbowl-ai/shared`
- Import `PersonalitiesPersistenceError` (created in parallel task)

### JSDoc Documentation

- Copy and adapt the comprehensive JSDoc from `RolesPersistenceAdapter`
- Include detailed method descriptions with parameters and return types
- Add @throws documentation for `PersonalitiesPersistenceError`
- Include practical code examples for each method
- Examples should show saving, loading, and resetting personalities
- Examples should demonstrate error handling with try/catch blocks

## Technical Approach

1. **Reference Pattern**: Use `packages/ui-shared/src/types/roles/persistence/RolesPersistenceAdapter.ts` as exact template
2. **Method Signatures**: Follow identical pattern but with personalities types
3. **Error Handling**: All methods throw `PersonalitiesPersistenceError` on failure
4. **Return Types**: load() returns `PersistedPersonalitiesSettingsData | null`, others return `Promise<void>`

## Acceptance Criteria

- [ ] Interface contains exactly 3 methods: save, load, reset
- [ ] All methods return Promises for async operations
- [ ] save() accepts `PersistedPersonalitiesSettingsData` parameter
- [ ] load() returns `PersistedPersonalitiesSettingsData | null`
- [ ] reset() returns `Promise<void>`
- [ ] Comprehensive JSDoc with examples adapted from roles pattern
- [ ] @throws annotations reference PersonalitiesPersistenceError
- [ ] File follows TypeScript coding standards
- [ ] Examples show realistic personality data structures

## Dependencies

- Requires `PersistedPersonalitiesSettingsData` type from shared package
- Will be used by PersonalitiesPersistenceError (parallel task)

## Testing Requirements

- Include unit tests that verify interface can be implemented
- Test TypeScript compilation and type checking
- No integration or performance tests
