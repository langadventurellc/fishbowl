---
id: T-create-default-llm-models
title: Create default LLM models JSON configuration file
status: done
priority: medium
parent: F-configurable-llm-models
prerequisites:
  - T-create-llm-models-schema-and
affectedFiles:
  packages/shared/src/data/defaultLlmModels.json: Created default LLM models
    configuration file with OpenAI and Anthropic providers, including all
    current models with correct context lengths and schema version 1.0.0
  packages/shared/src/data/__tests__/defaultLlmModels.test.ts:
    Created comprehensive test suite with 28 tests covering JSON structure
    validation, schema compliance, model data verification, and error resistance
    testing
log:
  - Successfully created default LLM models JSON configuration file with all
    models extracted from useLlmModels hook. The configuration includes OpenAI
    (GPT-4 Turbo, GPT-4, GPT-3.5 Turbo) and Anthropic (Claude 3 Opus, Sonnet,
    Haiku) models with correct context lengths matching existing implementation.
    Created comprehensive test suite with 28 tests validating JSON structure,
    schema compliance, model data accuracy, and error resistance. All tests pass
    and quality checks (lint, format, type-check) are successful. The file
    follows the same pattern as defaultPersonalities.json and validates
    perfectly against the llmModelsSchema.
schema: v1.0
childrenIds: []
created: 2025-08-21T19:36:46.720Z
updated: 2025-08-21T19:36:46.720Z
---

## Context

Create the default LLM models configuration file that will be bundled with the application and copied to the user data directory on first launch. This follows the same pattern as `packages/shared/src/data/defaultPersonalities.json`.

The configuration should include the same models that are currently hard-coded in `apps/desktop/src/hooks/useLlmModels.ts`, organized by provider.

## Specific Implementation Requirements

### 1. Create Default Configuration File

Create `packages/shared/src/data/defaultLlmModels.json` with the following structure:

```json
{
  "schemaVersion": "1.0.0",
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "models": [
        {
          "id": "gpt-4-turbo",
          "name": "GPT-4 Turbo",
          "contextLength": 128000
        },
        {
          "id": "gpt-4",
          "name": "GPT-4",
          "contextLength": 8192
        },
        {
          "id": "gpt-3.5-turbo",
          "name": "GPT-3.5 Turbo",
          "contextLength": 16385
        }
      ]
    },
    {
      "id": "anthropic",
      "name": "Anthropic",
      "models": [
        {
          "id": "claude-3-opus",
          "name": "Claude 3 Opus",
          "contextLength": 200000
        },
        {
          "id": "claude-3-sonnet",
          "name": "Claude 3 Sonnet",
          "contextLength": 200000
        },
        {
          "id": "claude-3-haiku",
          "name": "Claude 3 Haiku",
          "contextLength": 200000
        }
      ]
    }
  ],
  "lastUpdated": "2025-08-21T19:30:00.000Z"
}
```

### 2. Extract Model Data from Existing Hook

Reference the current hard-coded models in `apps/desktop/src/hooks/useLlmModels.ts`:

- Copy OpenAI models (GPT-4 Turbo, GPT-4, GPT-3.5 Turbo) with correct context lengths
- Copy Anthropic models (Claude 3 Opus, Sonnet, Haiku) with correct context lengths
- Ensure model IDs and names match exactly what's currently used
- Remove vision and functionCalling properties (not needed in new format)

### 3. Validate Against Schema

Ensure the JSON file validates against the schema created in the prerequisite task:

- Use the LLM models schema to validate the configuration
- Include proper error handling in validation
- Document any validation requirements

## Technical Approach

1. **Copy Existing Data**: Extract model information from useLlmModels hook
2. **Organize by Provider**: Group models under their respective providers
3. **Remove Deprecated Fields**: Don't include vision or functionCalling properties
4. **Validate Structure**: Ensure JSON matches the schema requirements
5. **Document Format**: Include comments explaining the configuration structure
6. **Set Timestamp**: Use current timestamp for lastUpdated field

## Detailed Acceptance Criteria

### Data Requirements

- ✅ JSON file contains all models currently defined in useLlmModels hook
- ✅ OpenAI provider includes GPT-4 Turbo, GPT-4, and GPT-3.5 Turbo models
- ✅ Anthropic provider includes Claude 3 Opus, Sonnet, and Haiku models
- ✅ All context lengths match the current hard-coded values
- ✅ Model IDs and names are identical to current implementation
- ✅ No vision or functionCalling properties are included

### Schema Compliance

- ✅ JSON structure validates against the llmModelsSchema
- ✅ Required fields (schemaVersion, providers, lastUpdated) are present
- ✅ Provider objects have required id, name, and models fields
- ✅ Model objects have required id, name, and contextLength fields
- ✅ Schema version is set to "1.0.0"

### File Organization

- ✅ File is placed in packages/shared/src/data/ directory
- ✅ File follows same naming convention as defaultPersonalities.json
- ✅ JSON is properly formatted and readable
- ✅ File size is reasonable (< 10KB expected)

### Testing Requirements

- ✅ Include unit test to validate JSON against schema
- ✅ Test that all providers and models are present
- ✅ Test schema version compatibility
- ✅ Verify model data matches expected format

## Dependencies

Requires completion of T-create-llm-models-schema-and to have the validation schema available.

## Security Considerations

- **No Sensitive Data**: Configuration contains only model metadata, no API keys
- **Static Content**: JSON file is read-only configuration data
- **Schema Validation**: Structure is validated against Zod schema
- **Size Limits**: Keep file size reasonable to prevent DoS attacks

## Files Created

- `packages/shared/src/data/defaultLlmModels.json` - Default configuration file
- Test file to validate the JSON against the schema

## Files Referenced

- `apps/desktop/src/hooks/useLlmModels.ts` - Source of current model data
- Schema files from prerequisite task for validation
