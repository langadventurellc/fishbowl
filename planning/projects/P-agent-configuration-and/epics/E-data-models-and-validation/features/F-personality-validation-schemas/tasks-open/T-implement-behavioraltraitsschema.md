---
kind: task
id: T-implement-behavioraltraitsschema
title: Implement BehavioralTraitsSchema with 14 trait validation
status: open
priority: high
prerequisites:
  - T-create-validation-directory
created: "2025-07-30T19:23:05.924366"
updated: "2025-07-30T19:23:05.924366"
schema_version: "1.1"
parent: F-personality-validation-schemas
---

# Implement BehavioralTraitsSchema with 14 Trait Validation

## Purpose

Create comprehensive Zod validation schema for BehavioralTraits interface with 0-100 integer range validation for all 14 behavioral traits.

## Context

The BehavioralTraits interface defines 14 behavioral traits that must be integers between 0-100 inclusive. This complements the BigFiveTraitsSchema and follows the same validation patterns.

## Implementation Requirements

### Schema Definition

- Validate all 14 behavioral traits as integers 0-100 inclusive
- Use `z.object().strict()` to prevent excess properties
- Provide descriptive error messages referencing trait purpose
- Include JSDoc comments explaining each trait

### Trait Validation

Based on `packages/shared/src/types/personality/BehavioralTraits.ts`:

- `formality`: Professional to casual communication style
- `humor`: Serious to playful responses
- `assertiveness`: Suggestive to directive communication
- `empathy`: Logical to emotionally aware responses
- `storytelling`: Factual to narrative-driven explanations
- `brevity`: Concise to detailed responses
- `imagination`: Practical to creative suggestions
- `playfulness`: Task-focused to spontaneous interactions
- `dramaticism`: Matter-of-fact to theatrical expressions
- `analyticalDepth`: Surface-level to comprehensive analysis
- `contrarianism`: Consensus-building to challenging assumptions
- `encouragement`: Neutral to supportive feedback
- `curiosity`: Direct answers to exploratory questions
- `patience`: Direct to accommodating explanations

## Acceptance Criteria

- [ ] BehavioralTraitsSchema validates all 14 traits as 0-100 integers
- [ ] Custom error messages for each trait with context
- [ ] Schema uses `z.object().strict()` to prevent extra properties
- [ ] Type inference works correctly with all 14 traits
- [ ] Unit tests cover boundary conditions for all traits
- [ ] Performance benchmark validates <5ms compilation
- [ ] Error collection supports multiple trait validation failures

## Technical Approach

1. Create `packages/shared/src/types/personality/validation/BehavioralTraitsSchema.ts`
2. Import BEHAVIORAL_TRAITS constant for consistency
3. Use utility function from base schemas for 0-100 validation
4. Implement descriptive error messages for each trait
5. Add comprehensive JSDoc documentation
6. Export schema and inferred type

## Files to Create

- `packages/shared/src/types/personality/validation/BehavioralTraitsSchema.ts`

## Testing Requirements

- Unit tests for each of the 14 traits
- Boundary condition tests: -1, 0, 100, 101 for each trait
- Multiple error aggregation testing
- Performance benchmarks for schema compilation

### Log
