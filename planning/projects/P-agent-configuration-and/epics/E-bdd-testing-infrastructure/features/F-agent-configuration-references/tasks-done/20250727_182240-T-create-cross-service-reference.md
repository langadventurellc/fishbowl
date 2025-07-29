---
kind: task
id: T-create-cross-service-reference
parent: F-agent-configuration-references
status: done
title: Create cross-service reference validation integration tests
priority: high
prerequisites: []
created: "2025-07-27T17:57:18.423619"
updated: "2025-07-27T18:00:32.429885"
schema_version: "1.1"
worktree: null
---

# Cross-Service Reference Validation Integration Tests

## Context

Implement comprehensive BDD integration tests for cross-service reference validation, focusing on validating agent configuration references across PersonalityService, RoleService, and ModelService boundaries. This task builds on the established integration testing patterns in the codebase.

## Technical Approach

Follow the established BDD integration test patterns from existing files like `agent-creation-cross-service.integration.spec.ts`. Use the service mock factory pattern with comprehensive error handling and performance validation.

### Implementation Requirements

1. **Test File Creation**: Create `packages/shared/src/__tests__/integration/features/agent-configuration/agent-references-cross-service.integration.spec.ts`

2. **Test Structure**: Follow established BDD patterns with Given-When-Then structure:
   - Feature: Agent Configuration References Integration
   - Scenario: Validating cross-service references
   - Comprehensive test coverage for AC-1 requirements

3. **Test Coverage**:
   - Personality reference validation through PersonalityService integration
   - Role reference resolution through RoleService coordination
   - Model reference verification against ModelService availability
   - Invalid reference error handling with service context
   - Performance validation (reference validation within 300ms)

4. **Mock Service Integration**: Use existing mock factories and extend as needed:
   - AgentServiceMockFactory for agent operations
   - Create mock responses for cross-service reference scenarios
   - Simulate service communication patterns and failures

5. **Error Handling Scenarios**:
   - Invalid personality ID references
   - Nonexistent role references
   - Unavailable model references
   - Service communication failures
   - Timeout handling with proper cleanup

## Detailed Acceptance Criteria

### Reference Validation Coverage

- ✅ Cross-service personality reference validation with PersonalityService integration
- ✅ Role reference resolution through RoleService coordination with error handling
- ✅ Model reference verification against ModelService availability and status
- ✅ Invalid reference detection with specific error messages including service context
- ✅ Reference validation performance meeting 300ms requirement

### Error Handling Integration

- ✅ Invalid reference errors provide service context and resolution guidance
- ✅ Cross-service communication failures handled gracefully with cleanup
- ✅ Service timeout scenarios with proper error propagation
- ✅ Reference not found scenarios with clear error messaging

### Performance Requirements

- ✅ Reference validation completes within 300ms performance requirement
- ✅ Cross-service coordination optimized for batch operations
- ✅ Service communication overhead minimized through efficient patterns

## Security Considerations

- Reference validation respects authorization controls and security policies
- Cross-service security context maintained during reference validation
- Referenced component access validated against user permissions
- Unauthorized reference access prevented with appropriate error responses

## Dependencies

- **Internal**: Existing AgentServiceMockFactory, established BDD test patterns
- **External**: PersonalityService, RoleService, ModelService interface definitions
- **Test Infrastructure**: Jest BDD integration framework, existing test support utilities

## File Structure

```
packages/shared/src/__tests__/integration/features/agent-configuration/
├── agent-references-cross-service.integration.spec.ts (NEW)
```

## Testing Requirements

Include comprehensive unit tests for all cross-service reference validation logic within the same task. Unit tests should cover:

- Reference validation logic
- Error handling pathways
- Service communication patterns
- Performance edge cases

## Implementation Notes

- Follow established patterns from `agent-creation-cross-service.integration.spec.ts`
- Use existing service mock factory patterns for consistency
- Implement comprehensive error scenarios with proper cleanup
- Ensure performance requirements are validated in tests

### Log

**2025-07-27T23:22:40.301587Z** - Successfully implemented comprehensive cross-service reference validation integration tests for agent configurations. Created PersonalityServiceMockFactory and agent-references-cross-service.integration.spec.ts with comprehensive BDD scenarios covering:

- Cross-service reference validation across PersonalityService, RoleService, and ModelService
- Performance validation meeting 300ms requirement with parallel execution optimization
- Comprehensive error handling with proper service context preservation
- Communication failure scenarios with graceful cleanup and timeout handling
- Security context preservation across service boundaries
- Batch operation optimization for multiple agent configurations

All tests follow established BDD patterns with Given-When-Then structure and include comprehensive mocking strategies for cross-service coordination testing. Quality checks pass with proper TypeScript types, linting, and formatting.

- filesChanged: ["packages/shared/src/__tests__/integration/support/PersonalityServiceMockFactory.ts", "packages/shared/src/__tests__/integration/features/agent-configuration/agent-references-cross-service.integration.spec.ts"]
