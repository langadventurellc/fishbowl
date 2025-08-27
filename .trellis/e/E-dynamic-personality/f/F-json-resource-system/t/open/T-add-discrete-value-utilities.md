---
id: T-add-discrete-value-utilities
title: Add discrete value utilities and validation (moved under Discrete Value System)
status: open
priority: medium
parent: F-discrete-value-system
prerequisites:
  - T-define-shared-personality
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T15:42:39.676Z
updated: 2025-08-27T15:42:39.676Z
---

# Add discrete value utilities and validation

## Context

Create minimal, shared utility functions and constants for the discrete value system (0, 20, 40, 60, 80, 100). These are shared primitives used by schema validation and UI components. Keep the surface small to avoid over‑engineering.

## Implementation Requirements

### Utility Functions

- Create `snapToNearestDiscrete()` function with proper rounding logic
- Implement `isDiscreteValue()` guard for validation
- Export a simple `convertToDiscreteValue()` alias to snapping for clarity

### Constants and Types

- Define `DISCRETE_VALUES` constant array and `DISCRETE_STEP = 20`
- Create `DiscreteValue` union type
- Export only what’s necessary for UI/schema use

### Validation Logic

- Provide `isDiscreteValue()` for use in Zod refinements (schema task)
- Support conversion from continuous to discrete values via snapping

### Files to Create

- `packages/shared/src/utils/discreteValues.ts`
- Unit tests for all utility functions

### Technical Approach

1. Define discrete value constants and types
2. Implement snapping logic with proper halfway rounding (rounds up)
3. Create validation functions using Zod refinements
4. Add helper functions for UI interactions (keyboard nav, step calculation)
5. Ensure all functions are pure and side-effect free

## Acceptance Criteria

- [ ] `DISCRETE_VALUES = [0, 20, 40, 60, 80, 100]` and `DISCRETE_STEP = 20` constants defined
- [ ] `snapToNearestDiscrete()` rounds halfway values up (30→40, 50→60)
- [ ] `isDiscreteValue()` type guard implemented
- [ ] All utility functions are pure with no side effects
- [ ] Comprehensive unit tests covering edge cases

## Testing Requirements

### Unit Tests

- Discrete value snapping logic and edge cases
- Validation guard with valid/invalid inputs
- Boundary conditions (0, 100, out-of-range values)

## Security Considerations

- Input validation to prevent injection through value manipulation
- Bounds checking to prevent integer overflow
- Safe type coercion for user input values

## Dependencies

- Requires shared types from T-define-shared-personality
- Zod validation library

## Out of Scope

- UI component integration (future tasks)
- Slider component implementation (future tasks)
- Form schema updates (future tasks)
