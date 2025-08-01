---
kind: task
id: T-create-advancedsettingsformdata
parent: F-advanced-settings-type-mapping
status: done
title: Create AdvancedSettingsFormData type and schema with defaults
priority: high
prerequisites: []
created: "2025-08-01T13:30:33.280661"
updated: "2025-08-01T13:32:43.153008"
schema_version: "1.1"
worktree: null
---

# Create AdvancedSettingsFormData type and schema with defaults

## Purpose

Create the UI form data type, Zod validation schema, and default values for Advanced Settings in the ui-shared package. This establishes the foundation for form validation and type safety with boolean developer options.

## Implementation Details

### File Location

Create: `packages/ui-shared/src/types/settings/advancedSettings.ts`

### Required Imports

```typescript
import { z } from "zod";
```

### Type and Schema Structure

```typescript
export const advancedSettingsSchema = z.object({
  debugLogging: z.boolean().default(false),
  experimentalFeatures: z.boolean().default(false),
});

export type AdvancedSettingsFormData = z.infer<typeof advancedSettingsSchema>;

export const defaultAdvancedSettings: AdvancedSettingsFormData = {
  debugLogging: false,
  experimentalFeatures: false,
};
```

### Documentation Requirements

- Add JSDoc comments explaining each field and its purpose
- Document safety considerations for developer options
- Include usage examples for form validation

## Technical Approach

1. Create the file in the specified location following existing patterns from appearanceSettings.ts
2. Define the Zod schema with proper boolean validation:
   - debugLogging: boolean for development logging control (defaults to false for security)
   - experimentalFeatures: boolean for experimental feature toggles (defaults to false for stability)
3. Infer TypeScript type from schema
4. Create safe default values (all false to prevent accidental enablement)
5. Add comprehensive JSDoc documentation with security warnings

## Unit Testing Requirements

Create: `packages/ui-shared/src/types/settings/__tests__/advancedSettings.test.ts`

Test coverage should include:

- Schema validation for boolean values (true/false)
- Invalid value rejection (non-boolean inputs)
- Default values verification (both false)
- Type inference correctness
- Coercion handling for various boolean-like inputs
- Schema error messages for debugging

## Acceptance Criteria

- ✓ AdvancedSettingsFormData type correctly defines boolean developer options fields
- ✓ Zod schema validates boolean types and provides clear error messages
- ✓ Both debugLogging and experimentalFeatures default to false for safety
- ✓ Schema rejects non-boolean values with descriptive error messages
- ✓ Default values provide safe developer option defaults (all disabled)
- ✓ Full TypeScript type safety with no 'any' types
- ✓ JSDoc documentation explains security implications of each option
- ✓ Unit tests achieve 100% code coverage
- ✓ All tests pass and quality checks are clean

## Integration Points

- Export all types and schema from ui-shared package
- Make available for form validation in desktop and mobile apps
- Ensure compatibility with existing settings architecture
- Coordinate with PersistedAdvancedSettingsData from @fishbowl-ai/shared

## Dependencies

- Zod for schema validation (already available in project)
- Follow existing type patterns in ui-shared package (appearanceSettings.ts as reference)
- Coordinate with PersistedAdvancedSettingsData from @fishbowl-ai/shared

## Security Considerations

- All developer options default to false to prevent accidental enablement
- Debug logging disabled by default to prevent information leakage
- Experimental features disabled by default to maintain stability
- Validate boolean types strictly to prevent type confusion
- No code execution through configuration values

### Log

**2025-08-01T18:38:56.989822Z** - Successfully implemented AdvancedSettingsFormData type and schema with comprehensive validation and security defaults.

Key Implementation Details:

- Created complete AdvancedSettingsFormData type with debugLogging and experimentalFeatures boolean fields
- Implemented strict Zod validation schema with custom error messages
- All developer options default to false for security (prevents accidental enablement of debug logging or experimental features)
- Added comprehensive JSDoc documentation with security warnings
- Created exhaustive test suite with 25 test cases achieving 100% code coverage
- Tests validate boolean type safety, reject invalid inputs, verify security defaults, and ensure schema strictness
- Updated barrel export to make types available throughout ui-shared package
- All quality checks passing (lint, format, type-check)
- Package successfully rebuilt to make new types available for import

Security Considerations Implemented:

- Debug logging disabled by default to prevent information leakage
- Experimental features disabled by default to maintain application stability
- Strict schema validation prevents extra fields and type confusion
- Explicit boolean validation with no truthy/falsy coercion allowed
- filesChanged: ["packages/ui-shared/src/types/settings/advancedSettings.ts", "packages/ui-shared/src/types/settings/index.ts", "packages/ui-shared/src/types/settings/__tests__/advancedSettings.test.ts"]
