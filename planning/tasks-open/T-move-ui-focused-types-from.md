---
kind: task
id: T-move-ui-focused-types-from
title: Move UI-focused types from settings directory to types/ui
status: open
priority: high
prerequisites: []
created: "2025-07-30T02:04:01.416764"
updated: "2025-07-30T02:04:01.416764"
schema_version: "1.1"
---

# Move and Rename UI-Focused Types from Settings Directory to types/ui

## Context and Purpose

Move ALL UI-focused types from `packages/shared/src/types/settings/` to `packages/shared/src/types/ui/` and rename them to use the ViewModel naming convention. This consolidates all UI-related types in the correct directory structure and establishes clear architectural boundaries between UI ViewModels and business domain types.

## Types to Move and Rename

### UI-Focused Types Requiring ViewModel Renaming

**Form Data Types** (UI-specific, already correctly named):

- `AgentFormData.ts` → `packages/shared/src/types/ui/forms/AgentFormData.ts`
- `PersonalityFormData.ts` → `packages/shared/src/types/ui/forms/PersonalityFormData.ts`
- `RoleFormData.ts` → `packages/shared/src/types/ui/forms/RoleFormData.ts`
- `ApiKeysFormData.ts` → `packages/shared/src/types/ui/forms/ApiKeysFormData.ts`

**UI Data Types** (need ViewModel suffix):

- `AgentDefaults.ts` → `packages/shared/src/types/ui/forms/AgentDefaultsViewModel.ts`
- `AgentTemplate.ts` → `packages/shared/src/types/ui/forms/AgentTemplateViewModel.ts`
- `AgentConfiguration.ts` → `packages/shared/src/types/ui/forms/AgentConfigurationViewModel.ts`
- `PredefinedRole.ts` → `packages/shared/src/types/ui/forms/PredefinedRoleViewModel.ts`
- `Personality.ts` → `packages/shared/src/types/ui/forms/PersonalityViewModel.ts`
- `BehaviorTrait.ts` → `packages/shared/src/types/ui/forms/BehaviorTraitViewModel.ts`
- `BehaviorGroup.ts` → `packages/shared/src/types/ui/forms/BehaviorGroupViewModel.ts`
- `AgentCard.ts` → `packages/shared/src/types/ui/forms/AgentCardViewModel.ts`

**Component Props Types** (UI-specific, keep Props suffix):

- `AgentCardProps.ts` → `packages/shared/src/types/ui/components/AgentCardProps.ts`
- `PersonalityCardProps.ts` → `packages/shared/src/types/ui/components/PersonalityCardProps.ts`
- `TemplateCardProps.ts` → `packages/shared/src/types/ui/components/TemplateCardProps.ts`
- `EmptyStateProps.ts` → `packages/shared/src/types/ui/components/EmptyStateProps.ts`
- `AgentsSectionProps.ts` → `packages/shared/src/types/ui/components/AgentsSectionProps.ts`
- `PersonalitiesSectionProps.ts` → `packages/shared/src/types/ui/components/PersonalitiesSectionProps.ts`
- `RolesSectionProps.ts` → `packages/shared/src/types/ui/components/RolesSectionProps.ts`
- `InteractiveTabsProps.ts` → `packages/shared/src/types/ui/components/InteractiveTabsProps.ts`
- `BigFiveSlidersProps.ts` → `packages/shared/src/types/ui/components/BigFiveSlidersProps.ts`

**Configuration Types** (UI-specific, need ViewModel suffix):

- `TabConfiguration.ts` → `packages/shared/src/types/ui/tabs/TabConfigurationViewModel.ts`
- `TabSectionConfiguration.ts` → `packages/shared/src/types/ui/tabs/TabSectionConfigurationViewModel.ts`

**ViewModels** (already correctly named):

- `BigFiveTraitsViewModel.ts` → `packages/shared/src/types/ui/forms/BigFiveTraitsViewModel.ts`
- `CustomRoleViewModel.ts` → `packages/shared/src/types/ui/forms/CustomRoleViewModel.ts`

**Provider Types** (UI-specific, already correctly named):

- All types in `providers/` subdirectory → `packages/shared/src/types/ui/providers/`

## Types to Keep in Settings Directory

**NONE** - All types in settings directory are UI-focused and should be moved.

## Implementation Steps

### 1. Create new directory structure

```bash
# Create new directories in types/ui
mkdir -p packages/shared/src/types/ui/forms
mkdir -p packages/shared/src/types/ui/tabs
mkdir -p packages/shared/src/types/ui/providers
# components directory already exists
```

### 2. Move and rename files to new locations

**Move and rename form data types**:

```bash
# Move and rename files that need ViewModel suffix
mv packages/shared/src/types/settings/AgentFormData.ts packages/shared/src/types/ui/forms/AgentFormData.ts
mv packages/shared/src/types/settings/PersonalityFormData.ts packages/shared/src/types/ui/forms/PersonalityFormData.ts
mv packages/shared/src/types/settings/RoleFormData.ts packages/shared/src/types/ui/forms/RoleFormData.ts
mv packages/shared/src/types/settings/ApiKeysFormData.ts packages/shared/src/types/ui/forms/ApiKeysFormData.ts

# Move and rename other UI data types
mv packages/shared/src/types/settings/AgentDefaults.ts packages/shared/src/types/ui/forms/AgentDefaultsViewModel.ts
mv packages/shared/src/types/settings/AgentTemplate.ts packages/shared/src/types/ui/forms/AgentTemplateViewModel.ts
mv packages/shared/src/types/settings/AgentConfiguration.ts packages/shared/src/types/ui/forms/AgentConfigurationViewModel.ts
mv packages/shared/src/types/settings/PredefinedRole.ts packages/shared/src/types/ui/forms/PredefinedRoleViewModel.ts
mv packages/shared/src/types/settings/Personality.ts packages/shared/src/types/ui/forms/PersonalityViewModel.ts
mv packages/shared/src/types/settings/BehaviorTrait.ts packages/shared/src/types/ui/forms/BehaviorTraitViewModel.ts
mv packages/shared/src/types/settings/BehaviorGroup.ts packages/shared/src/types/ui/forms/BehaviorGroupViewModel.ts
mv packages/shared/src/types/settings/AgentCard.ts packages/shared/src/types/ui/forms/AgentCardViewModel.ts

# Move ViewModels (already correctly named)
mv packages/shared/src/types/settings/BigFiveTraitsViewModel.ts packages/shared/src/types/ui/forms/
mv packages/shared/src/types/settings/CustomRoleViewModel.ts packages/shared/src/types/ui/forms/
```

**Move component props types** (no renaming needed):

```bash
# Move to existing components directory (Props suffix is correct)
mv packages/shared/src/types/settings/AgentCardProps.ts packages/shared/src/types/ui/components/
mv packages/shared/src/types/settings/PersonalityCardProps.ts packages/shared/src/types/ui/components/
mv packages/shared/src/types/settings/TemplateCardProps.ts packages/shared/src/types/ui/components/
mv packages/shared/src/types/settings/EmptyStateProps.ts packages/shared/src/types/ui/components/
mv packages/shared/src/types/settings/AgentsSectionProps.ts packages/shared/src/types/ui/components/
mv packages/shared/src/types/settings/PersonalitiesSectionProps.ts packages/shared/src/types/ui/components/
mv packages/shared/src/types/settings/RolesSectionProps.ts packages/shared/src/types/ui/components/
mv packages/shared/src/types/settings/InteractiveTabsProps.ts packages/shared/src/types/ui/components/
mv packages/shared/src/types/settings/BigFiveSlidersProps.ts packages/shared/src/types/ui/components/
```

**Move and rename tab configuration types**:

```bash
mv packages/shared/src/types/settings/TabConfiguration.ts packages/shared/src/types/ui/tabs/TabConfigurationViewModel.ts
mv packages/shared/src/types/settings/TabSectionConfiguration.ts packages/shared/src/types/ui/tabs/TabSectionConfigurationViewModel.ts
```

**Move entire providers directory**:

```bash
# Move the entire providers subdirectory
mv packages/shared/src/types/settings/providers packages/shared/src/types/ui/
```

### 3. Rename interfaces within moved files

For each moved file that was renamed to include ViewModel, update the interface name inside the file:

```typescript
// In AgentFormData.ts (formerly AgentFormData.ts)
// Before
export interface AgentFormData {
  // ... properties
}

// After
export interface AgentFormData {
  // ... properties
}

/** @deprecated Use AgentFormData instead */
export interface AgentFormData extends AgentFormData {}
```

Apply this pattern to all moved files with ViewModel suffix.

### 4. Update import statements

**Search for all imports** of moved types:

```bash
grep -r "from.*@fishbowl-ai/shared" --include="*.ts" --include="*.tsx" apps/ packages/ | grep "AgentFormData\|PersonalityFormData\|RoleFormData\|AgentDefaults\|AgentTemplate\|AgentConfiguration\|PredefinedRole\|Personality\|BehaviorTrait\|BehaviorGroup\|AgentCard\|TabConfiguration"
```

**Update imports** - most should continue working through barrel exports due to deprecated aliases, but verify:

```typescript
// These should still work after barrel export updates (using deprecated aliases)
import { AgentFormData, PersonalityFormData } from "@fishbowl-ai/shared";

// Eventually update to ViewModel names
import { AgentFormData, PersonalityFormData } from "@fishbowl-ai/shared";
```

### 5. Update barrel export files

**Update** `packages/shared/src/types/ui/index.ts`:

```typescript
// Add exports for moved types
export * from "./forms";
export * from "./tabs";
export * from "./providers";
// existing exports...
export * from "./components";
export * from "./core";
export * from "./menu";
export * from "./theme";
```

**Create** `packages/shared/src/types/ui/forms/index.ts`:

```typescript
// Export ViewModel types and their deprecated aliases
export * from "./AgentFormData";
export * from "./PersonalityFormData";
export * from "./RoleFormData";
export * from "./ApiKeysFormData";
export * from "./AgentDefaultsViewModel";
export * from "./AgentTemplateViewModel";
export * from "./AgentConfigurationViewModel";
export * from "./PredefinedRoleViewModel";
export * from "./PersonalityViewModel";
export * from "./BehaviorTraitViewModel";
export * from "./BehaviorGroupViewModel";
export * from "./AgentCardViewModel";
export * from "./BigFiveTraitsViewModel";
export * from "./CustomRoleViewModel";
```

**Create** `packages/shared/src/types/ui/tabs/index.ts`:

```typescript
export * from "./TabConfigurationViewModel";
export * from "./TabSectionConfigurationViewModel";
```

**Create** `packages/shared/src/types/ui/providers/index.ts`:

```typescript
// Export all provider types (moved from settings/providers)
export * from "./validation";
export * from "./isValidProvider";
export * from "./providerValidationError";
export * from "./providersConfig";
export * from "./getAllProviders";
export * from "./providerConfig";
export * from "./getProviderConfig";
export * from "./validateProviderData";
export * from "./providerState";
export * from "./providerFormData";
export * from "./createInitialProviderState";
export * from "./providerId";
```

**Update** `packages/shared/src/types/ui/components/index.ts`:

```typescript
// Add exports for newly moved component props
export * from "./AgentCardProps";
export * from "./PersonalityCardProps";
export * from "./TemplateCardProps";
export * from "./EmptyStateProps";
export * from "./AgentsSectionProps";
export * from "./PersonalitiesSectionProps";
export * from "./RolesSectionProps";
export * from "./InteractiveTabsProps";
export * from "./BigFiveSlidersProps";
// ... existing exports
```

**Remove** `packages/shared/src/types/settings/index.ts`:

```bash
# Delete the settings index file since no types remain
rm packages/shared/src/types/settings/index.ts
```

**Remove** `packages/shared/src/types/settings/` directory:

```bash
# Remove the now-empty settings directory
rmdir packages/shared/src/types/settings/
```

### 6. Build and validate changes

- Run `pnpm build:libs` to rebuild shared package
- Run `pnpm quality` to verify TypeScript compilation
- Run `pnpm test` to ensure no functionality broken
- Verify all imports resolve correctly

## Acceptance Criteria

### Functional Requirements

- ✅ ALL UI-focused types moved from settings to ui directory with ViewModel renaming
- ✅ Interface names within files updated to ViewModel pattern
- ✅ Backward compatibility maintained through deprecated aliases
- ✅ Proper directory structure created (forms/, tabs/, components/, providers/)
- ✅ Entire settings directory removed (no types remain)
- ✅ All existing imports continue to work through barrel exports

### Technical Requirements

- ✅ Build passes (`pnpm build:libs`)
- ✅ Quality checks pass (`pnpm quality`)
- ✅ All tests pass (`pnpm test`)
- ✅ No TypeScript compilation errors
- ✅ Import paths resolve correctly

### Architectural Requirements

- ✅ Clear architectural boundaries between UI ViewModels and business domain types
- ✅ All UI-focused types consolidated in types/ui directory
- ✅ Consistent ViewModel naming convention applied
- ✅ Logical subdirectory organization (forms/, components/, tabs/, providers/)
- ✅ Clean export structure maintained

### ViewModel Naming Requirements

- ✅ All non-Props UI types use ViewModel suffix
- ✅ Props interfaces keep Props suffix (already UI-specific)
- ✅ Deprecated aliases provide smooth migration path
- ✅ JSDoc updated to reflect ViewModel purpose

## Time Estimate

**Total: 3 hours**

- File moves, renaming, and directory creation: 90 minutes
- Interface renaming within files: 60 minutes
- Barrel export updates: 20 minutes
- Import verification and testing: 10 minutes
- Build validation: 10 minutes

### Log
