---
kind: task
id: T-add-live-preview-functionality
parent: F-appearance-settings-section
status: done
title: Add live preview functionality for theme and font size changes
priority: normal
prerequisites:
  - T-create-chat-display-settings
created: "2025-07-27T18:46:35.240353"
updated: "2025-07-27T22:03:56.050157"
schema_version: "1.1"
worktree: null
---

# Add Live Preview Functionality

## Context

Enhance the appearance settings with live preview areas that provide immediate visual feedback for theme selection and font size changes. This creates a more interactive and intuitive user experience.

## Implementation Requirements

### Theme Preview Component

- Create a dedicated ThemePreview component with exact 200x100px dimensions
- Display visual representation of selected theme colors
- Show background, text, and accent color samples
- Update immediately when theme selection changes
- Border and styling to clearly indicate preview area

### Theme Preview Content

```tsx
const ThemePreview: React.FC<{ theme: string }> = ({ theme }) => (
  <div
    className="w-[200px] h-[100px] border rounded p-3 transition-colors"
    data-theme={theme}
    aria-label={`${theme} theme preview`}
  >
    <div className="text-sm font-medium">Preview</div>
    <div className="text-xs text-muted-foreground">Sample text</div>
    <div className="mt-2 w-full h-2 bg-primary rounded" />
  </div>
);
```

### Font Size Preview Component

- Create sample text that updates with font size changes
- Sample text: "This is how your messages will appear"
- Position below font size slider
- Apply current font size immediately to preview text
- Maintain proper line height and spacing

### Font Size Preview Implementation

```tsx
const FontSizePreview: React.FC<{ fontSize: number }> = ({ fontSize }) => (
  <div
    className="mt-3 p-3 border rounded bg-muted/20"
    aria-label="Font size preview"
  >
    <div style={{ fontSize: `${fontSize}px` }} className="text-foreground">
      This is how your messages will appear
    </div>
  </div>
);
```

### Live Update Behavior

- Theme preview changes instantly when radio selection changes
- Font size preview updates in real-time as slider moves
- Smooth transitions for theme changes (CSS transitions)
- No delays or lag in preview updates
- Performance optimization to prevent excessive re-renders

### Styling and Positioning

- Theme preview positioned appropriately within theme section
- Font size preview positioned below slider with proper spacing
- Clear visual indication that these are preview areas
- Consistent border and background styling
- Responsive behavior that maintains preview functionality on mobile

### Accessibility Requirements

- Preview areas have appropriate ARIA labels
- Screen readers can identify preview content
- Preview changes are announced appropriately
- Keyboard users can understand preview functionality
- Color contrast maintained in all preview states

### Unit Tests

Include functionality tests for preview components:

- Theme preview renders with correct default theme
- Theme preview updates when selection changes
- Font size preview renders with correct default size
- Font size preview updates when slider value changes
- Preview components have proper accessibility attributes
- CSS transitions work correctly for theme changes

## Files to Modify

- `apps/desktop/src/components/settings/SettingsContent.tsx` - Add preview components to AppearanceSettings

## Acceptance Criteria

- [ ] Theme preview area displays with exact 200x100px dimensions
- [ ] Theme preview shows visual representation of background, text, and accent colors
- [ ] Theme preview updates immediately when radio selection changes
- [ ] Font size preview displays sample text below slider
- [ ] Font size preview text updates in real-time as slider moves
- [ ] Sample text: "This is how your messages will appear"
- [ ] Smooth CSS transitions for theme preview changes
- [ ] No performance lag or excessive re-renders
- [ ] Preview areas have clear visual styling and borders
- [ ] Responsive behavior maintains preview functionality on mobile
- [ ] Accessibility labels present and functional for preview areas
- [ ] Basic unit tests pass for preview component rendering and updates

## Dependencies

- Completion of chat display settings (T-create-chat-display-settings)
- All previous appearance settings sections
- CSS transition support for smooth theme changes

### Log

**2025-07-28T03:13:19.573659Z** - Implemented comprehensive live preview functionality for theme and font size changes in the AppearanceSettings section. Created optimized ThemePreview and FontSizePreview components with React.memo, smooth CSS transitions, and full accessibility support. Added real-time updates for theme selection and font size changes with immediate visual feedback. Includes comprehensive unit tests covering all functionality, performance optimizations, and accessibility features. All quality checks pass with zero errors.

- filesChanged: ["apps/desktop/src/components/settings/SettingsContent.tsx", "apps/desktop/src/components/settings/__tests__/AppearanceSettings.test.tsx"]
