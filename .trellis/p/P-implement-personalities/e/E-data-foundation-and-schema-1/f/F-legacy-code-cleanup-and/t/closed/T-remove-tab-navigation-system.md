---
id: T-remove-tab-navigation-system
title: Remove tab navigation system from personalities
status: done
priority: medium
parent: F-legacy-code-cleanup-and
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx:
    Completely removed TabContainer usage and replaced with unified layout
    showing both SavedPersonalitiesTab and CreatePersonalityForm components in a
    single view with visual separation
  packages/ui-shared/src/stores/settings/settingsSubTab.ts: Removed 'saved' and
    'create-new' tab types from SettingsSubTab since personalities no longer
    uses tabs
  packages/ui-shared/src/stores/settings/settingsStore.ts: Updated VALID_SUB_TABS array to remove the removed tab types
  apps/desktop/src/components/settings/SettingsNavigation.tsx:
    "Changed personalities section from hasSubTabs: true to hasSubTabs: false
    and removed subTabs array"
  apps/desktop/src/components/settings/__tests__/TabsIntegration.test.tsx:
    Removed personalities-specific tab test and updated roles test to use valid
    tab types
log:
  - Successfully removed the tab navigation system from personalities section
    and converted it to a unified single-screen layout. Eliminated "Saved" and
    "Create New" tabs, removed tab-related types from SettingsSubTab, updated
    navigation configuration, and cleaned up tests. The personalities section
    now displays both saved personalities and the create form in a single view
    with clear visual separation.
schema: v1.0
childrenIds: []
created: 2025-08-15T18:10:09.607Z
updated: 2025-08-15T18:10:09.607Z
---

# Remove Tab Navigation System from Personalities

## Context

Remove the tab-based navigation system from personalities section, including "Saved" and "Create New" tabs, to prepare for the unified single-screen interface that matches the roles section design.

## Implementation Requirements

### Components to Remove/Update

1. **Tab Components**:
   - Remove `PersonalityFormTabs.tsx` (if exists)
   - Remove tab navigation from `PersonalitiesSection.tsx`
   - Remove "Saved" tab component and logic
   - Remove "Create New" tab component and logic

2. **Tab State Management**:
   - Remove active tab state management
   - Remove tab switching logic and handlers
   - Remove tab-related routing logic
   - Remove tab persistence state

3. **Tab-Related UI Elements**:
   - Remove tab headers and navigation
   - Remove tab content containers
   - Remove tab-specific styling and classes
   - Remove tab indicator components

### Files Likely to Contain Tab Logic

```
apps/desktop/src/components/settings/personalities/
├── PersonalitiesSection.tsx      # Remove tab navigation wrapper
├── PersonalityFormTabs.tsx       # Remove entirely if exists
├── SavedPersonalities.tsx        # May be removed or converted
└── CreatePersonalityForm.tsx     # Remove tab-specific props

packages/ui-shared/src/
├── types/personalities/TabTypes.ts  # Remove tab-related types
└── hooks/useTabState.ts             # Remove if personality-specific
```

### State and Props Cleanup

- Remove `activeTab` state from personalities components
- Remove `onTabChange` handlers and props
- Remove tab-related prop interfaces
- Remove tab routing logic

### Code Patterns to Remove

```typescript
// Remove patterns like these:
const [activeTab, setActiveTab] = useState('saved');
const handleTabChange = (tab: string) => { ... };

// Remove tab-related props:
interface PersonalitiesProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

// Remove tab rendering logic:
{activeTab === 'saved' && <SavedPersonalities />}
{activeTab === 'create' && <CreatePersonalityForm />}
```

## Acceptance Criteria

- [ ] No tab navigation components remain in personalities section
- [ ] No "Saved" and "Create New" tab logic exists
- [ ] No active tab state management remains
- [ ] No tab switching handlers or props exist
- [ ] No tab-related routing logic remains
- [ ] No tab-specific styling or CSS classes remain
- [ ] Tab-related types and interfaces removed
- [ ] PersonalitiesSection simplified to single-screen layout
- [ ] Application builds successfully after tab removal
- [ ] No TypeScript errors from removed tab interfaces
- [ ] UI displays unified interface without tab navigation

## UI Transformation Required

- Convert from tabbed interface to single unified view
- Merge tab contents into single component layout
- Remove tab headers and navigation elements
- Simplify component hierarchy without tab containers
- Prepare for list-based interface similar to roles section

## Testing Requirements (include in this task)

- Test personalities section displays without tab navigation
- Test no tab-related state management remains
- Test component rendering works with simplified structure
- Test no console errors from removed tab logic
- Update unit tests to remove tab-related expectations
- Verify TypeScript compilation succeeds

## Design Considerations

- Plan layout for unified personality interface
- Consider how to merge "saved" and "create" functionality
- Prepare component structure for future list-based design
- Ensure consistent styling with roles section approach

## Breaking Changes Documentation

- Document removed tab-related components
- Note any tab props removed from personality components
- List tab-related hooks or utilities being removed
- Provide guidance for components that used tab system

## Dependencies

- Can be completed independently of other cleanup tasks
- Review current tab implementation to understand removal scope
