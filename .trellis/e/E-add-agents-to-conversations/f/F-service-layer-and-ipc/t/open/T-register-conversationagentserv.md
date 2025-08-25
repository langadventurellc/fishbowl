---
id: T-register-conversationagentserv
title: Register ConversationAgentService in MainProcessServices
status: open
priority: high
parent: F-service-layer-and-ipc
prerequisites:
  - T-create-conversationagentservic
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T05:19:27.216Z
updated: 2025-08-25T05:19:27.216Z
---

# Register ConversationAgentService in MainProcessServices

## Context

Register the ConversationAgentService in MainProcessServices following established dependency injection patterns, and wire the service with proper agent settings provider implementation for production use.

## Reference Implementation Patterns

- **Service Registration**: Follow `conversationsRepository` registration pattern in MainProcessServices constructor
- **Dependency Injection**: Use existing factory method patterns for service creation
- **Settings Integration**: Use existing settings repository patterns for agent configuration access
- **Initialization Logging**: Follow existing service initialization logging patterns

## Technical Approach

Extend MainProcessServices to instantiate ConversationAgentService with proper dependencies and make it available to IPC handlers following established service management patterns.

## Implementation Requirements

### 1. Agent Settings Provider Implementation

**File**: `apps/desktop/src/main/services/AgentSettingsProvider.ts`

Create concrete implementation of the AgentSettingsProvider interface:

```typescript
import type { AgentSettingsProvider } from "@fishbowl-ai/shared";
import type { AgentSettingsViewModel } from "@fishbowl-ai/ui-shared";
import type { SettingsRepository } from "@fishbowl-ai/shared";
import { createLoggerSync } from "@fishbowl-ai/shared";

/**
 * Provides access to agent settings for conversation agent service.
 *
 * Implements the AgentSettingsProvider interface by delegating to
 * the settings repository for agent configuration data.
 */
export class MainProcessAgentSettingsProvider implements AgentSettingsProvider {
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "MainProcessAgentSettingsProvider" } },
  });

  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getAgent(agentId: string): Promise<AgentSettingsViewModel | null> {
    try {
      const settings = await this.settingsRepository.load();
      const agent = settings.agents?.find((agent) => agent.id === agentId);
      return agent || null;
    } catch (error) {
      this.logger.error("Failed to get agent settings", error as Error, {
        agentId,
      });
      return null;
    }
  }

  async getAllAgents(): Promise<AgentSettingsViewModel[]> {
    try {
      const settings = await this.settingsRepository.load();
      return settings.agents || [];
    } catch (error) {
      this.logger.error("Failed to get all agent settings", error as Error);
      return [];
    }
  }
}
```

### 2. Service Registration in MainProcessServices

**File**: `apps/desktop/src/main/services/MainProcessServices.ts`

**Add imports**:

```typescript
// Existing imports...
import {
  ConversationAgentService,
  ConversationAgentsRepository,
} from "@fishbowl-ai/shared";
import { MainProcessAgentSettingsProvider } from "./AgentSettingsProvider";
```

**Add property declaration**:

```typescript
export class MainProcessServices {
  // ... existing properties

  /**
   * Repository for managing conversation agent associations.
   */
  readonly conversationAgentsRepository: ConversationAgentsRepository;

  /**
   * Service for conversation agent business logic.
   */
  readonly conversationAgentService: ConversationAgentService;

  // ... rest of class
}
```

**Add initialization in constructor**:

```typescript
constructor() {
  // ... existing initialization code

  // Initialize conversation agents repository
  try {
    this.conversationAgentsRepository = new ConversationAgentsRepository(
      this.databaseBridge,
      this.cryptoUtils,
    );
    this.logger.info("ConversationAgentsRepository initialized successfully");
  } catch (error) {
    this.logger.error(
      "Failed to initialize ConversationAgentsRepository",
      error instanceof Error ? error : undefined,
    );
    throw new Error("ConversationAgentsRepository initialization failed");
  }

  // Initialize conversation agent service with dependencies
  try {
    // Create settings repository for agent configuration access
    const settingsFilePath = this.getSettingsPath();
    const settingsRepository = this.createSettingsRepository(settingsFilePath);

    // Create agent settings provider
    const agentSettingsProvider = new MainProcessAgentSettingsProvider(settingsRepository);

    // Initialize conversation agent service
    this.conversationAgentService = new ConversationAgentService(
      this.conversationAgentsRepository,
      agentSettingsProvider,
    );

    this.logger.info("ConversationAgentService initialized successfully");
  } catch (error) {
    this.logger.error(
      "Failed to initialize ConversationAgentService",
      error instanceof Error ? error : undefined,
    );
    throw new Error("ConversationAgentService initialization failed");
  }
}
```

### 3. Settings Path Helper Method

**Add private method to MainProcessServices**:

```typescript
/**
 * Get the path to the settings file in the user data directory.
 *
 * @returns Settings file path
 */
private getSettingsPath(): string {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "settings.json");
}
```

### 4. Service Access Methods

**Add getter methods following existing patterns**:

```typescript
/**
 * Get the conversation agent service instance.
 *
 * @returns The conversation agent service
 * @throws Error if service not initialized
 */
getConversationAgentService(): ConversationAgentService {
  if (!this.conversationAgentService) {
    throw new Error("ConversationAgentService not initialized");
  }
  return this.conversationAgentService;
}

/**
 * Get the conversation agents repository instance.
 *
 * @returns The conversation agents repository
 * @throws Error if repository not initialized
 */
getConversationAgentsRepository(): ConversationAgentsRepository {
  if (!this.conversationAgentsRepository) {
    throw new Error("ConversationAgentsRepository not initialized");
  }
  return this.conversationAgentsRepository;
}
```

### 5. Handler Setup Integration

**File**: `apps/desktop/src/main/index.ts` (or main initialization file)

Add conversation agent handlers setup:

```typescript
import { setupConversationAgentHandlers } from "../electron/conversationAgentHandlers";

// In main process initialization...
async function createWindow() {
  // ... existing window creation code

  // Setup IPC handlers
  setupConversationsHandlers(mainProcessServices);
  setupConversationAgentHandlers(mainProcessServices); // Add this line

  // ... rest of initialization
}
```

### Error Handling and Validation

**Initialization Error Handling**:

- Comprehensive try/catch blocks for service initialization
- Meaningful error messages for troubleshooting
- Proper error logging with context
- Graceful failure with application exit if critical services fail

**Service Dependency Validation**:

- Verify all dependencies are properly initialized
- Check database connectivity before service registration
- Validate settings repository functionality
- Log successful initialization for debugging

**Runtime Error Handling**:

- Service availability checking in getter methods
- Proper error propagation to IPC handlers
- Consistent error logging patterns

### Testing Requirements

**Unit Tests in same task**:

**File**: `apps/desktop/src/main/services/__tests__/MainProcessServices.conversationAgent.test.ts`

```typescript
import { MainProcessServices } from "../MainProcessServices";
import { MainProcessAgentSettingsProvider } from "../AgentSettingsProvider";

describe("MainProcessServices ConversationAgent Integration", () => {
  test("should initialize ConversationAgentService successfully", () => {
    // Test service initialization
  });

  test("should provide access to ConversationAgentService", () => {
    // Test service getter method
  });

  test("should provide access to ConversationAgentsRepository", () => {
    // Test repository getter method
  });

  test("should handle initialization failures gracefully", () => {
    // Test error handling during initialization
  });
});

describe("MainProcessAgentSettingsProvider", () => {
  test("should get agent by ID from settings", async () => {
    // Test agent retrieval
  });

  test("should return null for non-existent agent", async () => {
    // Test not found scenario
  });

  test("should get all agents from settings", async () => {
    // Test all agents retrieval
  });

  test("should handle settings loading errors", async () => {
    // Test error handling
  });
});
```

**Test Coverage**:

- Service initialization success and failure scenarios
- Dependency injection verification
- Settings provider functionality
- Error handling and logging
- Service getter method validation

## Dependencies

- ConversationAgentService implementation (T-create-conversationagentservic)
- ConversationAgentsRepository (already implemented in epic)
- Existing MainProcessServices infrastructure
- Settings repository patterns
- Path utilities (Node.js path module)

## Acceptance Criteria

- [ ] MainProcessAgentSettingsProvider implements AgentSettingsProvider interface
- [ ] ConversationAgentService registered in MainProcessServices with proper dependencies
- [ ] Service initialization includes comprehensive error handling and logging
- [ ] Getter methods provide access to service and repository instances
- [ ] Settings path helper method following existing patterns
- [ ] Handler setup integration in main process initialization
- [ ] Unit tests covering initialization and runtime scenarios
- [ ] Error scenarios handled gracefully with meaningful messages
- [ ] Service dependencies properly validated during initialization

## Implementation Notes

- This task completes the service layer integration with the main process
- The AgentSettingsProvider bridges between service and settings storage
- Initialization order matters - database and settings must be available first
- Error handling ensures robust service initialization
- The service becomes available to IPC handlers after successful registration
