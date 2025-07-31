---
kind: feature
id: F-persistence-type-system-and-zod
title: Persistence Type System and Zod Schemas
status: in-progress
priority: high
prerequisites: []
created: "2025-07-31T12:19:09.144299"
updated: "2025-07-31T12:19:09.144299"
schema_version: "1.1"
parent: E-shared-layer-infrastructure
---

# Persistence Type System and Zod Schemas

## Purpose and Functionality

Establish the foundational type definitions and validation schemas for the settings persistence system. This feature creates the complete type system for General, Appearance, and Advanced settings along with comprehensive Zod schemas for validation, defaults, and schema evolution support.

## Key Components to Implement

### 1. Persistence Type Definitions

- `PersistedGeneralSettings` interface with all general configuration properties
- `PersistedAppearanceSettings` interface with theme and UI customization properties
- `PersistedAdvancedSettings` interface with power-user configuration options
- `PersistedSettings` union type encompassing all settings categories
- Utility types for partial updates and schema versioning

### 2. Zod Schema Definitions

- `generalSettingsSchema` with validation rules and defaults for all general settings
- `appearanceSettingsSchema` with theme validation and UI preference defaults
- `advancedSettingsSchema` with power-user configuration validation and defaults
- `persistedSettingsSchema` as the master schema combining all categories
- Schema versioning support for future migrations

## Detailed Acceptance Criteria

### Functional Behavior

- ✓ All settings interfaces define exact structure expected by persistence layer
- ✓ Types use primitive values and arrays only (no nested objects for serialization)
- ✓ Zod schemas validate all required and optional properties correctly
- ✓ Default values provided for every setting using `.default()` method
- ✓ Schema parsing throws clear validation errors for invalid data
- ✓ Schema accepts `undefined` and applies defaults appropriately
- ✓ All schemas support partial updates for incremental saves

### Data Validation and Error Handling

- ✓ Invalid email addresses rejected with clear error messages
- ✓ Out-of-range numeric values (theme opacity, timeouts) rejected
- ✓ Unknown enum values (theme modes, languages) rejected with suggestions
- ✓ Required fields missing trigger specific error messages
- ✓ Malformed objects return detailed validation error paths
- ✓ Schema evolution tags support future version migrations

### Performance Requirements

- ✓ Schema validation completes within 10ms for typical settings object
- ✓ Memory footprint of schema definitions under 100KB
- ✓ Default value generation has no performance impact on validation

### Security Validation

- ✓ String length limits enforced (usernames, file paths, custom CSS)
- ✓ URL validation prevents javascript: and data: schemes in theme URLs
- ✓ File path validation rejects directory traversal attempts (../, ~/)
- ✓ Custom CSS content sanitized to prevent XSS injection
- ✓ No sensitive data logged during validation failures

### Integration Requirements

- ✓ Exports clean TypeScript interfaces for UI layers to import
- ✓ Zod schemas can be imported independently for validation-only use cases
- ✓ Type definitions compatible with JSON serialization/deserialization
- ✓ No runtime dependencies on UI packages (React, DOM types)
- ✓ Works identically in Node.js and browser environments

## Implementation Guidance

### Type Design Patterns

```typescript
// Flat structure optimized for JSON persistence
interface PersistedGeneralSettings {
  userEmail: string;
  enableNotifications: boolean;
  autoSaveInterval: number; // seconds
  language: "en" | "es" | "fr" | "de";
  // No nested objects - keep flat for serialization
}
```

### Zod Schema Patterns

```typescript
// Schema with defaults and validation
const generalSettingsSchema = z.object({
  userEmail: z.string().email().default(""),
  enableNotifications: z.boolean().default(true),
  autoSaveInterval: z.number().min(30).max(3600).default(300),
  language: z.enum(["en", "es", "fr", "de"]).default("en"),
});
```

### Schema Evolution Support

- Include `schemaVersion` field in all schemas
- Use `.passthrough()` for unknown fields during migrations
- Tag schemas with version constants for future upgrade paths

## Testing Requirements

### Unit Testing

- Schema validation with valid inputs returns parsed data
- Schema validation with invalid inputs throws ZodError with specific paths
- Default value generation works for undefined and partial inputs
- Type inference produces correct TypeScript types
- Schema evolution handles version mismatches gracefully

### Integration Testing

- Schemas work with actual JSON serialization/deserialization
- Performance benchmarks meet response time requirements
- Cross-platform compatibility (Node.js vs browser)

## Dependencies

This feature has no dependencies on other features - it forms the foundation that other features will consume.

### Log
