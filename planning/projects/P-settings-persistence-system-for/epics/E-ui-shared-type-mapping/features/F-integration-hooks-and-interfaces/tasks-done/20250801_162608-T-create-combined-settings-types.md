---
kind: task
id: T-create-combined-settings-types
parent: F-integration-hooks-and-interfaces
status: done
title: Create combined settings types and interfaces
priority: high
prerequisites: []
created: "2025-08-01T15:01:23.153083"
updated: "2025-08-01T16:12:48.733310"
schema_version: "1.1"
worktree: null
---

# Create combined settings types and interfaces

## Purpose

Create unified TypeScript interfaces that combine all settings categories (general, appearance, advanced) for both UI form data and persisted data structures. These types provide the foundation for atomic settings operations.

## Implementation Details

### File Locations

1. `packages/ui-shared/src/types/settings/combined.ts` - Combined settings types
2. `packages/ui-shared/src/types/settings/__tests__/combined.test.ts` - Type validation tests

### Required Type Definitions

```typescript
// SettingsFormData - Combined UI form data for all categories
export interface SettingsFormData {
  general: GeneralSettingsFormData;
  appearance: AppearanceSettingsFormData;
  advanced: AdvancedSettingsFormData;
}

// PersistedSettingsData - Re-export from shared package for consistency
export type { PersistedSettingsData } from "@fishbowl-ai/shared";

// SettingsCategory - Union type for settings sections
export type SettingsCategory = "general" | "appearance" | "advanced";

// SettingsValidationResult - Validation outcome with detailed errors
export interface SettingsValidationResult {
  isValid: boolean;
  errors?: Record<SettingsCategory, string[]>;
}
```

### Implementation Requirements

1. Import all individual settings form data types from existing files
2. Create composite interfaces that maintain type safety for each category
3. Export helper type guards for runtime type checking
4. Ensure compatibility with existing mappers and validation functions
5. Add JSDoc documentation for all exported types

### Testing Requirements

Write unit tests to verify:

- Type compatibility with individual category types
- Proper structure validation
- Type guard functions work correctly
- No circular dependencies

**IMPORTANT**: This task should only include unit tests. Do NOT create integration tests or performance tests.

## Acceptance Criteria

- ✓ Combined SettingsFormData interface includes all three categories
- ✓ Type definitions maintain full type safety from individual categories
- ✓ Helper type guards provide runtime validation
- ✓ All types have comprehensive JSDoc documentation
- ✓ Unit tests validate type structure and guards
- ✓ No 'any' types used in interfaces
- ✓ Exports added to settings/index.ts barrel file
- ✓ All quality checks pass (lint, format, type-check)

## Dependencies

- GeneralSettingsFormData from existing types
- AppearanceSettingsFormData from existing types
- AdvancedSettingsFormData from existing types
- PersistedSettingsData from @fishbowl-ai/shared

## Security Considerations

- Type definitions should not expose implementation details
- Validation functions must sanitize error messages
- No sensitive data in type documentation

### Log

**2025-08-01T21:26:08.900646Z** - Implemented comprehensive combined settings types and interfaces for atomic settings operations in the ui-shared package. Created a properly structured `combined` folder with individual files for each export to comply with the one-export-per-file rule. The implementation includes:

**Core Types:**

- `SettingsFormData`: Combined interface for all UI settings categories (general, appearance, advanced)
- `SettingsCategory`: Union type for settings navigation
- `SettingsValidationResult`: Interface for validation feedback with category-specific errors and warnings
- Re-exported `PersistedSettingsData` from @fishbowl-ai/shared for consistency

**Type Guards and Utilities:**

- `isSettingsFormData`: Runtime validation of settings structure
- `isSettingsCategory`: Validation of category values
- `hasSettingsCategory`: Safe category existence checking
- `createValidValidationResult` & `createInvalidValidationResult`: Validation result factories

**Architecture:**

- Followed one-export-per-file rule with separate files in `combined/` folder
- Created proper barrel export with `index.ts`
- Updated main settings index.ts to export combined types
- All types support atomic operations (all categories saved/loaded together)
- Full TypeScript type safety with no 'any' types
- Comprehensive JSDoc documentation

**Testing:**

- Created 18 comprehensive unit tests covering all functions and edge cases
- Tested type compatibility, validation scenarios, and error handling
- All tests pass with 100% success rate
- Tests include boundary conditions, invalid inputs, and complex scenarios

**Quality Assurance:**

- All lint checks pass (only unrelated warning in shared package)
- Type checking passes successfully
- Formatting applied consistently
- Shared packages build successfully
- No circular dependencies or import issues

The implementation provides the foundation for atomic settings operations and maintains consistency with the existing codebase patterns while enabling future integration hooks to coordinate all individual mappers seamlessly.

- filesChanged: ["packages/ui-shared/src/types/settings/combined/SettingsFormData.ts", "packages/ui-shared/src/types/settings/combined/SettingsCategory.ts", "packages/ui-shared/src/types/settings/combined/PersistedSettingsData.ts", "packages/ui-shared/src/types/settings/combined/SettingsValidationResult.ts", "packages/ui-shared/src/types/settings/combined/isSettingsFormData.ts", "packages/ui-shared/src/types/settings/combined/isSettingsCategory.ts", "packages/ui-shared/src/types/settings/combined/hasSettingsCategory.ts", "packages/ui-shared/src/types/settings/combined/createValidValidationResult.ts", "packages/ui-shared/src/types/settings/combined/createInvalidValidationResult.ts", "packages/ui-shared/src/types/settings/combined/index.ts", "packages/ui-shared/src/types/settings/combined/__tests__/combined.test.ts", "packages/ui-shared/src/types/settings/index.ts"]
