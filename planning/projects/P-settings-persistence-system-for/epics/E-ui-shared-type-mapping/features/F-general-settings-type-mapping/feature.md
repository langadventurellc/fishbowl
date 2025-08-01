---
kind: feature
id: F-general-settings-type-mapping
title: General Settings Type Mapping
status: done
priority: high
prerequisites: []
created: "2025-07-31T22:01:40.624558"
updated: "2025-08-01T17:43:20.222784+00:00"
schema_version: "1.1"
parent: E-ui-shared-type-mapping
---

# General Settings Type Mapping

## Purpose and Functionality

Implement bidirectional type mapping functions for General Settings between UI form types and persistence types in the ui-shared package. This feature creates the foundational mapping layer that enables the desktop application to convert between GeneralSettingsFormData (UI representation) and PersistedGeneralSettingsData (storage format) while maintaining type safety and data integrity.

## Key Components to Implement

### 1. Type Mapping Functions

- `mapGeneralSettingsUIToPersistence`: Convert GeneralSettingsFormData to PersistedGeneralSettingsData
- `mapGeneralSettingsPersistenceToUI`: Convert PersistedGeneralSettingsData to GeneralSettingsFormData

### 2. Field Mappings

- Direct field mappings for matching fields
- Handle any naming differences between UI and persistence layers
- Ensure all fields are properly mapped with no data loss

### 3. Error Handling

- Graceful handling of missing fields during mapping
- Type-safe error handling without throwing exceptions
- Return Result types or use error callbacks

## Detailed Acceptance Criteria

### Functional Behavior

- ✓ UI to Persistence mapping correctly converts all general settings fields:
  - responseDelay (milliseconds)
  - maximumMessages (integer)
  - maximumWaitTime (milliseconds)
  - defaultMode ("manual" | "auto")
  - maximumAgents (integer)
  - checkUpdates (boolean)
- ✓ Persistence to UI mapping correctly converts all fields back
- ✓ Round-trip conversion maintains data fidelity (UI → Persistence → UI results in identical data)
- ✓ Handle missing fields by applying sensible defaults from schema
- ✓ No runtime errors during mapping operations

### Type Safety Requirements

- ✓ Full TypeScript type coverage with no 'any' types
- ✓ Input and output types properly enforced
- ✓ Compile-time type checking for all mappings
- ✓ Type guards for runtime validation where needed

### Integration Points

- ✓ Import GeneralSettingsFormData from existing ui-shared types
- ✓ Import PersistedGeneralSettingsData from @fishbowl-ai/shared package
- ✓ Export mapping functions from ui-shared package index
- ✓ Functions are pure with no side effects

### Performance Requirements

- ✓ Mapping operations complete in < 1ms
- ✓ No unnecessary object cloning or memory allocation
- ✓ Efficient field-by-field mapping

### Security Validation

- ✓ No sensitive data exposed in logs or error messages
- ✓ Input validation prevents injection attacks
- ✓ Safe handling of unexpected data types

## Technical Requirements

### Implementation Structure

```typescript
// packages/ui-shared/src/mapping/settings/generalSettingsMapper.ts
export function mapGeneralSettingsUIToPersistence(
  uiData: GeneralSettingsFormData,
): PersistedGeneralSettingsData;

export function mapGeneralSettingsPersistenceToUI(
  persistedData: PersistedGeneralSettingsData,
): GeneralSettingsFormData;
```

### Dependencies

- GeneralSettingsFormData from ui-shared types
- PersistedGeneralSettingsData from @fishbowl-ai/shared
- Default values from both schemas for missing field handling
- Common mapping utilities (F-common-mapping-utilities) for shared functionality

## Implementation Guidance

### Technical Approach

1. Create mapper module in `packages/ui-shared/src/mapping/settings/`
2. Import required types from both ui-shared and shared packages
3. **Leverage common mapping utilities** for consistent transformation patterns:
   - Use `applyDefaults` utility for missing field handling
   - Use `mapWithDefaults` for combining mapping with default injection
   - Use `coerceBoolean` for safe boolean conversions
   - Use `clampNumber` to ensure numeric values stay within bounds
4. Implement pure mapping functions with explicit field mappings
5. Use object spread for efficient copying when utilities don't apply

### Best Practices

- Keep functions pure and deterministic
- **Prefer common utilities over custom implementations** for consistency
- Use explicit field mapping (no dynamic property iteration)
- Document any field transformations
- Include JSDoc comments for public API

## Testing Requirements

### Unit Tests

- Test successful mapping in both directions
- Test handling of missing fields
- Test handling of extra/unknown fields
- Test round-trip conversion fidelity
- Test edge cases (null, undefined, empty objects)
- Test type validation

### Integration Tests

- Verify mapper works with actual UI forms
- Verify mapper works with persistence layer
- Test error scenarios

## Security Considerations

- Validate input types before mapping
- Never log sensitive user data
- Ensure no code injection through field values
- Sanitize any string values if needed

## Performance Requirements

- Mappings should be synchronous and fast
- Avoid deep cloning when shallow copy suffices
- Minimize object allocations
- Target sub-millisecond execution time

### Log
