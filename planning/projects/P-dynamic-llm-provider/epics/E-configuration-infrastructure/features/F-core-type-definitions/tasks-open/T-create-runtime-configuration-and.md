---
kind: task
id: T-create-runtime-configuration-and
title: Create runtime configuration and value types
status: open
priority: normal
prerequisites:
  - T-create-provider-metadata-and
  - T-create-field-configuration-types
created: "2025-08-04T19:47:14.325245"
updated: "2025-08-04T19:47:14.325245"
schema_version: "1.1"
parent: F-core-type-definitions
---

## Task Description

Implement runtime configuration types in `configuration.types.ts` that represent actual provider instances and their configuration values at runtime.

## Implementation Steps

1. **Create Configuration Values Type**:

   ```typescript
   export interface LlmConfigurationValues {
     [fieldId: string]: string | boolean | undefined;
   }
   ```

2. **Create Provider Instance Type**:

   ```typescript
   export interface LlmProviderInstance {
     id: string; // Unique instance ID (generated)
     providerId: string; // References provider metadata (e.g., 'openai')
     customName?: string; // User-defined name for this instance
     values: LlmConfigurationValues;
     createdAt: string; // ISO timestamp
     updatedAt: string; // ISO timestamp
   }
   ```

3. **Create Typed Configuration Values**:

   ```typescript
   // Type-safe value extraction based on field configs
   export type TypedConfigurationValues<T extends readonly LlmFieldConfig[]> = {
     [K in T[number]["id"]]: Extract<T[number], { id: K }> extends infer F
       ? F extends SecureTextField
         ? string
         : F extends TextField
           ? string
           : F extends CheckboxField
             ? boolean
             : never
       : never;
   };
   ```

4. **Create Configuration State Type**:

   ```typescript
   export interface LlmConfigurationState {
     providers: Record<string, LlmProviderDefinition>; // Available providers
     instances: Record<string, LlmProviderInstance>; // User configurations
   }
   ```

5. **Create Compatibility Interface**:

   ```typescript
   // Bridge to existing LlmConfigData interface
   export interface LlmConfigDataCompatible extends LlmProviderInstance {
     // Maps to existing interface structure
     apiKey: string;
     baseUrl: string;
     useAuthHeader: boolean;
   }
   ```

6. **Create Instance ID Type**:

   ```typescript
   export type LlmInstanceId = string; // Consider branded type
   ```

7. **Add Utility Type for Value Extraction**:
   ```typescript
   export type ExtractConfigValue<
     T extends LlmConfigurationValues,
     K extends keyof T,
   > = T[K];
   ```

## Integration Requirements

- Must be compatible with existing `LlmConfigData` interface
- Support serialization to/from JSON for storage
- Enable type-safe value extraction
- Support both new dynamic system and legacy fixed fields

## Acceptance Criteria

- ✓ Runtime types for provider instances
- ✓ Type-safe configuration value storage
- ✓ Compatibility bridge to existing types
- ✓ ISO timestamp format for dates
- ✓ JSDoc documentation for all types
- ✓ No `any` types except where explicitly needed

## Testing

- Verify JSON serialization/deserialization
- Test type compatibility with LlmConfigData
- Ensure value extraction types work correctly

## File Location

`packages/shared/src/types/llm-providers/configuration.types.ts`

### Log
