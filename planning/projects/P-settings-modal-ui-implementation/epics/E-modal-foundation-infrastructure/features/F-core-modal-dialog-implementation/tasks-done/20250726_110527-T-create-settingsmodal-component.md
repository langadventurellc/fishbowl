---
kind: task
id: T-create-settingsmodal-component
parent: F-core-modal-dialog-implementation
status: done
title: Create SettingsModal component with precise dimensions and positioning
priority: high
prerequisites:
  - T-install-and-setup-shadcn-ui
created: "2025-07-26T01:21:11.270822"
updated: "2025-07-26T10:56:38.886984"
schema_version: "1.1"
worktree: null
---

# Create SettingsModal Component with Precise Dimensions and Positioning

## Context

Create the main SettingsModal component that implements the exact dimensional and positioning requirements specified in the feature. This component will serve as the foundation for the settings interface with precise control over size, positioning, and visual styling. No automated tests should be created for this task.

## Technical Approach

Build a React component that wraps the shadcn/ui Dialog with custom styling to meet the specific requirements:

- Modal dimensions: 80% viewport width/height with min/max constraints
- Perfect centering in viewport
- Custom styling: 8px border radius, specific shadow
- Responsive behavior for different screen sizes

## Detailed Implementation Steps

### Component Structure

Create `apps/desktop/src/components/settings/SettingsModal.tsx` with:

```tsx
interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}
```

### Dimensional Requirements Implementation

- Width: 80% of viewport, max 1000px, min 800px
- Height: 80% of viewport, max 700px, min 500px
- Center positioning using CSS transforms
- Border radius: exactly 8px
- Box shadow: `0 10px 25px rgba(0, 0, 0, 0.3)`

### Custom CSS Classes

Create custom Tailwind classes or CSS-in-JS for:

- `.settings-modal-content` - Main modal container styling
- `.settings-modal-header` - Header section styling
- `.settings-modal-footer` - Footer section styling
- Responsive breakpoint adjustments

### Responsive Design Implementation

- Screens < 1000px: Modal takes 95% width
- Screens < 800px: Full width with proper margins
- Maintain aspect ratio and readability on all screen sizes

## Acceptance Criteria

- [ ] SettingsModal component created in correct directory structure
- [ ] Modal width: 80% viewport (max 1000px, min 800px)
- [ ] Modal height: 80% viewport (max 700px, min 500px)
- [ ] Perfect center positioning (horizontal and vertical)
- [ ] Border radius exactly 8px applied
- [ ] Box shadow: `0 10px 25px rgba(0, 0, 0, 0.3)` correctly rendered
- [ ] Semi-transparent overlay (bg-black/50) covers entire viewport
- [ ] Z-index properly managed (z-50 or higher)
- [ ] Responsive behavior works on screens < 1000px and < 800px
- [ ] Component accepts open/onOpenChange props for state control
- [ ] TypeScript types properly defined and exported

## Security Considerations

- Validate modal dimension inputs to prevent CSS injection
- Ensure proper escape handling for modal interactions
- Implement proper focus management within modal boundaries
- Sanitize any dynamic content passed to modal

## Performance Requirements

- Modal open/close animation completes within 200ms
- No layout thrashing during resize operations
- Smooth performance on lower-end hardware
- Proper cleanup of event listeners on unmount

## Files Created/Modified

- `apps/desktop/src/components/settings/SettingsModal.tsx` (created)
- `apps/desktop/src/components/settings/index.ts` (updated/created for exports)
- Custom CSS/Tailwind classes for modal styling

## Dependencies

- Requires T-install-and-setup-shadcn-ui to be completed
- Depends on shadcn/ui Dialog component being available

### Log

**2025-07-26T16:05:27.418301Z** - Created SettingsModal component with precise dimensions and positioning as specified. Component wraps shadcn/ui Dialog with custom styling: 80% viewport size with min/max constraints (800px/500px min, 1000px/700px max), perfect centering, 8px border radius, and custom shadow. Includes responsive behavior for smaller screens and comprehensive TypeScript interfaces. All quality checks passing.

- filesChanged: ["packages/shared/src/types/ui/components/SettingsModalProps.ts", "packages/shared/src/types/ui/components/index.ts", "apps/desktop/src/components/settings/SettingsModal.tsx", "apps/desktop/src/components/settings/index.ts"]
