---
id: T-create-roleselect-component
title: Create RoleSelect Component
status: done
priority: medium
parent: F-selection-components
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/settings/RoleSelectProps.ts:
    Created interface for
    RoleSelect component props with value, onChange, disabled, and placeholder
    properties
  packages/ui-shared/src/types/settings/index.ts: Added export for RoleSelectProps interface
  apps/desktop/src/components/settings/agents/RoleSelect.tsx: Created reusable
    RoleSelect dropdown component that integrates with useRolesStore, handles
    all states (loading, error, empty, success), uses shadcn/ui Select
    components, includes ARIA labels and accessibility features, shows role
    names with truncated descriptions
  apps/desktop/src/components/settings/agents/index.ts: Added export for RoleSelect component
  apps/desktop/src/components/settings/agents/__tests__/RoleSelect.test.tsx:
    Created comprehensive unit tests covering all states, functionality,
    accessibility, edge cases, and component behavior with 100% test coverage
log:
  - Successfully created RoleSelect component with full functionality including
    data loading from useRolesStore, loading/error/empty state handling,
    shadcn/ui Select integration, and comprehensive accessibility features.
    Component includes proper TypeScript interfaces, follows established
    patterns from PersonalitySelect, and includes comprehensive unit tests. All
    quality checks pass (lint, format, type-check).
schema: v1.0
childrenIds: []
created: 2025-08-19T16:11:01.286Z
updated: 2025-08-19T16:11:01.286Z
---

## Context

Create a reusable RoleSelect dropdown component that integrates with the existing roles system. This component will be used in the agent form to allow users to select from available roles. It should follow the established patterns from the RolesSection and RolesList components.

## Technical Approach

**File Location**: `apps/desktop/src/components/settings/agents/RoleSelect.tsx`

**Dependencies**:

- useRolesStore from @fishbowl-ai/ui-shared
- shadcn/ui Select component
- Follow patterns from existing components in `apps/desktop/src/components/settings/roles/`

**Component Interface**:

```typescript
interface RoleSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

## Implementation Requirements

### Core Functionality

1. **Data Loading**: Use `useRolesStore` to fetch available roles
2. **Loading State**: Show spinner while roles are being fetched
3. **Error Handling**: Display user-friendly error message if roles fail to load
4. **Empty State**: Handle case when no roles exist with appropriate message
5. **Selection Display**: Show role name with optional truncated description preview
6. **Change Handling**: Emit onChange events with selected role ID

### UI Implementation

1. **Use shadcn/ui Select**: Follow existing Select component patterns
2. **Consistent Styling**: Match design system patterns from other settings components
3. **Accessibility**: Full keyboard navigation and screen reader support
4. **Responsive Design**: Work properly at all screen sizes

### State Management

1. **Subscribe to Store**: Use useRolesStore selectors for roles, loading, error states
2. **No Data Persistence**: Component only handles selection, not data persistence
3. **Controlled Component**: Value controlled by parent component

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Component loads roles from useRolesStore on mount
- ✅ Displays loading spinner while `isLoading` is true
- ✅ Shows error message when `error` state exists with retry option
- ✅ Displays role names in dropdown options
- ✅ Calls onChange with role ID when selection changes
- ✅ Supports controlled value prop for current selection
- ✅ Handles disabled state properly
- ✅ Shows placeholder text when no role selected

### Technical Requirements

- ✅ Written in TypeScript with proper interfaces
- ✅ Uses shadcn/ui Select component for rendering
- ✅ Follows React functional component patterns
- ✅ Includes proper error boundaries if needed
- ✅ Implements proper cleanup for subscriptions

### Accessibility Requirements

- ✅ Proper ARIA labels and descriptions
- ✅ Keyboard navigation support (arrow keys, Enter, Escape)
- ✅ Screen reader announcements for state changes
- ✅ Focus management within dropdown

### Testing Requirements

- ✅ Unit tests for component rendering
- ✅ Test loading state display
- ✅ Test error state handling
- ✅ Test successful role selection
- ✅ Test disabled state behavior
- ✅ Test keyboard navigation
- ✅ Mock useRolesStore for predictable testing

## Security Considerations

- Validate selected role ID exists in available roles
- Sanitize any user-provided placeholder text
- Don't expose internal role data structures in props

## Performance Requirements

- Component should render instantly (< 50ms)
- Dropdown should open without delay (< 100ms)
- Should not cause unnecessary re-renders of parent components
