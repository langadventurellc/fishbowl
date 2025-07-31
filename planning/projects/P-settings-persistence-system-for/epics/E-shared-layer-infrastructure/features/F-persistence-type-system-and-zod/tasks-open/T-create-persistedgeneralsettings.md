---
kind: task
id: T-create-persistedgeneralsettings
title: Create PersistedGeneralSettings interface and schema
status: open
priority: high
prerequisites: []
created: "2025-07-31T12:33:48.968462"
updated: "2025-07-31T12:33:48.968462"
schema_version: "1.1"
parent: F-persistence-type-system-and-zod
---

# Create PersistedGeneralSettings Interface and Schema

## Context

Create the persistence type definitions and Zod validation schema for general application settings. This establishes the foundational types for settings persistence, separate from the UI form types.

Based on the analysis of `GeneralSettings.tsx`, the following properties need persistence:

- **Auto Mode Settings**: responseDelay (number, ms), maximumMessages (number), maximumWaitTime (number, ms)
- **Conversation Defaults**: defaultMode ("manual" | "auto"), maximumAgents (number 1-8)
- **Other Settings**: checkUpdates (boolean)

## Implementation Requirements

### File Location

- Create in `packages/shared/src/types/settings/persistedGeneralSettings.ts`
- This maintains separation from UI concerns in ui-shared package

### Type Definition

```typescript
interface PersistedGeneralSettings {
  // Auto Mode Settings - stored in milliseconds for precision
  responseDelay: number; // 1000-30000ms
  maximumMessages: number; // 0-500 (0 = unlimited)
  maximumWaitTime: number; // 5000-120000ms

  // Conversation Defaults
  defaultMode: "manual" | "auto";
  maximumAgents: number; // 1-8

  // Other Settings
  checkUpdates: boolean;
}
```

### Zod Schema Implementation

Create `generalSettingsSchema` with:

- Comprehensive validation rules matching UI constraints
- Clear default values using `.default()` method
- Security validation (no XSS, reasonable limits)
- Custom cross-field validation using `.superRefine()`
- Detailed error messages for validation failures

### Validation Rules

- **responseDelay**: 1000-30000ms, integer, must be less than maximumWaitTime
- **maximumMessages**: 0-500, integer, validate with defaultMode (warn if unlimited + auto)
- **maximumWaitTime**: 5000-120000ms, integer
- **defaultMode**: enum validation with clear error messages
- **maximumAgents**: 1-8, integer
- **checkUpdates**: boolean validation

### Security Considerations

- Validate numeric ranges prevent memory issues
- Ensure enum values prevent injection
- No sensitive data logging in validation failures

## Acceptance Criteria

- ✓ Interface defines exact structure for JSON serialization (flat, no nested objects)
- ✓ Zod schema validates all properties with appropriate constraints
- ✓ Default values provided for every setting using `.default()` method
- ✓ Schema parsing throws clear validation errors for invalid data
- ✓ Cross-field validation ensures responseDelay < maximumWaitTime
- ✓ Schema evolution support with version field
- ✓ Unit tests cover valid/invalid inputs and edge cases
- ✓ Security validation prevents out-of-range values
- ✓ Works identically in Node.js and browser environments

## Testing Requirements

- Test schema validation with valid general settings data
- Test invalid inputs throw ZodError with specific paths
- Test default value generation for undefined inputs
- Test cross-field validation (responseDelay vs maximumWaitTime)
- Test edge cases (0 values, boundary values)
- Test type inference produces correct TypeScript types

### Log
