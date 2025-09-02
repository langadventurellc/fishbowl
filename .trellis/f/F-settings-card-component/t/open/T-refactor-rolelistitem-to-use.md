---
id: T-refactor-rolelistitem-to-use
title: Replace RoleListItem with SettingsCard implementation
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

Completely replace the RoleListItem component by deleting the existing implementation and using the SettingsCard component while removing loading state complexity as specified in the feature requirements.

Reference the feature specification: F-settings-card-component
Reference existing component: `apps/desktop/src/components/settings/roles/RoleListItem.tsx`
Reference SettingsCard: `/Users/zach/code/fishbowl/apps/desktop/src/components/ui/SettingsCard.tsx`
Depends on: T-create-settingscard-component

## Implementation Requirements

Replace the entire RoleListItem implementation with SettingsCard usage, removing all loading states and complex functionality.

**File to modify**: `apps/desktop/src/components/settings/roles/RoleListItem.tsx`

### Complete Implementation Replacement

Delete the existing component implementation and replace with:

- **Title**: `role.name`
- **Content**: `truncateDescription(role.description, 120)` (keep truncation utility)
- **Handlers**: Direct SettingsCard integration
- **Remove**: All loading states, complex styling, and async patterns

### Content Transformation

Replace complex Card structure with simple SettingsCard usage:

- Use role.name for title
- Use truncated description for content (preserve existing truncation logic)
- Remove all loading state indicators and complex hover effects
- Simplify to basic role information display

### Handler Simplification

Remove loading states and async patterns:

- `onEdit: () => onEdit(role)` (direct handler, no loading state)
- `onDelete: () => onDelete(role)` (direct handler, no loading state)
- Remove all useState, loading states, and async/await patterns

### Remove All Complex Features

Delete the following entirely:

- `isEditLoading` and `isDeleteLoading` state variables
- `useState` import and state management
- `Loader2` icon and loading spinners
- Complex focus management and styling utilities
- Async `handleEdit` and `handleDelete` functions
- `try/finally` blocks and error handling
- Complex Card styling with group hover effects
- Custom button styling and loading states
- `cn` utility usage for complex styling
- `memo` wrapper with complex logic

## Detailed Acceptance Criteria

### Replacement Requirements

- ✅ Entire component implementation replaced with SettingsCard usage
- ✅ All loading state logic removed completely
- ✅ Complex Card structure deleted and replaced
- ✅ Component file significantly simplified (under 40 lines)
- ✅ Only essential role display logic kept

### Functional Requirements

- ✅ Component renders using SettingsCard as base
- ✅ Displays role.name as title
- ✅ Displays truncated description (120 chars) as content
- ✅ Edit button triggers onEdit with role object directly
- ✅ Delete button triggers onDelete with role object directly
- ✅ Maintains RoleListItemProps interface externally

### Code Simplification

- ✅ Removes all loading state imports and logic
- ✅ Removes complex styling utilities and focus management
- ✅ Removes async patterns and error handling
- ✅ Adds SettingsCard import from ui components
- ✅ Keeps only truncateDescription utility import
- ✅ Simplifies JSDoc to reflect basic functionality
- ✅ Eliminates memo wrapper and complex optimizations

### Integration Requirements

- ✅ Works with existing roles settings page without changes
- ✅ Maintains same external API (props interface unchanged)
- ✅ Visual consistency with other SettingsCard implementations
- ✅ No functionality regressions for edit/delete operations

## Technical Approach

1. **Complete Implementation Replacement**:
   - Delete entire existing component implementation
   - Replace with simple SettingsCard wrapper
   - Keep only role display and truncation logic
   - Remove all loading states and complex patterns

2. **Minimal Code Retention**:
   - Keep truncateDescription utility import and usage
   - Keep RoleListItemProps interface
   - Keep basic component structure and exports
   - Remove everything else

3. **SettingsCard Integration**:
   - Import SettingsCard from ui components
   - Pass role.name as title
   - Pass truncated description as content
   - Use direct handlers without async patterns

4. **Cleanup**:
   - Remove all unused imports and dependencies
   - Delete loading state logic and error handling
   - Simplify JSDoc documentation
   - Remove performance optimizations and memo

## New Implementation Structure

```typescript
/**
 * RoleListItem component displays basic role information.
 * Uses SettingsCard for consistent styling and interaction patterns.
 */

import type { RoleListItemProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { SettingsCard } from "../../ui/SettingsCard";
import { truncateDescription } from "../../../utils";

export const RoleListItem: React.FC<RoleListItemProps> = ({
  role,
  onEdit,
  onDelete,
  className,
}) => {
  return (
    <SettingsCard
      title={role.name}
      content={truncateDescription(role.description, 120)}
      onEdit={() => onEdit(role)}
      onDelete={() => onDelete(role)}
      className={className}
    />
  );
};
```

## Dependencies

- T-create-settingscard-component (must complete first)
- SettingsCard component must be available
- Existing truncateDescription utility (preserved)
- RoleListItemProps interface (unchanged)

## Testing Requirements

### Unit Testing (included in implementation)

- ✅ Component renders with SettingsCard structure
- ✅ Title displays role.name correctly
- ✅ Content displays truncated description correctly
- ✅ Edit handler passes role object to onEdit directly
- ✅ Delete handler passes role object to onDelete directly
- ✅ truncateDescription utility called with correct parameters
- ✅ Custom className prop works correctly

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
