---
kind: feature
id: F-core-type-definitions
title: Core Type Definitions
status: done
priority: normal
prerequisites: []
created: "2025-08-04T19:37:15.740105"
updated: "2025-08-05T06:16:52.575677+00:00"
schema_version: "1.1"
parent: E-configuration-infrastructure
---

## Purpose and Functionality

Establish the foundational TypeScript type system for LLM provider configurations in the shared package. This feature creates the core interfaces and types that define how providers, fields, and configurations are structured across the entire application.

## Key Components to Implement

1. **Provider Configuration Types**
   - `LlmProviderConfig` interface defining provider structure
   - `LlmProviderMetadata` for id, name, and available models
   - `LlmModelDefinition` for model id to display name mapping
   - Support for extensible provider types

2. **Field Configuration Types**
   - `LlmFieldConfig` base interface for all field types
   - `SecureTextField`, `TextField`, `CheckboxField` specific types
   - Field validation rules and constraints
   - Default value support with proper typing

3. **Configuration Value Types**
   - `LlmProviderInstance` for runtime provider data
   - `LlmConfigurationValues` for storing field values
   - Type-safe field value extraction utilities
   - Configuration ID generation types

4. **Integration Types**
   - Bridge interfaces for platform-specific storage
   - Configuration state management types
   - Error types for validation failures
   - Migration/versioning types for future compatibility

## Detailed Acceptance Criteria

### Type Safety

- ✓ All types use TypeScript strict mode with no `any` types
- ✓ Discriminated unions for field types ensure compile-time safety
- ✓ Generic types properly constrained for type inference
- ✓ Exported types have comprehensive JSDoc documentation

### Field Type Support

- ✓ `secure-text` type includes encryption flag and masking options
- ✓ `text` type supports validation patterns and max length
- ✓ `checkbox` type properly typed as boolean with defaults
- ✓ Field types extensible via discriminated union pattern

### Provider Structure

- ✓ Provider config supports dynamic model lists
- ✓ Field arrays maintain order for UI rendering
- ✓ Optional fields properly marked with TypeScript optionals
- ✓ Metadata includes all display information needed by UI

### Integration Compatibility

- ✓ Types compatible with existing `LlmConfigData` interface
- ✓ Storage bridge interface supports async operations
- ✓ Configuration values serializable to JSON
- ✓ No platform-specific types in shared package

## Implementation Guidance

### File Structure

```
packages/shared/src/types/llm-providers/
├── index.ts                    # Barrel exports
├── provider.types.ts           # Core provider interfaces
├── field.types.ts              # Field configuration types
├── configuration.types.ts      # Runtime configuration types
├── storage.types.ts            # Storage bridge interfaces
└── validation.types.ts         # Validation error types
```

### Design Patterns

- Use discriminated unions for field types with `type` as discriminator
- Leverage TypeScript mapped types for field value extraction
- Implement builder pattern helpers for type-safe config creation
- Use branded types for IDs to prevent mixing different ID types

### Example Type Definitions

```typescript
// Provider metadata
export interface LlmProviderMetadata {
  id: string; // 'openai', 'anthropic', etc.
  name: string; // Display name
  models: Record<string, string>; // id -> display name
}

// Field configuration with discriminated union
export type LlmFieldConfig = SecureTextField | TextField | CheckboxField;

// Runtime configuration instance
export interface LlmProviderInstance {
  id: string; // Unique instance ID
  providerId: string; // References provider metadata
  values: LlmConfigurationValues;
  createdAt: string;
  updatedAt: string;
}
```

## Testing Requirements

- Unit tests for type guards and utility functions
- Compile-time tests using TypeScript's type system
- Test type compatibility with existing interfaces
- Verify JSON serialization/deserialization

## Security Considerations

- Secure field types must indicate encryption requirements
- No actual secrets or keys in type definitions
- Types should enforce secure storage patterns
- Clear distinction between public and secure data

## Performance Requirements

- Zero runtime overhead (compile-time only)
- Types should enable tree-shaking
- Minimal bundle size impact
- Support for type-only imports

## Dependencies

None - this is the foundational feature

### Log
