---
kind: task
id: T-create-agentservice-mock-factory
title: Create AgentService mock factory with comprehensive behavior simulation
status: open
priority: high
prerequisites:
  - T-create-agentservice-interface
created: "2025-07-27T13:02:57.363905"
updated: "2025-07-27T13:02:57.363905"
schema_version: "1.1"
parent: F-agent-configuration-creation
---

# Create AgentService Mock Factory for Integration Testing

## Context

Following the established mock factory pattern in the codebase, create a comprehensive AgentService mock factory to support BDD integration testing for agent configuration creation workflows. This mock will simulate all AgentService behaviors with configurable success/failure scenarios.

## Technical Approach

- Follow existing mock factory patterns from RoleServiceMockFactory and ValidationServiceMockFactory
- Create configurable mock behaviors for all AgentService interface methods
- Support both success and failure scenarios for comprehensive testing
- Include realistic agent configuration data and validation responses

## Implementation Requirements

### File Location

- Create: `packages/shared/src/__tests__/integration/support/AgentServiceMockFactory.ts`
- Import AgentService interface from types/services
- Follow existing mock factory file organization

### Mock Factory Structure

1. **AgentServiceMockConfig Interface**
   - `shouldSucceed?: boolean` - Overall success/failure control
   - `returnValue?: any` - Custom return values for testing
   - `simulateDelay?: boolean` - Network delay simulation
   - `validationErrors?: ValidationResult[]` - Custom validation errors
   - `crossServiceFailures?: boolean` - Simulate cross-service coordination failures

2. **AgentServiceMockFactory Class**
   - Static factory methods following existing patterns
   - `createSuccess()` - Mock with successful behaviors
   - `createFailure()` - Mock with failure scenarios
   - `create(config)` - Configurable mock creation

### Mocked Methods Implementation

#### createAgent(config: AgentCreateRequest): Promise<Agent>

- **Success**: Return complete agent configuration with generated ID
- **Failure**: Throw validation errors or service coordination failures
- **Validation**: Check personality, role, and model compatibility
- **Cross-service coordination**: Simulate PersonalityService, RoleService, ModelService interactions

#### validateAgentConfiguration(config: AgentCreateRequest): Promise<ValidationResult>

- **Success**: Return comprehensive validation success with details
- **Failure**: Return detailed validation errors with field-specific context
- **Edge cases**: Simulate partial validation failures and warnings

#### updateAgentConfiguration(agentId: string, updates: AgentUpdateRequest): Promise<Agent>

- **Success**: Return updated agent configuration
- **Failure**: Agent not found, validation errors, or update conflicts
- **Consistency**: Maintain configuration consistency across updates

#### getAgentConfiguration(agentId: string): Promise<Agent | null>

- **Success**: Return complete agent configuration with all related data
- **Failure**: Return null for non-existent agents
- **Performance**: Simulate fast retrieval with optional delay

#### deleteAgent(agentId: string): Promise<void>

- **Success**: Complete deletion with cleanup
- **Failure**: Agent not found or dependency conflicts
- **Cleanup**: Simulate cascade deletion scenarios

### Test Data Support

- **Agent Fixtures**: Pre-configured agent data for consistent testing
- **Validation Scenarios**: Common validation error patterns
- **Cross-Service Data**: Related personality, role, and model configurations
- **Performance Data**: Realistic response times and data sizes

## Acceptance Criteria

### Mock Factory Implementation

- ✅ AgentServiceMockFactory class created following existing patterns
- ✅ All AgentService interface methods mocked with Jest
- ✅ Configurable success/failure scenarios implemented
- ✅ Realistic agent configuration data generation
- ✅ Cross-service coordination simulation included

### Test Behavior Coverage

- ✅ Agent creation workflows with validation and persistence
- ✅ Configuration validation with detailed error reporting
- ✅ Cross-service compatibility checking simulation
- ✅ Agent retrieval and update operations
- ✅ Error scenarios and edge case handling

### Integration Support

- ✅ Mock integrates seamlessly with existing test infrastructure
- ✅ Compatible with Jest test framework
- ✅ Supports async/await testing patterns
- ✅ Provides comprehensive test data fixtures
- ✅ Performance simulation capabilities

### Code Quality

- ✅ TypeScript strict mode compliance
- ✅ Consistent with existing mock factory patterns
- ✅ Comprehensive JSDoc documentation
- ✅ Proper error handling and edge case coverage
- ✅ No TypeScript compilation errors

## Dependencies

- Requires completed AgentService interface (prerequisite)
- Reference existing mock factories: RoleServiceMockFactory, ValidationServiceMockFactory
- Use agent configuration types and validation patterns
- Integration with Jest testing framework

## File Structure

```
packages/shared/src/__tests__/integration/support/
├── AgentServiceMockFactory.ts (NEW)
├── RoleServiceMockFactory.ts (existing)
├── ValidationServiceMockFactory.ts (existing reference)
└── mock-factories.ts (UPDATE to include AgentService exports)
```

## Testing Integration

- Mock will be used in agent configuration integration tests
- Supports BDD Given-When-Then testing patterns
- Enables comprehensive cross-service coordination testing
- Provides foundation for agent creation workflow validation

### Log
