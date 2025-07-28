---
kind: task
id: T-implement-cross-service
title: Implement Cross-Service Configuration CRUD Integration Tests
status: open
priority: high
prerequisites:
  - T-create-configuration-service
created: "2025-07-27T23:24:49.582988"
updated: "2025-07-27T23:24:49.582988"
schema_version: "1.1"
parent: F-configuration-service-crud
---

# Implement Cross-Service Configuration CRUD Integration Tests

## Context

Implement comprehensive BDD integration tests for ConfigurationService CRUD operations that coordinate with PersonalityService, RoleService, and AgentService. Tests focus on AC-1: Cross-Service CRUD Integration from the feature specification.

## Technical Approach

### Test Structure

Follow the established BDD pattern from existing integration tests:

```typescript
describe("Feature: Configuration Service CRUD Integration Tests", () => {
  describe("Scenario: Creating configuration across multiple services", () => {
    it.skip("should coordinate creation across PersonalityService, RoleService, and AgentService", async () => {
      // Given - Configuration data requiring multiple service coordination
      // When - Creating configuration through ConfigurationService
      // Then - All services coordinate properly with transaction consistency
    });
  });
});
```

### CRUD Operation Coverage

- **Create Operations**: Test ConfigurationService coordinating personality, role, and agent creation through respective services
- **Read Operations**: Test data aggregation from multiple service sources with proper coordination
- **Update Operations**: Test consistency maintenance when changes affect multiple services
- **Delete Operations**: Test dependency handling and cascading deletions appropriately

## Implementation Details

### Cross-Service Create Integration

```typescript
it.skip("should coordinate configuration creation across PersonalityService, RoleService, and AgentService", async () => {
  // Given - Multi-service configuration request
  const configRequest: ConfigCreateRequest = {
    name: "Multi-Service Integration Config",
    personality: {
      /* personality data */
    },
    role: {
      /* role data */
    },
    agent: {
      /* agent data */
    },
  };

  // When - ConfigurationService coordinates creation across services
  const { result: createdConfig, duration } =
    await PerformanceTestHelper.measureExecutionTime(async () => {
      return configurationService.createConfiguration(configRequest);
    });

  // Then - All services coordinate with proper integration
  expect(createdConfig).toBeDefined();
  expect(duration).toBeLessThan(1000); // Performance requirement

  // Verify service coordination
  expect(personalityService.createPersonality).toHaveBeenCalled();
  expect(roleService.createRole).toHaveBeenCalled();
  expect(agentService.createAgent).toHaveBeenCalled();
});
```

### Cross-Service Read Integration

Test data aggregation from multiple services with proper error handling and performance optimization.

### Cross-Service Update Integration

Test update operations that maintain consistency when changes affect multiple services, including partial update scenarios.

### Cross-Service Delete Integration

Test deletion operations with proper dependency handling and cascading deletion across services.

## Acceptance Criteria

### AC-1: Cross-Service CRUD Integration

- ✅ Create operations coordinate across PersonalityService, RoleService, and AgentService with proper transaction-like consistency
- ✅ Read operations aggregate data correctly from multiple service sources with performance optimization
- ✅ Update operations maintain consistency when changes affect multiple services with rollback capabilities
- ✅ Delete operations handle dependencies and cascading deletions appropriately with cleanup verification

### Performance Requirements

- ✅ Cross-service CRUD operations complete within 1000ms performance requirement
- ✅ Individual service interactions complete within 200ms
- ✅ Service coordination overhead is minimized and measured

### Error Handling Integration

- ✅ Partial operation failures trigger appropriate rollback across affected services
- ✅ Service communication failures are handled with proper cleanup mechanisms
- ✅ Cross-service error propagation maintains context and provides actionable error messages

## File Structure

Create the following test file:

```
packages/shared/src/__tests__/integration/features/configuration-service-integration/
└── configuration-crud-cross-service.integration.spec.ts
```

## Dependencies

- ConfigurationService mock factory (T-create-configuration-service)
- PersonalityService, RoleService, AgentService mocks
- PerformanceTestHelper for timing measurements
- Configuration fixtures for test data scenarios

## Testing Requirements

- Unit tests for each CRUD operation with comprehensive coverage
- Performance testing to validate timing requirements
- Error scenario testing for all failure modes
- Concurrency testing for multiple simultaneous operations
- Integration validation with existing service patterns

## Security Considerations

- Configuration operations maintain security context across services
- Access control validation for CRUD operations across all services
- Data integrity verification during cross-service operations
- Audit logging verification for compliance and security monitoring

### Log
