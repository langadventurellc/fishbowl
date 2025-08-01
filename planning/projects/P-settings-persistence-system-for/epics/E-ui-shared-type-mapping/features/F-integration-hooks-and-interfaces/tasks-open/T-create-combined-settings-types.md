---
kind: task
id: T-create-combined-settings-types
title: Create combined settings types and interfaces
status: open
priority: high
prerequisites: []
created: "2025-08-01T15:01:23.153083"
updated: "2025-08-01T15:01:23.153083"
schema_version: "1.1"
parent: F-integration-hooks-and-interfaces
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
