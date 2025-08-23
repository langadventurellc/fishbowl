---
id: T-create-database-service
title: Create database service factory method pattern
status: done
priority: low
parent: F-database-service-integration
prerequisites:
  - T-add-nodedatabasebridge-to
affectedFiles:
  apps/desktop/src/main/services/MainProcessServices.ts:
    Added DatabaseBridge type
    import from @fishbowl-ai/shared. Added createDatabaseService<T>() factory
    method with comprehensive JSDoc documentation, usage examples, and
    TypeScript generics for type-safe database service creation.
  apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts:
    Added comprehensive test suite for createDatabaseService method with 7 test
    cases including mock service classes (MockUserRepository,
    MockConversationService), factory function verification, error handling,
    type safety testing, and complex service creation patterns.
log:
  - >-
    Successfully implemented database service factory method pattern in
    MainProcessServices following the existing createSettingsRepository pattern.


    Added createDatabaseService<T>() method that:

    - Uses TypeScript generics for type-safe service creation

    - Takes a factory function that receives the DatabaseBridge and returns the
    service

    - Provides clean dependency injection for database-dependent services

    - Follows established service architecture patterns

    - Includes comprehensive JSDoc documentation with usage examples


    Added comprehensive unit test suite with 7 test cases covering:

    - Basic service creation and database bridge injection

    - Factory function parameter passing verification

    - Multiple service instance creation

    - Generic type safety and support for different service types

    - Error handling for factory function failures

    - Type inference and complex service factory patterns


    All quality checks passed (linting, formatting, type checking) and all 25
    tests in MainProcessServices test suite are passing, including the new
    createDatabaseService tests.
schema: v1.0
childrenIds: []
created: 2025-08-23T01:03:42.737Z
updated: 2025-08-23T01:03:42.737Z
---

# Create database service factory method pattern

## Context

Following the existing MainProcessServices pattern (like `createSettingsRepository`), add a factory method for creating database-dependent services. This provides a clean API for other services that need database access and maintains the dependency injection pattern.

## Implementation Requirements

### Factory Method Implementation

- Add `createDatabaseService<T>()` method to MainProcessServices
- Follow the existing pattern used by `createSettingsRepository()`
- Provide typed interface for database-dependent service creation
- Include proper error handling and validation

### Service Pattern Integration

- Enable other services to access database through dependency injection
- Maintain singleton pattern for database bridge access
- Provide clean abstraction for database-dependent service creation
- Follow existing service architecture patterns

### Type Safety and Generics

- Use TypeScript generics for type-safe service creation
- Provide proper typing for database service interfaces
- Ensure compile-time validation of service dependencies
- Support future service types that may need database access

### Documentation and Usage Examples

- Add JSDoc documentation with usage examples
- Document service creation patterns
- Provide examples for common database service scenarios
- Include unit tests demonstrating factory method usage

## Technical Approach

### Factory Method Pattern

Add to MainProcessServices following the existing pattern:

```typescript
/**
 * Create a database-dependent service with the configured database bridge.
 *
 * @template T The type of service to create
 * @param serviceFactory Function that creates the service with database dependency
 * @returns Configured service instance with database access
 */
createDatabaseService<T>(
  serviceFactory: (databaseBridge: DatabaseBridge) => T
): T {
  return serviceFactory(this.databaseBridge);
}

// Alternative more specific approach:
/**
 * Create a repository with the configured database bridge.
 *
 * @template T The type of repository to create
 * @param repositoryConstructor Constructor function for the repository
 * @param ...args Additional constructor arguments
 * @returns Configured repository instance
 */
createRepository<T>(
  repositoryConstructor: new (db: DatabaseBridge, ...args: any[]) => T,
  ...args: any[]
): T {
  return new repositoryConstructor(this.databaseBridge, ...args);
}
```

### Usage Examples

Provide clear examples of how to use the factory:

```typescript
// Example usage in application code:
const userRepository = mainProcessServices.createDatabaseService(
  (db) => new UserRepository(db),
);

// Or with the repository pattern:
const conversationRepo = mainProcessServices.createRepository(
  ConversationRepository,
  additionalConfig,
);
```

### Integration with Existing Services

- Follow the same instantiation and lifecycle patterns as other services
- Ensure factory methods are available after MainProcessServices construction
- Maintain consistent error handling and logging patterns
- Support both singleton and instance-based service creation

## Acceptance Criteria

- [ ] Database service factory method added to MainProcessServices with proper typing
- [ ] Factory method follows existing `createSettingsRepository` pattern
- [ ] TypeScript generics provide type safety for service creation
- [ ] JSDoc documentation includes usage examples and patterns
- [ ] Unit tests demonstrate factory method functionality with mock services
- [ ] Factory method handles errors appropriately (invalid services, database not ready)
- [ ] Integration with existing service architecture maintained
- [ ] Code examples show common usage patterns for database services

## Files to Modify

- `apps/desktop/src/main/services/MainProcessServices.ts` - Add factory method
- `apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts` - Add factory tests

## Dependencies

- T-add-nodedatabasebridge-to (Database bridge integration complete)
- DatabaseBridge interface from shared package
- Existing MainProcessServices patterns

## Testing Requirements

- Unit tests for factory method with mock service constructors
- Type safety validation in tests
- Error scenario testing (invalid constructors, database not ready)
- Integration with existing MainProcessServices test suite
- Example service creation and usage testing

## Design Considerations

- Balance between flexibility and simplicity in factory API
- Consider future service types that may need database access
- Maintain consistency with existing service creation patterns
- Provide clear migration path from direct service instantiation

## Optional Enhancements (Future)

- Support for service configuration and options
- Service lifecycle management (singleton vs instance)
- Service health monitoring and dependency validation
- Integration with service discovery patterns
