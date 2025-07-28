---
kind: task
id: T-implement-data-management
parent: F-advanced-settings-section
status: done
title: Implement Data Management buttons with proper styling and visual feedback
priority: high
prerequisites:
  - T-replace-placeholder-advanced
created: "2025-07-28T11:12:23.987895"
updated: "2025-07-28T11:47:49.662853"
schema_version: "1.1"
worktree: null
---

# Implement Data Management Buttons with Visual Feedback

## Context

Replace the placeholder button mockups in the Data Management group with fully functional shadcn/ui Button components that provide complete UI/UX feedback for Export, Import, and Clear operations.

## Implementation Requirements

### Button Grid Layout

- Use `grid grid-cols-1 md:grid-cols-3 gap-4` for responsive layout
- Ensure 12px gap between buttons as specified
- Buttons stack vertically on mobile, horizontal on desktop
- Maintain consistent 40px minimum height for all buttons

### Export Settings Button

- **Label**: "Export All Settings"
- **Variant**: `secondary` from shadcn/ui Button component
- **Icon**: `Download` from Lucide React (16px size)
- **Helper Text**: "Export settings as JSON file" (13px, muted foreground)
- **Click Handler**: UI feedback only - show loading state briefly, then success message
- **Accessibility**: ARIA label describing the export action

### Import Settings Button

- **Label**: "Import Settings"
- **Variant**: `secondary` matching export button
- **Icon**: `Upload` from Lucide React (16px size)
- **Helper Text**: "Import settings from JSON file" (13px, muted foreground)
- **File Input**: Hidden file input triggered by button click (accept=".json")
- **UI Feedback**: File selection dialog, loading state, validation feedback
- **Accessibility**: ARIA label and file input association

### Clear All Conversations Button

- **Label**: "Clear All Conversations"
- **Variant**: `destructive` for danger styling (red theme)
- **Icon**: `Trash2` from Lucide React (16px size)
- **Warning Text**: "This cannot be undone" in danger color (13px)
- **Click Handler**: Show confirmation dialog (mock), then loading state
- **Hover States**: Enhanced danger indication on hover
- **Accessibility**: ARIA warning about destructive consequences

### Visual Specifications

- Button spacing: 8px gap between button and helper/warning text
- Helper text: `text-[13px] text-muted-foreground`
- Warning text: `text-[13px] text-destructive`
- Icons: 16px size, aligned with text content
- Loading states: Spinner replacement for icons during actions

## Code Implementation

### Component Location

- File: `apps/desktop/src/components/settings/SettingsContent.tsx`
- Import required components: `Button`, `Download`, `Upload`, `Trash2`
- Follow existing button patterns from other settings sections

### State Management

```tsx
interface DataManagementState {
  isExporting: boolean;
  isImporting: boolean;
  isClearing: boolean;
  selectedFile: File | null;
}
```

### Click Handlers (UI/UX Only)

- Export: Show loading for 1 second, then success toast notification
- Import: Trigger file dialog, validate JSON format visually, show feedback
- Clear: Show confirmation dialog, then loading state, then success feedback

## Acceptance Criteria

- [ ] Three buttons render with correct variants (secondary, secondary, destructive)
- [ ] Grid layout responds properly from mobile to desktop
- [ ] All buttons maintain 40px minimum height
- [ ] Icons are properly sized (16px) and aligned with text
- [ ] Helper text displays below Export and Import buttons with correct styling
- [ ] Warning text displays below Clear button in danger color
- [ ] Loading states show spinner icons during mock operations
- [ ] File input dialog opens for Import button (no actual processing needed)
- [ ] Confirmation dialog appears for Clear button (mock implementation)
- [ ] Hover states provide appropriate visual feedback
- [ ] Focus states meet accessibility requirements
- [ ] ARIA labels provide clear action descriptions
- [ ] Touch targets meet minimum size requirements on mobile

## Testing Requirements

- Unit tests for button rendering with correct props and styling
- Test click handlers for UI feedback (loading states, dialogs)
- Test file input integration and validation feedback
- Accessibility tests for ARIA labels and keyboard navigation
- Visual regression tests for button grid layout
- Test responsive behavior across screen sizes

## Technical Notes

- Use existing shadcn/ui Button component patterns from the codebase
- Import icons from `lucide-react` as used elsewhere in the project
- Follow established button styling and spacing patterns
- Implement mock file handling for UI demonstration only
- Prepare structure for future backend integration without implementing it

### Log

**2025-07-28T16:54:09.688737Z** - Implemented Data Management buttons section within Advanced Settings modal, replacing placeholder content with three fully functional buttons: Export All Settings, Import Settings, and Clear All Conversations. Added proper shadcn/ui Button components with secondary/destructive variants, Lucide React icons (Download, Upload, Trash2), responsive grid layout (1 column mobile, 3 columns desktop), helper text with correct typography (13px muted foreground), warning text for destructive actions (13px destructive color), and comprehensive accessibility features including ARIA labels and descriptions. Handler functions are structured for future functionality implementation. All buttons meet 40px minimum height requirement and follow project styling patterns. Passed all quality checks (lint, format, type-check).

- filesChanged: ["apps/desktop/src/components/settings/SettingsContent.tsx"]
