---
kind: feature
id: F-json-schema-and-validation
title: JSON Schema and Validation
status: done
priority: normal
prerequisites:
  - F-core-type-definitions
created: "2025-08-04T19:37:51.058909"
updated: "2025-08-05T21:12:45.877439+00:00"
schema_version: "1.1"
parent: E-configuration-infrastructure
---

## Purpose and Functionality

Implement the JSON configuration schema and Zod-based validation layer for LLM provider configurations. This feature ensures that provider configuration files are properly structured, validated, and type-safe at runtime, building upon the core type definitions.

## Key Components to Implement

1. **JSON Schema Definition**
   - Formal JSON schema specification for provider configuration format
   - Version field for future migration support
   - Provider array with complete field definitions
   - Schema documentation and examples

2. **Zod Validation Schemas**
   - `LlmProviderConfigSchema` for complete provider definitions
   - `LlmFieldConfigSchema` with union types for each field type
   - `LlmProviderMetadataSchema` for provider metadata validation
   - Refinements for business logic validation

3. **Schema Utilities**
   - Type inference from Zod schemas to TypeScript types
   - Schema composition utilities for extensibility
   - Default value application with schema validation
   - Error message customization for user feedback

4. **Validation Service**
   - Configuration file validation with detailed error reporting
   - Partial validation for incremental updates
   - Schema version compatibility checking
   - Development-time validation helpers

## Detailed Acceptance Criteria

### Schema Definition

- ✓ JSON schema follows JSON Schema Draft 7 specification
- ✓ All provider fields documented with descriptions
- ✓ Schema includes examples for each field type
- ✓ Version field supports semantic versioning

### Zod Implementation

- ✓ Zod schemas match TypeScript types exactly via inference
- ✓ Custom error messages provide actionable feedback
- ✓ Refinements validate business rules (e.g., required fields)
- ✓ Union types properly discriminated for field types

### Validation Features

- ✓ Full configuration validation under 10ms
- ✓ Detailed error paths for nested validation failures
- ✓ Support for unknown fields with strict mode option
- ✓ Async validation for future remote schema loading

### Default Handling

- ✓ Schema applies defaults for optional fields
- ✓ Default values type-checked at compile time
- ✓ Defaults can be overridden per provider
- ✓ Clear distinction between missing and null values

## Implementation Guidance

### File Structure

```
packages/shared/src/validation/llm-providers/
├── index.ts                      # Barrel exports
├── schemas/
│   ├── provider.schema.ts        # Provider validation
│   ├── field.schema.ts           # Field type schemas
│   ├── configuration.schema.ts   # Runtime config validation
│   └── file.schema.ts            # JSON file format
├── validators/
│   ├── configuration.validator.ts # High-level validation
│   └── field.validator.ts        # Field-specific validation
└── utils/
    ├── schema-inference.ts       # Type inference utilities
    └── error-formatting.ts       # Error message helpers
```

### Zod Schema Examples

```typescript
// Field type schemas with discriminated unions
const SecureTextFieldSchema = z.object({
  type: z.literal("secure-text"),
  id: z.string().min(1),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  helperText: z.string().optional(),
});

// Provider configuration schema
const LlmProviderConfigSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  models: z.record(z.string(), z.string()),
  configuration: z.object({
    fields: z.array(LlmFieldConfigSchema),
  }),
});

// Full file schema with version
const LlmProvidersFileSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  providers: z.array(LlmProviderConfigSchema),
});
```

### Validation Patterns

- Use `.parse()` for hard failures in production
- Use `.safeParse()` for development with detailed errors
- Implement custom refinements for cross-field validation
- Create reusable schema components for common patterns

## Testing Requirements

- Unit tests for each schema with valid/invalid cases
- Integration tests for complete configuration files
- Error message formatting tests
- Performance benchmarks for large configurations
- Type inference tests using TypeScript compiler

## Security Considerations

- Validate all external input through schemas
- Prevent prototype pollution via strict parsing
- Sanitize error messages to avoid exposing internals
- Limit schema complexity to prevent DoS

## Performance Requirements

- Configuration parsing < 50ms for typical files
- Field validation < 10ms per provider
- Lazy schema compilation for faster startup
- Minimal memory overhead for schema objects

## Dependencies

- F-core-type-definitions: Uses type definitions for schema inference
- External: zod@^3.x for validation (verify version in package.json)

### Log
