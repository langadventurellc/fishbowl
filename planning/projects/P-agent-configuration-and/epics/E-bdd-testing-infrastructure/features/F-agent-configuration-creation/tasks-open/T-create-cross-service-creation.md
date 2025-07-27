---
kind: task
id: T-create-cross-service-creation
title: Create cross-service creation workflow integration tests
status: open
priority: high
prerequisites:
  - T-create-agent-configuration
created: "2025-07-27T13:04:25.415796"
updated: "2025-07-27T13:04:25.415796"
schema_version: "1.1"
parent: F-agent-configuration-creation
---

# Create Cross-Service Creation Workflow Integration Tests

## Context

Implement BDD integration tests for cross-service agent creation workflows, focusing on service coordination and transaction-like consistency across PersonalityService, RoleService, ModelService, and ValidationService. Tests verify workflow orchestration and error handling.

## Technical Approach

- Test complete end-to-end agent creation workflows across all services
- Simulate service coordination with proper error handling and rollback scenarios
- Focus on AC-2 from feature specification: "Cross-Service Creation Workflow"
- Include comprehensive service communication and state consistency testing

## Implementation Requirements

### File Location

- Create: `packages/shared/src/__tests__/integration/features/agent-configuration/agent-creation-cross-service.integration.spec.ts`
- Follow established integration test patterns and directory structure

### Test Structure

Following AC-2: "Cross-Service Creation Workflow"

#### Scenario 1: Complete Cross-Service Workflow Coordination

```typescript
describe("Scenario: Cross-service agent creation workflow coordination", () => {
  it("should coordinate agent creation across all services with transaction consistency", async () => {
    // Given - Agent configuration creation requiring multiple service coordination
    // When - Creation workflow orchestrates across PersonalityService, RoleService, ModelService
    // Then - All services coordinate properly with transaction-like consistency
  });
});
```

#### Scenario 2: Service Coordination Failure and Rollback

```typescript
it("should handle service coordination failures with proper rollback", async () => {
  // Given - Agent creation workflow with simulated service failures
  // When - One service fails during the creation process
  // Then - Rollback mechanisms handle partial creation failures appropriately
});
```

#### Scenario 3: Service Communication Error Handling

```typescript
it("should handle service communication errors gracefully with cleanup", async () => {
  // Given - Service communication errors during agent creation
  // When - Network or service communication failures occur
  // Then - Error handling maintains system consistency with proper cleanup
});
```

### Service Workflow Testing

#### Complete Workflow Orchestration

- **Service Sequence**: Test proper service call ordering and coordination
- **State Management**: Verify service state consistency throughout workflow
- **Transaction Consistency**: Test rollback and cleanup mechanisms
- **Performance**: Validate workflow performance meets requirements (1000ms total)

#### Error Scenario Testing

- **Partial Failures**: Test individual service failures and recovery
- **Communication Errors**: Test network and service communication failures
- **Rollback Testing**: Verify rollback mechanisms maintain data consistency
- **Error Context**: Test error context preservation across service boundaries

### Service Coordination Patterns

#### PersonalityService Coordination

- Test personality configuration retrieval and validation within workflow
- Verify personality service integration with error handling
- Test personality data consistency during workflow failures

#### RoleService Coordination

- Test role configuration validation and application within workflow
- Verify role constraint checking and enforcement
- Test role service error handling and state management

#### ModelService Coordination

- Test model configuration validation and compatibility checking
- Verify model availability and capability validation
- Test model service integration with cross-service workflows

#### ValidationService Coordination

- Test cross-service validation orchestration
- Verify validation error aggregation across services
- Test validation service coordination with workflow management

## Acceptance Criteria

### Workflow Coordination Testing

- ✅ Service coordination maintains data consistency across creation workflow
- ✅ Rollback mechanisms handle partial creation failures appropriately
- ✅ Service communication errors are handled gracefully with proper cleanup
- ✅ Creation workflow performance meets acceptable response time requirements
- ✅ Transaction-like consistency maintained across all service operations

### Error Handling and Recovery

- ✅ Individual service failures trigger appropriate rollback procedures
- ✅ Service communication errors maintain system state consistency
- ✅ Error context preservation across service boundaries
- ✅ Partial creation cleanup prevents data inconsistencies
- ✅ Recovery mechanisms restore services to consistent state

### Service Integration Validation

- ✅ PersonalityService integration within complete workflow
- ✅ RoleService integration with constraint validation
- ✅ ModelService integration with compatibility checking
- ✅ ValidationService coordination across all workflow steps
- ✅ Cross-service state management and consistency

### Performance and Reliability

- ✅ Complete workflow execution within 1000ms requirement
- ✅ Individual service coordination within 200ms per service
- ✅ Error recovery and rollback within acceptable time limits
- ✅ Service coordination efficiency under various load scenarios
- ✅ Workflow reliability under service failure conditions

## Dependencies

- Requires completed agent configuration composition tests (prerequisite)
- Use all service mock factories (Agent, Model, Personality, Role, Validation)
- Integration with existing service coordination patterns
- Reference transaction consistency patterns from existing tests

## File Structure

```
packages/shared/src/__tests__/integration/features/agent-configuration/
├── agent-creation-composition.integration.spec.ts (previous task)
├── agent-creation-cross-service.integration.spec.ts (NEW)
├── agent-creation-validation.integration.spec.ts (next task)
└── agent-creation-workflow.integration.spec.ts (next task)
```

## Testing Focus Areas

- **Service Orchestration**: Complete workflow coordination testing
- **Transaction Consistency**: State management and rollback testing
- **Error Handling**: Comprehensive failure scenario coverage
- **Performance**: Workflow timing and efficiency validation
- **Recovery**: Service recovery and cleanup mechanism testing

### Log
