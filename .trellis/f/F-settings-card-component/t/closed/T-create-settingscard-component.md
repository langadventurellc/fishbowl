---
id: T-create-settingscard-component
title: Create SettingsCard component with accessibility and styling
status: done
priority: high
parent: F-settings-card-component
prerequisites:
  - T-create-settingscardprops
affectedFiles:
  apps/desktop/src/components/ui/SettingsCard.tsx: Created new SettingsCard
    component with React.memo optimization, hover-reveal action buttons,
    accessibility features, and shadcn Card component integration
  apps/desktop/src/components/ui/index.ts: Created barrel export file to
    centralize UI component exports following project conventions
log:
  - Successfully implemented the SettingsCard component with full TypeScript
    support, accessibility features, and performance optimizations. The
    component provides a unified interface for all settings list items with
    consistent styling, hover-reveal action buttons using Edit2 and Trash2
    icons, and comprehensive accessibility features including ARIA labels and
    keyboard navigation. Uses shadcn Card components with proper semantic
    structure and focus management. All quality checks (lint, format,
    type-check) pass successfully.
schema: v1.0
childrenIds: []
created: 2025-09-02T02:45:58.486Z
updated: 2025-09-02T02:45:58.486Z
---

## Context

Create the core SettingsCard component that will standardize all settings list items across the application. This component must provide consistent styling, accessibility, and interaction patterns.

Reference the feature specification: F-settings-card-component
Depends on: T-create-settingscardprops (props interface)

## Implementation Requirements

Create a new React component with full TypeScript support and comprehensive styling.

**File**: `apps/desktop/src/components/ui/SettingsCard.tsx`

### Component Structure

```typescript
import { SettingsCardProps } from "@fishbowl-ai/ui-shared";
import { Edit2, Trash2 } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export const SettingsCard = React.memo<SettingsCardProps>(
  ({ title, content, onEdit, onDelete, className }) => {
    // Implementation here
  },
);

SettingsCard.displayName = "SettingsCard";
```

### Styling Requirements

- Use shadcn Card components (CardHeader, CardContent)
- Title in CardHeader using CardTitle with h3 semantics
- Content in CardContent with proper text styling
- Right-aligned action buttons with hover reveal effect
- Ghost variant buttons with icon-only display
- Hover shadow elevation transition
- Focus management following existing patterns

### Accessibility Features

- Proper ARIA labels for edit and delete buttons
- Role attributes for semantic structure
- Keyboard navigation support
- Screen reader friendly structure
- Focus indicators consistent with design system

### Performance Optimization

- React.memo with custom comparison for optimal re-renders
- Efficient hover state handling
- No memory leaks from event listeners

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ Component renders with title displayed prominently in header
- ✅ Secondary content area renders string or ReactNode correctly
- ✅ Edit button with Edit2 icon triggers onEdit when clicked
- ✅ Delete button with Trash2 icon triggers onDelete when clicked
- ✅ Action buttons hidden by default, revealed on card hover/focus
- ✅ Custom className prop applied to root Card element
- ✅ Component memoized for performance optimization

### Visual Requirements

- ✅ Uses Card, CardHeader, CardContent structure
- ✅ Title uses CardTitle component with appropriate typography
- ✅ Content area has proper text styling and spacing
- ✅ Buttons are icon-only, ghost variant, small size
- ✅ Hover effects include shadow transition and button visibility
- ✅ Consistent spacing matching existing design system
- ✅ Right-aligned button placement

### Accessibility Requirements

- ✅ Edit button has descriptive aria-label
- ✅ Delete button has descriptive aria-label
- ✅ Card has proper role attribute (article)
- ✅ Title has proper heading semantics
- ✅ Focus indicators visible and consistent
- ✅ Keyboard navigation works for interactive elements

### Integration Requirements

- ✅ Imports SettingsCardProps from @fishbowl-ai/ui-shared
- ✅ Uses existing shadcn components (Card, Button)
- ✅ Uses lucide-react icons (Edit2, Trash2)
- ✅ Leverages cn utility for className merging
- ✅ Follows existing component patterns and conventions

## Technical Approach

1. **Component Implementation**:
   - Use React.memo with custom comparison function
   - Implement hover state with CSS classes
   - Use consistent button patterns from existing components
   - Follow accessibility patterns from AgentCard and RoleListItem

2. **Styling Implementation**:
   - Apply hover effects similar to existing card components
   - Use transition classes for smooth animations
   - Implement button visibility toggle on hover/focus
   - Maintain consistent spacing and typography

3. **Accessibility Implementation**:
   - Add proper ARIA labels with descriptive text
   - Implement focus management
   - Use semantic HTML structure
   - Follow existing focus styles and patterns

4. **Export Updates**:
   - Add SettingsCard export to `apps/desktop/src/components/ui/index.ts`
   - Follow alphabetical ordering convention

## Dependencies

- T-create-settingscardprops (must complete first for type imports)
- Existing shadcn components (Card, Button) already available
- lucide-react icons already available
- cn utility already available

## Testing Requirements

### Unit Testing (included in implementation)

- ✅ Component renders with provided props
- ✅ Title and content display correctly
- ✅ Edit button click triggers onEdit callback
- ✅ Delete button click triggers onDelete callback
- ✅ Custom className applied to root element
- ✅ Hover states work correctly
- ✅ Accessibility attributes present and correct

### Component Testing

- ✅ Memoization prevents unnecessary re-renders
- ✅ All interactive elements are keyboard accessible
- ✅ Focus indicators work properly
- ✅ Screen reader announcements are appropriate

## Security Considerations

- ✅ Content prop safely renders React nodes without XSS risk
- ✅ Callback functions validated before execution
- ✅ No sensitive data exposed in component structure
- ✅ Event handlers properly scoped to prevent injection

## Out of Scope

- Integration with existing card components (handled by refactoring tasks)
- Loading states or complex state management (kept simple per requirements)
- Performance testing beyond basic memoization
- Advanced animations or transitions beyond hover effects
