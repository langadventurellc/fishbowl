---
kind: feature
id: F-code-migration-and-setup
title: Code Migration and Setup
status: done
priority: normal
prerequisites: []
created: "2025-08-04T11:07:33.463812"
updated: "2025-08-04T11:07:33.463812"
schema_version: "1.1"
parent: E-transform-api-keys-to-llm-setup
---

## Overview

Initial setup and code migration to rename "API Keys" to "LLM Setup" throughout the application. This feature establishes the foundation for the new LLM Setup interface while maintaining existing functionality during the transition.

## Scope and Deliverables

### 1. Rename Navigation and References

- Update all "API Keys" text to "LLM Setup" in navigation
- Change section type from "api-keys" to "llm-setup" in settings types
- Update route references and component imports

### 2. Create New Component Structure

- Create new `LlmSetupSection.tsx` component that initially wraps existing functionality
- Set up new directory structure: `llm-setup/` folder
- Create barrel exports for future components

### 3. Update Integration Points

- Modify SettingsContent.tsx to import new component
- Update SettingsNavigation.tsx with new label
- Ensure all TypeScript types are updated

## Detailed Acceptance Criteria

### Navigation Updates

- ✓ Settings navigation shows "LLM Setup" instead of "API Keys"
- ✓ Section header displays "LLM Setup"
- ✓ All hover states and active states work correctly
- ✓ Navigation item highlights properly when selected

### Code Structure

- ✓ New `LlmSetupSection.tsx` created in settings directory
- ✓ New `llm-setup/` directory created with index.ts barrel export
- ✓ Old ApiKeysSettings component still functional (temporarily)
- ✓ All imports updated to use new component

### Type Updates

- ✓ `settingsSection` type updated from "api-keys" to "llm-setup"
- ✓ All TypeScript errors resolved
- ✓ No type mismatches in navigation or routing

### Testing Compatibility

- ✓ All existing tests updated to use "llm-setup" references
- ✓ No broken test selectors or navigation tests

## Implementation Guidance

### File Changes Required

1. `apps/desktop/src/lib/types/settingsSection.ts` - Update section type
2. `apps/desktop/src/components/settings/SettingsNavigation.tsx` - Update label
3. `apps/desktop/src/components/settings/SettingsContent.tsx` - Update import
4. Create `apps/desktop/src/components/settings/LlmSetupSection.tsx`
5. Create `apps/desktop/src/components/settings/llm-setup/index.ts`

### Migration Strategy

- Keep ApiKeysSettings.tsx temporarily functional
- LlmSetupSection initially imports and renders ApiKeysSettings
- This allows incremental development without breaking the app

## Testing Requirements

### Manual Testing

- Navigate to settings and verify "LLM Setup" appears
- Click on "LLM Setup" and verify it shows the API configuration
- Verify no console errors or warnings
- Check that existing functionality still works

### Code Quality

- No ESLint errors
- No TypeScript errors
- Consistent naming conventions
- Clear migration path for next features

## Security Considerations

- No security changes in this feature
- Existing API key handling remains unchanged
- Focus only on UI labeling and structure

## Performance Requirements

- No performance impact expected
- Simple rename and restructure operation
- No new components or logic added

### Log
