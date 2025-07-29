---
kind: task
id: T-replace-appearancesettings
parent: F-appearance-settings-section
status: done
title: Replace AppearanceSettings placeholder with theme selection UI
priority: high
prerequisites: []
created: "2025-07-27T18:45:34.183012"
updated: "2025-07-27T21:24:03.420126"
schema_version: "1.1"
worktree: null
---

# Replace AppearanceSettings Placeholder with Theme Selection UI

## Context

Replace the current placeholder AppearanceSettings component in `apps/desktop/src/components/settings/SettingsContent.tsx` (lines 407-442) with a fully functional theme selection section. This task focuses on UI/UX implementation without connecting to actual theme switching functionality.

## Implementation Requirements

### Component Structure

Replace the existing AppearanceSettings component with:

- Section title: "Appearance" with 24px font and 20px margin-bottom
- Section description: "Customize the appearance and theme of the application"
- Theme selection group with proper visual hierarchy

### Theme Selection Group

- Group title: "Theme" with 18px font, semi-bold weight
- Use shadcn/ui RadioGroup component in vertical layout
- Three theme options:
  - "Light" radio button with proper label
  - "Dark" radio button with proper label
  - "System" radio button with label and helper text
- Local state management for UX demonstration (no persistence needed)

### Theme Preview Area

- Exactly 200px width × 100px height preview area
- Static visual representation showing theme colors
- Background, text, and accent color representation
- Border and styling to clearly indicate preview area
- Placeholder content showing theme concept

### Technical Approach

```tsx
// Use existing patterns from GeneralSettings
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Local state for UX demonstration
const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "system">(
  "system",
);

// Follow existing component structure and styling patterns
```

### Styling Requirements

- Follow exact spacing and typography from feature specification
- Use consistent styling patterns from GeneralSettings component
- Implement responsive behavior for mobile devices
- Ensure proper visual hierarchy with existing modal structure

### Accessibility Requirements

- Proper ARIA attributes for radio group
- Screen reader compatible labels and descriptions
- Keyboard navigation support
- Focus indicators matching existing patterns

### Unit Tests

Include basic unit tests in the same task:

- Component renders without errors
- Radio group selection updates state correctly
- Preview area displays with correct dimensions
- Accessibility attributes are present

## Files to Modify

- `apps/desktop/src/components/settings/SettingsContent.tsx` - Replace AppearanceSettings component (lines 407-442)

## Acceptance Criteria

- [ ] Theme selection radio group renders with vertical layout
- [ ] Three theme options (Light, Dark, System) with proper labels
- [ ] Preview area displays with exact 200x100px dimensions
- [ ] Local state management works for selection demonstration
- [ ] Component follows existing styling patterns from GeneralSettings
- [ ] Responsive behavior works on mobile devices
- [ ] Basic unit tests pass for rendering and state management
- [ ] Accessibility attributes present and functional

## Dependencies

- Existing shadcn/ui RadioGroup component
- Existing form patterns from GeneralSettings
- Current settings modal structure and styling

### Log

**2025-07-28T02:35:36.243743Z** - Successfully replaced AppearanceSettings placeholder with fully functional theme selection UI featuring shadcn/ui RadioGroup component for Light/Dark/System theme options, 200x100px live theme preview area with color mapping, local state management, and comprehensive accessibility support. Implementation follows exact design specifications and existing GeneralSettings patterns. Includes complete unit test suite with 8 passing tests covering rendering, interaction, accessibility, and visual hierarchy.

- filesChanged: ["apps/desktop/src/components/settings/SettingsContent.tsx", "apps/desktop/src/components/settings/__tests__/AppearanceSettings.test.tsx"]
