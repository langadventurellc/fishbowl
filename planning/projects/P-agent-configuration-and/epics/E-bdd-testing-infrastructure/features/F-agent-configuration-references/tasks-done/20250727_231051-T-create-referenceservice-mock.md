---
kind: task
id: T-create-referenceservice-mock
parent: F-agent-configuration-references
status: done
title: Create ReferenceService mock factory for cross-service testing
priority: normal
prerequisites: []
created: "2025-07-27T17:59:45.745200"
updated: "2025-07-27T22:49:53.644986"
schema_version: "1.1"
worktree: null
---

# ReferenceService Mock Factory for Cross-Service Testing

## Context

Create a comprehensive mock factory for ReferenceService following established patterns from existing mock factories like `AgentServiceMockFactory.ts`. This mock factory will support all reference validation, dependency tracking, integrity enforcement, and resolution testing scenarios.

## Technical Approach

Follow the established mock factory patterns observed in `AgentServiceMockFactory.ts` and other service mock factories. Implement comprehensive mock scenarios for cross-service reference operations with configurable behavior for testing various scenarios.

### Implementation Requirements

1. **Mock Factory File Creation**: Create `packages/shared/src/__tests__/integration/support/ReferenceServiceMockFactory.ts`

2. **Service Interface Definition**: Define or extend ReferenceService interface based on testing requirements:
   - Reference validation operations
   - Dependency tracking and resolution operations
   - Integrity constraint enforcement operations
   - Reference resolution workflow operations

3. **Mock Configuration Support**:
   - Configurable success/failure scenarios
   - Latency simulation for performance testing
   - Cross-service failure simulation
   - Validation error scenario configuration
   - Circular reference detection scenario configuration

4. **Factory Methods**:
   - `create()` - Main configurable factory method
   - `createSuccess()` - Pre-configured success scenarios
   - `createFailure()` - Pre-configured failure scenarios
   - `createWithValidationErrors()` - Validation error scenarios
   - `createWithCircularReferences()` - Circular reference scenarios
   - `createWithLatency()` - Performance testing scenarios

5. **Mock Operations**:
   - `validateReference()` - Cross-service reference validation
   - `trackDependencies()` - Dependency graph construction and tracking
   - `detectCircularReferences()` - Circular reference detection
   - `enforceIntegrity()` - Integrity constraint enforcement
   - `resolveReferences()` - Reference resolution workflows
   - `batchResolveReferences()` - Batch resolution operations

## Detailed Acceptance Criteria

### Mock Factory Functionality

- ✅ Configurable mock behavior for all reference service operations
- ✅ Latency simulation support for performance testing scenarios
- ✅ Error scenario configuration with detailed error message customization
- ✅ Cross-service failure simulation with proper error context

### Reference Operation Mocks

- ✅ Reference validation mocks with success and failure scenarios
- ✅ Dependency tracking mocks with complex dependency graph support
- ✅ Circular reference detection mocks with detailed error reporting
- ✅ Integrity enforcement mocks with constraint violation scenarios

### Service Integration Mocks

- ✅ Cross-service coordination simulation with PersonalityService, RoleService, ModelService
- ✅ Service communication failure scenarios with proper error propagation
- ✅ Batch operation mocks with performance optimization simulation
- ✅ Caching behavior simulation for reference resolution workflows

## Security Considerations

- Mock factory includes authorization scenario simulation
- Reference validation mocks respect security context requirements
- Cross-service security boundary simulation for comprehensive testing
- Authorization failure scenarios with appropriate error responses

## Dependencies

- **Internal**: Understanding of existing mock factory patterns from `AgentServiceMockFactory.ts`
- **External**: ReferenceService interface definition (create if needed)
- **Test Infrastructure**: Jest mocking framework, TypeScript mock patterns

## File Structure

```
packages/shared/src/__tests__/integration/support/
├── ReferenceServiceMockFactory.ts (NEW)
```

## Testing Requirements

Include comprehensive unit tests for the mock factory itself within the same task:

- Mock factory configuration validation
- Mock method behavior verification
- Error scenario generation testing
- Performance simulation accuracy
- Cross-service coordination mock validation

## Implementation Notes

- Follow established patterns from `AgentServiceMockFactory.ts` for consistency
- Implement comprehensive error scenario configuration options
- Support complex dependency graph simulation for testing
- Include performance testing support with realistic latency simulation
- Ensure mock behavior covers all scenarios needed by the integration tests
- Provide clear documentation and TypeScript types for mock configuration
- Support both simple and complex reference scenarios for comprehensive testing

### Log

**2025-07-28T04:10:51.502458Z** - Implemented ReferenceService interface and comprehensive mock factory for cross-service testing support. Created modular type definitions following project conventions and established mock factory patterns for consistent test infrastructure.

- filesChanged: ["packages/shared/src/types/services/ReferenceServiceInterface.ts", "packages/shared/src/types/services/ReferenceValidationRequest.ts", "packages/shared/src/types/services/DependencyNode.ts", "packages/shared/src/types/services/DependencyGraph.ts", "packages/shared/src/types/services/ReferenceResolutionResult.ts", "packages/shared/src/types/services/index.ts", "packages/shared/src/__tests__/integration/support/ReferenceServiceMockFactory.ts"]
