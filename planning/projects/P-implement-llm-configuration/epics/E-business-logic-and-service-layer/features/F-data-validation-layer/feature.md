---
kind: feature
id: F-data-validation-layer
title: Data Validation Layer
status: done
priority: high
prerequisites: []
created: "2025-08-06T21:37:13.396310"
updated: "2025-08-07T16:19:10.665435+00:00"
schema_version: "1.1"
parent: E-business-logic-and-service-layer
---

# Data Validation Layer

## Purpose and Functionality

Implement comprehensive data validation for LLM configurations using Zod schemas. This layer ensures all configuration data is valid before it reaches the storage layer, providing type safety, runtime validation, and clear error messages for invalid data.

## Key Components to Implement

### 1. Zod Schema Definitions

- Complete validation schemas in `packages/shared/src/types/llmConfig/`
- Input validation schemas for create/update operations
- Runtime type checking for all configuration fields
- Custom validation rules for provider-specific requirements

### 2. Validation Functions

- Input validation for CRUD operations
- API key format validation per provider
- Custom name and URL validation
- Error message standardization

### 3. Validation Integration

- Integration points in the service layer
- Validation before storage operations
- Clear error messages for validation failures

## Detailed Acceptance Criteria

### Schema Implementation

- ✓ Zod schemas validate all configuration fields
- ✓ Required fields are enforced (customName, provider, apiKey)
- ✓ Optional fields have proper defaults
- ✓ Field types are strictly validated
- ✓ Schemas are exported for use across the application

### Field Validations

- ✓ customName: Non-empty string, max 100 characters
- ✓ provider: Must be valid provider enum value
- ✓ apiKey: Non-empty string, provider-specific format
- ✓ baseUrl: Valid URL format when provided
- ✓ useAuthHeader: Boolean value
- ✓ All fields have appropriate constraints

### Provider-Specific Rules

- ✓ OpenAI: API key starts with 'sk-' and has proper length
- ✓ Anthropic: API key format validation
- ✓ Google: API key format validation
- ✓ Custom providers: Base URL required
- ✓ Provider-specific field requirements

### Error Handling

- ✓ Validation errors include field-specific messages
- ✓ Multiple validation errors are aggregated
- ✓ Error messages are user-friendly
- ✓ Errors include the invalid value context (without exposing sensitive data)
- ✓ Validation errors are distinguishable from other errors

## Technical Requirements

### Schema Structure

```typescript
// Input schema for creating/updating configurations
const llmConfigInputSchema = z.object({
  customName: z.string().min(1).max(100),
  provider: z.enum(["openai", "anthropic", "google", "custom"]),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  useAuthHeader: z.boolean().default(true),
});

// Complete configuration schema (includes system fields)
const llmConfigSchema = llmConfigInputSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

### Custom Validators

```typescript
// API key validation based on provider
const validateApiKey = (apiKey: string, provider: string): boolean => {
  switch (provider) {
    case "openai":
      return apiKey.startsWith("sk-") && apiKey.length > 40;
    case "anthropic":
      return apiKey.startsWith("sk-ant-") && apiKey.length > 50;
    // ... other providers
  }
};
```

### File Structure

```
packages/shared/src/types/llmConfig/
├── llmConfigSchema.ts       # Main configuration schema
├── llmConfigInputSchema.ts  # Input validation schema
├── validators.ts            # Custom validation functions
├── index.ts                # Barrel export
└── __tests__/
    ├── llmConfigSchema.test.ts
    └── validators.test.ts
```

## Implementation Guidance

### Validation Strategy

1. Use Zod for structural validation
2. Add custom refinements for business rules
3. Validate at service layer before storage
4. Return detailed error information
5. Never expose sensitive data in errors

### Error Message Standards

- Use clear, actionable language
- Include field names in messages
- Suggest corrections where possible
- Group related errors together
- Format consistently across the application

### Integration Points

```typescript
// In service layer
async create(input: unknown): Promise<LlmConfig> {
  // Validate input
  const validationResult = llmConfigInputSchema.safeParse(input);

  if (!validationResult.success) {
    throw new ValidationError(
      'Invalid configuration data',
      validationResult.error.format()
    );
  }

  const validInput = validationResult.data;

  // Additional custom validation
  if (!validateApiKey(validInput.apiKey, validInput.provider)) {
    throw new ValidationError(
      `Invalid API key format for ${validInput.provider}`
    );
  }

  // Proceed with creation...
}
```

## Testing Requirements

### Unit Tests

- Test valid configurations pass validation
- Test each field's validation rules
- Test required vs optional fields
- Test default values are applied
- Test provider-specific validations
- Test error message formatting

### Test Scenarios

1. Valid configuration for each provider type
2. Missing required fields
3. Invalid field types
4. Invalid API key formats
5. Invalid URL formats
6. String length violations
7. Multiple validation errors
8. Edge cases (empty strings, special characters)
9. Default value application
10. Custom validation rules

## Security Considerations

- Never include API keys in error messages
- Sanitize user input before validation
- Validate URLs to prevent injection attacks
- Limit string lengths to prevent DoS
- Use allowlists for enum values

## Performance Requirements

- Validation completes within 5ms
- Efficient schema compilation
- Minimal memory overhead
- No blocking operations

## Error Message Examples

```typescript
// Good error messages
"Configuration name is required";
"Configuration name must be between 1 and 100 characters";
"Invalid API key format for OpenAI provider";
"Base URL must be a valid URL";

// Bad error messages (avoid these)
"Invalid input";
"Error";
"apiKey: sk-1234... is invalid"; // Exposes sensitive data
```

## Dependencies on Other Features

This feature has no dependencies on other features in this epic. It provides validation capabilities that will be used by the Core LLM Configuration Service.

### Log
