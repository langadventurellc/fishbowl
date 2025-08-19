---
id: T-extract-defaultstab-as
title: Extract DefaultsTab as separate component file
status: open
priority: medium
parent: F-section-components-update
prerequisites:
  - T-remove-templates-tab-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-19T19:26:06.035Z
updated: 2025-08-19T19:26:06.035Z
---

## Purpose

Extract the DefaultsTab component from the main AgentsSection.tsx file into its own separate component file for better code organization and maintainability.

## Context

The current DefaultsTab component (lines 526-814) is defined inline within AgentsSection.tsx. Following the pattern established by other components and preparing for future development, this should be extracted as a separate component file.

Current location: `apps/desktop/src/components/settings/agents/AgentsSection.tsx` (lines 526-814)
New location: `apps/desktop/src/components/settings/agents/DefaultsTab.tsx`

## Detailed Implementation Requirements

### Create New DefaultsTab Component File

1. **Create new file** `apps/desktop/src/components/settings/agents/DefaultsTab.tsx`

2. **Move component implementation**
   - Extract entire DefaultsTab component (lines 526-814)
   - Include all imports needed by the component:
     - React hooks: `useState`, `useMemo`, `useCallback`
     - UI components: `Button`, `Input`, `Label`, `Slider`, `Tooltip`, `TooltipContent`, `TooltipTrigger`
     - Types: `AgentDefaults` from `@fishbowl-ai/ui-shared`
     - Utilities: `useDebounce`, `announceToScreenReader`, `getSliderDescription`, `createSliderKeyHandler`

3. **Add proper exports**
   - Export DefaultsTab as named export
   - Add component documentation with JSDoc

### Update AgentsSection.tsx

1. **Remove DefaultsTab component definition** (lines 526-814)
   - Remove entire component implementation
   - Keep only the import and usage

2. **Add import for DefaultsTab**
   - Import DefaultsTab from `./DefaultsTab`
   - Update barrel export in index file if needed

3. **Clean up unnecessary imports**
   - Remove imports that are only used by DefaultsTab
   - Keep imports needed by remaining components

### Component Structure

The extracted DefaultsTab should maintain all current functionality:

1. **Configuration Controls**
   - Temperature slider (0-2) with real-time descriptions
   - Max tokens input (1-4000) with validation
   - Top P slider (0-1) with real-time descriptions
   - Reset to defaults button with confirmation dialog

2. **Accessibility Features**
   - Proper ARIA labels and descriptions
   - Keyboard navigation support
   - Screen reader announcements
   - Tooltip explanations

3. **Visual Design**
   - Two-column layout with settings and preview
   - Responsive design
   - Real-time preview panel

## Acceptance Criteria

- ✅ DefaultsTab component extracted to separate file
- ✅ All functionality preserved (temperature, max tokens, top P, reset)
- ✅ Real-time preview panel works correctly
- ✅ Reset confirmation dialog appears and functions
- ✅ All accessibility features maintained
- ✅ AgentsSection correctly imports and uses extracted component
- ✅ No TypeScript errors in either file
- ✅ Component follows established file organization patterns

## Testing Requirements

- Test all three configuration controls (temperature, max tokens, top P)
- Verify reset button shows confirmation and resets values
- Test keyboard navigation and accessibility
- Verify real-time preview updates correctly
- Test responsive layout at different screen sizes

## Files to Create/Modify

- **Create**: `apps/desktop/src/components/settings/agents/DefaultsTab.tsx`
- **Modify**: `apps/desktop/src/components/settings/agents/AgentsSection.tsx`
- **Update**: `apps/desktop/src/components/settings/agents/index.ts` (barrel export)

## Dependencies

- Requires Templates tab removal to be completed first
- Can be done in parallel with LibraryTab search removal
