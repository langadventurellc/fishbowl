---
id: T-remove-search-functionality
title: Remove search functionality from LibraryTab component
status: open
priority: medium
parent: F-section-components-update
prerequisites:
  - T-remove-templates-tab-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-19T19:25:42.574Z
updated: 2025-08-19T19:25:42.574Z
---

## Purpose

Remove all search functionality from the LibraryTab component while maintaining the grid layout for agent cards and the "Create New Agent" button.

## Context

The current LibraryTab component has extensive search functionality including a search bar, filtering, debounced search, and empty search states. The feature requirements specify removing all search functionality to simplify the interface.

Location: `apps/desktop/src/components/settings/agents/AgentsSection.tsx` (LibraryTab component, lines 192-354)

## Detailed Implementation Requirements

### Search Functionality Removal

1. **Remove search imports and hooks**
   - Remove `useAgentSearch` import from `@fishbowl-ai/ui-shared`
   - Remove `Search`, `X` icon imports from lucide-react
   - Remove `useDebounce` hook import

2. **Remove search state and logic** (lines 203-214)
   - Remove all `useAgentSearch` hook usage
   - Remove `searchTerm`, `setSearchTerm`, `filteredAgents`, `isSearching`, `resultsCount`, `clearSearch`, `handleKeyDown` variables
   - Use direct `agents` state instead of `filteredAgents`

3. **Remove search UI components** (lines 229-300)
   - Remove the entire search bar section including:
     - Search input with Search icon
     - Clear button (X icon)
     - Loading indicator (Loader2)
     - Results count display
   - Remove hidden helper text for screen readers

4. **Simplify empty state logic** (lines 308-343)
   - Remove search-specific empty state with "No agents found" message
   - Keep only the `EmptyLibraryState` for when no agents exist
   - Remove `searchTerm` conditional logic

5. **Remove skip link references** (lines 219-227)
   - Update or remove the skip link that references search functionality
   - Ensure accessibility navigation still works properly

### Grid Layout Preservation

1. **Keep AgentGrid component usage** (line 342)
   - Maintain `<AgentGrid agents={agents} openEditModal={openEditModal} />`
   - Change from `filteredAgents` to direct `agents` prop

2. **Preserve responsive design**
   - Keep grid layout: 1 column mobile, 2 columns desktop
   - Maintain spacing and visual structure

3. **Keep Create button** (lines 347-352)
   - Preserve "Create New Agent" button with Plus icon
   - Maintain button positioning and styling

### Component Structure Updates

1. **Simplify main content area**
   - Remove complex conditional rendering for search states
   - Direct display: empty state OR agent grid

2. **Update accessibility**
   - Remove search-related aria labels and live regions
   - Maintain keyboard navigation for agent grid
   - Keep screen reader announcements for agent actions

## Acceptance Criteria

- ✅ No search box or search functionality visible
- ✅ Agent grid displays all agents without filtering
- ✅ Empty state shows when no agents exist
- ✅ "Create New Agent" button prominently displayed
- ✅ Responsive grid layout maintained (1 col mobile, 2 cols desktop)
- ✅ Keyboard navigation through agent cards works
- ✅ Edit/Delete actions on cards remain functional
- ✅ No search-related console errors or warnings

## Testing Requirements

- Test that all agents display without filtering
- Verify empty state shows when agents array is empty
- Test Create button opens agent creation modal
- Test Edit functionality on agent cards
- Verify keyboard navigation through simplified interface
- Test responsive behavior at different screen sizes

## Files to Modify

- `apps/desktop/src/components/settings/agents/AgentsSection.tsx` (LibraryTab component)

## Dependencies

- Requires Templates tab removal to be completed first
