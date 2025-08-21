---
id: F-configurable-llm-models
title: Configurable LLM Models
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  packages/shared/src/types/settings/llmModelsSchema.ts:
    Created main schema file
    with Zod validation schemas for LLM models, providers, and settings.
    Includes version constants, security validation limits, and comprehensive
    JSDoc documentation.
  packages/shared/src/types/settings/PersistedLlmModelsSettingsData.ts:
    Created TypeScript type definition for complete LLM models settings file
    structure inferred from Zod schema.
  packages/shared/src/types/settings/PersistedLlmProviderData.ts:
    Created TypeScript type definition for single LLM provider configuration
    inferred from Zod schema.
  packages/shared/src/types/settings/PersistedLlmModelData.ts:
    Created TypeScript type definition for single LLM model configuration
    inferred from Zod schema.
  packages/shared/src/types/settings/index.ts:
    Updated exports to include new LLM
    models schemas and type definitions following established patterns.
  packages/shared/src/types/settings/__tests__/llmModelsSchema.test.ts:
    Added comprehensive unit tests (56 test cases) covering all validation
    scenarios, edge cases, security limits, and error handling.
  packages/ui-shared/src/types/settings/LlmModel.ts: Removed vision and functionCalling boolean properties from interface
  apps/desktop/src/hooks/useLlmModels.ts: Removed vision and functionCalling
    properties from all OpenAI, Anthropic, and implied model definitions
  packages/shared/src/data/defaultLlmModels.json: Created default LLM models
    configuration file with OpenAI and Anthropic providers, including all
    current models with correct context lengths and schema version 1.0.0
  packages/shared/src/data/__tests__/defaultLlmModels.test.ts:
    Created comprehensive test suite with 28 tests covering JSON structure
    validation, schema compliance, model data verification, and error resistance
    testing
log: []
schema: v1.0
childrenIds:
  - T-create-default-llm-models
  - T-create-llm-models-default
  - T-create-llmmodelsrepository
  - T-create-llmmodelsrepositorymana
  - T-integrate-llmmodelsrepositorym
  - T-update-usellmmodels-hook-to
  - T-create-llm-models-schema-and
  - T-update-llmmodel-interface-to
created: 2025-08-21T19:31:35.047Z
updated: 2025-08-21T19:31:35.047Z
---

## Purpose and Functionality

Replace hard-coded LLM model configurations in `useLlmModels` hook with a JSON-based configuration system that loads model definitions from a user data directory file. This enables modification of available models without updating application binaries.

## Key Components to Implement

### 1. Default LLM Models Configuration File

- **File Structure**: JSON with providers array, each containing models array
- **Provider Properties**: id, name, models[]
- **Model Properties**: id, name, contextLength (remove vision and functionCalling)
- **Schema Validation**: Zod schema for configuration validation
- **Default Content**: Pre-populated with OpenAI and Anthropic models

### 2. LLM Models Repository

- **Repository Pattern**: Following PersonalitiesRepository/RolesRepository patterns
- **File Management**: Atomic reads/writes to `llmModels.json` in user data directory
- **Default Initialization**: Copy defaults to user data folder on first app launch
- **Error Handling**: Graceful fallback to defaults on corruption/missing file

### 3. Updated LLM Model Interface

- **Remove Properties**: vision and functionCalling boolean fields
- **Retain Properties**: id, name, provider, contextLength
- **Type Safety**: Ensure all components using LlmModel interface compile

### 4. Hook Integration

- **Data Source**: Load models from JSON file instead of hard-coded switch statement
- **Caching**: Efficient loading and caching of configuration data
- **Error Resilience**: Handle file read errors gracefully

## Detailed Acceptance Criteria

**Functional Behavior:**

- ✅ Application loads LLM models from `llmModels.json` in user data directory
- ✅ On first launch, default configuration file is created automatically
- ✅ Configuration includes OpenAI (GPT-4 Turbo, GPT-4, GPT-3.5 Turbo) and Anthropic (Claude 3 Opus, Sonnet, Haiku) models
- ✅ Models displayed in UI match those defined in JSON configuration
- ✅ Advanced users can manually edit JSON file to add/modify/remove models
- ✅ Invalid JSON or missing file gracefully falls back to bundled defaults
- ✅ No UI changes required for model selection components

**Data Validation and Error Handling:**

- ✅ JSON schema validation ensures configuration file integrity
- ✅ Malformed configuration files trigger automatic reset to defaults
- ✅ File read/write errors logged appropriately without crashing application
- ✅ Missing provider or model properties handled with reasonable defaults

**Integration Requirements:**

- ✅ Existing `useLlmModels` hook API remains unchanged
- ✅ All components using LlmModel interface continue to work
- ✅ No changes required to ModelSelect or other UI components
- ✅ Configuration loads during application initialization

**Performance Requirements:**

- ✅ Configuration file reads complete within 100ms on typical systems
- ✅ Models list updates immediately when configuration file changes
- ✅ Memory usage for configuration data remains minimal (< 1MB)

**Security Validation:**

- ✅ No sensitive data stored in configuration file
- ✅ File permissions set appropriately for user data directory
- ✅ Input validation prevents injection or corruption attacks

## Implementation Guidance

### Technical Approach and Patterns

**Follow Existing Patterns:**

- Mirror PersonalitiesRepository implementation for file operations
- Use FileStorageService for atomic read/write operations
- Implement same error handling and logging patterns
- Follow shared package organization (types in shared, repository in desktop)

**File Structure:**

```
packages/shared/src/data/defaultLlmModels.json
packages/shared/src/types/settings/llmModelsSchema.ts
packages/shared/src/types/settings/getDefaultLlmModels.ts
packages/shared/src/types/settings/createDefaultLlmModelsSettings.ts
apps/desktop/src/data/repositories/LlmModelsRepository.ts
```

**JSON Configuration Format:**

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
        }
      ]
    }
  ],
  "lastUpdated": "2025-01-21T..."
}
```

**Interface Updates:**

- Remove `vision: boolean` from LlmModel interface
- Remove `functionCalling: boolean` from LlmModel interface
- Update all references to use simplified interface

### Testing Requirements

**Unit Tests:**

- Configuration file loading and validation
- Default model creation and persistence
- Error handling for malformed JSON
- Repository CRUD operations

**Integration Tests:**

- End-to-end model loading from file to UI
- Configuration file initialization on first launch
- Graceful fallback when configuration corrupted

### Security Considerations

**Input Validation:**

- Zod schema validation for all JSON configuration data
- Sanitization of model names and descriptions
- File path validation to prevent directory traversal

**Data Protection:**

- Configuration stored in user data directory with appropriate permissions
- No API keys or sensitive data in model configuration
- Atomic file operations prevent corruption during writes

## Dependencies

None - this is a standalone feature that integrates with existing configuration patterns.

## Files Modified

**New Files:**

- `packages/shared/src/data/defaultLlmModels.json` - Default model configurations
- `packages/shared/src/types/settings/LlmModelsSettingsData.ts` - TypeScript interfaces
- `packages/shared/src/types/settings/llmModelsSchema.ts` - Zod validation schema
- `packages/shared/src/types/settings/getDefaultLlmModels.ts` - Default models getter
- `packages/shared/src/types/settings/createDefaultLlmModelsSettings.ts` - Settings creator
- `apps/desktop/src/data/repositories/LlmModelsRepository.ts` - Repository implementation

**Modified Files:**

- `packages/ui-shared/src/types/settings/LlmModel.ts` - Remove vision/functionCalling properties
- `apps/desktop/src/hooks/useLlmModels.ts` - Replace hard-coded models with repository data
- Repository manager files for dependency injection integration
