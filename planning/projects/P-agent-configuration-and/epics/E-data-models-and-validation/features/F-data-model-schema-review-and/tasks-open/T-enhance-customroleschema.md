---
kind: task
id: T-enhance-customroleschema
title: Enhance CustomRoleSchema validation patterns and error messaging
status: open
priority: high
prerequisites:
  - T-review-customroleschema-for
created: "2025-07-30T23:09:45.975557"
updated: "2025-07-30T23:09:45.975557"
schema_version: "1.1"
parent: F-data-model-schema-review-and
---

# Enhance CustomRoleSchema Validation Patterns and Error Messaging

## Context

Based on the findings from the CustomRoleSchema review task, enhance the role validation schemas to match the comprehensive validation patterns established by the personality schema system. Focus on validation consistency, error message quality, and business rule enforcement.

**Related files:**

- `packages/shared/src/types/role/CustomRoleCore.ts` - Main schema to enhance
- `packages/shared/src/types/role/CustomRoleCapability.ts` - Capability schema enhancement
- `packages/shared/src/types/role/CustomRoleConstraint.ts` - Constraint schema enhancement
- `packages/shared/src/types/role/CustomRoleMetadata.ts` - Metadata schema enhancement
- `packages/shared/src/types/personality/validation/` - Reference validation patterns

## Specific Requirements

### AC-1: Role Schema Validation Enhancement (from Feature AC-1)

- Ensure CustomRoleSchema validates all required business rules
- Enhance role capability and constraint validation comprehensiveness
- Strengthen template role immutability rules enforcement
- Improve cross-reference validation (templateId) effectiveness
- Standardize error messages to be user-friendly and actionable

### AC-4: Cross-Schema Consistency (from Feature AC-4)

- Align error message format with personality schema standards
- Implement identical UUID validation patterns across schemas
- Ensure consistent timestamp validation (ISO string format)
- Standardize optional field handling patterns

## Technical Implementation

1. **Implement validation pattern enhancements**
   - Update CustomRoleSchema with personality-schema-style validation patterns
   - Add comprehensive error messages following PERSONALITY_VALIDATION_ERRORS format
   - Implement XSS prevention for string fields (name, description)
   - Add proper JSDoc documentation for all schema fields

2. **Enhance business rule validation**
   - Strengthen template role immutability enforcement with clear error messages
   - Improve templateId cross-reference validation with format checking
   - Add comprehensive role capability validation rules
   - Implement role constraint validation with business rule enforcement

3. **Create validation utilities and helpers**
   - Create `packages/shared/src/types/role/validation/` directory structure
   - Implement role-specific validation utilities following personality pattern
   - Add role validation constants for error messages
   - Create reusable validation helper functions

4. **Add comprehensive unit tests**
   - Create test files in `packages/shared/src/types/role/validation/__tests__/`
   - Test all validation scenarios including edge cases and boundary conditions
   - Test business rule enforcement scenarios
   - Verify error message quality and consistency

## Acceptance Criteria

- [ ] CustomRoleSchema enhanced with comprehensive validation following personality schema patterns
- [ ] Template role immutability rules properly enforced with clear error messages
- [ ] Cross-reference validation (templateId) robust and effective
- [ ] Role capability and constraint validation comprehensive and well-tested
- [ ] Error messages user-friendly, actionable, and consistent with personality schema format
- [ ] XSS prevention implemented for all string fields with security testing
- [ ] UUID validation patterns identical to personality schema implementation
- [ ] Timestamp validation consistent with ISO string format standards
- [ ] Validation utilities and helpers implemented following established patterns
- [ ] Comprehensive unit tests achieve >95% coverage for all validation scenarios
- [ ] JSDoc documentation complete for all schema fields and validation rules

## Testing Requirements

- Create comprehensive unit tests for all validation scenarios
- Test template role immutability enforcement
- Test cross-reference validation effectiveness
- Test error message format consistency
- Add security tests for XSS prevention
- Test performance requirements (<10ms validation time)

## Security Considerations

- Implement XSS prevention for name and description fields
- Ensure templateId validation prevents injection attacks
- Validate that error messages don't leak sensitive information
- Test capability and constraint validation for security implications

## Dependencies

- Must complete T-review-customroleschema-for task first to understand specific enhancement needs
- Must not break existing integration tests
- Must maintain compatibility with existing service layer implementations

## Definition of Done

CustomRoleSchema enhanced with comprehensive validation patterns matching personality schema standards, including robust business rule enforcement, consistent error messaging, comprehensive unit test coverage, security measures, and complete documentation.

### Log
