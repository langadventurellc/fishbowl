---
id: T-extract-librarytab-as
title: Extract LibraryTab as separate component file
status: done
priority: medium
parent: F-section-components-update
prerequisites:
  - T-remove-search-functionality
affectedFiles:
  apps/desktop/src/components/settings/agents/LibraryTab.tsx: Created new
    component file containing LibraryTab component, AgentGrid component, and
    AgentGridProps interface extracted from AgentsSection.tsx. Includes all
    required imports, mock agent data, and full functionality for displaying and
    managing agent library.
  apps/desktop/src/components/settings/agents/AgentsSection.tsx:
    Removed LibraryTab component definition, AgentGrid component definition,
    AgentGridProps interface, and mock agents data. Added import for LibraryTab
    from './LibraryTab'. Cleaned up imports that are no longer needed.
  apps/desktop/src/components/settings/agents/index.ts: Added export for
    LibraryTab component to barrel export file for consistent module access.
log:
  - Successfully extracted LibraryTab component from AgentsSection.tsx into its
    own separate file. The extraction included moving the AgentGrid component
    and AgentGridProps interface since they are only used by LibraryTab. All
    functionality has been preserved including the simplified implementation
    without search functionality, responsive grid layout, keyboard navigation,
    empty state handling, and accessibility features. The extraction improves
    code organization and maintainability while following the existing patterns
    in the codebase.
schema: v1.0
childrenIds: []
created: 2025-08-19T19:26:29.520Z
updated: 2025-08-19T19:26:29.520Z
---

## Purpose

Extract the simplified LibraryTab component (after search removal) from the main AgentsSection.tsx file into its own separate component file for better code organization and maintainability.

## Context

After removing the search functionality, the LibraryTab component should be extracted as a separate component file following the same pattern as DefaultsTab. This will make the codebase more modular and easier to maintain.

Current location: `apps/desktop/src/components/settings/agents/AgentsSection.tsx` (LibraryTab component after search removal)
New location: `apps/desktop/src/components/settings/agents/LibraryTab.tsx`

## Detailed Implementation Requirements

### Create New LibraryTab Component File

1. **Create new file** `apps/desktop/src/components/settings/agents/LibraryTab.tsx`

2. **Move simplified component implementation**
   - Extract LibraryTab component (simplified version without search)
   - Include required imports:
     - React hooks: `useState`
     - UI components: `Button` from `../../ui/button`
     - Icons: `Plus` from lucide-react
     - Types: `AgentCard as AgentCardType` from `@fishbowl-ai/ui-shared`
     - Utilities: `announceToScreenReader`
     - Components: `AgentGrid`, `EmptyLibraryState`

3. **Component Structure**

   ```typescript
   interface LibraryTabProps {
     openCreateModal: () => void;
     openEditModal: (agent: AgentCardType) => void;
   }

   export const LibraryTab: React.FC<LibraryTabProps> = ({
     openCreateModal,
     openEditModal,
   }) => {
     // Simplified implementation without search
   };
   ```

### Simplified LibraryTab Features

1. **Agent Display**
   - Direct display of all agents without filtering
   - Grid layout for agent cards (1 column mobile, 2 columns desktop)
   - Empty state when no agents exist

2. **User Actions**
   - "Create New Agent" button prominently displayed
   - Edit functionality on agent cards
   - Delete functionality on agent cards

3. **Accessibility**
   - Proper aria labels for main content
   - Keyboard navigation through agent grid
   - Screen reader announcements for actions

### Update AgentsSection.tsx

1. **Remove LibraryTab component definition**
   - Remove entire simplified component implementation
   - Keep only the import and usage

2. **Add import for LibraryTab**
   - Import LibraryTab from `./LibraryTab`
   - Update tab configuration to use imported component

3. **Clean up imports**
   - Remove imports only used by LibraryTab
   - Remove AgentGrid import (now used by LibraryTab)

### Move AgentGrid Component

1. **Move AgentGrid to LibraryTab file**
   - Since AgentGrid is only used by LibraryTab, move it to the same file
   - Include AgentGridProps interface
   - Maintain all existing functionality and keyboard navigation

2. **Update imports**
   - Move grid-related imports to LibraryTab file
   - Include `useGridNavigation`, `useServices` for logging

## Acceptance Criteria

- ✅ LibraryTab component extracted to separate file
- ✅ No search functionality present (as per previous task)
- ✅ Grid displays agent cards properly without filtering
- ✅ Empty state shows when no agents exist
- ✅ "Create New Agent" button prominently displayed and functional
- ✅ Responsive grid layout maintained (1 col mobile, 2 cols desktop)
- ✅ Keyboard navigation through agent cards works
- ✅ Edit/Delete actions on cards functional
- ✅ AgentsSection correctly imports and uses extracted component
- ✅ No TypeScript errors in either file

## Testing Requirements

- Test agent grid display with all agents visible
- Verify Create button opens agent creation modal
- Test Edit/Delete functionality on agent cards
- Test empty state display when no agents exist
- Verify keyboard navigation through agent grid
- Test responsive layout at different screen sizes

## Files to Create/Modify

- **Create**: `apps/desktop/src/components/settings/agents/LibraryTab.tsx`
- **Modify**: `apps/desktop/src/components/settings/agents/AgentsSection.tsx`
- **Update**: `apps/desktop/src/components/settings/agents/index.ts` (barrel export)

## Dependencies

- Requires search functionality removal from LibraryTab to be completed first
- Should be done after DefaultsTab extraction for consistency
