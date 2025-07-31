---
kind: task
id: T-enhance-agentschema-validation
title: Enhance AgentSchema validation and cross-service integration patterns
status: open
priority: high
prerequisites:
  - T-review-agentschema-for
created: "2025-07-30T23:10:05.062512"
updated: "2025-07-30T23:10:05.062512"
schema_version: "1.1"
parent: F-data-model-schema-review-and
---

# Enhance AgentSchema Validation and Cross-Service Integration

## Context

Based on the findings from the AgentSchema review task, enhance the agent validation schema to match the comprehensive validation patterns established by the personality schema system. Focus on cross-service validation coordination, comprehensive agent configuration validation, and consistent error messaging.

**Related files:**

- `packages/shared/src/types/agent/AgentSchema.ts` - Main schema to enhance
- `packages/shared/src/types/agent/AgentCreateRequest.ts` - Create request validation
- `packages/shared/src/types/agent/AgentUpdateRequest.ts` - Update request validation
- `packages/shared/src/types/personality/validation/` - Reference validation patterns

## Specific Requirements

### AC-2: Agent Schema Validation Enhancement (from Feature AC-2)

- Enhance AgentSchema to validate all agent configuration requirements comprehensively
- Strengthen personalityId and roleId reference validation robustness
- Improve model configuration validation integration
- Enhance agent metadata validation to cover all use cases
- Make settings and capabilities validation comprehensive

### AC-4: Cross-Schema Consistency Implementation

- Align error message format with personality schema standards
- Implement identical UUID validation patterns for personalityId and roleId
- Ensure consistent timestamp validation (ISO string format)
- Standardize optional field handling patterns

## Technical Implementation

1. **Enhance AgentSchema validation patterns**
   - Update AgentSchema with personality-schema-style comprehensive validation
   - Add detailed error messages following PERSONALITY_VALIDATION_ERRORS format
   - Implement XSS prevention for string fields (name, description, role)
   - Add comprehensive JSDoc documentation for all schema fields

2. **Strengthen cross-reference validation**
   - Enhance personalityId UUID validation with detailed error messages
   - Improve roleId validation with format checking and clear errors
   - Add modelId validation with proper format checking
   - Implement cross-reference validation error context preservation

3. **Enhance agent metadata and configuration validation**
   - Improve metadata object validation with comprehensive field checking
   - Enhance settings record validation with type safety and error handling
   - Strengthen capabilities and constraints array validation
   - Add version validation and timestamp consistency checking

4. **Create agent-specific validation utilities**
   - Create `packages/shared/src/types/agent/validation/` directory structure
   - Implement agent-specific validation utilities following personality pattern
   - Add agent validation constants for error messages
   - Create reusable validation helper functions for cross-service integration

5. **Add comprehensive unit tests**
   - Create test files in `packages/shared/src/types/agent/validation/__tests__/`
   - Test all validation scenarios including cross-service integration patterns
   - Test reference validation effectiveness with various invalid scenarios
   - Verify error message quality and consistency with other schemas

## Acceptance Criteria

- [ ] AgentSchema enhanced with comprehensive validation following personality schema patterns
- [ ] PersonalityId and roleId reference validation robust with detailed error messages
- [ ] Model configuration validation integrated effectively with clear constraints
- [ ] Agent metadata validation comprehensive covering all use cases
- [ ] Settings and capabilities validation complete with type safety
- [ ] Error messages user-friendly, actionable, and consistent with personality schema format
- [ ] XSS prevention implemented for all string fields with security testing
- [ ] UUID validation patterns identical to personality schema implementation
- [ ] Cross-service validation patterns documented and tested
- [ ] Agent-specific validation utilities implemented following established patterns
- [ ] Comprehensive unit tests achieve >95% coverage for all validation scenarios
- [ ] JSDoc documentation complete for all schema fields and validation rules

## Testing Requirements

- Create comprehensive unit tests for all validation scenarios
- Test cross-reference validation robustness (personalityId, roleId, modelId)
- Test agent metadata validation completeness
- Test error message format consistency across all validation scenarios
- Add security tests for XSS prevention
- Test performance requirements (300ms cross-service validation limit)
- Add integration tests for cross-service validation coordination

## Security Considerations

- Implement XSS prevention for name, description, and role fields
- Ensure reference ID validation prevents injection attacks
- Validate that error messages don't leak sensitive information
- Test settings record validation for security implications
- Ensure capabilities and constraints validation prevents malicious configurations

## Dependencies

- Must complete T-review-agentschema-for task first to understand specific enhancement needs
- Must not break existing integration tests in agent-configuration features
- Must maintain compatibility with existing AgentService interface implementations
- Should coordinate with cross-service validation patterns from other schemas

## Definition of Done

AgentSchema enhanced with comprehensive validation patterns matching personality schema standards, including robust cross-service validation, consistent error messaging, comprehensive unit test coverage, security measures, complete documentation, and effective integration with existing agent service implementations.

### Log
