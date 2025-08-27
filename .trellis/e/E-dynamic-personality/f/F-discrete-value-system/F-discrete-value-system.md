---
id: F-discrete-value-system
title: Discrete Value System Implementation
status: open
priority: medium
parent: E-dynamic-personality
prerequisites:
  - F-json-resource-system
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T05:14:05.875Z
updated: 2025-08-27T05:14:05.875Z
---

# Discrete Value System Implementation

## Overview

Transform the continuous slider system (0-100 with any value) into a discrete value system supporting only specific values (0, 20, 40, 60, 80, 100) with proper snapping behavior, keyboard navigation, and accessibility features.

## Purpose

This feature implements the core discrete value logic and updated validation schemas that ensure personality sliders only accept intentional, meaningful values instead of arbitrary numbers between 0-100.

## Key Components to Implement

### Discrete Value Logic

- Create discrete value constants and type definitions
- Implement snapping logic that rounds to nearest discrete value (with halfway rounding up)
- Create validation functions for discrete value checking
- Export discrete value utilities for use across components

### Schema Updates

- Update Zod schemas to validate only discrete values using refinement
- Maintain permissive record types for dynamic trait keys
- Update form validation to reject non-discrete values
- Ensure backward compatibility during migration

### Value Conversion Utilities

- Create functions to convert continuous values to discrete equivalents
- Implement rounding logic (nearest; halfway rounds up to 60 for "positively charged balanced")
- Handle edge cases and boundary conditions
- Provide migration helpers for existing data

## Detailed Acceptance Criteria

### Discrete Value Constants

- [ ] `DISCRETE_VALUES` constant defined as `[0, 20, 40, 60, 80, 100]`
- [ ] `DiscreteValue` type exported for type safety
- [ ] Values accessible and importable across the application
- [ ] `DISCRETE_STEP` exported and set to `20`
- [ ] `DISCRETE_VALUE_SET` exported for fast membership checks

### Snapping Logic Implementation

- [ ] `snapToNearestDiscrete(value: number): DiscreteValue` function implemented
- [ ] Rounding logic: values round to nearest discrete value
- [ ] Halfway values (10, 30, 50, 70, 90) round up to next higher discrete value
- [ ] Edge cases handled: values < 0 become 0, values > 100 become 100
- [ ] Function returns only valid discrete values

### Validation Functions

- [ ] `isDiscreteValue(value: number): value is DiscreteValue` type guard implemented
- [ ] `validateDiscreteValue(value: number): boolean` validation function
- [ ] Functions handle edge cases and invalid inputs gracefully

### Schema Validation Updates

- [ ] `personalitySchema.ts` updated with discrete value refinement
- [ ] Single `behaviors` record keyed by trait id (includes Big Five and all other traits)
- [ ] All trait values must be in {0,20,40,60,80,100}
- [ ] Schema provides clear error messages for invalid values
- [ ] Form validation rejects submissions with non-discrete values

### Permissive Key Structure

- [ ] Behavior keys remain flexible as `Record<string, number>`
- [ ] UI can be driven by JSON trait definitions without schema regeneration
- [ ] Dynamic trait addition supported without code changes

### Value Conversion System

- [ ] `convertToDiscreteValue(value: number): DiscreteValue` conversion function
- [ ] Handles common input scenarios (floats, out-of-bounds values)
- [ ] Consistent with snapping logic for UI interactions
- [ ] Deterministic conversion for defaults and external inputs (no migrations)

## Implementation Guidance

### Technical Approach

- Create a single shared utilities module exporting all discrete value primitives
- Export `DISCRETE_VALUES`, `DISCRETE_STEP=20`, `DISCRETE_VALUE_SET`, `isDiscreteValue`, `snapToNearestDiscrete`, and `convertToDiscreteValue`
- Use TypeScript const assertions for compile-time value validation
- Leverage Zod's `refine()` method for schema-level discrete value validation
- Implement consistent rounding algorithm (Math.round(value/20) \* 20)

### File Structure

```
packages/shared/src/utils/
├── discreteValues.ts              # canonical exports for constants + helpers
├── index.ts
└── __tests__/
    └── discreteValues.test.ts

packages/ui-shared/src/schemas/
└── personalitySchema.ts (updated to dynamic records for bigFive & behaviors)
```

### Schema Example (single dynamic record)

```ts
import { z } from "zod";
import { isDiscreteValue } from "@fishbowl-ai/shared/utils/discreteValues";

const discreteNumber = z
  .number()
  .refine(isDiscreteValue, "Must be one of 0,20,40,60,80,100");

export const personalitySchema = z.object({
  name: z.string().min(1).max(50),
  behaviors: z.record(z.string(), discreteNumber), // includes Big Five + all other traits
  customInstructions: z.string().max(500),
});
```

### Algorithm Details

```typescript
// Primary snapping algorithm
export const snapToNearestDiscrete = (value: number): DiscreteValue => {
  const clamped = Math.min(100, Math.max(0, value));
  const idx = Math.round(clamped / 20); // 0.5 rounds up
  return DISCRETE_VALUES[idx] as DiscreteValue;
};
```

### Dependencies

- Requires foundation feature (F-json-resource-system) for JSON loading
- Zod library for schema validation updates
- TypeScript for type safety and const assertions

## Testing Requirements

### Unit Tests

- Snapping logic with all boundary conditions
- Edge cases: negative values, values > 100, exact halfway values
- Schema validation with valid and invalid discrete values
- Type guard functions with various input types
- Conversion functions with floating point inputs

### Property-Based Tests

- Verify snapping always returns valid discrete values
- Ensure idempotent behavior (snapping discrete values returns same value)
- Test large ranges of input values for consistent behavior

### Schema Integration Tests

- Form validation with discrete and non-discrete values
- Error message clarity and helpfulness
- Works with dynamic trait keys (no reliance on hardcoded Big Five)

## Performance Requirements

- [ ] Snapping calculations complete in < 1ms for responsive UI
- [ ] Schema validation performs efficiently with large personality datasets
- [ ] No performance regression compared to continuous validation

## Accessibility Considerations

- Discrete values enable better screen reader value announcements
- Predictable value changes improve keyboard navigation experience
- Clear discrete steps provide better mental model for users

## Security Considerations

- Input validation prevents injection of invalid discrete values
- Type safety prevents runtime errors from invalid value types
- Schema validation ensures data integrity at persistence layer

## Future Extensibility

- Algorithm supports different step sizes if needed (currently fixed at 20)
- Additional discrete value sets can be defined for different trait types
- Conversion logic can be extended for more complex rounding rules
