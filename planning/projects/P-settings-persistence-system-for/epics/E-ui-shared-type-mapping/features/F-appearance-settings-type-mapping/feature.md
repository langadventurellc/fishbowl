---
kind: feature
id: F-appearance-settings-type-mapping
title: Appearance Settings Type Mapping
status: in-progress
priority: high
prerequisites: []
created: "2025-07-31T22:02:17.348150"
updated: "2025-07-31T22:02:17.348150"
schema_version: "1.1"
parent: E-ui-shared-type-mapping
---

# Appearance Settings Type Mapping

## Purpose and Functionality

Implement bidirectional type mapping functions for Appearance Settings between UI form types and persistence types in the ui-shared package. This feature includes creating the AppearanceSettingsFormData type and schema for the UI layer, then implementing mappers that convert between this UI representation and PersistedAppearanceSettingsData (storage format) while maintaining type safety and data integrity.

## Key Components to Implement

### 1. UI Form Types and Schema

- Create `AppearanceSettingsFormData` type definition
- Create `appearanceSettingsSchema` Zod schema for UI validation
- Define default values for appearance settings

### 2. Type Mapping Functions

- `mapAppearanceSettingsUIToPersistence`: Convert AppearanceSettingsFormData to PersistedAppearanceSettingsData
- `mapAppearanceSettingsPersistenceToUI`: Convert PersistedAppearanceSettingsData to AppearanceSettingsFormData

### 3. Field Mappings

- Theme selection (light/dark/system)
- Display settings (showTimestamps, showActivityTime, compactList)
- Chat display settings (fontSize, messageSpacing)
- Handle enum conversions and validation

## Detailed Acceptance Criteria

### Functional Behavior

- ✓ Create complete AppearanceSettingsFormData type with all fields:
  - theme: "light" | "dark" | "system"
  - showTimestamps: "always" | "hover" | "never"
  - showActivityTime: boolean
  - compactList: boolean
  - fontSize: number (range: 12-20)
  - messageSpacing: "compact" | "normal" | "relaxed"
- ✓ UI to Persistence mapping correctly converts all appearance settings fields
- ✓ Persistence to UI mapping correctly converts all fields back
- ✓ Round-trip conversion maintains data fidelity
- ✓ Handle missing fields by applying sensible defaults
- ✓ Enum values are properly validated and converted

### Type Safety Requirements

- ✓ Full TypeScript type coverage with no 'any' types
- ✓ Zod schema provides runtime validation for UI forms
- ✓ Type-safe enum conversions
- ✓ Compile-time type checking for all mappings

### User Interface Requirements

- ✓ Form validation provides clear error messages
- ✓ Font size constraints are enforced (12-20px)
- ✓ Theme options are properly typed
- ✓ Timestamp display options are validated

### Integration Points

- ✓ Export AppearanceSettingsFormData from ui-shared types
- ✓ Import PersistedAppearanceSettingsData from @fishbowl-ai/shared
- ✓ Export mapping functions from ui-shared package
- ✓ Schema available for form validation

### Performance Requirements

- ✓ Mapping operations complete in < 1ms
- ✓ Efficient enum conversions
- ✓ No unnecessary object allocations

## Technical Requirements

### Implementation Structure

```typescript
// packages/ui-shared/src/types/settings/appearanceSettings.ts
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

// packages/ui-shared/src/mapping/settings/appearanceSettingsMapper.ts
export function mapAppearanceSettingsUIToPersistence(
  uiData: AppearanceSettingsFormData,
): PersistedAppearanceSettingsData;

export function mapAppearanceSettingsPersistenceToUI(
  persistedData: PersistedAppearanceSettingsData,
): AppearanceSettingsFormData;
```

### Dependencies

- Zod for schema validation
- PersistedAppearanceSettingsData from @fishbowl-ai/shared
- Theme and display enums shared between layers
- Common mapping utilities (F-common-mapping-utilities) for shared functionality

## Implementation Guidance

### Technical Approach

1. Create appearance settings types in `packages/ui-shared/src/types/settings/`
2. Define Zod schema with proper validation rules
3. Create mapper module in `packages/ui-shared/src/mapping/settings/`
4. **Leverage common mapping utilities** for consistent transformation patterns:
   - Use `normalizeEnum` utility for safe enum conversions with fallbacks
   - Use `applyDefaults` utility for missing field handling
   - Use `clampNumber` to ensure fontSize stays within 12-20 range
   - Use `coerceBoolean` for display preference conversions
5. Implement bidirectional mapping with explicit enum handling
6. Ensure proper default values for all fields

### Best Practices

- **Prefer common utilities over custom implementations** for consistency
- Use string literal unions for theme and spacing options
- Leverage `normalizeEnum` for all enum conversions rather than manual validation
- Keep display preferences as simple booleans
- Document any transformation logic

## Testing Requirements

### Unit Tests

- Test schema validation for all fields
- Test mapping in both directions
- Test enum conversions
- Test boundary values for fontSize
- Test handling of invalid data
- Test default value application

### Integration Tests

- Verify mapper works with UI forms
- Test persistence layer integration
- Validate error scenarios

## Security Considerations

- Validate all enum values against allowed options
- Ensure fontSize stays within safe bounds
- No code execution through theme values
- Safe handling of unexpected values

## Performance Requirements

- Synchronous mapping operations
- Efficient enum lookups
- Minimal memory allocation
- Sub-millisecond execution

### Log
