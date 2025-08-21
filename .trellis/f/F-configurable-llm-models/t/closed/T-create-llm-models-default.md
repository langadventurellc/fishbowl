---
id: T-create-llm-models-default
title: Create LLM models default settings creation functions
status: done
priority: medium
parent: F-configurable-llm-models
prerequisites:
  - T-create-llm-models-schema-and
  - T-create-default-llm-models
affectedFiles:
  packages/shared/src/types/settings/getDefaultLlmModels.ts: Created function to
    get bundled default LLM models without wrapper metadata, following exact
    pattern from getDefaultPersonalities.ts with proper validation and error
    handling
  packages/shared/src/types/settings/createDefaultLlmModelsSettings.ts:
    Created function to create default LLM models settings structure with
    includeDefaults parameter, following exact pattern from
    createDefaultPersonalitiesSettings.ts
  packages/shared/src/types/settings/index.ts: Added exports for both new
    functions to make them available from shared package
  packages/shared/src/types/settings/__tests__/getDefaultLlmModels.test.ts:
    Comprehensive unit tests covering functionality, validation, error handling,
    and data consistency for getDefaultLlmModels function
  packages/shared/src/types/settings/__tests__/createDefaultLlmModelsSettings.test.ts:
    Comprehensive unit tests covering functionality, validation, error handling,
    and includeDefaults parameter behavior for createDefaultLlmModelsSettings
    function
log:
  - Successfully implemented LLM models default settings creation functions
    following the exact pattern established by personalities. Created
    getDefaultLlmModels() and createDefaultLlmModelsSettings() functions with
    comprehensive error handling, validation, and testing. Both functions
    validate against the existing schema, handle edge cases gracefully, and
    provide proper fallbacks. All quality checks pass and comprehensive unit
    tests cover functionality, edge cases, and validation requirements.
schema: v1.0
childrenIds: []
created: 2025-08-21T19:37:18.397Z
updated: 2025-08-21T19:37:18.397Z
---

## Context

Create the default settings creation functions that load and validate the bundled LLM models configuration. This follows the exact pattern established by personalities and roles in the codebase.

These functions are used by the repository to initialize default configurations when no user configuration exists, and for resetting to defaults.

Reference files:

- `packages/shared/src/types/settings/getDefaultPersonalities.ts`
- `packages/shared/src/types/settings/createDefaultPersonalitiesSettings.ts`

## Specific Implementation Requirements

### 1. Create Default Models Getter (`packages/shared/src/types/settings/getDefaultLlmModels.ts`)

Follow the exact pattern from `getDefaultPersonalities.ts`:

```typescript
import type { PersistedLlmProviderData } from "./PersistedLlmProviderData";
import { persistedLlmModelsSettingsSchema } from "./llmModelsSchema";
import defaultLlmModelsData from "../../data/defaultLlmModels.json";

/**
 * Gets the bundled default LLM models without wrapper metadata
 * @returns Array of default provider data, or empty array if not available
 */
export function getDefaultLlmModels(): PersistedLlmProviderData[] {
  try {
    const validatedData =
      persistedLlmModelsSettingsSchema.parse(defaultLlmModelsData);
    return validatedData.providers;
  } catch (error) {
    console.warn("Failed to validate default LLM models:", error);
    return [];
  }
}
```

### 2. Create Default Settings Creator (`packages/shared/src/types/settings/createDefaultLlmModelsSettings.ts`)

Follow the exact pattern from `createDefaultPersonalitiesSettings.ts`:

```typescript
import type { PersistedLlmModelsSettingsData } from "./PersistedLlmModelsSettingsData";
import type { PersistedLlmProviderData } from "./PersistedLlmProviderData";
import { persistedLlmModelsSettingsSchema } from "./llmModelsSchema";
import defaultLlmModelsData from "../../data/defaultLlmModels.json";

/**
 * Creates the default LLM models settings structure
 * @param includeDefaults - Whether to include the bundled default models (default: true)
 * @returns Default LLM models settings with optional default models
 */
export function createDefaultLlmModelsSettings(
  includeDefaults: boolean = true,
): PersistedLlmModelsSettingsData {
  let providers: PersistedLlmProviderData[] = [];

  if (includeDefaults) {
    try {
      // Validate the default data against current schema
      const validatedData =
        persistedLlmModelsSettingsSchema.parse(defaultLlmModelsData);
      providers = validatedData.providers;
    } catch (error) {
      console.warn(
        "Default LLM models data validation failed, using empty array:",
        error,
      );
      providers = [];
    }
  }

  return {
    schemaVersion: "1.0.0",
    providers,
    lastUpdated: new Date().toISOString(),
  };
}
```

### 3. Update Shared Package Index

Add exports to `packages/shared/src/types/settings/index.ts`:

```typescript
export * from "./getDefaultLlmModels";
export * from "./createDefaultLlmModelsSettings";
```

## Technical Approach

1. **Copy Existing Pattern**: Use personalities functions as exact template
2. **Replace Domain Logic**: Change personalities-specific code to LLM models
3. **Maintain Error Handling**: Keep same validation and fallback patterns
4. **Preserve Function Signatures**: Match parameter names and return types
5. **Include Documentation**: Copy JSDoc patterns with updated descriptions

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ getDefaultLlmModels() returns array of provider data from JSON file
- ✅ createDefaultLlmModelsSettings() creates complete settings structure
- ✅ Functions handle includeDefaults parameter correctly
- ✅ Validation errors result in empty array fallback (no crashes)
- ✅ Generated timestamps are in ISO format
- ✅ Schema version is set to "1.0.0"

### Error Handling Requirements

- ✅ Invalid JSON data logs warning and returns empty array
- ✅ Schema validation failures are caught and handled gracefully
- ✅ Functions never throw exceptions (always return valid data)
- ✅ Console warnings provide helpful debugging information

### Integration Requirements

- ✅ Functions are exported from shared package index
- ✅ Import paths match established conventions
- ✅ TypeScript types are correctly inferred
- ✅ Functions work with both default and empty configurations

### Testing Requirements

- ✅ Include unit tests for both functions
- ✅ Test default data loading and validation
- ✅ Test includeDefaults parameter behavior
- ✅ Test error handling with invalid data
- ✅ Test schema validation edge cases
- ✅ Verify timestamp generation

## Dependencies

- Requires T-create-llm-models-schema-and for schema and type definitions
- Requires T-create-default-llm-models for the JSON configuration file

## Security Considerations

- **Input Validation**: JSON data is validated against Zod schema
- **Error Isolation**: Validation failures don't crash the application
- **No External Data**: Functions only process bundled configuration files
- **Type Safety**: All return values are properly typed

## Files Created

- `packages/shared/src/types/settings/getDefaultLlmModels.ts`
- `packages/shared/src/types/settings/createDefaultLlmModelsSettings.ts`
- Unit tests for both functions

## Files Modified

- `packages/shared/src/types/settings/index.ts` - Add new exports
