---
id: T-create-personalitiesprovider
title: Create PersonalitiesProvider React component with context and lifecycle
  management
status: open
priority: high
parent: F-react-personalities-context
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T03:37:28.088Z
updated: 2025-08-17T03:37:28.088Z
---

# Create PersonalitiesProvider React Component

## Purpose

Create the `PersonalitiesProvider` React component following the established RolesProvider pattern, including context creation, store initialization, loading states, and error handling with retry functionality.

## Technical Implementation Requirements

### File Location

- Create `apps/desktop/src/contexts/PersonalitiesProvider.tsx`
- Follow the exact same structure as `apps/desktop/src/contexts/RolesProvider.tsx`

### Component Structure

Implement the following components and interfaces:

```typescript
interface PersonalitiesProviderProps {
  children: React.ReactNode;
}

interface PersonalitiesProviderState {
  isInitializing: boolean;
  initError: Error | null;
}

export const PersonalitiesPersistenceAdapterContext =
  createContext<PersonalitiesPersistenceAdapter | null>(null);

export const usePersonalitiesAdapter = (): PersonalitiesPersistenceAdapter => {
  // Hook implementation with proper error handling
};

export const PersonalitiesProvider: React.FC<PersonalitiesProviderProps> = ({
  children,
}) => {
  // Component implementation
};
```

### Store Initialization Logic

- Import `usePersonalitiesStore` from `@fishbowl-ai/ui-shared`
- Import `desktopPersonalitiesAdapter` from `../adapters/desktopPersonalitiesAdapter`
- Check if store is already initialized before attempting initialization
- Use mounted flag to prevent state updates after unmount
- Implement single initialization attempt prevention
- Call `store.initialize(desktopPersonalitiesAdapter)` with proper error handling

### Loading State Implementation

- Display loading spinner with "Loading personalities..." message
- Use the same styling pattern as RolesProvider:
  ```jsx
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Loading personalities...</p>
    </div>
  </div>
  ```

### Error Handling and Retry

- Display user-friendly error messages without exposing system paths
- Implement reload button that calls `window.location.reload()`
- Use the same error UI pattern as RolesProvider
- Log detailed errors with structured data for debugging
- Handle both Error objects and string errors appropriately

### Logging Integration

- Import and configure logger: `createLoggerSync({ config: { name: "PersonalitiesProvider", level: "info" } })`
- Log initialization start, success, and failure events
- Include relevant metadata in success logs (personalities count, error status)
- Use consistent log levels: info for normal flow, error for failures

### Context Provider Implementation

- Create context with `PersonalitiesPersistenceAdapter` type
- Provide `desktopPersonalitiesAdapter` instance through context
- Include hook for accessing adapter with proper error messaging
- Only render children after successful initialization

## Acceptance Criteria

### Functional Requirements

- [x] Component successfully initializes personalities store on mount
- [x] Loading state displays appropriate spinner and message
- [x] Error state shows user-friendly message with reload button
- [x] Context provides adapter instance to child components
- [x] Hook throws descriptive error when used outside provider
- [x] Component prevents multiple initialization attempts
- [x] Proper cleanup on component unmount

### Code Quality Requirements

- [x] Follow exact same patterns as RolesProvider implementation
- [x] Full TypeScript typing with no `any` types
- [x] Proper import structure from shared packages
- [x] Consistent styling with existing providers
- [x] Structured logging with appropriate metadata
- [x] Error handling for both Error objects and strings

### Integration Requirements

- [x] Compatible with existing app component hierarchy
- [x] Works with React 19+ and strict mode
- [x] Uses correct imports from `@fishbowl-ai/ui-shared` and `@fishbowl-ai/shared`
- [x] Follows established context provider naming conventions

## Dependencies

- Requires `desktopPersonalitiesAdapter` implementation (prerequisite: F-desktop-personalities-adapter)
- Requires `usePersonalitiesStore` from ui-shared package
- Requires `PersonalitiesPersistenceAdapter` interface from ui-shared package

## Implementation Notes

- Copy the exact structure from RolesProvider.tsx and adapt for personalities
- Ensure all variable names and types are changed from "roles" to "personalities"
- Maintain the same useEffect dependency array (empty) for single initialization
- Use the same mounted flag pattern to prevent memory leaks
