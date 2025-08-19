---
id: T-add-shared-types-and
title: Add Shared Types and Integration Testing
status: done
priority: medium
parent: F-selection-components
prerequisites:
  - T-create-roleselect-component
  - T-create-personalityselect
  - T-create-modelselect-component
affectedFiles:
  packages/ui-shared/src/types/settings/BaseSelectProps.ts: Created shared base
    interface for all selection components with consistent prop structure
  packages/ui-shared/src/types/settings/SelectWithLoadingProps.ts:
    Created extended interface for selection components that handle loading
    states
  packages/ui-shared/src/types/settings/SelectOption.ts: Created generic option structure for consistency across selection components
  packages/ui-shared/src/types/settings/index.ts: Added exports for new shared types
  packages/ui-shared/src/types/settings/ModelSelectProps.ts: Updated to extend BaseSelectProps interface
  packages/ui-shared/src/types/settings/RoleSelectProps.ts: Updated to extend BaseSelectProps interface
  packages/ui-shared/src/types/settings/PersonalitySelectProps.ts: Updated to extend BaseSelectProps interface
  apps/desktop/src/components/settings/agents/ModelSelect.tsx: Updated to import types from shared package instead of local definition
  apps/desktop/src/components/settings/agents/PersonalitySelect.tsx:
    Added aria-label for accessibility consistency, conditional retry button
    display, and consistent error handling patterns
  apps/desktop/src/components/settings/agents/index.ts: Added ModelSelect and PersonalitySelect to barrel exports
  apps/desktop/src/components/settings/agents/__tests__/SelectionComponents.integration.test.tsx:
    Created comprehensive integration test suite verifying consistent behavior
    patterns across all selection components
  apps/desktop/src/components/settings/agents/__tests__/PersonalitySelect.test.tsx:
    Updated test to include isRetryable property in error mock to align with
    consistent error handling patterns
log:
  - Successfully implemented shared types and integration testing for selection
    components. Created BaseSelectProps interface and related types to ensure
    consistency across ModelSelect, RoleSelect, and PersonalitySelect
    components. Updated all components to use shared types, ensured consistent
    accessibility attributes and error handling patterns, created comprehensive
    integration tests, and updated barrel exports for clean imports. Fixed
    failing tests to align with new consistent behavior patterns. All quality
    checks and tests pass.
schema: v1.0
childrenIds: []
created: 2025-08-19T16:12:08.020Z
updated: 2025-08-19T16:12:08.020Z
---

## Context

Create shared TypeScript interfaces and integration testing for the selection components to ensure consistency and proper integration. This task ensures all three selection components (ModelSelect, RoleSelect, PersonalitySelect) follow identical patterns and can work together seamlessly in the agent form.

## Technical Approach

**File Locations**:

- `packages/ui-shared/src/types/settings/SelectProps.ts` (shared interfaces)
- `apps/desktop/src/components/settings/agents/index.ts` (barrel export)
- Integration tests as needed

**Dependencies**:

- All three selection components must be completed
- Follow existing type organization patterns in `packages/ui-shared/src/types/`

## Implementation Requirements

### Shared Type Definitions

1. **Base Select Interface**: Create consistent interface for all selection components

```typescript
interface BaseSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

2. **Component-Specific Extensions**: Define any component-specific prop extensions
3. **Selection Option Types**: Define standard option structures for consistency

### Integration Requirements

1. **Barrel Exports**: Create clean export structure for all selection components
2. **Consistent Patterns**: Ensure all three components follow identical patterns for:
   - Error handling approaches
   - Loading state implementations
   - Empty state messaging
   - Accessibility attributes
   - Event handling patterns

3. **Integration Testing**: Test components working together in realistic scenarios

### Documentation

1. **Usage Examples**: Document how to use each selection component
2. **Integration Guide**: Show how components work together in forms
3. **Pattern Documentation**: Document the established patterns for future components

## Detailed Acceptance Criteria

### Type Safety Requirements

- ✅ Shared base interface defined and exported from ui-shared package
- ✅ All three selection components use the shared interface
- ✅ TypeScript compilation succeeds with no type errors
- ✅ Consistent prop naming across all components
- ✅ Proper generic types for extensibility

### Integration Requirements

- ✅ Barrel export file created for clean imports
- ✅ All three components can be imported together cleanly
- ✅ Components follow identical patterns for error states
- ✅ Components follow identical patterns for loading states
- ✅ Components follow identical patterns for empty states
- ✅ Consistent accessibility implementation across components

### Testing Requirements

- ✅ Integration tests showing components working together
- ✅ Test consistent behavior across all three components
- ✅ Test that shared interfaces work correctly
- ✅ Test barrel exports work properly
- ✅ Verify no circular dependencies in imports

### Documentation Requirements

- ✅ TypeScript interfaces properly documented with JSDoc
- ✅ Usage examples for each component
- ✅ Integration patterns documented
- ✅ Error handling patterns documented
- ✅ Accessibility patterns documented

## Security Considerations

- Ensure shared types don't expose sensitive data structures
- Validate that all components handle invalid props safely
- Confirm consistent input validation patterns across components

## Performance Requirements

- Shared types should not impact bundle size significantly
- Barrel exports should support tree-shaking properly
- No performance regressions when using components together
