---
kind: task
id: T-implement-bigfivetraitsschema
title: Implement BigFiveTraitsSchema with range validation
status: open
priority: high
prerequisites:
  - T-create-validation-directory
created: "2025-07-30T19:22:49.810101"
updated: "2025-07-30T19:22:49.810101"
schema_version: "1.1"
parent: F-personality-validation-schemas
---

# Implement BigFiveTraitsSchema with Range Validation

## Purpose

Create comprehensive Zod validation schema for BigFiveTraits interface with 0-100 integer range validation and custom error messages.

## Context

The BigFiveTraits interface defines 5 traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) that must be integers between 0-100 inclusive. Follow existing patterns from `packages/shared/src/types/agent/AgentSchema.ts`.

## Implementation Requirements

### Schema Definition

- Validate all 5 Big Five traits as integers 0-100 inclusive
- Use `z.object().strict()` to prevent excess properties
- Provide descriptive error messages for each validation rule
- Include JSDoc comments for IDE support

### Trait Validation

Based on `packages/shared/src/types/personality/BigFiveTraits.ts`:

- `openness`: 0-100 integer (creativity and exploration)
- `conscientiousness`: 0-100 integer (attention to detail)
- `extraversion`: 0-100 integer (verbosity and enthusiasm)
- `agreeableness`: 0-100 integer (supportiveness vs critical)
- `neuroticism`: 0-100 integer (confidence vs cautiousness)

### Performance Requirements

- Schema compilation completes in <5ms
- Validation performs efficiently for repeated use
- Memory efficient schema reuse

## Acceptance Criteria

- [ ] BigFiveTraitsSchema validates all 5 traits as 0-100 integers
- [ ] Custom error messages for out-of-range values ("Value must be between 0-100")
- [ ] Custom error messages for non-integer values
- [ ] Custom error messages for missing required traits
- [ ] Schema uses `z.object().strict()` to prevent extra properties
- [ ] Type inference works: `type BigFiveTraits = z.infer<typeof BigFiveTraitsSchema>`
- [ ] Schema compilation performance <5ms (add benchmark test)
- [ ] Unit tests cover all validation scenarios (boundary conditions: -1, 0, 100, 101)

## Technical Approach

1. Create `packages/shared/src/types/personality/validation/BigFiveTraitsSchema.ts`
2. Import trait constants from `PersonalityTraitConstants.ts`
3. Use `z.number().int().min(0).max(100)` for each trait
4. Add custom error messages using second parameter
5. Export schema constant and inferred type
6. Follow existing validation patterns for consistency

## Files to Create

- `packages/shared/src/types/personality/validation/BigFiveTraitsSchema.ts`

## Related Files to Reference

- `packages/shared/src/types/personality/BigFiveTraits.ts` (interface)
- `packages/shared/src/types/personality/PersonalityTraitConstants.ts` (constants)
- `packages/shared/src/types/agent/AgentSchema.ts` (validation patterns)

### Log
