---
id: T-refactor-rolelistitem-to-use
title: Refactor RoleListItem to use SettingsCard removing loading states
status: open
priority: medium
parent: F-settings-card-component
prerequisites:
  - T-create-settingscard-component
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-02T02:47:11.084Z
updated: 2025-09-02T02:47:11.084Z
---

## Context

Refactor RoleListItem component to use SettingsCard while removing loading state complexity as specified in the feature requirements. This simplification removes async loading patterns to keep the component straightforward.

Reference the feature specification: F-settings-card-component
Reference existing component: `apps/desktop/src/components/settings/roles/RoleListItem.tsx`
Depends on: T-create-settingscard-component

## Implementation Requirements

Simplify RoleListItem by removing loading states and using SettingsCard for consistent layout.

**File to modify**: `apps/desktop/src/components/settings/roles/RoleListItem.tsx`

### Content Transformation

Transform existing content to SettingsCard format:

- **Title**: `role.name` (unchanged)
- **Content**: `truncateDescription(role.description, 120)` (keep existing truncation)

### Handler Simplification

Remove loading states and async patterns:

- `onEdit: () => onEdit(role)` (direct handler, no loading state)
- `onDelete: () => onDelete(role)` (direct handler, no loading state)

### Remove Loading Complexity

- Remove isEditLoading and isDeleteLoading state variables
- Remove async/await patterns from handlers
- Remove loading spinners and disabled states
- Remove complex focus styling and loading indicators
- Simplify component to synchronous operation

### Preserve Essential Features

- Keep truncateDescription utility usage
- Maintain RoleListItemProps interface compatibility
- Preserve memo optimization
- Keep existing accessibility patterns where applicable

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Component renders using SettingsCard as base
- ✅ Displays role.name as title
- ✅ Displays truncated description (120 chars) as content
- ✅ Edit button triggers onEdit with role object directly
- ✅ Delete button triggers onDelete with role object directly
- ✅ Maintains existing prop interface (RoleListItemProps)

### Simplification Requirements

- ✅ Removes isEditLoading and isDeleteLoading state variables
- ✅ Removes useState import and loading state management
- ✅ Removes async/await patterns from event handlers
- ✅ Removes Loader2 icon import and loading spinners
- ✅ Removes disabled button states and loading opacity
- ✅ Removes complex focus styling related to loading states
- ✅ Eliminates try/finally blocks and error handling

### Code Quality Requirements

- ✅ Uses SettingsCard import from ui components
- ✅ Maintains React.memo optimization
- ✅ Updates JSDoc comments to reflect simplified functionality
- ✅ Removes unused imports (Loader2, complex styling utilities)
- ✅ Clean, readable code following project conventions
- ✅ Preserves truncateDescription utility usage

### Integration Requirements

- ✅ Works with existing roles settings page without changes
- ✅ Maintains same external API (props interface unchanged)
- ✅ Visual consistency with other SettingsCard implementations
- ✅ Preserves role description truncation functionality

## Technical Approach

1. **State Removal**:
   - Remove useState import and loading state variables
   - Remove async patterns from event handlers
   - Simplify handlers to direct callback invocation
   - Remove loading-related conditional logic

2. **Component Structure Refactor**:
   - Replace complex Card structure with SettingsCard
   - Remove manual Button implementation with loading states
   - Simplify to basic title/content pattern
   - Remove complex styling and focus management

3. **Handler Simplification**:
   - Convert handleEdit and handleDelete to direct callbacks
   - Remove try/finally blocks and error handling
   - Remove loading state management
   - Pass role object directly to parent handlers

4. **Import Cleanup**:
   - Add SettingsCard import from ui components
   - Remove Loader2 icon import
   - Remove complex styling utilities if unused
   - Remove useState import
   - Keep truncateDescription import

## Dependencies

- T-create-settingscard-component (must complete first)
- Existing truncateDescription utility (preserve usage)
- RoleListItemProps interface (unchanged)
- Parent component contracts remain unchanged

## Testing Requirements

### Unit Testing (included in implementation)

- ✅ Component renders with SettingsCard structure
- ✅ Title displays role.name correctly
- ✅ Content displays truncated description correctly
- ✅ Edit handler passes role object to onEdit directly
- ✅ Delete handler passes role object to onDelete directly
- ✅ truncateDescription utility called with correct parameters
- ✅ Custom className prop works correctly
- ✅ Memoization prevents unnecessary re-renders

### Integration Testing

- ✅ Works correctly in roles settings page
- ✅ Role data displays properly without loading states
- ✅ Edit and delete operations function immediately
- ✅ Visual consistency maintained with other settings cards

## Security Considerations

- ✅ Role description safely displayed with truncation
- ✅ No XSS risks in role name or description
- ✅ Callback functions properly scoped
- ✅ Role data handled securely without async complexity

## Out of Scope

- Changes to RoleListItemProps interface or RoleViewModel
- Modifications to parent role settings components
- Role data validation or processing logic
- Error handling or async operation patterns (removed by design)
- Complex focus management or loading indicators
