---
id: F-section-components-update
title: Section Components Update
status: done
priority: medium
parent: E-ui-components
prerequisites:
  - F-agent-form-simplification
affectedFiles:
  apps/desktop/src/components/settings/agents/AgentsSection.tsx:
    Removed Templates tab, mockTemplates data, TemplatesTab component,
    template-related imports, modal state properties, and openTemplateModal
    handler. Updated tab configuration to only include Library and Defaults
    tabs. Updated JSDoc documentation to reflect two-tab navigation.; Removed
    inline DefaultsTab component definition (lines 354-642). Added import for
    DefaultsTab from './DefaultsTab'. Cleaned up unused imports that were only
    needed by DefaultsTab (removed AgentDefaults type, useMemo, useDebounce,
    getSliderDescription, createSliderKeyHandler, Label, Slider, Tooltip
    components). Preserved all other functionality and imports needed by
    remaining components.; Removed all search functionality from LibraryTab
    component - removed useAgentSearch hook, search imports (Search, X icons),
    search UI components (search bar, clear button, loading indicator, results
    count), search-specific empty states, and simplified logic to use direct
    agents array instead of filteredAgents; Removed LibraryTab component
    definition, AgentGrid component definition, AgentGridProps interface, and
    mock agents data. Added import for LibraryTab from './LibraryTab'. Cleaned
    up imports that are no longer needed.
  apps/desktop/src/components/settings/agents/__tests__/AgentsSection.test.tsx:
    Updated unit tests to reflect the new two-tab structure by removing all
    template-related test assertions and expectations. Updated test descriptions
    and assertions to match the Library and Defaults only structure.; Updated
    tests to match new implementation without search functionality - removed
    useAgentSearch mock and search-related test assertions while preserving
    tests for other functionality like Create button and agent display
  apps/desktop/src/components/settings/agents/DefaultsTab.tsx:
    Created new DefaultsTab component file with extracted code from
    AgentsSection.tsx. Includes all configuration controls, preview panel,
    accessibility features, and JSDoc documentation. Component maintains exact
    same functionality as original inline version.
  apps/desktop/src/components/settings/agents/index.ts: Added DefaultsTab to
    barrel exports to maintain consistent import patterns across the codebase.;
    Added export for LibraryTab component to barrel export file for consistent
    module access.
  apps/desktop/src/components/settings/agents/LibraryTab.tsx: Created new
    component file containing LibraryTab component, AgentGrid component, and
    AgentGridProps interface extracted from AgentsSection.tsx. Includes all
    required imports, mock agent data, and full functionality for displaying and
    managing agent library.
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-extract-defaultstab-as
  - T-extract-librarytab-as
  - T-remove-search-functionality
  - T-remove-templates-tab-and
created: 2025-08-19T16:01:11.431Z
updated: 2025-08-19T16:01:11.431Z
---

## Purpose and Functionality

Update the AgentsSection component to match the final design specification by removing the Templates tab, refining the Library and Defaults tabs, and ensuring consistent integration with the settings modal navigation. This feature completes the UI implementation by organizing the agent management interface into its final two-tab structure.

## Key Components to Update

### AgentsSection Component Modifications

- Remove Templates tab completely from tab configuration
- Remove all template-related code and imports
- Keep only Library and Defaults tabs
- Maintain TabContainer integration for consistent behavior
- Preserve modal infrastructure for create/edit operations
- Update component documentation to reflect new structure

### LibraryTab Component Updates

- Remove search functionality (search bar and related logic)
- Maintain grid layout for agent cards
- Keep "Create New Agent" button
- Preserve empty state for when no agents exist
- Ensure responsive design (1 column mobile, 2 columns desktop)
- Maintain keyboard navigation for agent grid

### DefaultsTab Component Refinements

- Temperature slider (0-2) with real-time description
- Max tokens input (1-4000) with validation
- Top P slider (0-1) with real-time description
- Reset to defaults button with confirmation dialog
- Settings preview panel showing human-readable values
- Maintain all accessibility features

## Detailed Acceptance Criteria

### AgentsSection Requirements

- ✅ Templates tab completely removed from codebase
- ✅ Only Library and Defaults tabs present
- ✅ Tab navigation works correctly with two tabs
- ✅ Modal infrastructure preserved for agent operations
- ✅ Integration with settings modal navigation maintained
- ✅ 200ms animation transitions preserved

### LibraryTab Requirements

- ✅ No search box or search functionality
- ✅ Grid displays agent cards properly
- ✅ Empty state shows when no agents exist
- ✅ Create button prominently displayed
- ✅ Responsive grid layout (1 col mobile, 2 cols desktop)
- ✅ Keyboard navigation through agent cards works
- ✅ Edit/Delete actions on cards functional

### DefaultsTab Requirements

- ✅ All three configuration controls present
- ✅ Temperature slider shows descriptive text
- ✅ Max tokens validates numeric input
- ✅ Top P slider shows descriptive text
- ✅ Reset button shows confirmation before resetting
- ✅ Preview panel updates in real-time
- ✅ All controls keyboard accessible

## Technical Requirements

### Tab Configuration

```typescript
const tabs: TabConfiguration[] = [
  {
    id: "library",
    label: "Library",
    content: () => <LibraryTab />
  },
  {
    id: "defaults",
    label: "Defaults",
    content: () => <DefaultsTab />
  }
];
```

### Component Structure

```
apps/desktop/src/components/settings/agents/
├── AgentsSection.tsx (modified)
├── LibraryTab.tsx (new/updated)
├── DefaultsTab.tsx (new/updated)
├── AgentCard.tsx (existing)
└── AgentFormModal.tsx (existing)
```

### State Management

- Library tab connects to agents store when implemented
- Defaults tab manages local state for settings
- Modal state managed by AgentsSection parent

## Implementation Guidance

1. **Start by removing Templates tab** from AgentsSection
2. **Extract LibraryTab** as separate component or update inline
3. **Extract DefaultsTab** as separate component or update inline
4. **Remove all search-related code** from LibraryTab
5. **Ensure TabContainer** integration still works correctly
6. **Test keyboard navigation** through simplified interface
7. **Verify responsive breakpoints** for grid layout
8. **Follow patterns** from RolesSection with its single list view

## Testing Requirements

- Test tab navigation between Library and Defaults
- Test agent grid layout at different screen sizes
- Test empty state in Library tab
- Test all controls in Defaults tab
- Test reset confirmation dialog
- Test keyboard navigation through interface
- Test screen reader announcements
- Verify no Template tab code remains

## Security Considerations

- Validate defaults values before saving
- Ensure reset confirmation prevents accidental data loss
- Sanitize any user inputs in defaults
- Maintain proper access control for agent operations

## Performance Requirements

- Tab switching should be instant (< 100ms)
- Grid layout should render smoothly
- Settings preview updates in real-time
- No lag when adjusting sliders
- Smooth 200ms transitions between tabs
