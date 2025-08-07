---
kind: task
id: T-implement-llmconfigservice-with
title: Implement LlmConfigService with CRUD operations and unit tests
status: open
priority: high
prerequisites:
  - T-create-llmconfig-custom-error
created: "2025-08-06T21:44:14.192324"
updated: "2025-08-06T21:44:14.192324"
schema_version: "1.1"
parent: F-core-llm-configuration-service
---

# Implement LlmConfigService with CRUD Operations and Unit Tests

## Context

Implement the main LLM Configuration Service that provides all business logic for managing LLM provider configurations. This service orchestrates between the storage layer and UI, handling CRUD operations, business rule enforcement, and error handling.

The service uses the existing `LlmStorageService` for persistence and implements business logic like duplicate name checking, validation, and state management.

## Technical Approach

Create a singleton service class that follows existing service patterns in the codebase. The service will use dependency injection for the storage service and implement a clean interface for all CRUD operations.

## Implementation Requirements

### File Location

- Create `apps/desktop/src/electron/services/LlmConfigService.ts`
- Follow existing service patterns found in the codebase

### Service Class Implementation

```typescript
import { randomUUID } from "crypto";
import { logger } from "@fishbowl-ai/shared";
import type {
  LlmConfig,
  LlmConfigInput,
} from "@fishbowl-ai/shared/types/llmConfig";
import { LlmStorageService } from "./LlmStorageService";
import {
  LlmConfigError,
  DuplicateConfigError,
  ConfigNotFoundError,
  InvalidConfigError,
  ConfigOperationError,
} from "./errors/LlmConfigError";

export interface LlmConfigServiceInterface {
  create(input: LlmConfigInput): Promise<LlmConfig>;
  read(id: string): Promise<LlmConfig | null>;
  update(id: string, updates: Partial<LlmConfigInput>): Promise<LlmConfig>;
  delete(id: string): Promise<void>;
  list(): Promise<LlmConfig[]>;
  initialize(): Promise<void>;
}

export class LlmConfigService implements LlmConfigServiceInterface {
  private storageService: LlmStorageService;

  constructor(storageService?: LlmStorageService) {
    this.storageService = storageService ?? LlmStorageService.getInstance();
  }

  async initialize(): Promise<void> {
    // Service initialization logic
  }

  async create(input: LlmConfigInput): Promise<LlmConfig> {
    // Implementation with business logic
  }

  async read(id: string): Promise<LlmConfig | null> {
    // Implementation with error handling
  }

  async update(
    id: string,
    updates: Partial<LlmConfigInput>,
  ): Promise<LlmConfig> {
    // Implementation with validation
  }

  async delete(id: string): Promise<void> {
    // Implementation with cleanup
  }

  async list(): Promise<LlmConfig[]> {
    // Implementation with caching
  }
}

// Export singleton instance
export const llmConfigService = new LlmConfigService();
```

### Method Implementation Details

#### 1. `initialize()` Method

- Initialize service on app startup
- Load existing configurations
- Set up any necessary state
- Handle initialization errors gracefully

#### 2. `create(input: LlmConfigInput)` Method

- Generate unique ID using `crypto.randomUUID()`
- Check for duplicate configuration names
- Create full `LlmConfig` object with timestamps
- Save using `storageService.saveConfiguration()`
- Return created configuration
- Log successful creation
- Handle and wrap storage errors

```typescript
async create(input: LlmConfigInput): Promise<LlmConfig> {
  try {
    // Generate unique ID
    const id = randomUUID();

    // Check for duplicate names
    const existing = await this.list();
    if (existing.some(cfg => cfg.customName === input.customName)) {
      throw new DuplicateConfigError(
        `Configuration with name '${input.customName}' already exists`,
        'DUPLICATE_CONFIG_NAME',
        { attemptedName: input.customName }
      );
    }

    // Create configuration object
    const config: LlmConfig = {
      id,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to storage
    const result = await this.storageService.saveConfiguration(config);

    if (result.success) {
      logger.info('LLM configuration created successfully', {
        id,
        provider: input.provider,
        customName: input.customName
      });
      return config;
    } else {
      throw new ConfigOperationError(
        'Failed to save configuration',
        'CONFIG_SAVE_FAILED',
        { id, error: result.error }
      );
    }
  } catch (error) {
    if (error instanceof LlmConfigError) {
      throw error;
    }

    logger.error('Failed to create LLM configuration', { error, input });
    throw new ConfigOperationError(
      'Configuration creation failed',
      'CONFIG_CREATE_FAILED',
      { input },
      error instanceof Error ? error : undefined
    );
  }
}
```

#### 3. `read(id: string)` Method

- Validate input ID
- Retrieve from storage service
- Return null if not found (don't throw)
- Handle storage errors appropriately

#### 4. `update(id: string, updates: Partial<LlmConfigInput>)` Method

- Verify configuration exists
- Check for duplicate names if name is being changed
- Merge updates with existing configuration
- Update `updatedAt` timestamp
- Save merged configuration
- Return updated configuration

#### 5. `delete(id: string)` Method

- Verify configuration exists before deletion
- Delete from storage service
- Log successful deletion
- Handle cases where configuration doesn't exist gracefully

#### 6. `list()` Method

- Retrieve all configurations from storage
- Return empty array if none exist
- Handle storage errors gracefully
- Consider caching for performance (simple in-memory cache)

### Business Rules Implementation

1. **Unique Names**: Prevent duplicate `customName` values across all configurations
2. **ID Generation**: Use `crypto.randomUUID()` for unique configuration IDs
3. **Timestamps**: Automatically manage `createdAt` and `updatedAt` timestamps
4. **Validation**: Basic input validation (rely on existing Zod schemas)
5. **Atomic Operations**: Ensure operations are atomic where possible
6. **Error Context**: Provide clear error messages with context

### Error Handling Strategy

- Wrap storage service errors with business-level errors
- Use specific error types for different failure scenarios
- Include relevant context in error objects
- Log all errors with appropriate detail level
- Never expose sensitive information in error messages
- Ensure errors are serializable for IPC communication

### Integration with Storage Service

The service uses the existing `LlmStorageService` for all persistence operations:

```typescript
// Example storage integration
const result = await this.storageService.saveConfiguration(config);
if (!result.success) {
  throw new ConfigOperationError(
    "Failed to save configuration to storage",
    "STORAGE_SAVE_FAILED",
    { configId: config.id, storageError: result.error },
  );
}
```

## Detailed Acceptance Criteria

### Service Interface

- ✓ Implements all required CRUD methods (create, read, update, delete, list)
- ✓ Includes initialize method for service startup
- ✓ Uses TypeScript interfaces for type safety
- ✓ Returns proper types for all operations
- ✓ Handles async operations correctly with proper Promise types

### Business Logic

- ✓ Prevents duplicate configuration names across all providers
- ✓ Generates unique IDs using crypto.randomUUID()
- ✓ Manages createdAt and updatedAt timestamps automatically
- ✓ Validates input using existing Zod schemas
- ✓ Implements singleton pattern for consistent state

### CRUD Operations

- ✓ **Create**: Adds new configuration with validation and uniqueness checks
- ✓ **Read**: Retrieves single configuration by ID, returns null if not found
- ✓ **Update**: Modifies existing configuration with validation
- ✓ **Delete**: Removes configuration and handles non-existent configs gracefully
- ✓ **List**: Returns all configurations, empty array when none exist
- ✓ All operations include comprehensive error handling

### Error Handling

- ✓ Uses custom error classes from the error task
- ✓ Wraps storage service errors with business context
- ✓ Provides clear, actionable error messages
- ✓ Includes relevant context in error objects
- ✓ Logs errors at appropriate levels
- ✓ Never exposes sensitive data in errors

### Integration Requirements

- ✓ Uses existing LlmStorageService for persistence
- ✓ Uses existing logger service for debugging
- ✓ Compatible with existing IPC handler patterns
- ✓ Follows established service patterns from codebase
- ✓ Uses shared types from packages/shared

### Logging and Monitoring

- ✓ Logs successful operations with relevant context
- ✓ Logs errors with sufficient detail for debugging
- ✓ Uses appropriate log levels (info for success, error for failures)
- ✓ Never logs sensitive data like API keys
- ✓ Includes operation timing for performance monitoring

## Unit Testing Requirements

Create comprehensive unit tests in `apps/desktop/src/electron/services/__tests__/LlmConfigService.test.ts`:

### Test Structure

```typescript
import { LlmConfigService } from "../LlmConfigService";
import { LlmStorageService } from "../LlmStorageService";
import { logger } from "@fishbowl-ai/shared";
import {
  DuplicateConfigError,
  ConfigNotFoundError,
  ConfigOperationError,
} from "../errors/LlmConfigError";

jest.mock("../LlmStorageService");
jest.mock("@fishbowl-ai/shared", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("LlmConfigService", () => {
  let service: LlmConfigService;
  let mockStorageService: jest.Mocked<LlmStorageService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService = {
      saveConfiguration: jest.fn(),
      getCompleteConfiguration: jest.fn(),
      updateConfiguration: jest.fn(),
      deleteConfiguration: jest.fn(),
      getAllConfigurations: jest.fn(),
    } as any;

    service = new LlmConfigService(mockStorageService);
  });

  // Test implementations...
});
```

### Test Scenarios

#### Create Operation Tests

1. **Successful creation** with valid input
2. **Duplicate name prevention** - should throw DuplicateConfigError
3. **Storage failure handling** - should wrap and rethrow storage errors
4. **ID generation** - should generate unique UUIDs
5. **Timestamp handling** - should set createdAt and updatedAt
6. **Logging verification** - should log successful creation

#### Read Operation Tests

1. **Successful retrieval** of existing configuration
2. **Not found handling** - should return null for non-existent ID
3. **Storage error handling** - should handle storage failures gracefully

#### Update Operation Tests

1. **Successful update** with partial data
2. **Configuration not found** - should throw ConfigNotFoundError
3. **Duplicate name prevention** on name changes
4. **Timestamp update** - should update updatedAt timestamp
5. **Storage failure handling** - should wrap storage errors

#### Delete Operation Tests

1. **Successful deletion** of existing configuration
2. **Non-existent configuration** - should handle gracefully
3. **Storage failure handling** - should wrap storage errors
4. **Logging verification** - should log successful deletion

#### List Operation Tests

1. **Return all configurations** when configurations exist
2. **Return empty array** when no configurations exist
3. **Storage failure handling** - should handle storage errors gracefully

#### Initialize Operation Tests

1. **Successful initialization** - should complete without errors
2. **Error handling** - should handle initialization failures gracefully

### Mock Setup Examples

```typescript
// Mock successful storage operations
beforeEach(() => {
  mockStorageService.saveConfiguration.mockResolvedValue({ success: true });
  mockStorageService.getAllConfigurations.mockResolvedValue({
    success: true,
    data: [],
  });
});

// Test duplicate name prevention
it("should prevent duplicate configuration names", async () => {
  const existingConfig = { id: "existing-id", customName: "OpenAI Main" };
  mockStorageService.getAllConfigurations.mockResolvedValue({
    success: true,
    data: [existingConfig],
  });

  const duplicateInput = {
    customName: "OpenAI Main",
    provider: "openai",
    apiKey: "key",
  };

  await expect(service.create(duplicateInput)).rejects.toThrow(
    DuplicateConfigError,
  );
});
```

### Coverage Requirements

- All public methods must have unit tests
- All error scenarios must be tested
- All business rules must be verified
- Storage service integration must be mocked and tested
- Logging calls must be verified
- Error handling paths must be covered

## Security Considerations

- Never log API keys or other sensitive data
- Sanitize error messages for user display
- Use secure UUID generation for configuration IDs
- Validate all input data using existing schemas
- Follow principle of least privilege for data access

## Dependencies

- **LlmStorageService**: For data persistence operations
- **@fishbowl-ai/shared/types/llmConfig**: For TypeScript types
- **@fishbowl-ai/shared logger**: For error tracking and debugging
- **crypto.randomUUID**: For unique ID generation
- **Custom error classes**: From the prerequisite error task

## Integration Points

- **IPC Handlers**: Service will be called from IPC handlers for UI communication
- **Application Startup**: Initialize method called during app initialization
- **Storage Layer**: Uses existing LlmStorageService for persistence
- **Type System**: Uses shared types for consistency across the application

## Performance Considerations

- Operations should complete within 50ms (excluding storage)
- Consider simple in-memory caching for list operations
- Efficient duplicate name checking
- Minimal memory footprint for service state

## Estimated Completion Time

2-3 hours for complete implementation including comprehensive unit tests and error handling.

### Log
