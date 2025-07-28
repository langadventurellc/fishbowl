---
kind: task
id: T-replace-placeholder-advanced
parent: F-advanced-settings-section
status: done
title: Replace placeholder Advanced Settings with proper section structure and typography
priority: high
prerequisites: []
created: "2025-07-28T11:11:58.878630"
updated: "2025-07-28T11:17:13.353546"
schema_version: "1.1"
worktree: null
---

# Replace Advanced Settings Placeholder Structure

## Context

The current Advanced Settings section in `apps/desktop/src/components/settings/SettingsContent.tsx` (lines 837-874) contains placeholder mockups that need to be replaced with proper structure and exact typography specifications.

## Implementation Requirements

### Typography Corrections

- Change section title from `text-2xl` to exact `text-[24px]` font size
- Add exact `mb-[20px]` margin-bottom to section title
- Ensure group titles use `text-[18px] font-semibold mb-4`
- Apply consistent helper text styling: `text-[13px] text-muted-foreground`

### Structure Updates

- Remove existing placeholder `<div>` elements with muted backgrounds
- Create proper semantic structure with clear group separation
- Implement proper spacing using `space-y-6` for sections and `space-y-4` for groups
- Prepare component structure for functional buttons and toggles (next tasks)

### Code Location

- File: `apps/desktop/src/components/settings/SettingsContent.tsx`
- Component: `AdvancedSettings` (lines 837-874)
- Pattern to follow: Existing settings sections like `GeneralSettings` and `AppearanceSettings`

## Acceptance Criteria

- [ ] Section title uses exact `text-[24px] font-bold mb-[20px]` styling
- [ ] Section description maintains existing content and styling
- [ ] Data Management group title uses `text-[18px] font-semibold mb-4`
- [ ] Developer Options group title uses consistent styling
- [ ] Placeholder mockups are removed and replaced with proper semantic structure
- [ ] Spacing follows established patterns (`space-y-6` for sections, `space-y-4` for groups)
- [ ] Structure is ready for functional components to be added in subsequent tasks
- [ ] Component maintains existing accessibility structure
- [ ] Visual layout matches other settings sections for consistency

## Testing Requirements

- Write unit tests for component rendering with correct typography
- Test responsive layout behavior
- Verify accessibility attributes are preserved
- Test that structure matches design specifications

## Technical Notes

- Follow existing patterns from other settings sections
- Maintain the same semantic HTML structure
- Keep existing CSS classes where appropriate
- Ensure no breaking changes to parent component integration

### Log

**2025-07-28T16:25:59.332284Z** - Successfully replaced placeholder Advanced Settings section with proper semantic structure and exact typography specifications. Fixed section title from text-2xl to text-[24px] font-bold mb-[20px], updated group titles to text-[18px] font-semibold mb-4, and applied consistent helper text styling with text-[13px] text-muted-foreground. Removed all placeholder muted background divs and created proper semantic structure for Data Management group (Export Settings, Import Settings, Clear All Conversations) and Developer Options group (Debug Mode, Experimental Features). Added proper container structure with max-w-[600px] mx-auto px-4 sm:px-6 to match other settings sections. Structure is now ready for functional buttons and toggles to be added in subsequent tasks.

- filesChanged: ["apps/desktop/src/components/settings/SettingsContent.tsx"]
