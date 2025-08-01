---
kind: task
id: T-create-1
title: Create AppearanceSettingsFormData type and schema with defaults
status: open
priority: high
prerequisites: []
created: "2025-08-01T12:46:24.841468"
updated: "2025-08-01T12:46:24.841468"
schema_version: "1.1"
parent: F-appearance-settings-type-mapping
---

# Create AppearanceSettingsFormData type and schema with defaults

## Purpose

Create the UI form data type, Zod validation schema, and default values for Appearance Settings in the ui-shared package. This establishes the foundation for form validation and type safety.

## Implementation Details

### File Location

Create: `packages/ui-shared/src/types/settings/appearanceSettings.ts`

### Required Imports

```typescript
import { z } from "zod";
```

### Type and Schema Structure

```typescript
export const appearanceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  showTimestamps: z.enum(["always", "hover", "never"]),
  showActivityTime: z.boolean(),
  compactList: z.boolean(),
  fontSize: z.number().min(12).max(20),
  messageSpacing: z.enum(["compact", "normal", "relaxed"]),
});

export type AppearanceSettingsFormData = z.infer<
  typeof appearanceSettingsSchema
>;

export const defaultAppearanceSettings: AppearanceSettingsFormData = {
  theme: "system",
  showTimestamps: "hover",
  showActivityTime: true,
  compactList: false,
  fontSize: 14,
  messageSpacing: "normal",
};
```

### Documentation Requirements

- Add JSDoc comments explaining each field and its purpose
- Document valid ranges and enum values
- Include usage examples

## Technical Approach

1. Create the file in the specified location following existing patterns
2. Define the Zod schema with proper validation rules:
   - Theme: enum with light/dark/system options
   - showTimestamps: enum with always/hover/never options
   - showActivityTime: boolean for activity display
   - compactList: boolean for list density
   - fontSize: number with 12-20 range validation
   - messageSpacing: enum with compact/normal/relaxed options
3. Infer TypeScript type from schema
4. Create sensible default values matching UI expectations
5. Add comprehensive JSDoc documentation

## Unit Testing Requirements

Create: `packages/ui-shared/src/types/settings/__tests__/appearanceSettings.test.ts`

Test coverage should include:

- Schema validation for all valid enum values
- Boundary testing for fontSize (12, 20, out of range)
- Boolean field validation
- Invalid value rejection
- Default values verification
- Type inference correctness

## Acceptance Criteria

- ✓ AppearanceSettingsFormData type correctly defines all appearance fields
- ✓ Zod schema validates all field types and constraints
- ✓ fontSize range properly constrained to 12-20
- ✓ All enum values are properly typed and validated
- ✓ Default values provide sensible UI defaults
- ✓ Schema rejects invalid values with clear error messages
- ✓ Full TypeScript type safety with no 'any' types
- ✓ JSDoc documentation explains all fields and constraints
- ✓ Unit tests achieve 100% code coverage
- ✓ All tests pass and quality checks are clean

## Integration Points

- Export all types and schema from ui-shared package
- Make available for form validation in desktop and mobile apps
- Ensure compatibility with existing settings architecture

## Dependencies

- Zod for schema validation (already available in project)
- Follow existing type patterns in ui-shared package
- Coordinate with PersistedAppearanceSettingsData from @fishbowl-ai/shared

## Security Considerations

- Validate all enum values against allowed options
- Ensure fontSize stays within safe bounds (12-20px)
- No code execution through theme or string values
- Safe handling of user input through Zod validation

### Log
