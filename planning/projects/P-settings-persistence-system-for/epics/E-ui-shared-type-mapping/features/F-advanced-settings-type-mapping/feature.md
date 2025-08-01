---
kind: feature
id: F-advanced-settings-type-mapping
title: Advanced Settings Type Mapping
status: in-progress
priority: high
prerequisites: []
created: "2025-07-31T22:02:52.508053"
updated: "2025-07-31T22:02:52.508053"
schema_version: "1.1"
parent: E-ui-shared-type-mapping
---

# Advanced Settings Type Mapping

## Purpose and Functionality

Implement bidirectional type mapping functions for Advanced Settings between UI form types and persistence types in the ui-shared package. This feature includes creating the AdvancedSettingsFormData type and schema for the UI layer, then implementing mappers that convert between this UI representation and PersistedAdvancedSettingsData (storage format) while maintaining type safety and data integrity.

## Key Components to Implement

### 1. UI Form Types and Schema

- Create `AdvancedSettingsFormData` type definition
- Create `advancedSettingsSchema` Zod schema for UI validation
- Define default values for advanced settings

### 2. Type Mapping Functions

- `mapAdvancedSettingsUIToPersistence`: Convert AdvancedSettingsFormData to PersistedAdvancedSettingsData
- `mapAdvancedSettingsPersistenceToUI`: Convert PersistedAdvancedSettingsData to AdvancedSettingsFormData

### 3. Field Mappings

- Developer options (debugLogging boolean)
- Experimental features toggle
- Future extensibility for additional advanced options

## Detailed Acceptance Criteria

### Functional Behavior

- ✓ Create complete AdvancedSettingsFormData type with all fields:
  - debugLogging: boolean
  - experimentalFeatures: boolean
- ✓ UI to Persistence mapping correctly converts all advanced settings fields
- ✓ Persistence to UI mapping correctly converts all fields back
- ✓ Round-trip conversion maintains data fidelity
- ✓ Handle missing fields by applying sensible defaults (false for developer options)
- ✓ Support future extensibility without breaking existing mappings

### Type Safety Requirements

- ✓ Full TypeScript type coverage with no 'any' types
- ✓ Zod schema provides runtime validation
- ✓ Boolean fields properly validated
- ✓ Compile-time type checking for all mappings

### User Interface Requirements

- ✓ Form validation for boolean toggles
- ✓ Clear labeling of developer-only options
- ✓ Default to safe values (false) for all options

### Integration Points

- ✓ Export AdvancedSettingsFormData from ui-shared types
- ✓ Import PersistedAdvancedSettingsData from @fishbowl-ai/shared
- ✓ Export mapping functions from ui-shared package
- ✓ Schema available for form validation

### Performance Requirements

- ✓ Mapping operations complete in < 1ms
- ✓ Minimal overhead for boolean conversions
- ✓ Efficient handling of sparse objects

## Technical Requirements

### Implementation Structure

```typescript
// packages/ui-shared/src/types/settings/advancedSettings.ts
export const advancedSettingsSchema = z.object({
  debugLogging: z.boolean().default(false),
  experimentalFeatures: z.boolean().default(false),
});

export type AdvancedSettingsFormData = z.infer<typeof advancedSettingsSchema>;

export const defaultAdvancedSettings: AdvancedSettingsFormData = {
  debugLogging: false,
  experimentalFeatures: false,
};

// packages/ui-shared/src/mapping/settings/advancedSettingsMapper.ts
export function mapAdvancedSettingsUIToPersistence(
  uiData: AdvancedSettingsFormData,
): PersistedAdvancedSettingsData;

export function mapAdvancedSettingsPersistenceToUI(
  persistedData: PersistedAdvancedSettingsData,
): AdvancedSettingsFormData;
```

### Dependencies

- Zod for schema validation
- PersistedAdvancedSettingsData from @fishbowl-ai/shared
- Boolean validation utilities
- Common mapping utilities (F-common-mapping-utilities) for shared functionality

## Implementation Guidance

### Technical Approach

1. Create advanced settings types in `packages/ui-shared/src/types/settings/`
2. Define Zod schema with boolean validation
3. Create mapper module in `packages/ui-shared/src/mapping/settings/`
4. **Leverage common mapping utilities** for consistent transformation patterns:
   - Use `applyDefaults` utility for missing field handling
   - Use `coerceBoolean` for safe boolean conversions from various input types
   - Use `mapWithDefaults` for combining mapping with default injection
5. Implement straightforward boolean field mapping
6. Default all developer options to false for safety

### Best Practices

- **Prefer common utilities over custom implementations** for consistency
- Keep advanced settings simple and boolean-based
- Use `coerceBoolean` utility rather than manual boolean conversion
- Default to the safest option (false)
- Plan for future extensibility
- Clear documentation of each option's purpose

## Testing Requirements

### Unit Tests

- Test schema validation for boolean fields
- Test mapping in both directions
- Test handling of missing fields
- Test default value application
- Test handling of null/undefined values
- Test future field additions don't break mappings

### Integration Tests

- Verify mapper works with UI forms
- Test persistence layer integration
- Validate toggle functionality

## Security Considerations

- Debug logging should default to false
- Experimental features should default to false
- No sensitive data exposure through debug options
- Validate boolean types strictly

## Performance Requirements

- Synchronous mapping operations
- Minimal overhead for simple boolean mappings
- Efficient object creation
- Sub-millisecond execution

## Developer Experience

- Clear naming for developer options
- Intuitive boolean toggles
- Safe defaults prevent accidental enablement
- Easy to add new advanced options in future

### Log
