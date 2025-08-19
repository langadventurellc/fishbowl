---
id: T-remove-templates-tab-and
title: Remove Templates tab and cleanup template-related code
status: done
priority: high
parent: F-section-components-update
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/agents/AgentsSection.tsx:
    Removed Templates tab, mockTemplates data, TemplatesTab component,
    template-related imports, modal state properties, and openTemplateModal
    handler. Updated tab configuration to only include Library and Defaults
    tabs. Updated JSDoc documentation to reflect two-tab navigation.
  apps/desktop/src/components/settings/agents/__tests__/AgentsSection.test.tsx:
    Updated unit tests to reflect the new two-tab structure by removing all
    template-related test assertions and expectations. Updated test descriptions
    and assertions to match the Library and Defaults only structure.
log:
  - Successfully removed the Templates tab and all template-related code from
    the AgentsSection component. The component now has a clean two-tab structure
    (Library and Defaults) as specified. All template imports, mock data,
    component definitions, modal handlers, and tab configuration have been
    removed. Updated component documentation and tests to reflect the new
    structure. All quality checks pass with no TypeScript or linting errors.
schema: v1.0
childrenIds: []
created: 2025-08-19T19:25:19.885Z
updated: 2025-08-19T19:25:19.885Z
---

## Purpose

Remove the Templates tab completely from the AgentsSection component and clean up all template-related code, imports, and state management.

## Context

The AgentsSection component currently has three tabs: Library, Templates, and Defaults. The feature requires removing the Templates tab entirely to simplify the interface to just Library and Defaults tabs.

Location: `apps/desktop/src/components/settings/agents/AgentsSection.tsx`

## Detailed Implementation Requirements

### Code Removal Tasks

1. **Remove TemplatesTab component** (lines 476-521)
   - Remove the entire TemplatesTab component definition
   - Remove TemplatesTabProps interface

2. **Remove mockTemplates data** (lines 357-471)
   - Remove the entire mockTemplates array with 8 template definitions
   - Remove related template configuration objects

3. **Remove template-related imports**
   - Remove `AgentTemplate` type import from `@fishbowl-ai/ui-shared`
   - Remove `TemplateCard` and `EmptyTemplatesState` imports from local components

4. **Remove template modal state and handlers**
   - Remove `template` property from agentModalState type
   - Remove `openTemplateModal` function (lines 847-853)
   - Remove template mode from modal operations

5. **Update tab configuration** (lines 892-913)
   - Remove the templates tab object from the tabs array
   - Keep only "library" and "defaults" tabs

6. **Clean up modal handling**
   - Update AgentFormModal props to remove template-related properties
   - Ensure modal mode only handles "create" and "edit"

### Component Documentation Updates

- Update the component's JSDoc header (lines 1-12) to reflect two-tab structure
- Remove references to "Three-tab navigation" and update to "Two-tab navigation"
- Update feature list to remove Templates tab mention

## Acceptance Criteria

- ✅ No Templates tab appears in the interface
- ✅ All template-related code removed from codebase
- ✅ No template-related imports remain
- ✅ Tab navigation works correctly with only two tabs
- ✅ Modal infrastructure preserved for Library tab operations
- ✅ No TypeScript errors after removal
- ✅ Component documentation updated to reflect new structure

## Testing Requirements

- Verify tab navigation between Library and Defaults works
- Confirm no console errors about missing template components
- Test that agent create/edit functionality still works from Library tab
- Verify AgentFormModal works without template mode

## Files to Modify

- `apps/desktop/src/components/settings/agents/AgentsSection.tsx`

## Dependencies

None - this is the foundational cleanup task that enables other updates.
