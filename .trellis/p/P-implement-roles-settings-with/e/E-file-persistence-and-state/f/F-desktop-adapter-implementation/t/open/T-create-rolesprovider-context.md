---
id: T-create-rolesprovider-context
title: Create RolesProvider context and hook
status: open
priority: medium
parent: F-desktop-adapter-implementation
prerequisites:
  - T-implement-desktoprolesadapter
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-11T03:15:35.830Z
updated: 2025-08-11T03:15:35.830Z
---

# Create RolesProvider Context and Hook

## Context

Implement React context provider and hook for roles adapter access, following the exact pattern of SettingsProvider.

## Implementation Requirements

Create `apps/desktop/src/contexts/RolesProvider.tsx`:

### Context Implementation

```typescript
export const RolesPersistenceAdapterContext =
  createContext<RolesPersistenceAdapter | null>(null);

export const useRolesAdapter = (): RolesPersistenceAdapter => {
  const adapter = useContext(RolesPersistenceAdapterContext);
  if (!adapter) {
    throw new Error(
      "useRolesAdapter must be used within a RolesProvider"
    );
  }
  return adapter;
};

export interface RolesProviderProps {
  children: React.ReactNode;
}

export const RolesProvider: React.FC<RolesProviderProps> = ({
  children
}) => {
  return (
    <RolesPersistenceAdapterContext.Provider value={desktopRolesAdapter}>
      {children}
    </RolesPersistenceAdapterContext.Provider>
  );
};
```

### Export Updates

Update `apps/desktop/src/contexts/index.ts`:

- Export RolesProvider component
- Export useRolesAdapter hook
- Export RolesPersistenceAdapterContext

### TypeScript Integration

- Import types from @fishbowl-ai/ui-shared
- Proper typing for all context values and props
- Follow same import/export patterns as SettingsProvider

## Acceptance Criteria

- [ ] Context provides RolesPersistenceAdapter interface
- [ ] useRolesAdapter hook throws error when used outside provider
- [ ] RolesProvider wraps children with context value
- [ ] Uses singleton desktopRolesAdapter instance
- [ ] Follows exact same pattern as SettingsProvider
- [ ] Properly typed with TypeScript throughout
- [ ] All exports available from contexts/index.ts
- [ ] Unit tests for provider and hook functionality
- [ ] Tests verify error throwing when hook used outside provider
- [ ] Tests verify context value accessibility within provider

## Dependencies

- T-implement-desktoprolesadapter (needs adapter instance)

## Testing Requirements

- Test RolesProvider provides adapter to children
- Test useRolesAdapter returns adapter when used within provider
- Test useRolesAdapter throws error when used outside provider
- Test error message matches expected format
- Use React Testing Library for component testing
- Verify context value type and accessibility
- Test provider with multiple children components
