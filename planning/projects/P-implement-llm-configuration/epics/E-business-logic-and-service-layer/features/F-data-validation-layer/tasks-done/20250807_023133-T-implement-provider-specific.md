---
kind: task
id: T-implement-provider-specific
parent: F-data-validation-layer
status: done
title: Implement provider-specific validation functions
priority: high
prerequisites:
  - T-implement-core-zod-schemas-for
created: "2025-08-07T01:36:13.916010"
updated: "2025-08-07T02:14:48.153613"
schema_version: "1.1"
worktree: null
---

# Implement Provider-Specific Validation Functions

## Context

This task implements custom validation functions for provider-specific business rules, particularly API key format validation. These validators work alongside the core Zod schemas to ensure LLM configurations meet provider requirements.

## Technical Approach

Create custom validation functions in `packages/shared/src/types/llmConfig/validators.ts`:

### 1. API Key Validation

```typescript
/**
 * Validates API key format based on provider requirements
 */
export function validateApiKey(apiKey: string, provider: string): boolean {
  if (!apiKey || typeof apiKey !== "string") {
    return false;
  }

  switch (provider) {
    case "openai":
      // OpenAI keys start with 'sk-' and are typically 51+ characters
      return apiKey.startsWith("sk-") && apiKey.length >= 40;

    case "anthropic":
      // Anthropic keys start with 'sk-ant-' and are typically 55+ characters
      return apiKey.startsWith("sk-ant-") && apiKey.length >= 50;

    case "google":
      // Google API keys are typically 39 characters, alphanumeric
      return /^[A-Za-z0-9_-]{35,45}$/.test(apiKey);

    case "custom":
      // Custom providers just need non-empty string
      return apiKey.length > 0;

    default:
      return false;
  }
}

/**
 * Gets human-readable error message for invalid API key
 */
export function getApiKeyValidationError(provider: string): string {
  switch (provider) {
    case "openai":
      return 'OpenAI API key must start with "sk-" and be at least 40 characters long';
    case "anthropic":
      return 'Anthropic API key must start with "sk-ant-" and be at least 50 characters long';
    case "google":
      return "Google API key must be 35-45 characters with letters, numbers, underscores, or hyphens";
    case "custom":
      return "API key cannot be empty";
    default:
      return "Invalid API key format";
  }
}
```

### 2. Configuration Name Validation

```typescript
/**
 * Validates configuration name for uniqueness (when provided existing names)
 */
export function validateUniqueConfigName(
  newName: string,
  existingNames: string[] = [],
  currentId?: string,
  currentName?: string,
): { isValid: boolean; error?: string } {
  // Allow keeping the same name when updating
  if (currentName && newName === currentName) {
    return { isValid: true };
  }

  // Check for duplicates
  const isDuplicate = existingNames.some(
    (name) => name.toLowerCase() === newName.toLowerCase(),
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error:
        "Configuration name already exists. Please choose a different name.",
    };
  }

  return { isValid: true };
}
```

### 3. Provider-Specific Requirements

```typescript
/**
 * Validates provider-specific requirements beyond API key
 */
export function validateProviderRequirements(
  provider: string,
  config: { baseUrl?: string; [key: string]: any },
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (provider) {
    case "custom":
      if (!config.baseUrl) {
        errors.push("Base URL is required for custom providers");
      }
      break;

    case "openai":
    case "anthropic":
    case "google":
      // These providers have default endpoints, baseUrl is optional
      break;

    default:
      errors.push(`Unknown provider: ${provider}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

## Implementation Requirements

### File Structure

```
packages/shared/src/types/llmConfig/
├── validators.ts              # Custom validation functions
└── __tests__/
    └── validators.test.ts     # Unit tests for validators
```

### Validation Rules

- **OpenAI**: API key starts with `sk-` and ≥40 characters
- **Anthropic**: API key starts with `sk-ant-` and ≥50 characters
- **Google**: API key is 35-45 alphanumeric/underscore/hyphen characters
- **Custom**: Non-empty API key + baseUrl required
- **Name Uniqueness**: Case-insensitive duplicate detection

## Unit Tests to Implement

Test scenarios in `__tests__/validators.test.ts`:

1. **API Key Validation**:
   - Valid API keys for each provider
   - Invalid API keys (wrong format, too short, etc.)
   - Edge cases (empty string, null, undefined)
   - Error message accuracy

2. **Configuration Name Validation**:
   - Unique names pass validation
   - Duplicate names fail validation
   - Case-insensitive duplicate detection
   - Update scenarios (keeping same name)

3. **Provider Requirements**:
   - Custom provider requires baseUrl
   - Standard providers work with/without baseUrl
   - Unknown provider handling

4. **Error Messages**:
   - All error messages are user-friendly
   - Messages are specific to the validation failure

## Acceptance Criteria

- ✓ API key validation enforces correct format for each provider
- ✓ OpenAI keys validated: start with "sk-", ≥40 characters
- ✓ Anthropic keys validated: start with "sk-ant-", ≥50 characters
- ✓ Google keys validated: 35-45 alphanumeric characters
- ✓ Custom provider validation allows any non-empty API key
- ✓ Configuration name uniqueness is enforced (case-insensitive)
- ✓ Custom providers require baseUrl, others don't
- ✓ All validation functions return clear error messages
- ✓ Functions handle edge cases gracefully (empty/null values)
- ✓ Unit tests cover all validation scenarios with 100% path coverage
- ✓ All validation functions are properly exported

## Dependencies

- **T-implement-core-zod-schemas-for**: Needs the core schemas for integration

## File Locations

- Implementation: `packages/shared/src/types/llmConfig/validators.ts`
- Tests: `packages/shared/src/types/llmConfig/__tests__/validators.test.ts`

### Log

**2025-08-07T07:31:33.878281Z** - Implemented comprehensive provider-specific validation functions for LLM configurations. Successfully enforced API key format validation for all providers (OpenAI: sk- prefix + ≥40 chars, Anthropic: sk-ant- prefix + ≥50 chars, Google: 35-45 alphanumeric chars, Custom: non-empty string), case-insensitive configuration name uniqueness checking, and provider requirements (custom providers require baseUrl). All validation functions return clear error messages, handle edge cases gracefully, and achieve 100% test coverage. Implementation follows project architecture with one export per file and comprehensive error handling.

- filesChanged: ["packages/shared/src/types/llmConfig/ValidationResult.ts", "packages/shared/src/types/llmConfig/validateApiKeyWithError.ts", "packages/shared/src/types/llmConfig/validateUniqueConfigName.ts", "packages/shared/src/types/llmConfig/validateProviderRequirements.ts", "packages/shared/src/types/llmConfig/validateLlmConfig.ts", "packages/shared/src/types/llmConfig/validateApiKey.ts", "packages/shared/src/types/llmConfig/getApiKeyErrorMessage.ts", "packages/shared/src/types/llmConfig/index.ts", "packages/shared/src/types/llmConfig/__tests__/validators.test.ts", "packages/shared/src/types/llmConfig/__tests__/validateApiKey.test.ts", "packages/shared/src/types/llmConfig/__tests__/getApiKeyErrorMessage.test.ts"]
