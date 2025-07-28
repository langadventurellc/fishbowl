---
kind: task
id: T-implement-developer-options
title: Implement Developer Options toggles with state management and warning indicators
status: open
priority: high
prerequisites:
  - T-replace-placeholder-advanced
created: "2025-07-28T11:13:03.145551"
updated: "2025-07-28T11:13:03.145551"
schema_version: "1.1"
parent: F-advanced-settings-section
---

# Implement Developer Options Toggles with State Management

## Context

Replace the placeholder toggle mockups in the Developer Options group with functional shadcn/ui Switch components that provide proper state management, visual feedback, and warning indicators.

## Implementation Requirements

### Debug Mode Toggle

- **Label**: "Enable debug logging"
- **Switch Component**: Use shadcn/ui Switch with proper styling
- **Helper Text**: "Show detailed logs in developer console" (13px, muted foreground)
- **State Management**: Local React state with proper UI updates
- **Default State**: `false` (off)
- **Layout**: Follow existing switch patterns from AppearanceSettings (lines 613-617, 627-631)

### Experimental Features Toggle

- **Label**: "Enable experimental features"
- **Switch Component**: Identical styling to Debug Mode toggle
- **Warning Text**: "May cause instability" in amber color (13px)
- **Warning Icon**: `AlertTriangle` from Lucide React (16px, amber color)
- **State Management**: Local React state with proper UI updates
- **Default State**: `false` (off)
- **Visual Treatment**: Distinct amber warning color for risk communication

### Layout Pattern

Use established switch container pattern from existing settings:

```tsx
<div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
  <div className="space-y-0.5">
    <Label className="text-base">{label}</Label>
    <div className="text-[13px] text-muted-foreground">{helperText}</div>
    {/* Warning text for experimental features */}
    <div className="text-[13px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
      <AlertTriangle className="h-4 w-4" />
      {warningText}
    </div>
  </div>
  <Switch checked={value} onCheckedChange={setValue} />
</div>
```

### State Management Implementation

```tsx
const [debugMode, setDebugMode] = useState(false);
const [experimentalFeatures, setExperimentalFeatures] = useState(false);
```

### Warning Color System

- **Amber Text**: `text-amber-600 dark:text-amber-400`
- **Icon Size**: 16px (h-4 w-4)
- **Icon-Text Gap**: 4px (gap-1)
- **Warning Icon**: Only for experimental features toggle

## Code Implementation

### Component Location

- File: `apps/desktop/src/components/settings/SettingsContent.tsx`
- Import: `Switch`, `Label`, `AlertTriangle` from appropriate sources
- Follow existing switch patterns from AppearanceSettings section

### Styling Requirements

- Container: `flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm`
- Label section: `space-y-0.5` for proper text spacing
- Label: `text-base` for main toggle labels
- Helper text: `text-[13px] text-muted-foreground`
- Warning text: `text-[13px] text-amber-600 dark:text-amber-400`
- Warning container: `flex items-center gap-1` for icon-text alignment

### Accessibility Requirements

- Switch components have proper ARIA labels
- Helper text associated with controls via `aria-describedby`
- Warning text properly announced by screen readers
- Keyboard navigation works for both toggles
- Focus indicators are visible and consistent
- Toggle state changes are announced

## Acceptance Criteria

- [ ] Debug Mode toggle renders with proper label and helper text
- [ ] Experimental Features toggle renders with label, helper text, and amber warning
- [ ] Both toggles use identical switch styling and container layout
- [ ] Warning icon (AlertTriangle) displays next to experimental features warning
- [ ] Toggle states change correctly when clicked/interacted with
- [ ] Helper text uses correct muted foreground color (13px)
- [ ] Warning text uses correct amber color system for light/dark themes
- [ ] Layout matches existing switch patterns from other settings sections
- [ ] Switches provide immediate visual feedback when toggled
- [ ] Container styling matches established border/shadow/padding patterns
- [ ] Accessibility attributes provide proper screen reader support
- [ ] Keyboard navigation works for both switches
- [ ] Focus states are visible and consistent with design system

## Testing Requirements

- Unit tests for toggle rendering with correct labels and styling
- Test state changes when toggles are clicked
- Test warning text and icon display for experimental features
- Accessibility tests for ARIA labels and keyboard navigation
- Visual tests for amber warning color in light/dark themes
- Test responsive layout behavior
- Test switch state persistence during component re-renders

## Technical Notes

- Follow the established switch pattern from existing settings sections
- Use the same container and layout styling as other toggles in the app
- Import `AlertTriangle` from `lucide-react` for warning icon
- Maintain local state for UI demonstration (no persistence needed yet)
- Ensure warning color system works in both light and dark themes

### Log
