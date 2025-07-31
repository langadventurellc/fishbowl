---
kind: task
id: T-implement-1
title: Implement PersonalityCreationDataSchema for input validation
status: open
priority: normal
prerequisites:
  - T-implement
created: "2025-07-30T19:23:39.120281"
updated: "2025-07-30T19:23:39.120281"
schema_version: "1.1"
parent: F-personality-validation-schemas
---

# Implement PersonalityCreationDataSchema for Input Validation

## Purpose

Create validation schema for PersonalityCreationData, which omits generated fields (id, createdAt, updatedAt) from PersonalityConfiguration for creation operations.

## Context

PersonalityCreationData is defined as `Omit<PersonalityConfiguration, "id" | "createdAt" | "updatedAt">` and is used for creating new personalities before generated fields are added by the service layer.

## Implementation Requirements

### Schema Definition

- Based on PersonalityConfigurationSchema but exclude generated fields
- Include all 19 traits (5 Big Five + 14 behavioral) validation
- Include metadata fields: name, description, customInstructions, isTemplate
- Use `z.object().strict()` to prevent excess properties

### Field Validation

Required fields:

- `name`: Non-empty string, max 100 characters
- `isTemplate`: Boolean value
- All 19 personality traits: 0-100 integers

Optional fields:

- `description`: Optional string
- `customInstructions`: Optional string, max 2000 characters

### Input Sanitization

- XSS prevention for text fields
- Trim whitespace from string inputs
- Normalize boolean inputs

## Acceptance Criteria

- [ ] Schema validates PersonalityCreationData without generated fields
- [ ] All trait validation (19 traits) works correctly
- [ ] Required field validation: name, isTemplate, all traits
- [ ] Optional field validation: description, customInstructions
- [ ] Input sanitization for text fields
- [ ] Custom error messages for missing required fields
- [ ] Type inference produces correct PersonalityCreationData type
- [ ] Unit tests cover creation scenario validation

## Technical Approach

1. Create `packages/shared/src/types/personality/validation/PersonalityCreationDataSchema.ts`
2. Use `PersonalityConfigurationSchema.omit(['id', 'createdAt', 'updatedAt'])` approach
3. Or compose from BigFiveTraitsSchema + BehavioralTraitsSchema + creation-specific metadata
4. Add input sanitization transforms
5. Include comprehensive validation error messages
6. Export schema and inferred type

## Files to Create

- `packages/shared/src/types/personality/validation/PersonalityCreationDataSchema.ts`

## Testing Requirements

- Unit tests for valid creation data
- Tests for missing required fields
- Tests for invalid trait values
- Tests for input sanitization

### Log
