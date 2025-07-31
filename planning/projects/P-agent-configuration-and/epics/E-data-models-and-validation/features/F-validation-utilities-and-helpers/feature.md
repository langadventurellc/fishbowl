---
kind: feature
id: F-validation-utilities-and-helpers
title: Validation Utilities and Helpers
status: in-progress
priority: high
prerequisites:
  - F-personality-validation-schemas
created: "2025-07-30T19:16:00.301585"
updated: "2025-07-30T19:16:00.301585"
schema_version: "1.1"
parent: E-data-models-and-validation
---

# Validation Utilities and Helpers Feature

## Purpose and Functionality

Implement common validation utilities and helper functions that support all data model validation schemas. This feature provides reusable validation patterns, error formatting, and business rule enforcement utilities used across personality, role, agent, and model validation.

## Key Components to Implement

- Range validation helpers for 0-100 trait constraints
- UUID format validation and generation utilities
- Error message formatting and aggregation utilities
- Field validation helpers for common patterns
- Business rule validation framework

## Detailed Acceptance Criteria

### AC-1: Range and Constraint Validation Utilities

- Given: Multiple schemas need 0-100 integer validation
- When: Range validation utilities are implemented
- Then:
  - validateTraitRange(value: number, fieldName: string) validates 0-100 integers
  - validateStringLength(value: string, min: number, max: number) handles text constraints
  - validateRequiredField(value: unknown, fieldName: string) checks required fields
  - All utilities provide consistent, descriptive error messages
  - Utilities are type-safe and support generic usage patterns

### AC-2: UUID Validation and Generation Utilities

- Given: All data models require consistent UUID handling
- When: UUID utilities are implemented
- Then:
  - validateUUID(value: string) validates UUID format with clear errors
  - generateId() produces RFC 4122 compliant UUIDs consistently
  - isValidId(value: string) provides type guard functionality
  - UUID utilities integrate seamlessly with Zod schemas
  - Generated UUIDs are guaranteed unique within reasonable probability

### AC-3: Error Formatting and Aggregation

- Given: Complex validation can produce multiple errors
- When: Error formatting utilities are implemented
- Then:
  - formatValidationError(error: ZodError) produces user-friendly messages
  - aggregateValidationErrors(errors: ValidationError[]) combines multiple errors
  - createFieldError(field: string, message: string) standardizes error format
  - Error utilities support internationalization hooks for future expansion
  - Error aggregation preserves field-specific context

### AC-4: Business Rule Validation Framework

- Given: Data models have domain-specific business rules
- When: Business rule framework is implemented
- Then:
  - validateBusinessRule(rule: BusinessRule, data: unknown) executes rules
  - Business rules can be composed and chained together
  - Rule validation results are consistently formatted
  - Framework supports both synchronous and asynchronous rules
  - Custom validation rules can be easily added and maintained

## Technical Requirements

- Implement utilities in packages/shared/src/utils/validation/
- Use TypeScript generics for type-safe validation utilities
- Ensure utilities are tree-shakeable for optimal bundle size
- Provide comprehensive JSDoc documentation for all utilities
- Support both individual and batch validation scenarios

## Implementation Guidance

- Create modular utility functions that can be imported individually
- Follow functional programming patterns for utility composition
- Ensure utilities integrate seamlessly with existing Zod schemas
- Implement consistent error handling patterns across all utilities
- Use const assertions and type narrowing for optimal TypeScript support

## Testing Requirements

- Unit tests for each utility function with edge cases and boundary conditions
- Integration tests showing utilities working with actual data schemas
- Performance tests for utilities used in high-frequency validation
- Test error message quality and consistency across different scenarios
- Validate utilities work correctly in batch validation operations

## Security Considerations

- Sanitize all string inputs to prevent XSS in error messages
- Ensure UUID generation uses cryptographically secure randomness
- Validate that error messages don't leak sensitive information
- Prevent code injection through dynamic validation rule execution
- Ensure validation utilities don't introduce timing attack vulnerabilities

## Performance Requirements

- Individual validation utilities complete in <1ms for typical inputs
- Batch validation utilities scale linearly with input size
- Memory usage remains constant for utility function execution
- Error aggregation has minimal overhead even with many errors
- UUID generation performs efficiently for high-frequency operations

## Dependencies

- PersonalityConfiguration and related interfaces for trait validation
- Zod library integration for schema composition
- Existing ValidationResult and error interfaces

### Log
