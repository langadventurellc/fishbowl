---
kind: task
id: T-implement-comprehensive-warning
parent: F-advanced-settings-section
status: done
title: Implement comprehensive warning and helper text system with proper visual hierarchy
priority: normal
prerequisites:
  - T-implement-data-management
  - T-implement-developer-options
created: "2025-07-28T11:13:40.924577"
updated: "2025-07-28T12:26:43.150365"
schema_version: "1.1"
worktree: null
---

# Implement Warning and Helper Text System with Visual Hierarchy

## Context

Ensure all warning and helper text throughout the Advanced Settings section follows the specified visual hierarchy and color system for effective risk communication and user guidance.

## Visual Hierarchy Requirements

### Warning Levels

- **Danger (Red)**: Irreversible destructive actions (Clear All Conversations)
- **Warning (Amber)**: Potentially risky but recoverable actions (Experimental Features)
- **Info (Muted)**: General helpful information (all helper text)

### Typography Specifications

- **Helper Text**: `text-[13px] text-muted-foreground`
- **Warning Text**: `text-[13px] text-destructive` (danger) or `text-[13px] text-amber-600 dark:text-amber-400` (warning)
- **Warning Icons**: 16px size (`h-4 w-4`), matching text color
- **Text Spacing**: 8px gap between buttons/controls and helper/warning text

## Implementation Requirements

### Data Management Warning System

- **Export Helper**: "Export settings as JSON file" - muted foreground
- **Import Helper**: "Import settings from JSON file" - muted foreground
- **Clear Warning**: "This cannot be undone" - danger/destructive color
- **Spacing**: 8px gap below each button (`mt-2` class)

### Developer Options Warning System

- **Debug Helper**: "Show detailed logs in developer console" - muted foreground
- **Experimental Warning**: "May cause instability" with AlertTriangle icon - amber color
- **Icon Integration**: Warning icon inline with text, proper alignment

### Color System Constants

Create reusable color system for consistency:

```tsx
const textColors = {
  helper: "text-[13px] text-muted-foreground",
  warning: "text-[13px] text-amber-600 dark:text-amber-400",
  danger: "text-[13px] text-destructive",
} as const;
```

### Spacing System

- **Button to text gap**: `mt-2` (8px)
- **Icon to text gap**: `gap-1` (4px)
- **Text line height**: `leading-normal` for readability

## Visual Treatment Requirements

### Warning Icon Integration

- Only experimental features toggle shows warning icon
- Icon positioned to the left of warning text
- Icon and text must be vertically centered
- Icon color matches text color exactly

### Responsive Considerations

- Text remains readable at all screen sizes
- Warning text maintains proper spacing on mobile
- Icons scale appropriately with text on different devices
- Touch targets remain accessible with warning text present

### Dark Mode Compatibility

- Amber warnings use `text-amber-600 dark:text-amber-400`
- Danger text uses theme-aware destructive color
- Helper text uses theme-aware muted foreground
- Icons inherit proper colors in both themes

## Implementation Details

### Component Integration

- Apply warning system to buttons created in T-implement-data-management
- Apply warning system to toggles created in T-implement-developer-options
- Ensure consistent spacing and typography across all elements

### Code Structure

```tsx
// Helper text component
const HelperText = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[13px] text-muted-foreground mt-2">{children}</div>
);

// Warning text component
const WarningText = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="text-[13px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
    {icon}
    {children}
  </div>
);

// Danger text component
const DangerText = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[13px] text-destructive mt-2">{children}</div>
);
```

## Acceptance Criteria

- [ ] All helper text uses exact `text-[13px] text-muted-foreground` styling
- [ ] Clear button warning uses `text-[13px] text-destructive` styling
- [ ] Experimental features warning uses amber color system for light/dark themes
- [ ] Warning icon (AlertTriangle) appears inline with experimental features text
- [ ] All text maintains 8px spacing below associated controls
- [ ] Icon and text are properly aligned vertically
- [ ] Text hierarchy clearly distinguishes between info, warning, and danger
- [ ] Typography is consistent across both Data Management and Developer Options
- [ ] Warning colors work correctly in both light and dark themes
- [ ] Text remains readable and properly spaced on mobile devices
- [ ] Visual hierarchy guides user attention to appropriate risk levels

## Testing Requirements

- Visual regression tests for text color accuracy in light/dark themes
- Test text spacing and alignment with associated controls
- Test warning icon alignment and color matching
- Test responsive behavior of warning text on mobile devices
- Accessibility tests for warning text announcement by screen readers
- Test color contrast ratios meet WCAG 2.1 AA standards
- Test visual hierarchy effectiveness for risk communication

## Technical Notes

- Use exact pixel values for font sizes as specified (13px)
- Follow established Tailwind color system for theme compatibility
- Ensure warning icon imports match existing icon usage patterns
- Maintain consistent spacing using Tailwind utility classes
- Test color accessibility in both light and dark mode variants

### Log

**2025-07-28T17:33:07.016122Z** - Implemented comprehensive warning and helper text system with proper visual hierarchy for Advanced Settings section. Created three reusable components (HelperText, WarningText, DangerText) following exact typography specifications with flexible className props for different layout contexts. Replaced all inline text elements with reusable components while maintaining accessibility relationships and exact visual styling requirements including proper spacing, color hierarchy, and icon integration.

- filesChanged: ["apps/desktop/src/components/settings/SettingsContent.tsx"]
