---
id: T-integrate-repository-into
title: Integrate repository into MainProcessServices
status: done
priority: high
parent: F-service-integration
prerequisites: []
affectedFiles:
  apps/desktop/src/main/services/MainProcessServices.ts: Added
    ConversationsRepository import, property declaration, initialization in
    constructor with proper error handling, createConversationService factory
    method, and getConversationsRepository getter method
  apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts:
    Added ConversationsRepository mocking, initialization test,
    createConversationService tests for normal operation and error handling,
    getConversationsRepository tests for normal operation and error handling
log:
  - Successfully integrated ConversationsRepository into MainProcessServices
    class. Added proper dependency injection with DatabaseBridge and
    NodeCryptoUtils, implemented factory method for conversation-related
    services, added getter method for repository access, and included
    comprehensive error handling and logging. All integration follows existing
    patterns in the codebase. Added complete test coverage with 6 new test cases
    covering initialization, service creation, error handling, and getter
    functionality. All quality checks pass and 31 tests pass successfully.
schema: v1.0
childrenIds: []
created: 2025-08-23T06:33:03.386Z
updated: 2025-08-23T06:33:03.386Z
---

# Integrate Repository into MainProcessServices

## Context

Add the ConversationsRepository to the MainProcessServices class, establishing proper dependency injection and initialization order. This makes the repository available to the rest of the application.

Reference:

- `apps/desktop/src/main/services/MainProcessServices.ts` - existing service container
- Follow pattern used for database bridge integration

## Implementation Requirements

### 1. Update MainProcessServices Class

File: `apps/desktop/src/main/services/MainProcessServices.ts`

Add imports:

```typescript
import { ConversationsRepository } from "@fishbowl-ai/shared";
import type { ConversationsRepositoryInterface } from "@fishbowl-ai/shared";
```

Add property:

```typescript
export class MainProcessServices {
  // ... existing properties ...

  /**
   * Repository for managing conversation persistence.
   */
  readonly conversationsRepository: ConversationsRepositoryInterface;
```

Update constructor:

```typescript
constructor() {
  // ... existing initialization ...

  // After database bridge is initialized
  try {
    // Initialize conversations repository
    const cryptoUtils = new NodeCryptoUtils();
    this.conversationsRepository = new ConversationsRepository(
      this.databaseBridge,
      cryptoUtils
    );

    this.logger.info("ConversationsRepository initialized successfully");
  } catch (error) {
    this.logger.error("Failed to initialize ConversationsRepository", { error });
    throw new Error("ConversationsRepository initialization failed");
  }
}
```

### 2. Add Service Factory Method

````typescript
/**
 * Create a conversation-related service with repository dependency.
 *
 * @template T The service type to create
 * @param ServiceClass Constructor for the service class
 * @returns Instance of the service with repository injected
 *
 * @example
 * ```typescript
 * class ConversationSearchService {
 *   constructor(private repo: ConversationsRepositoryInterface) {}
 * }
 *
 * const searchService = services.createConversationService(ConversationSearchService);
 * ```
 */
createConversationService<T>(
  ServiceClass: new (repo: ConversationsRepositoryInterface) => T
): T {
  if (!this.conversationsRepository) {
    throw new Error("ConversationsRepository not initialized");
  }

  return new ServiceClass(this.conversationsRepository);
}
````

### 3. Add Getter Method (optional)

```typescript
/**
 * Get the conversations repository instance.
 *
 * @returns The conversations repository
 * @throws Error if repository not initialized
 */
getConversationsRepository(): ConversationsRepositoryInterface {
  if (!this.conversationsRepository) {
    throw new Error("ConversationsRepository not initialized");
  }

  return this.conversationsRepository;
}
```

## Technical Approach

1. Import ConversationsRepository and interface
2. Add readonly property for repository
3. Initialize after database bridge (dependency)
4. Use NodeCryptoUtils for UUID generation
5. Add factory method for future services
6. Include error handling and logging

## Acceptance Criteria

- ✓ ConversationsRepository property added
- ✓ Repository initialized in constructor
- ✓ Proper dependency injection (DatabaseBridge, CryptoUtils)
- ✓ Initialization order maintained (after database)
- ✓ Error handling for initialization failures
- ✓ Service factory method implemented
- ✓ Comprehensive logging
- ✓ TypeScript types properly imported

## Testing Requirements

Update tests in: `apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts`

```typescript
describe("MainProcessServices", () => {
  describe("conversationsRepository", () => {
    it("should initialize ConversationsRepository");
    it("should pass DatabaseBridge dependency");
    it("should pass CryptoUtils dependency");
    it("should handle initialization errors");
    it("should log initialization");
  });

  describe("createConversationService", () => {
    it("should create service with repository");
    it("should throw if repository not initialized");
    it("should support generic service types");
  });
});
```

Mock requirements:

- Mock ConversationsRepository constructor
- Mock NodeCryptoUtils
- Verify constructor calls with correct dependencies

## Security Considerations

- Keep repository in main process only
- Don't expose to renderer process
- Validate service initialization
- Log all initialization steps
