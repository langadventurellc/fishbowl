---
id: T-create-personalities-mock
title: Create Personalities Mock Data Generators
status: open
priority: medium
parent: F-end-to-end-tests-for
prerequisites:
  - T-create-personalities-test-1
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T21:16:30.002Z
updated: 2025-08-17T21:16:30.002Z
---

# Create Personalities Mock Data Generators

## Context

Create mock data generators for personalities end-to-end tests, following the pattern established for roles tests but adapted for the personality data structure. These generators create consistent test data for various testing scenarios.

## Reference Implementations

Base implementations on these roles data generators:

- `tests/desktop/helpers/settings/MockRoleData.ts` - Type definitions
- `tests/desktop/helpers/settings/createMockRoleData.ts` - Basic mock generator
- Other role data generators: `createMinimalRoleData.ts`, `createInvalidRoleData.ts`, etc.

## Data Structure Reference

Based on `packages/shared/src/data/defaultPersonalities.json`, personalities have:

- `id`: unique identifier
- `name`: display name
- `bigFive`: personality traits (openness, conscientiousness, extraversion, agreeableness, neuroticism) - 0-100 range
- `behaviors`: behavioral traits (14 traits: analytical, empathetic, decisive, curious, patient, humorous, formal, optimistic, cautious, creative, logical, supportive, direct, enthusiastic) - 0-100 range
- `customInstructions`: personality-specific instructions
- `createdAt`/`updatedAt`: timestamps (nullable)

## Implementation Requirements

### 1. Create MockPersonalityData.ts

Create file: `tests/desktop/helpers/settings/MockPersonalityData.ts`

Define the mock data interface:

```typescript
export interface MockPersonalityData {
  name: string;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  behaviors: {
    analytical: number;
    empathetic: number;
    decisive: number;
    curious: number;
    patient: number;
    humorous: number;
    formal: number;
    optimistic: number;
    cautious: number;
    creative: number;
    logical: number;
    supportive: number;
    direct: number;
    enthusiastic: number;
  };
  customInstructions: string;
}
```

### 2. Create createMockPersonalityData.ts

Create file: `tests/desktop/helpers/settings/createMockPersonalityData.ts`

Following the pattern from createMockRoleData.ts but adapted for personalities:

```typescript
import { randomUUID } from "crypto";
import type { MockPersonalityData } from "./MockPersonalityData";

export const createMockPersonalityData = (
  overrides?: Partial<MockPersonalityData>,
): MockPersonalityData => {
  const personalityId = randomUUID().slice(0, 8);

  // Generate balanced trait scores (40-60 range for neutral)
  const generateBalancedTraits = () => ({
    openness: 55 + Math.floor(Math.random() * 20) - 10, // 45-65
    conscientiousness: 55 + Math.floor(Math.random() * 20) - 10,
    extraversion: 55 + Math.floor(Math.random() * 20) - 10,
    agreeableness: 55 + Math.floor(Math.random() * 20) - 10,
    neuroticism: 55 + Math.floor(Math.random() * 20) - 10,
  });

  const generateBalancedBehaviors = () => ({
    analytical: 55 + Math.floor(Math.random() * 20) - 10,
    empathetic: 55 + Math.floor(Math.random() * 20) - 10,
    decisive: 55 + Math.floor(Math.random() * 20) - 10,
    curious: 55 + Math.floor(Math.random() * 20) - 10,
    patient: 55 + Math.floor(Math.random() * 20) - 10,
    humorous: 55 + Math.floor(Math.random() * 20) - 10,
    formal: 55 + Math.floor(Math.random() * 20) - 10,
    optimistic: 55 + Math.floor(Math.random() * 20) - 10,
    cautious: 55 + Math.floor(Math.random() * 20) - 10,
    creative: 55 + Math.floor(Math.random() * 20) - 10,
    logical: 55 + Math.floor(Math.random() * 20) - 10,
    supportive: 55 + Math.floor(Math.random() * 20) - 10,
    direct: 55 + Math.floor(Math.random() * 20) - 10,
    enthusiastic: 55 + Math.floor(Math.random() * 20) - 10,
  });

  return {
    name: `Test Personality ${personalityId}`,
    bigFive: generateBalancedTraits(),
    behaviors: generateBalancedBehaviors(),
    customInstructions: `You are a test personality for automated testing purposes (ID: ${personalityId}). Help with testing and verification tasks while maintaining this specific personality profile. Always provide clear, actionable responses for test scenarios.`,
    ...overrides,
  };
};
```

### 3. Create createMinimalPersonalityData.ts

Create file: `tests/desktop/helpers/settings/createMinimalPersonalityData.ts`

Minimal personality data for testing edge cases:

```typescript
import { randomUUID } from "crypto";
import type { MockPersonalityData } from "./MockPersonalityData";

export const createMinimalPersonalityData = (
  overrides?: Partial<MockPersonalityData>,
): MockPersonalityData => {
  const personalityId = randomUUID().slice(0, 8);

  // Minimal valid trait scores (all set to 50 - neutral)
  const minimalTraits = {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  };

  const minimalBehaviors = {
    analytical: 50,
    empathetic: 50,
    decisive: 50,
    curious: 50,
    patient: 50,
    humorous: 50,
    formal: 50,
    optimistic: 50,
    cautious: 50,
    creative: 50,
    logical: 50,
    supportive: 50,
    direct: 50,
    enthusiastic: 50,
  };

  return {
    name: `Min Test ${personalityId}`,
    bigFive: minimalTraits,
    behaviors: minimalBehaviors,
    customInstructions: `Minimal test personality ${personalityId}.`,
    ...overrides,
  };
};
```

### 4. Create createInvalidPersonalityData.ts

Create file: `tests/desktop/helpers/settings/createInvalidPersonalityData.ts`

Invalid data for testing validation:

```typescript
import type { MockPersonalityData } from "./MockPersonalityData";

export const createInvalidPersonalityData = (): {
  emptyName: Partial<MockPersonalityData>;
  invalidTraitScores: Partial<MockPersonalityData>;
  missingCustomInstructions: Partial<MockPersonalityData>;
  extremeTraitScores: Partial<MockPersonalityData>;
} => {
  const validBigFive = {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  };

  const validBehaviors = {
    analytical: 50,
    empathetic: 50,
    decisive: 50,
    curious: 50,
    patient: 50,
    humorous: 50,
    formal: 50,
    optimistic: 50,
    cautious: 50,
    creative: 50,
    logical: 50,
    supportive: 50,
    direct: 50,
    enthusiastic: 50,
  };

  return {
    emptyName: {
      name: "",
      bigFive: validBigFive,
      behaviors: validBehaviors,
      customInstructions: "Valid instructions but empty name",
    },
    invalidTraitScores: {
      name: "Invalid Traits Personality",
      bigFive: {
        openness: -10, // Invalid: below 0
        conscientiousness: 150, // Invalid: above 100
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
      },
      behaviors: validBehaviors,
      customInstructions: "Personality with invalid trait scores",
    },
    missingCustomInstructions: {
      name: "No Instructions Personality",
      bigFive: validBigFive,
      behaviors: validBehaviors,
      customInstructions: "",
    },
    extremeTraitScores: {
      name: "Extreme Personality",
      bigFive: {
        openness: 0,
        conscientiousness: 100,
        extraversion: 0,
        agreeableness: 100,
        neuroticism: 0,
      },
      behaviors: {
        analytical: 100,
        empathetic: 0,
        decisive: 100,
        curious: 0,
        patient: 100,
        humorous: 0,
        formal: 100,
        optimistic: 0,
        cautious: 100,
        creative: 0,
        logical: 100,
        supportive: 0,
        direct: 100,
        enthusiastic: 0,
      },
      customInstructions: "Personality with extreme but valid trait scores",
    },
  };
};
```

### 5. Create createDuplicateNamePersonalityData.ts

Create file: `tests/desktop/helpers/settings/createDuplicateNamePersonalityData.ts`

For testing duplicate name validation:

```typescript
import type { MockPersonalityData } from "./MockPersonalityData";

export const createDuplicateNamePersonalityData = (
  existingName: string,
): MockPersonalityData => {
  return {
    name: existingName, // Intentionally duplicate
    bigFive: {
      openness: 60,
      conscientiousness: 60,
      extraversion: 60,
      agreeableness: 60,
      neuroticism: 40,
    },
    behaviors: {
      analytical: 60,
      empathetic: 60,
      decisive: 60,
      curious: 60,
      patient: 60,
      humorous: 60,
      formal: 40,
      optimistic: 60,
      cautious: 40,
      creative: 60,
      logical: 60,
      supportive: 60,
      direct: 40,
      enthusiastic: 60,
    },
    customInstructions: `Duplicate personality with name: ${existingName}`,
  };
};
```

### 6. Update Test Helpers Index

Update `tests/desktop/helpers/index.ts` to export the new mock data generators:

```typescript
export type { MockPersonalityData } from "./settings/MockPersonalityData";
export { createMockPersonalityData } from "./settings/createMockPersonalityData";
export { createMinimalPersonalityData } from "./settings/createMinimalPersonalityData";
export { createInvalidPersonalityData } from "./settings/createInvalidPersonalityData";
export { createDuplicateNamePersonalityData } from "./settings/createDuplicateNamePersonalityData";
```

## Acceptance Criteria

✅ **Type Definitions**: `MockPersonalityData` interface matches personality data structure
✅ **Basic Generator**: `createMockPersonalityData` creates realistic personality data
✅ **Minimal Data**: `createMinimalPersonalityData` for edge case testing
✅ **Invalid Data**: `createInvalidPersonalityData` for validation testing
✅ **Duplicate Names**: `createDuplicateNamePersonalityData` for duplicate validation
✅ **Trait Validation**: All generators respect 0-100 range for trait scores
✅ **Export Integration**: All generators exported from helpers index.ts
✅ **Consistent Patterns**: Follow exact same structure as roles data generators

## Technical Details

### Trait Score Ranges

- **Valid Range**: 0-100 (inclusive)
- **Balanced Range**: 45-65 (for realistic personalities)
- **Neutral Value**: 50 (for minimal/default cases)
- **Invalid Examples**: Negative numbers, > 100

### BigFive Traits (5 total)

- openness, conscientiousness, extraversion, agreeableness, neuroticism

### Behavior Traits (14 total)

- analytical, empathetic, decisive, curious, patient, humorous, formal, optimistic, cautious, creative, logical, supportive, direct, enthusiastic

## Testing Requirements

### Unit Tests (included in this task)

Create validation tests that verify:

- Generated data matches MockPersonalityData interface
- Trait scores are within valid ranges
- Invalid data generators produce expected invalid data
- All required fields are present

### Integration Testing

Mock data will be tested through actual e2e test usage in subsequent tasks.

## Dependencies

- Requires: T-create-personalities-test-1 (helper functions)
- Enables: All personality test implementation tasks
