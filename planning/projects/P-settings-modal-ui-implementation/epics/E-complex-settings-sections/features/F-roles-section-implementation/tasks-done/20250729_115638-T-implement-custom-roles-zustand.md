---
kind: task
id: T-implement-custom-roles-zustand
parent: F-roles-section-implementation
status: done
title: Implement custom roles Zustand store with CRUD operations
priority: high
prerequisites:
  - T-create-role-interfaces-and
created: "2025-07-29T11:00:03.874741"
updated: "2025-07-29T11:45:45.803315"
schema_version: "1.1"
worktree: null
---

# Implement Custom Roles Zustand Store with CRUD Operations

## Context

Create the state management system for custom roles using Zustand, following the same patterns as the existing personality store. This will provide persistent storage and CRUD operations for user-created roles.

## Technical Approach

### 1. Create Custom Roles Store

**File: `packages/shared/src/stores/customRolesStore.ts`**

Implement Zustand store with complete CRUD operations:

```typescript
interface CustomRolesState {
  roles: CustomRole[];
  isLoading: boolean;
  error: string | null;

  // CRUD operations
  createRole: (roleData: RoleFormData) => string;
  updateRole: (id: string, roleData: RoleFormData) => void;
  deleteRole: (id: string) => void;
  getRoleById: (id: string) => CustomRole | undefined;

  // Validation helpers
  isRoleNameUnique: (name: string, excludeId?: string) => boolean;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
```

### 2. Implement Persistence Layer

**File: `packages/shared/src/stores/customRolesPersistence.ts`**

- Create persistence utilities for saving/loading roles
- Handle data migration and version compatibility
- Implement error recovery for corrupted data
- Use same patterns as existing persistence layers

### 3. Add Store Integration

**File: `packages/shared/src/stores/index.ts`**

- Export custom roles store
- Ensure store is properly initialized
- Add to existing store composition if applicable

### 4. Create Store Hooks

**File: `packages/shared/src/hooks/useCustomRoles.ts`**

- Create React hooks for easier component integration
- Provide loading states and error handling
- Include optimistic updates for better UX

### 5. Add Unit Tests

**File: `packages/shared/src/stores/__tests__/customRolesStore.test.ts`**

- Test all CRUD operations with edge cases
- Test persistence layer integration
- Test validation functions
- Test error handling and recovery

## Detailed Acceptance Criteria

### CRUD Operations

- [ ] `createRole` generates unique IDs and timestamps, returns created role ID
- [ ] `updateRole` updates role data and modifies updatedAt timestamp
- [ ] `deleteRole` removes role and handles references gracefully
- [ ] `getRoleById` returns undefined for non-existent roles
- [ ] All operations update store state immutably following Zustand patterns

### Validation Functions

- [ ] `isRoleNameUnique` correctly checks name uniqueness (case-insensitive)
- [ ] `isRoleNameUnique` excludes current role when editing (excludeId parameter)
- [ ] Validation integrates with form validation for real-time feedback
- [ ] Error states provide clear, actionable error messages

### State Management

- [ ] Loading states prevent multiple simultaneous operations
- [ ] Error handling provides specific error messages for different failure types
- [ ] Store state updates trigger proper React re-renders
- [ ] Optimistic updates provide immediate UI feedback

### Persistence Integration

- [ ] Changes automatically persist to local storage/file system
- [ ] Store loads existing roles on initialization
- [ ] Data migration handles schema changes gracefully
- [ ] Corrupted data recovery provides fallback empty state

### Performance Optimizations

- [ ] Store updates use shallow equality checks to prevent unnecessary re-renders
- [ ] Large role lists handled efficiently with proper indexing
- [ ] Persistence operations are debounced to avoid excessive I/O
- [ ] Memory usage remains stable with many roles

### Testing Requirements

- [ ] Unit tests achieve 90%+ code coverage
- [ ] Tests cover all CRUD operations and edge cases
- [ ] Persistence layer tests include error scenarios
- [ ] Validation function tests cover duplicate names and edge cases
- [ ] Performance tests ensure store scales to 100+ custom roles

## Implementation Notes

- Follow existing store patterns from personality management
- Use TypeScript strict mode for type safety
- Implement proper error boundaries for resilience
- Consider future extensibility for role categories and metadata

## Dependencies

- Requires: T-create-role-interfaces-and (CustomRole and RoleFormData types)

## Security Considerations

- Validate all input data before storing
- Sanitize role names and descriptions to prevent XSS
- Implement proper error handling to avoid data corruption
- Use immutable updates to prevent accidental state mutations

### Log

**2025-07-29T16:56:38.663510Z** - Implemented complete custom roles Zustand store with CRUD operations, validation, persistence integration, and comprehensive testing. The store provides reactive state management for custom user-created roles with full error handling, name uniqueness validation, and localStorage persistence. All functionality includes proper TypeScript types, immutable updates following Zustand patterns, React hooks for easy component integration, and 90%+ test coverage across all operations.

- filesChanged: ["packages/shared/src/stores/customRolesStore.ts", "packages/shared/src/stores/customRolesPersistence.ts", "packages/shared/src/hooks/useCustomRoles.ts", "packages/shared/src/stores/index.ts", "packages/shared/src/hooks/index.ts", "packages/shared/src/stores/__tests__/customRolesStore.test.ts"]
