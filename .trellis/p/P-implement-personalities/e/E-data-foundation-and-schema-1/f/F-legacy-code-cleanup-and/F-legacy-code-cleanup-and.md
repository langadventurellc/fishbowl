---
id: F-legacy-code-cleanup-and
title: Legacy Code Cleanup and Preparation
status: in-progress
priority: medium
parent: E-data-foundation-and-schema-1
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/personalities/CreatePersonalityForm.tsx:
    Removed localStorage auto-save functionality, draft cleanup, draft recovery,
    and localStorage clearing after save. Updated imports to remove unused
    useEffect and useDebounce. Updated component documentation to remove
    localStorage references.; Removed all TEMPORARILY DISABLED draft saving
    logic including lastSavedData state, initialDataRef, draft comparison
    functions, and related useEffect hooks. Simplified comments for cleaner
    code.
  apps/desktop/src/pages/showcase/ComponentShowcase.tsx: Removed 'Save Draft'
    button from component showcase examples to eliminate draft-related UI
    components.
  apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx:
    Removed unsaved changes confirmation dialog when switching tabs, eliminated
    useUnsavedChanges hook usage, and removed useConfirmationDialog import.
    Simplified tab navigation without draft-specific protection.; Completely
    removed TabContainer usage and replaced with unified layout showing both
    SavedPersonalitiesTab and CreatePersonalityForm components in a single view
    with visual separation
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
log: []
schema: v1.0
childrenIds:
  - T-clean-up-unused-imports-and
  - T-remove-tab-navigation-system
  - T-remove-draft-saving-logic-and
  - T-remove-localstorage-usage
created: 2025-08-15T18:04:15.427Z
updated: 2025-08-15T18:04:15.427Z
---

# Legacy Code Cleanup and Preparation

## Purpose

Remove existing non-functional localStorage usage, clean up draft saving logic, eliminate tab-related code, and prepare the codebase for the new file-based persistence implementation.

## Key Components to Clean Up

### localStorage Removal

- Remove all localStorage references from personality forms
- Clean up localStorage-based persistence attempts
- Remove temporary storage utilities no longer needed
- Eliminate localStorage backup/restore functionality

### Draft Saving Logic Removal

- Remove draft personality saving mechanisms
- Clean up unsaved changes tracking
- Remove draft persistence UI components
- Eliminate draft-related state management

### Tab Navigation Cleanup

- Remove "Saved" and "Create New" tab components
- Clean up tab-related types and interfaces
- Remove tab state management code
- Eliminate tab-specific routing logic

### Deprecated Code Identification

- Mark deprecated components for future removal
- Identify unused imports and dependencies
- Document breaking changes for other features
- Create migration notes for affected code

## Detailed Acceptance Criteria

### localStorage Elimination

- [ ] No references to `localStorage.getItem()` for personalities
- [ ] No references to `localStorage.setItem()` for personalities
- [ ] No references to `localStorage.removeItem()` for personalities
- [ ] No localStorage keys related to personalities or drafts
- [ ] Remove localStorage utility functions if no longer used elsewhere

### Draft Logic Removal

- [ ] Remove draft saving components and hooks
- [ ] Remove unsaved changes warning dialogs
- [ ] Remove draft recovery mechanisms on app restart
- [ ] Remove draft-specific state in forms
- [ ] Clean up draft-related error handling

### Tab System Removal

- [ ] Remove tab navigation components from personalities section
- [ ] Remove "Saved" tab and its associated components
- [ ] Remove "Create New" tab and its components
- [ ] Remove tab state management (active tab, tab switching)
- [ ] Remove tab-related props and interfaces

### Code Quality Improvements

- [ ] Remove unused imports after cleanup
- [ ] Remove unused utility functions
- [ ] Remove unused type definitions
- [ ] Update component interfaces to remove deprecated props
- [ ] Clean up dead code paths

## Implementation Guidance

### Files to Modify

```
apps/desktop/src/components/settings/personalities/
├── PersonalitiesSection.tsx      # Remove tab navigation
├── CreatePersonalityForm.tsx     # Remove localStorage/draft logic
├── SavedPersonalities.tsx        # May be removed entirely
└── PersonalityFormTabs.tsx       # Remove tab management

packages/ui-shared/src/
├── types/personalities/          # Clean up tab-related types
├── hooks/                        # Remove localStorage hooks
└── utils/                        # Remove localStorage utilities
```

### Cleanup Strategy

1. **Systematic Removal**: Go through each file and remove localStorage references
2. **Dead Code Elimination**: Remove functions/components that only supported removed features
3. **Type Cleanup**: Remove interfaces and types no longer needed
4. **Import Cleanup**: Remove unused imports after other cleanup
5. **Documentation Update**: Update any inline comments referencing removed features

### Breaking Changes Documentation

- Document which components are being removed
- Note which props/interfaces are changing
- List any hooks or utilities being deprecated
- Provide migration path for other features depending on removed code

## Testing Requirements

- [ ] No localStorage references remain in codebase search
- [ ] No console errors from missing localStorage data
- [ ] No broken imports after cleanup
- [ ] No unused variables or functions remain
- [ ] Application builds successfully after cleanup
- [ ] No TypeScript errors from removed types

### Verification Steps

- Search codebase for "localStorage" and verify no personality-related usage
- Search for "draft" in personality-related files
- Search for "tab" in personality components
- Compile and verify no TypeScript errors
- Run linting to catch unused imports/variables

## Security Considerations

- Ensure no sensitive data left in localStorage after cleanup
- Remove any localStorage keys that might contain personal data
- Clean up any debugging localStorage that might expose internals
- Verify no localStorage-based authentication or session data affected

## Performance Improvements

- Reduced bundle size from removed code
- Eliminated localStorage read/write operations
- Removed unnecessary state management overhead
- Cleaner component tree without tab management

## Compatibility Considerations

- Ensure cleanup doesn't break other features using same components
- Verify shared utilities aren't used elsewhere before removal
- Check that removed types aren't exported to other packages
- Maintain backward compatibility where required by other features

## Migration Impact Assessment

- Document components that will need updates in future features
- Note any shared utilities that are being removed
- Identify any dependencies other features have on removed code
- Provide clear migration path for affected integrations

## Code Quality Standards

- Follow project's ESLint rules after cleanup
- Maintain consistent code formatting
- Remove TODO comments related to removed features
- Update any outdated documentation references
- Ensure all remaining code follows current patterns
