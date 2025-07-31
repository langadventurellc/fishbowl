---
kind: task
id: T-implement
title: Implement PersonalityConfigurationSchema with business rules
status: open
priority: high
prerequisites:
  - T-implement-bigfivetraitsschema
  - T-implement-behavioraltraitsschema
created: "2025-07-30T19:23:25.103374"
updated: "2025-07-30T19:23:25.103374"
schema_version: "1.1"
parent: F-personality-validation-schemas
---

# Implement PersonalityConfigurationSchema with Business Rules

## Purpose

Create the comprehensive PersonalityConfigurationSchema that combines BigFiveTraits and BehavioralTraits with metadata validation and business rule enforcement.

## Context

PersonalityConfiguration extends both BigFiveTraits and BehavioralTraits, adding metadata fields (id, name, description, etc.) and business rules. This is the primary validation schema for complete personality configurations.

## Implementation Requirements

### Schema Composition

- Extend BigFiveTraitsSchema and BehavioralTraitsSchema using `z.intersection()` or object merging
- Add metadata field validation following existing patterns
- Implement business rule validation with custom refinements

### Metadata Field Validation

Based on `packages/shared/src/types/personality/PersonalityConfiguration.ts`:

- `id`: UUID format validation with descriptive error messages
- `name`: Non-empty string, max 100 characters
- `description`: Optional string field
- `customInstructions`: Optional string, max 2000 characters
- `isTemplate`: Boolean field validation
- `createdAt`: ISO string format validation
- `updatedAt`: ISO string format validation

### Business Rule Validation

- Template personalities (isTemplate=true) validation rules
- String field XSS prevention and sanitization
- Aggregate error collection for multiple validation failures
- Performance optimization for repeated validation

## Acceptance Criteria

- [ ] Schema successfully validates complete PersonalityConfiguration objects
- [ ] All 19 traits (5 Big Five + 14 behavioral) properly validated
- [ ] UUID validation for id field with custom error message
- [ ] Name field validation: non-empty, max 100 chars
- [ ] CustomInstructions field validation: optional, max 2000 chars
- [ ] ISO timestamp validation for createdAt/updatedAt
- [ ] Business rule validation for template personalities
- [ ] Schema uses `z.object().strict()` to prevent excess properties
- [ ] Type inference produces correct PersonalityConfiguration type
- [ ] Performance requirement: validation completes in <10ms
- [ ] Comprehensive error aggregation across all fields and traits

## Technical Approach

1. Create `packages/shared/src/types/personality/validation/PersonalityConfigurationSchema.ts`
2. Import and compose BigFiveTraitsSchema and BehavioralTraitsSchema
3. Add metadata field validation using existing patterns from AgentSchema
4. Implement `z.uuid()` for id field validation
5. Use `z.string().datetime()` for ISO timestamp validation
6. Add custom refinements for business rules
7. Include comprehensive JSDoc documentation
8. Export schema and inferred type

## Files to Create

- `packages/shared/src/types/personality/validation/PersonalityConfigurationSchema.ts`

## Security Considerations

- Input sanitization for text fields (name, description, customInstructions)
- XSS prevention in string field validation
- UUID format validation to prevent malformed identifiers
- Template personality business rule enforcement

## Related Files

- Uses BigFiveTraitsSchema and BehavioralTraitsSchema
- References PersonalityConfiguration interface
- Follows patterns from AgentSchema.ts

### Log
