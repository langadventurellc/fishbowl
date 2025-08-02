---
kind: task
id: T-implement-usesettingsvalidation
parent: F-integration-hooks-and-interfaces
status: done
title: Implement useSettingsValidation hook
priority: normal
prerequisites:
  - T-create-combined-settings-types
  - T-create-settings-error
created: "2025-08-01T15:03:01.973829"
updated: "2025-08-01T18:24:32.981129"
schema_version: "1.1"
worktree: null
---

# Implement useSettingsValidation hook

## Purpose

Create a React hook that provides comprehensive validation for settings data, coordinating validation across all categories and returning structured validation results with user-friendly error messages.

## Implementation Details

### File Location

`packages/ui-shared/src/hooks/useSettingsValidation.ts`

### Hook Implementation

```typescript
/**
 * Hook providing validation functions for settings data
 * Validates individual categories and complete settings objects
 */
export function useSettingsValidation() {
  /**
   * Validates complete settings form data
   * @param formData - Combined settings to validate
   * @returns Validation result with category-specific errors
   */
  const validateSettings = useCallback(
    (formData: Partial<SettingsFormData>): SettingsValidationResult => {
      const errors: Record<SettingsCategory, string[]> = {
        general: [],
        appearance: [],
        advanced: [],
      };

      let isValid = true;

      // Validate each category if present
      if (formData.general) {
        const result = generalSettingsSchema.safeParse(formData.general);
        if (!result.success) {
          isValid = false;
          errors.general = result.error.issues.map((issue) =>
            transformValidationError(issue),
          );
        }
      }

      if (formData.appearance) {
        const result = appearanceSettingsSchema.safeParse(formData.appearance);
        if (!result.success) {
          isValid = false;
          errors.appearance = result.error.issues.map((issue) =>
            transformValidationError(issue),
          );
        }
      }

      if (formData.advanced) {
        const result = advancedSettingsSchema.safeParse(formData.advanced);
        if (!result.success) {
          isValid = false;
          errors.advanced = result.error.issues.map((issue) =>
            transformValidationError(issue),
          );
        }
      }

      return {
        isValid,
        errors: isValid ? undefined : errors,
      };
    },
    [],
  );

  /**
   * Validates a single settings category
   * @param category - The category to validate
   * @param data - The data to validate
   * @returns Array of validation errors or empty array
   */
  const validateCategory = useCallback(
    (category: SettingsCategory, data: unknown): string[] => {
      const schemas = {
        general: generalSettingsSchema,
        appearance: appearanceSettingsSchema,
        advanced: advancedSettingsSchema,
      };

      const result = schemas[category].safeParse(data);
      if (!result.success) {
        return result.error.issues.map((issue) =>
          transformValidationError(issue),
        );
      }

      return [];
    },
    [],
  );

  /**
   * Checks if a partial update would result in valid settings
   * @param currentData - Current settings data
   * @param updates - Partial updates to apply
   * @returns Whether the merged data would be valid
   */
  const canUpdate = useCallback(
    (
      currentData: SettingsFormData,
      updates: Partial<SettingsFormData>,
    ): boolean => {
      const merged = {
        general: { ...currentData.general, ...updates.general },
        appearance: { ...currentData.appearance, ...updates.appearance },
        advanced: { ...currentData.advanced, ...updates.advanced },
      };

      const result = validateSettings(merged);
      return result.isValid;
    },
    [validateSettings],
  );

  return {
    validateSettings,
    validateCategory,
    canUpdate,
  };
}
```

### Required Imports

- Validation schemas from shared package
- React hooks (useCallback) for memoization
- Type definitions (SettingsFormData, SettingsCategory, SettingsValidationResult)
- transformValidationError utility from error utilities

### Implementation Requirements

1. **Category-Specific Validation**: Validate each category independently
2. **User-Friendly Errors**: Use transformValidationError for all messages
3. **Partial Validation**: Support validating incomplete data
4. **Memoization**: All functions memoized with useCallback
5. **Type Safety**: Maintain TypeScript types throughout
6. **Performance**: Validation should complete quickly (< 10ms)

### Hook Return Type

```typescript
export interface UseSettingsValidationReturn {
  validateSettings: (
    formData: Partial<SettingsFormData>,
  ) => SettingsValidationResult;
  validateCategory: (category: SettingsCategory, data: unknown) => string[];
  canUpdate: (
    currentData: SettingsFormData,
    updates: Partial<SettingsFormData>,
  ) => boolean;
}
```

### Unit Testing

Create `packages/ui-shared/src/hooks/__tests__/useSettingsValidation.test.ts`:

1. Test validateSettings with valid complete data
2. Test validateSettings with invalid data in each category
3. Test validateSettings with partial data
4. Test validateCategory for each category type
5. Test canUpdate with valid and invalid updates
6. Test error message transformation
7. Test memoization of functions
8. Test performance (validation < 10ms)

**IMPORTANT**: This task should only include unit tests. Do NOT create integration tests or performance tests.

### Example Usage

```typescript
function SettingsForm() {
  const { validateSettings, validateCategory } = useSettingsValidation();

  const handleFieldChange = (
    category: SettingsCategory,
    field: string,
    value: unknown,
  ) => {
    const categoryData = { ...formData[category], [field]: value };
    const errors = validateCategory(category, categoryData);

    if (errors.length === 0) {
      updateFormData(category, categoryData);
    } else {
      showErrors(errors);
    }
  };

  const handleSubmit = () => {
    const result = validateSettings(formData);
    if (result.isValid) {
      saveSettings(formData);
    } else {
      showValidationErrors(result.errors);
    }
  };
}
```

## Acceptance Criteria

- ✓ Hook validates complete and partial settings data
- ✓ Individual category validation available
- ✓ canUpdate helper for pre-validation of changes
- ✓ All validation errors transformed to user-friendly messages
- ✓ Functions properly memoized with useCallback
- ✓ TypeScript type safety maintained
- ✓ JSDoc documentation with examples
- ✓ Comprehensive unit tests
- ✓ Hook exported from hooks/index.ts
- ✓ All quality checks pass

## Dependencies

- Validation schemas from @fishbowl-ai/shared
- Combined settings types
- Error transformation utilities
- React hooks for memoization

## Performance Requirements

- Hook initialization < 5ms
- Complete validation < 10ms
- Individual category validation < 3ms
- No unnecessary re-renders from function changes

### Log

**2025-08-01T23:35:11.751337Z** - Successfully implemented useSettingsValidation hook with comprehensive validation functions for settings data. The hook provides three main functions: validateSettings for complete/partial validation, validateCategory for individual category validation, and canUpdate for detecting valid changes. All functions are properly memoized with useCallback for performance. Error messages are user-friendly and validation completes quickly (< 10ms). Implementation includes comprehensive unit tests covering all functionality including memoization and performance requirements. All 524 tests pass and quality checks are clean.

- filesChanged: ["packages/ui-shared/src/hooks/useSettingsValidation.ts", "packages/ui-shared/src/hooks/UseSettingsValidationReturn.ts", "packages/ui-shared/src/hooks/__tests__/useSettingsValidation.test.ts", "packages/ui-shared/src/hooks/index.ts"]
