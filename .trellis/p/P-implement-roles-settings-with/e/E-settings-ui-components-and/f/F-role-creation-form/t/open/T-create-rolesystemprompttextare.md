---
id: T-create-rolesystemprompttextare
title: Create RoleSystemPromptTextarea component with validation and character counter
status: open
priority: high
parent: F-role-creation-form
prerequisites:
  - T-update-role-schema-to-match
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T21:37:43.533Z
updated: 2025-08-12T21:37:43.533Z
---

# Create RoleSystemPromptTextarea Component

## Context

The role creation form is missing the system prompt field component. This component needs to follow the same patterns as the existing `RoleNameInput` and `RoleDescriptionTextarea` components but accommodate a larger text input (up to 5000 characters).

## Implementation Requirements

### Component Specifications

- **File Location**: `apps/desktop/src/components/settings/roles/RoleSystemPromptTextarea.tsx`
- **Character Limit**: 5000 characters (to match updated schema)
- **Interface**: Similar to `RoleDescriptionTextarea` but with larger dimensions
- **Validation**: Real-time character counting with color-coded feedback

### Component Features

1. **Text Area**: Multi-row textarea (8-10 rows) with resize capability
2. **Character Counter**: Shows current/max characters with color thresholds
3. **Label**: "System Prompt" with required indicator (\*)
4. **Placeholder**: Helpful text explaining system prompt purpose
5. **Accessibility**: Full ARIA support and screen reader compatibility

### Technical Implementation

#### Component Props Interface

Create type in `packages/ui-shared/src/types/settings/RoleSystemPromptTextareaProps.ts`:

```typescript
export interface RoleSystemPromptTextareaProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
}
```

#### Component Structure

```tsx
export const RoleSystemPromptTextarea: React.FC<
  RoleSystemPromptTextareaProps
> = ({
  value,
  onChange,
  maxLength = 5000,
  disabled = false,
  className,
  "aria-describedby": ariaDescribedBy,
}) => {
  // Character counting logic
  // Color threshold calculation (similar to RoleDescriptionTextarea)
  // Change handler with length enforcement
  // Render textarea with counter
};
```

### Character Counter Color Thresholds

- **Green** (0-4000 chars): `text-muted-foreground`
- **Yellow** (4001-4500 chars): `text-yellow-600`
- **Red** (4501-5000 chars): `text-red-600`

### Styling Requirements

- **Textarea Size**: 8-10 rows minimum height
- **Resize**: Allow vertical resize for user preference
- **Counter Position**: Bottom-right corner, absolute positioned
- **Required Indicator**: Red asterisk (\*) next to label
- **Focus States**: Clear visual focus indication

## Acceptance Criteria

- [ ] Component renders with proper label and required indicator
- [ ] Character counter displays current/max with color coding
- [ ] Input prevention beyond 5000 characters
- [ ] Textarea allows vertical resizing
- [ ] Proper accessibility attributes (ARIA, IDs, descriptions)
- [ ] Component follows existing design patterns from other role inputs
- [ ] TypeScript types are properly exported and available
- [ ] Component integrates with react-hook-form (controlled component pattern)

## Dependencies

- Requires `T-update-role-schema-to-match` to be completed first
- Uses existing UI components (Label, Textarea) from shadcn/ui
- Follows patterns from `RoleDescriptionTextarea` component

## Security Considerations

- Input length validation prevents oversized data
- HTML escaping through React's built-in protection
- No script injection vulnerabilities through controlled input

## Testing Requirements

- Component renders correctly with empty value
- Character counter updates in real-time
- Color thresholds change at correct character counts
- Input prevention works at 5000 character limit
- Accessibility attributes are correctly applied
- Component works with react-hook-form integration

## Implementation Guidance

1. Copy structure from `RoleDescriptionTextarea.tsx` as starting point
2. Modify character limits and thresholds for 5000 chars
3. Increase textarea rows and allow resize
4. Create corresponding TypeScript interface
5. Test component in isolation before form integration
