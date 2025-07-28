---
kind: task
id: T-create-personality-data-types
title: Create personality data types and Zustand store integration
status: open
priority: high
prerequisites: []
created: "2025-07-28T17:01:46.638204"
updated: "2025-07-28T17:01:46.638204"
schema_version: "1.1"
parent: F-personalities-section
---

# Create Personality Data Types and Zustand Store Integration

## Context

This task sets up the foundational data structures and state management for the Personalities section. It establishes the TypeScript interfaces and Zustand store integration needed for both the Saved and Create New tabs.

## Implementation Requirements

### Data Type Definitions

Create TypeScript interfaces in `packages/shared/src/types/`:

```typescript
interface Personality {
  id: string;
  name: string;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  behaviors: {
    [key: string]: number; // 14 behavior traits
  };
  customInstructions: string;
  createdAt: string;
  updatedAt: string;
}

interface PersonalityFormData {
  name: string;
  bigFive: BigFiveTraits;
  behaviors: BehaviorTraits;
  customInstructions: string;
}

interface BigFiveTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface BehaviorTraits {
  [key: string]: number;
}
```

### Zustand Store Integration

Extend existing store or create personality slice with:

- `personalities: Personality[]` - stored personalities list
- `addPersonality(personality: Personality)` - save new personality
- `updatePersonality(id: string, updates: Partial<Personality>)` - edit existing
- `deletePersonality(id: string)` - remove personality
- `clonePersonality(id: string)` - duplicate personality with new ID

### Validation Schemas

Create Zod schemas for data validation:

- PersonalitySchema for complete personality objects
- PersonalityFormSchema for form data validation
- Trait value ranges (0-100) with proper constraints

## Acceptance Criteria

- [ ] TypeScript interfaces defined with complete type safety
- [ ] Zustand store methods handle personality CRUD operations
- [ ] Zod validation schemas prevent invalid data
- [ ] Store actions include proper error handling
- [ ] Unit tests verify store operations work correctly
- [ ] Types exported properly for use in UI components

## Testing Requirements

- Unit tests for all store actions
- Validation tests for Zod schemas
- Type checking ensures no TypeScript errors
- Mock data generation utilities for testing

## Dependencies

- Existing Zustand store structure
- Zod validation library
- Shared types package structure

## Security Considerations

- Input sanitization for personality names and custom instructions
- Validation of trait value ranges (0-100)
- Protection against malformed data injection

### Log
