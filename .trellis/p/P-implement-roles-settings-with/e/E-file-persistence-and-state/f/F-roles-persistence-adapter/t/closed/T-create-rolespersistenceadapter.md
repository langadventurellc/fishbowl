---
id: T-create-rolespersistenceadapter
title: Create RolesPersistenceAdapter interface with comprehensive documentation
status: done
priority: high
parent: F-roles-persistence-adapter
prerequisites:
  - T-create-rolespersistenceerror
affectedFiles:
  packages/ui-shared/src/types/roles/persistence/RolesPersistenceAdapter.ts:
    Created comprehensive RolesPersistenceAdapter interface with save/load/reset
    methods, detailed JSDoc documentation with runnable examples, and proper
    TypeScript typing using PersistedRolesSettingsData from shared package
  packages/ui-shared/src/types/roles/persistence/index.ts: Added type export for
    RolesPersistenceAdapter to barrel exports alongside existing
    RolesPersistenceError export
log:
  - Successfully implemented RolesPersistenceAdapter interface with
    comprehensive documentation following established patterns from
    SettingsPersistenceAdapter. The interface defines platform-agnostic
    persistence operations (save, load, reset) for roles data with detailed
    JSDoc examples, proper TypeScript types, and error handling specifications
    using RolesPersistenceError. All quality checks pass and the interface is
    properly exported for use by platform-specific implementations.
schema: v1.0
childrenIds: []
created: 2025-08-10T21:39:12.113Z
updated: 2025-08-10T21:39:12.113Z
---

# Create RolesPersistenceAdapter Interface with Comprehensive Documentation

## Context and Purpose

Implement the core RolesPersistenceAdapter interface that defines the contract for all platform-specific roles persistence implementations. This interface abstracts file operations away from the UI layer, enabling testable and platform-agnostic roles management.

## Implementation Location

**File**: `packages/ui-shared/src/types/roles/persistence/RolesPersistenceAdapter.ts`

## Reference Implementation

Follow the exact pattern from `packages/ui-shared/src/types/settings/persistence/SettingsPersistenceAdapter.ts`

## Detailed Implementation Requirements

### Interface Structure

```typescript
import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import { RolesPersistenceError } from "./RolesPersistenceError";

export interface RolesPersistenceAdapter {
  save(roles: PersistedRolesSettingsData): Promise<void>;
  load(): Promise<PersistedRolesSettingsData | null>;
  reset(): Promise<void>;
}
```

### Method Documentation Requirements

Each method must include:

- [ ] **Comprehensive JSDoc**: Purpose, parameters, return values, exceptions
- [ ] **Usage Examples**: Complete TypeScript code examples
- [ ] **Error Handling Examples**: RolesPersistenceError usage patterns
- [ ] **Null Handling**: Clear documentation of when null is returned vs errors

### Save Method Documentation

````typescript
/**
 * Persists the provided roles data to the platform's storage mechanism.
 *
 * @param roles - The roles data to persist
 * @throws {RolesPersistenceError} If the save operation fails
 *
 * @example
 * ```typescript
 * try {
 *   await adapter.save({
 *     version: "1.0.0",
 *     lastUpdated: new Date().toISOString(),
 *     roles: [
 *       {
 *         id: "role-1",
 *         name: "Assistant",
 *         description: "Helpful assistant",
 *         systemPrompt: "You are a helpful assistant",
 *         createdAt: "2025-01-01T00:00:00.000Z",
 *         updatedAt: "2025-01-01T00:00:00.000Z"
 *       }
 *     ]
 *   });
 * } catch (error) {
 *   if (error instanceof RolesPersistenceError) {
 *     console.error(`Save failed: ${error.message}`);
 *   }
 * }
 * ```
 */
````

### Load Method Documentation

````typescript
/**
 * Loads the persisted roles data from the platform's storage mechanism.
 *
 * @returns The loaded roles data, or null if no roles are found
 * @throws {RolesPersistenceError} If the load operation fails
 *
 * @example
 * ```typescript
 * try {
 *   const roles = await adapter.load();
 *   if (roles) {
 *     console.log(`Loaded ${roles.roles.length} roles`);
 *   } else {
 *     console.log("No roles found, using defaults");
 *   }
 * } catch (error) {
 *   if (error instanceof RolesPersistenceError) {
 *     console.error(`Load failed: ${error.message}`);
 *   }
 * }
 * ```
 */
````

### Reset Method Documentation

````typescript
/**
 * Resets the persisted roles by removing them from storage.
 * After calling this method, subsequent calls to `load()` will return null
 * until new roles are saved.
 *
 * @throws {RolesPersistenceError} If the reset operation fails
 *
 * @example
 * ```typescript
 * try {
 *   await adapter.reset();
 *   console.log("Roles reset successfully");
 * } catch (error) {
 *   if (error instanceof RolesPersistenceError) {
 *     console.error(`Reset failed: ${error.message}`);
 *   }
 * }
 * ```
 */
````

## Type Integration Requirements

### Import Management

- [ ] Import `PersistedRolesSettingsData` from `@fishbowl-ai/shared`
- [ ] Import `RolesPersistenceError` from local module
- [ ] Use proper TypeScript import types where applicable

### Return Type Specifications

- [ ] All methods return Promise-wrapped types for async operations
- [ ] Load method specifically returns `Promise<PersistedRolesSettingsData | null>`
- [ ] Null return indicates no existing data (not an error condition)
- [ ] Error conditions throw RolesPersistenceError

## Acceptance Criteria

### Interface Definition

- [ ] Interface exports correctly from module
- [ ] All three methods (save, load, reset) are properly defined
- [ ] Method signatures match specification exactly
- [ ] TypeScript generic types used appropriately

### Documentation Quality

- [ ] All methods have comprehensive JSDoc documentation
- [ ] Usage examples are complete and runnable
- [ ] Error handling patterns are clearly demonstrated
- [ ] Cross-references to related types and errors

### Type Safety

- [ ] All parameters and return types are properly typed
- [ ] Import statements use appropriate type-only imports
- [ ] Interface is compatible with existing adapter patterns

## Technical Notes

- **Platform Agnostic**: Interface must not reference any platform-specific APIs
- **Async by Design**: All operations return Promises for non-blocking UI
- **Error Consistency**: Use RolesPersistenceError for all persistence failures
- **Null Semantics**: null return from load() indicates absence, not failure

## Dependencies

- Requires T-create-rolespersistenceerror (error class must exist)
- Uses PersistedRolesSettingsData from shared package (from E-data-foundation-and-schema)

## Definition of Done

- [ ] RolesPersistenceAdapter interface fully implemented
- [ ] All three methods documented with comprehensive JSDoc
- [ ] Usage examples are accurate and complete
- [ ] TypeScript types are correct and well-integrated
- [ ] Interface follows established project patterns exactly
- [ ] Code passes all TypeScript compilation checks
