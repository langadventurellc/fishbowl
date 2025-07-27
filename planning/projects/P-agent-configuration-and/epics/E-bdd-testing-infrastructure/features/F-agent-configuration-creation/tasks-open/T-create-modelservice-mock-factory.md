---
kind: task
id: T-create-modelservice-mock-factory
title: Create ModelService mock factory for configuration testing
status: open
priority: high
prerequisites:
  - T-create-modelservice-interface
created: "2025-07-27T13:03:25.908297"
updated: "2025-07-27T13:03:25.908297"
schema_version: "1.1"
parent: F-agent-configuration-creation
---

# Create ModelService Mock Factory for Model Configuration Testing

## Context

Create a comprehensive ModelService mock factory following established patterns to support model configuration validation testing in agent creation workflows. This mock will simulate model availability, capability validation, and cross-service compatibility checking.

## Technical Approach

- Follow existing mock factory patterns (RoleServiceMockFactory, ValidationServiceMockFactory)
- Create configurable mock behaviors for all ModelService interface methods
- Include realistic model configuration data and compatibility scenarios
- Support model constraint validation and availability simulation

## Implementation Requirements

### File Location

- Create: `packages/shared/src/__tests__/integration/support/ModelServiceMockFactory.ts`
- Import ModelService interface from types/services
- Follow established mock factory organization patterns

### Mock Factory Structure

1. **ModelServiceMockConfig Interface**
   - `shouldSucceed?: boolean` - Overall success/failure control
   - `availableModels?: ModelConfiguration[]` - Custom model availability
   - `compatibilityResults?: CompatibilityResult[]` - Pre-configured compatibility data
   - `simulateDelay?: boolean` - Network delay simulation
   - `constraintViolations?: boolean` - Simulate constraint failures

2. **ModelServiceMockFactory Class**
   - Static factory methods following existing patterns
   - `createSuccess()` - Mock with successful model operations
   - `createFailure()` - Mock with model availability/validation failures
   - `create(config)` - Configurable mock creation with custom behaviors

### Mocked Methods Implementation

#### validateModelConfiguration(config: ModelConfiguration): Promise<ValidationResult>

- **Success**: Return comprehensive validation success with model details
- **Failure**: Return model configuration errors (invalid model ID, capability mismatches)
- **Edge Cases**: Simulate deprecated models, capacity constraints, regional availability

#### checkModelCompatibility(modelConfig: ModelConfiguration, personalityConfig: PersonalityConfiguration, roleConfig: Role): Promise<CompatibilityResult>

- **Success**: Return detailed compatibility analysis with match scores
- **Failure**: Return incompatibility reasons (insufficient capabilities, constraint conflicts)
- **Analysis**: Simulate personality-model and role-model compatibility algorithms

#### getModelCapabilities(modelId: string): Promise<ModelCapabilities | null>

- **Success**: Return comprehensive model capability data
- **Failure**: Return null for unknown models
- **Data**: Include performance metrics, supported features, and limitations

#### listAvailableModels(filters?: ModelFilters): Promise<ModelConfiguration[]>

- **Success**: Return filtered list of available models
- **Filtering**: Support capability, performance, and constraint-based filtering
- **Availability**: Simulate real-time model availability and capacity

#### validateModelConstraints(modelConfig: ModelConfiguration, constraints: ModelConstraints): Promise<ValidationResult>

- **Success**: Return constraint compliance validation
- **Failure**: Return constraint violation details (performance, cost, availability)
- **Analysis**: Simulate operational constraint checking algorithms

### Test Data Support

- **Model Fixtures**: Pre-configured model data for various testing scenarios
- **Capability Data**: Realistic model capability definitions and constraints
- **Compatibility Matrices**: Personality-role-model compatibility scenarios
- **Performance Data**: Model response times, throughput, and capacity limits
- **Error Scenarios**: Common model validation and constraint failure patterns

## Acceptance Criteria

### Mock Factory Implementation

- ✅ ModelServiceMockFactory class created following existing patterns
- ✅ All ModelService interface methods mocked with Jest
- ✅ Configurable success/failure scenarios implemented
- ✅ Realistic model configuration and capability data generation
- ✅ Cross-service compatibility simulation included

### Model Validation Coverage

- ✅ Model configuration validation with detailed error reporting
- ✅ Model capability and constraint checking simulation
- ✅ Cross-service compatibility analysis (personality, role compatibility)
- ✅ Model availability and capacity simulation
- ✅ Performance and operational constraint validation

### Integration Support

- ✅ Mock integrates with existing test infrastructure
- ✅ Compatible with Jest async/await testing patterns
- ✅ Provides comprehensive model test data fixtures
- ✅ Supports BDD Given-When-Then testing scenarios
- ✅ Performance and availability simulation capabilities

### Code Quality

- ✅ TypeScript strict mode compliance
- ✅ Consistent with existing mock factory patterns
- ✅ Comprehensive JSDoc documentation
- ✅ Proper error handling and edge case coverage
- ✅ No TypeScript compilation errors

## Dependencies

- Requires completed ModelService interface (prerequisite)
- Reference PersonalityConfiguration and Role types for compatibility checking
- Use existing ValidationResult patterns from other services
- Integration with Jest testing framework

## File Structure

```
packages/shared/src/__tests__/integration/support/
├── ModelServiceMockFactory.ts (NEW)
├── AgentServiceMockFactory.ts (previous task)
├── RoleServiceMockFactory.ts (existing)
└── mock-factories.ts (UPDATE to include ModelService exports)
```

## Testing Integration

- Mock will be used in agent configuration creation integration tests
- Supports model compatibility validation testing
- Enables cross-service coordination testing with personality and role services
- Provides foundation for comprehensive agent creation workflow testing

### Log
