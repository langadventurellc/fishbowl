---
kind: task
id: T-update-desktop-app-imports-to
title: Update desktop app imports to use both shared and ui-shared packages
status: open
priority: high
prerequisites:
  - T-remove-ui-theme-dependency-from
created: "2025-07-30T16:32:06.829061"
updated: "2025-07-30T16:32:06.829061"
schema_version: "1.1"
---

## Objective

Update all desktop app imports to use the correct package (@fishbowl-ai/shared for business logic, @fishbowl-ai/ui-shared for UI types and components).

## Context

The desktop app currently imports everything from @fishbowl-ai/shared. After the package split, it needs to import business logic from @fishbowl-ai/shared and UI-related items from @fishbowl-ai/ui-shared.

## Implementation Requirements

1. Update ~85 files in the desktop app that import from @fishbowl-ai/shared
2. Determine which imports should come from which package
3. Update import statements to use correct package
4. Add @fishbowl-ai/ui-shared to desktop app dependencies

## Technical Approach

1. Add `@fishbowl-ai/ui-shared: "workspace:*"` to `apps/desktop/package.json` dependencies
2. Systematically update import statements in desktop app files:
   - UI types, component props, view models → `@fishbowl-ai/ui-shared`
   - Business types, stores, services → `@fishbowl-ai/shared`
   - Settings stores, UI hooks → `@fishbowl-ai/ui-shared`
3. Update imports in categories:
   - Settings components (50+ files)
   - Chat components (10+ files)
   - Layout components (8+ files)
   - Hooks and types (15+ files)

## Files Requiring Updates

Based on analysis, approximately 85 files need import updates:

- All settings components in `apps/desktop/src/components/settings/`
- Chat components in `apps/desktop/src/components/chat/`
- Layout components in `apps/desktop/src/components/layout/`
- Menu components in `apps/desktop/src/components/menu/`
- Hook files in `apps/desktop/src/hooks/`
- Type definition files

## Import Guidelines

**Import from @fishbowl-ai/ui-shared:**

- Component props interfaces (ButtonProps, FormProps, etc.)
- View models (AgentViewModel, MessageViewModel, etc.)
- UI state stores (settings stores)
- UI-focused hooks (useAgentSearch, useEnhancedTabNavigation)
- Form data types and UI schemas

**Import from @fishbowl-ai/shared:**

- Business entity types (Agent, Role, Personality)
- Business logic stores (customRolesStore)
- Service interfaces
- Business validation schemas
- Core business utilities

## Acceptance Criteria

- [ ] @fishbowl-ai/ui-shared added to desktop app dependencies
- [ ] All import statements updated to use correct packages
- [ ] Desktop app builds successfully with new imports
- [ ] No broken imports or missing types
- [ ] All components render correctly
- [ ] Functionality remains intact after import changes

## Testing Requirements

- Build desktop app with updated imports
- Run desktop app tests to verify functionality
- Test that all components load and render properly
- Verify type checking passes with new import structure

### Log
