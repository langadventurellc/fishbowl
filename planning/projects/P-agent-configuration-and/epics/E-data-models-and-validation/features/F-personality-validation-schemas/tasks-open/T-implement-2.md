---
kind: task
id: T-implement-2
title: Implement PersonalityUpdateDataSchema for update operations
status: open
priority: normal
prerequisites:
  - T-implement
created: "2025-07-30T19:23:53.536856"
updated: "2025-07-30T19:23:53.536856"
schema_version: "1.1"
parent: F-personality-validation-schemas
---

# Implement PersonalityUpdateDataSchema for Update Operations

## Purpose

Create validation schema for PersonalityUpdateData, which allows partial updates to PersonalityConfiguration with only the id field required.

## Context

PersonalityUpdateData is defined as `Partial<PersonalityConfiguration> & { id: string }` allowing partial updates while requiring the id field for identification.

## Implementation Requirements

### Schema Definition

- Based on PersonalityConfigurationSchema but make all fields optional except id
- Validate id field as required UUID
- Support partial updates of any field or trait
- Include business rule validation for template personality restrictions

### Field Validation

Required fields:

- `id`: UUID format validation

Optional fields (partial updates):

- All 19 personality traits: 0-100 integers when provided
- `name`: Non-empty string, max 100 characters when provided
- `description`: String validation when provided
- `customInstructions`: Max 2000 characters when provided
- `isTemplate`: Boolean validation when provided
- `createdAt`: ISO string validation when provided (should not be updated)
- `updatedAt`: ISO string validation when provided

### Business Rule Validation

- Template personality update restrictions
- Prevent modification of createdAt field
- Validate that at least one field (besides id) is being updated

## Acceptance Criteria

- [ ] Schema validates PersonalityUpdateData with required id field
- [ ] All other fields are optional and validated when present
- [ ] Partial trait updates work correctly (can update subset of traits)
- [ ] Business rule validation for template personality restrictions
- [ ] Prevention of createdAt field modification
- [ ] Custom error messages for invalid partial updates
- [ ] Type inference produces correct PersonalityUpdateData type
- [ ] Schema performance <5ms compilation
- [ ] Unit tests cover partial update scenarios

## Technical Approach

1. Create `packages/shared/src/types/personality/validation/PersonalityUpdateDataSchema.ts`
2. Use `PersonalityConfigurationSchema.partial().extend({ id: z.uuid() })` approach
3. Add custom refinements for business rules
4. Include template personality update restrictions
5. Add validation for at least one update field
6. Export schema and inferred type

## Files to Create

- `packages/shared/src/types/personality/validation/PersonalityUpdateDataSchema.ts`

## Testing Requirements

- Unit tests for valid partial updates
- Tests for id field requirement
- Tests for template personality restrictions
- Tests for invalid field combinations
- Performance benchmarks

## Security Considerations

- Validate id field to prevent unauthorized updates
- Template personality protection
- Input sanitization for updated text fields

### Log
