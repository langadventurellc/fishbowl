---
id: F-logger-dependency-injection
title: Logger Dependency Injection Refactor
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  packages/ui-shared/src/stores/settings/settingsModalState.ts:
    Added logger property (IStructuredLogger | null) to state interface with
    proper documentation
  packages/ui-shared/src/stores/settings/settingsModalActions.ts: Added initialize method to actions interface for logger dependency injection
  packages/ui-shared/src/stores/settings/defaultSettingsModalState.ts: "Added logger: null to default state to satisfy interface requirement"
  packages/ui-shared/src/stores/settings/settingsStore.ts: Complete refactor -
    removed createLoggerSync import and all fallback patterns, implemented clean
    dependency injection with initialize method, replaced all logging calls with
    get().logger! non-null assertion, assuming logger is always injected before
    use
  packages/ui-shared/src/stores/settings/__tests__/settingsStore.test.ts:
    Updated test file to use proper mock logger dependency injection instead of
    mocking createLoggerSync, fixed test assertions to account for new logger
    property in state
  packages/ui-shared/src/stores/PersonalitiesState.ts: "Added logger: StructuredLogger | null property to state interface"
  packages/ui-shared/src/stores/PersonalitiesActions.ts: Updated initialize method signature to accept logger parameter
  packages/ui-shared/src/stores/usePersonalitiesStore.ts: Removed lazy logger
    pattern, updated all logging calls to use injected logger instance, added
    logger to initial state and initialize method
  packages/ui-shared/src/stores/__tests__/personalitiesStore.test.ts:
    Updated tests to pass mock logger to initialize method, added
    createMockLogger helper function, and provided default mock logger in
    beforeEach setup
  packages/ui-shared/src/stores/RolesState.ts: "Added logger: StructuredLogger property to store state interface"
  packages/ui-shared/src/stores/RolesActions.ts: Updated initialize method
    signature to accept logger parameter alongside adapter
  packages/ui-shared/src/stores/useRolesStore.ts: Removed module-level logger
    variable and getLogger function, updated initialize method to accept and
    store logger, replaced all getLogger() calls with get().logger?.method()
    pattern using optional chaining for defensive null checks
  packages/ui-shared/src/stores/__tests__/rolesStorePersistence.test.ts:
    Updated test setup to include mock logger in store state and pass logger to
    initialize method calls
  packages/ui-shared/src/stores/__tests__/rolesStore.test.ts: Updated test setup to include mock logger in store state initialization
  apps/desktop/src/hooks/useLlmConfig.ts: Migrated to use useServices() pattern,
    removed createLoggerSync import and module-level logger, added logger to all
    useCallback dependencies (except clearError which doesn't use logger)
  apps/desktop/src/hooks/useElectronIPC.ts:
    Migrated to use useServices() pattern,
    removed createLoggerSync import and module-level logger, added logger to
    useEffect dependencies
  apps/desktop/src/hooks/useFocusTrap.ts: Migrated to use useServices() pattern,
    removed createLoggerSync import and module-level logger, added logger to
    useCallback and useEffect dependencies
  apps/desktop/src/contexts/RolesProvider.tsx: Updated to use useServices() for
    logger and pass logger to store.initialize(), removed logger from useEffect
    dependencies to prevent infinite loops
  apps/desktop/src/contexts/PersonalitiesProvider.tsx: Updated to use
    useServices() for logger and pass logger to store.initialize(), removed
    logger from useEffect dependencies to prevent infinite loops; Added ESLint
    disable comment to acknowledge intentionally excluding logger from useEffect
    dependencies to prevent infinite re-renders during initialization
  apps/desktop/src/components/settings/roles/__tests__/RolesSection.error.test.tsx:
    Added proper StructuredLogger mock using createMockLogger pattern to fix
    test type errors; Updated test mocks to mock useServices hook instead of
    createLoggerSync
  apps/desktop/src/hooks/__tests__/useElectronIPC.test.ts: Added useServices mock with correct import path to prevent test failures
  apps/desktop/src/hooks/__tests__/useFocusTrap.test.ts: Added useServices mock with correct import path to prevent test failures
  apps/desktop/src/hooks/__tests__/useLlmConfig.test.tsx: Added useServices mock
    with stable logger reference to prevent memory leak and infinite re-renders,
    added proper mock cleanup
  apps/desktop/src/contexts/__tests__/RolesProvider.test.tsx:
    Updated mock to use
    useServices and updated test assertions to expect both adapter and logger
    arguments
  apps/desktop/src/contexts/__tests__/PersonalitiesProvider.test.tsx:
    Updated mock to use useServices and updated test assertions to expect both
    adapter and logger arguments
  apps/desktop/src/components/settings/__tests__/SettingsModal.keyboard.test.tsx: Added useServices mock with correct import path to prevent test failures
  apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx:
    Removed createLoggerSync import and module-level logger creation. Added
    useServices() hook usage inside component to get logger.
  apps/desktop/src/components/layout/MainContentPanelDisplay.tsx:
    Removed createLoggerSync import and module-level logger creation. Added
    useServices() hook usage inside component to get logger.
  apps/desktop/src/components/errors/RolesErrorBoundary.tsx: Removed
    createLoggerSync import and module-level logger creation. Updated to accept
    optional logger prop and use this.props.logger?.error() in
    componentDidCatch.
  apps/desktop/src/App.tsx: Updated RolesErrorBoundary usage to pass logger prop from useServices() hook.
  apps/desktop/src/components/errors/__tests__/RolesErrorBoundary.test.tsx:
    Updated all test cases to provide mock logger prop to RolesErrorBoundary
    component.
  apps/desktop/src/components/settings/personalities/PersonalityForm.tsx:
    Migrated from module-level createLoggerSync to useServices() hook pattern.
    Removed createLoggerSync import, added useServices import, moved logger
    access inside component function, and added logger to handleSave dependency
    array.
  apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx:
    Migrated from module-level createLoggerSync to useServices() hook pattern.
    Removed createLoggerSync import, added useServices import, moved logger
    access inside component function, and added logger to dependency arrays for
    handleCreatePersonality, handleEditPersonality, handleDeletePersonality,
    handleFormSave, and handleConfirmDelete callbacks.
  apps/desktop/src/components/settings/personalities/__tests__/PersonalitiesSection.test.tsx:
    Updated test mocks to use useServices hook pattern instead of
    createLoggerSync. Changed mock path to ../../../../contexts and replaced
    createLoggerSync mock with useServices mock returning a logger object.
  apps/desktop/src/components/settings/roles/CreateRoleForm.tsx:
    Migrated from createLoggerSync to useServices() hook, moved logger access
    inside component function, added logger to useCallback dependency array
  apps/desktop/src/components/settings/roles/RolesSection.tsx:
    Migrated from createLoggerSync to useServices() hook, moved logger access
    inside component function, added logger to all useCallback dependency arrays
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.basic.test.tsx: Updated test mocks to mock useServices hook instead of createLoggerSync
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.edit.test.tsx: Updated test mocks to mock useServices hook instead of createLoggerSync
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.changeDetection.test.tsx: Updated test mocks to mock useServices hook instead of createLoggerSync
  apps/desktop/src/components/settings/SettingsContent.tsx: Migrated from
    createLoggerSync to useServices() hook, fixed missing logger dependencies in
    useCallback hooks
  apps/desktop/src/components/settings/TabContainer.tsx: Migrated from
    createLoggerSync to useServices() hook, fixed missing logger dependency in
    useEffect hook
  apps/desktop/src/components/settings/SettingsModal.tsx: Migrated from
    createLoggerSync to useServices() hook, added proper import structure
  apps/desktop/src/components/settings/agents/AgentsSection.tsx:
    Migrated from createLoggerSync to useServices() hook in main component and
    child components (AgentGrid, TemplatesTab), fixed missing logger dependency
    in useCallback
  apps/desktop/src/components/settings/agents/AgentForm.tsx: Migrated from
    createLoggerSync to useServices() hook, fixed missing logger dependency in
    useCallback hook
  apps/desktop/src/components/settings/agents/__tests__/AgentsSection.test.tsx: Added useServices mock to fix failing tests after migration
  apps/desktop/src/components/settings/__tests__/AppearanceSettings.test.tsx: Added useServices mock to fix failing tests after SettingsContent migration
log: []
schema: v1.0
childrenIds:
  - T-update-personalitiesprovider
  - T-update-rolesprovider-to-use
  - T-validate-logger-dependency
  - T-migrate-desktop-hooks-to-use
  - T-migrate-layout-and-error
  - T-migrate-personalities
  - T-migrate-roles-components-to
  - T-migrate-settings-components
  - T-update-settingsstore-for
  - T-update-usepersonalitiesstore
  - T-update-userolesstore-for
created: 2025-08-17T14:04:13.529Z
updated: 2025-08-17T14:04:13.529Z
---

# Logger Dependency Injection Refactor

## Purpose and Functionality

Eliminate inconsistent logger usage across the desktop application by implementing proper dependency injection for all logging operations. This addresses the convoluted logger configuration issue where UI-shared stores use lazy logger creation to avoid browser context issues, and many desktop components directly create loggers instead of using the properly configured logger from RendererProcessServices.

## Problem Statement

Currently the codebase has inconsistent logger usage patterns:

1. **UI-shared stores** use lazy logger creation with fallbacks to avoid process access in browser context
2. **Desktop UI components** directly call `createLoggerSync` instead of using `useServices()` hook
3. **Desktop hooks** create their own loggers instead of leveraging dependency injection
4. **Provider components** create standalone loggers instead of using the services pattern

This leads to:

- Inconsistent logging configuration across the application
- Browser context compatibility issues
- Harder testing and maintenance
- Violation of dependency injection principles

## Key Components to Implement

### 1. UI-Shared Store Logger Injection

**Files to modify:**

- `packages/ui-shared/src/stores/usePersonalitiesStore.ts` (lines 23-41)
- `packages/ui-shared/src/stores/useRolesStore.ts` (lines 24-37)
- `packages/ui-shared/src/stores/settings/settingsStore.ts` (lines 19-31)

**Changes:**

- Remove lazy logger creation patterns
- Add logger parameter to store initialization methods
- Update all internal logger usage to use injected logger
- Remove try/catch fallback patterns
- Update store interfaces to require logger dependency

### 2. Desktop Component Logger Migration

**Files to refactor (use `useServices()` hook):**

- `apps/desktop/src/components/settings/SettingsContent.tsx`
- `apps/desktop/src/components/settings/TabContainer.tsx`
- `apps/desktop/src/components/settings/SettingsModal.tsx`
- `apps/desktop/src/components/settings/agents/AgentsSection.tsx`
- `apps/desktop/src/components/settings/agents/AgentForm.tsx`
- `apps/desktop/src/components/settings/roles/CreateRoleForm.tsx`
- `apps/desktop/src/components/settings/roles/RolesSection.tsx`
- `apps/desktop/src/components/settings/personalities/CreatePersonalityForm.tsx`
- `apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx`
- `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`
- `apps/desktop/src/components/layout/MainContentPanelDisplay.tsx`
- `apps/desktop/src/components/errors/RolesErrorBoundary.tsx`

**Changes:**

- Remove direct `createLoggerSync` imports and calls
- Add `useServices()` hook usage
- Extract logger from services: `const { logger } = useServices()`
- Update all logging calls to use the injected logger

### 3. Desktop Hook Logger Migration

**Files to refactor:**

- `apps/desktop/src/hooks/useLlmConfig.ts`
- `apps/desktop/src/hooks/useElectronIPC.ts`
- `apps/desktop/src/hooks/useFocusTrap.ts`

**Changes:**

- Remove direct `createLoggerSync` usage
- Add `useServices()` hook to access logger
- Pass logger from hook caller or use services directly

### 4. Provider Component Updates

**Files to refactor:**

- `apps/desktop/src/contexts/PersonalitiesProvider.tsx`
- `apps/desktop/src/contexts/RolesProvider.tsx`

**Changes:**

- Remove direct logger creation
- Use `useServices()` to get configured logger
- Pass logger to store initialization
- Update provider initialization patterns

### 5. Store Integration Updates

**Files to modify:**

- Update store usage in components to pass logger during initialization
- Modify provider components to inject logger into stores
- Update any store factory methods to accept logger parameter

## Detailed Acceptance Criteria

### Functional Requirements

1. **UI-Shared Store Injection**
   - [ ] All three UI-shared stores accept logger via dependency injection
   - [ ] Lazy logger creation patterns completely removed
   - [ ] No direct `createLoggerSync` calls in UI-shared stores
   - [ ] Store initialization requires logger parameter
   - [ ] All internal logging uses injected logger instance

2. **Desktop Component Migration**
   - [ ] All listed components use `useServices()` hook for logger access
   - [ ] No direct `createLoggerSync` imports in desktop components
   - [ ] Logger extracted from services: `const { logger } = useServices()`
   - [ ] All logging operations use the services-provided logger

3. **Desktop Hook Migration**
   - [ ] All listed hooks use `useServices()` for logger access
   - [ ] No module-level logger creation in hooks
   - [ ] Hooks properly integrate with services dependency injection

4. **Provider Integration**
   - [ ] Provider components use `useServices()` for logger access
   - [ ] Store initialization includes logger injection
   - [ ] No standalone logger creation in providers

5. **Consistency Validation**
   - [ ] All desktop renderer process code uses single logger configuration
   - [ ] No remaining lazy logger patterns in shared code
   - [ ] Browser context compatibility maintained
   - [ ] Logging configuration centralized in RendererProcessServices

### Technical Requirements

1. **Import Changes**
   - Remove all `import { createLoggerSync }` from desktop components/hooks
   - Add `import { useServices }` where needed
   - Maintain existing functional imports

2. **Hook Integration Pattern**

   ```typescript
   // Before
   const logger = createLoggerSync({ config: { name: "ComponentName" } });

   // After
   const { logger } = useServices();
   ```

3. **Store Integration Pattern**

   ```typescript
   // In provider components
   const { logger } = useServices();
   const store = usePersonalitiesStore();

   useEffect(() => {
     store.initialize(adapter, logger);
   }, [store, adapter, logger]);
   ```

4. **Error Handling**
   - Maintain existing error handling patterns
   - Ensure logger fallbacks are not needed
   - Preserve existing try/catch logic where appropriate

### Testing Requirements

1. **Unit Test Updates**
   - Update all component tests to mock `useServices()` hook
   - Remove `createLoggerSync` mocks from individual components
   - Ensure store tests include logger injection
   - Verify logging calls use injected logger

2. **Integration Testing**
   - Verify logger configuration flows from services to all components
   - Test store initialization with logger dependency
   - Validate error scenarios maintain proper logging

### Security Considerations

1. **No Sensitive Data Logging**
   - Ensure refactoring doesn't introduce sensitive data in logs
   - Maintain existing log level configurations
   - Preserve security boundaries between main/renderer processes

2. **Context Validation**
   - Ensure `useServices()` calls are within proper React context
   - Add appropriate error handling for missing services context
   - Maintain renderer process security boundaries

### Performance Requirements

1. **Logger Reuse**
   - Single logger instance shared across renderer process
   - No unnecessary logger recreations
   - Maintain existing performance characteristics

2. **Bundle Size**
   - Remove redundant logger creation code
   - Reduce duplicate imports across components
   - Maintain current bundle size or improve

## Implementation Guidance

### Phase 1: Store Interface Updates

1. Update UI-shared store interfaces to accept logger parameter
2. Modify store implementations to use injected logger
3. Remove lazy logger creation patterns

### Phase 2: Component Migration

1. Start with leaf components (no child components)
2. Work up component hierarchy systematically
3. Update one component at a time, test, then continue

### Phase 3: Hook Migration

1. Update hooks to use `useServices()` pattern
2. Ensure hooks properly integrate with dependency injection
3. Update hook callers as needed

### Phase 4: Provider Integration

1. Update provider components to use services
2. Implement logger injection into store initialization
3. Test full integration flow

### Phase 5: Validation and Testing

1. Run comprehensive testing suite
2. Verify no remaining `createLoggerSync` usage in desktop renderer
3. Validate consistent logging behavior
4. Perform additional research as needed for any missed patterns

## Testing Requirements

1. **Unit Tests**
   - Update all component test mocks to use `useServices()`
   - Remove individual `createLoggerSync` mocks
   - Test store logger injection

2. **Integration Tests**
   - Verify end-to-end logger configuration flow
   - Test error scenarios maintain proper logging
   - Validate services context integration

3. **Manual Testing**
   - Verify logging output consistency across application
   - Test all refactored components function normally
   - Validate store operations work with injected loggers

## Dependencies

- Must not break existing functionality
- Should maintain current logging output format
- Requires thorough testing of services context integration

## Additional Research Required

During implementation, conduct additional research to:

1. **Identify Other Patterns**: Search for any other files using logger creation patterns that may have been missed in initial analysis
2. **Validate Mobile Compatibility**: Ensure changes to ui-shared stores are compatible with mobile platform requirements
3. **Review Main Process**: Verify no similar patterns exist in main process that should also be addressed
4. **Check Test Files**: Review test files for similar patterns that need updating
5. **Examine Build Process**: Ensure refactoring doesn't break build or bundling processes

## Success Metrics

1. **Code Consistency**: All desktop renderer process code uses single logger source
2. **Maintainability**: Simplified logger usage patterns across codebase
3. **Testability**: Easier mocking and testing with dependency injection
4. **Performance**: No degradation in logging performance
5. **Functionality**: All existing features work exactly as before
