---
kind: task
id: T-move-settings-component-types
status: done
title: Move settings component types and interfaces to shared package
priority: high
prerequisites: []
created: "2025-07-28T20:57:40.341342"
updated: "2025-07-28T20:58:32.970556"
schema_version: "1.1"
worktree: null
---

# Move Settings Component Types to Shared Package

## Context

Several interfaces and types in the desktop settings components contain business logic and component contracts that should be shared across platforms. These types are currently defined within individual desktop components but represent core business logic that would be valuable for future mobile implementations.

## Current Location Analysis

The following types are currently defined in desktop components but should be moved to shared:

### Component Props Interfaces

- **`SettingsContentProps`** - `apps/desktop/src/components/settings/SettingsContent.tsx:1033-1037`
- **`NavigationItemProps`** - `apps/desktop/src/components/settings/NavigationItem.tsx:22-47`
- **`FormErrorDisplayProps`** - `apps/desktop/src/components/settings/FormErrorDisplay.tsx:11-14`
- **`SubNavigationTabProps`** - `apps/desktop/src/components/settings/SubNavigationTab.tsx:20-39`
- **`CreatePersonalityFormProps`** - `apps/desktop/src/components/settings/CreatePersonalityForm.tsx:54-58`
- **`SavedPersonalitiesTabProps`** - `apps/desktop/src/components/settings/SavedPersonalitiesTab.tsx:18-21`
- **`PersonalitiesSectionProps`** - `apps/desktop/src/components/settings/PersonalitiesSection.tsx:26-28`
- **`ProviderCardProps`** - `apps/desktop/src/components/settings/ProviderCard.tsx:23-44`
- **`SettingsNavigationProps`** - `apps/desktop/src/components/settings/SettingsNavigation.tsx:31-36`
- **`EnhancedNavigationListProps`** - `apps/desktop/src/components/settings/SettingsNavigation.tsx:182-204`

### Form Data and Business Logic Types

- **`PersonalityFormData`** - `apps/desktop/src/components/settings/CreatePersonalityForm.tsx:52`
- **`ApiKeysFormData`** - `apps/desktop/src/components/settings/ApiKeysSettings.tsx:31`
- **`ApiKeysState`** - `apps/desktop/src/components/settings/ApiKeysSettings.tsx:36-41`

### UI Configuration Types

- **`ThemePreviewProps`** - `apps/desktop/src/components/settings/SettingsContent.tsx:375-377`
- **`FontSizePreviewProps`** - `apps/desktop/src/components/settings/SettingsContent.tsx:441-443`

### Validation Schemas

- **`personalitySchema`** - `apps/desktop/src/components/settings/CreatePersonalityForm.tsx:39-50`
- **`createApiKeysFormSchema`** function - `apps/desktop/src/components/settings/ApiKeysSettings.tsx:19-29`

## Implementation Steps

### 1. Create New Shared Type Files

Create the following new files in `packages/shared/src/types/`:

**`packages/shared/src/types/settings.ts`**

- Move all component props interfaces
- Add proper JSDoc documentation for each interface
- Ensure all imports are correctly referenced

**`packages/shared/src/types/forms.ts`**

- Move form data types (`PersonalityFormData`, `ApiKeysFormData`, `ApiKeysState`)
- Include proper validation type references

**`packages/shared/src/types/ui.ts`**

- Move UI configuration types (`ThemePreviewProps`, `FontSizePreviewProps`)

**`packages/shared/src/schemas/settings.ts`**

- Move validation schemas (`personalitySchema`, `createApiKeysFormSchema`)
- Ensure all zod dependencies are properly imported

### 2. Update Shared Package Exports

Update `packages/shared/src/index.ts` to export the new types:

```typescript
// Settings types
export type * from "./types/settings";
export type * from "./types/forms";
export type * from "./types/ui";

// Settings schemas
export * from "./schemas/settings";
```

### 3. Update Desktop Components

For each desktop component file:

- Remove the local type definitions
- Add imports from `@fishbowl-ai/shared`
- Verify all references are updated correctly
- Ensure no breaking changes to component functionality

### 4. Dependencies Consideration

- Ensure `zod` is properly listed as a dependency in shared package
- Check that any React-specific types are handled appropriately
- Verify that lucide-react icon types are properly referenced

### 5. Build and Verify

- Run `pnpm build:libs` to rebuild shared package after changes
- Verify desktop components still compile and function correctly
- Check that all type exports are working as expected

## Acceptance Criteria

### Functional Requirements

- [ ] All identified types are moved to appropriate shared package files
- [ ] Desktop components successfully import types from shared package
- [ ] No compilation errors in desktop or shared packages
- [ ] All component functionality remains unchanged

### Code Quality Requirements

- [ ] Types are organized logically in separate files by category
- [ ] JSDoc documentation is added to all moved interfaces
- [ ] Proper barrel exports are configured in shared package index
- [ ] Import statements are clean and follow project conventions

### Testing Requirements

- [ ] Desktop settings components render without errors
- [ ] Form validation continues to work with moved schemas
- [ ] Type checking passes in both packages
- [ ] Build process completes successfully for all packages

### Documentation Requirements

- [ ] Update any internal documentation referencing old type locations
- [ ] Ensure new shared types are discoverable through IDE autocomplete
- [ ] Verify that type definitions appear correctly in built shared package

## Technical Considerations

### Import Dependencies

- Some types may reference React types (like `React.ReactNode`, `React.KeyboardEvent`)
- Zod schemas will need proper zod imports in shared package
- Lucide icon types may need careful handling

### Breaking Changes Prevention

- Maintain exact same type definitions during move
- Use temporary re-exports if needed during transition
- Ensure component prop interfaces remain compatible

### Future Mobile Compatibility

- Organize types to be platform-agnostic where possible
- Separate UI-specific types from business logic types
- Consider which types truly need to be shared vs. platform-specific

## Files to Modify

### New Files to Create:

- `packages/shared/src/types/settings.ts`
- `packages/shared/src/types/forms.ts`
- `packages/shared/src/types/ui.ts`
- `packages/shared/src/schemas/settings.ts`

### Files to Update:

- `packages/shared/src/index.ts`
- `apps/desktop/src/components/settings/SettingsContent.tsx`
- `apps/desktop/src/components/settings/NavigationItem.tsx`
- `apps/desktop/src/components/settings/FormErrorDisplay.tsx`
- `apps/desktop/src/components/settings/SubNavigationTab.tsx`
- `apps/desktop/src/components/settings/CreatePersonalityForm.tsx`
- `apps/desktop/src/components/settings/SavedPersonalitiesTab.tsx`
- `apps/desktop/src/components/settings/PersonalitiesSection.tsx`
- `apps/desktop/src/components/settings/ProviderCard.tsx`
- `apps/desktop/src/components/settings/SettingsNavigation.tsx`
- `apps/desktop/src/components/settings/ApiKeysSettings.tsx`

## Estimated Effort

1-2 hours of focused work to complete the type migration and verify all imports are working correctly.

### Log

**2025-07-29T02:19:29.457404Z** - Successfully moved all settings component types and interfaces to the shared package. Created organized type files following the project's one-export-per-file convention, updated all desktop components to import from shared package, and verified all builds and quality checks pass.

- filesChanged: ["packages/shared/src/schemas/personalitySchema.ts", "packages/shared/src/schemas/createApiKeysFormSchema.ts", "packages/shared/src/schemas/index.ts", "packages/shared/src/types/settings/ApiKeysFormData.ts", "packages/shared/src/types/settings/ApiKeysState.ts", "packages/shared/src/types/settings/PersonalityFormData.ts", "packages/shared/src/types/ui/ThemePreviewProps.ts", "packages/shared/src/types/ui/FontSizePreviewProps.ts", "packages/shared/src/types/ui/components/SettingsContentProps.ts", "packages/shared/src/types/ui/components/NavigationItemProps.ts", "packages/shared/src/types/ui/components/FormErrorDisplayProps.ts", "packages/shared/src/types/ui/components/SubNavigationTabProps.ts", "packages/shared/src/types/ui/components/CreatePersonalityFormProps.ts", "packages/shared/src/types/ui/components/SavedPersonalitiesTabProps.ts", "packages/shared/src/types/ui/components/PersonalitiesSectionProps.ts", "packages/shared/src/types/ui/components/ProviderCardProps.ts", "packages/shared/src/types/ui/components/SettingsNavigationProps.ts", "packages/shared/src/types/ui/components/EnhancedNavigationListProps.ts", "packages/shared/src/types/ui/components/index.ts", "packages/shared/src/types/ui/index.ts", "packages/shared/src/types/settings/index.ts", "packages/shared/src/index.ts", "apps/desktop/src/components/settings/SettingsContent.tsx", "apps/desktop/src/components/settings/NavigationItem.tsx", "apps/desktop/src/components/settings/FormErrorDisplay.tsx", "apps/desktop/src/components/settings/SubNavigationTab.tsx", "apps/desktop/src/components/settings/CreatePersonalityForm.tsx", "apps/desktop/src/components/settings/SavedPersonalitiesTab.tsx", "apps/desktop/src/components/settings/PersonalitiesSection.tsx", "apps/desktop/src/components/settings/ProviderCard.tsx", "apps/desktop/src/components/settings/SettingsNavigation.tsx", "apps/desktop/src/components/settings/ApiKeysSettings.tsx"]
