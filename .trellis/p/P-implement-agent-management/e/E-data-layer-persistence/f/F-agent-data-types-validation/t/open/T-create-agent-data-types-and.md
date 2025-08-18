---
id: T-create-agent-data-types-and
title: Create Agent Data Types and Validation Schema
status: open
priority: high
parent: F-agent-data-types-validation
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-18T23:07:36.738Z
updated: 2025-08-18T23:07:36.738Z
---

## Context

Create the core agent data types and Zod validation schema for the agent management system, following the exact patterns established by the roles and personalities implementations. This is the foundational task that enables all other agent data operations.

**Reference implementations:**

- `packages/ui-shared/src/types/settings/RoleFormData.ts`
- `packages/ui-shared/src/types/settings/RoleViewModel.ts`
- `packages/ui-shared/src/schemas/roleSchema.ts`
- `packages/ui-shared/src/types/settings/PersonalityFormData.ts`
- `packages/ui-shared/src/schemas/personalitySchema.ts`

## Implementation Requirements

### 1. Create Agent Validation Schema

**File:** `packages/ui-shared/src/schemas/agentSchema.ts`

Follow the exact pattern from `roleSchema.ts` with these field specifications:

- `name`: string, 2-100 characters, alphanumeric with spaces/hyphens/underscores, required
- `model`: string, required
- `role`: string, required
- `personality`: string, required
- `temperature`: number, 0-2 range, step 0.1
- `maxTokens`: number, 1-4000 range, integer
- `topP`: number, 0-1 range, step 0.01
- `systemPrompt`: string, optional, max 5000 characters

```typescript
import { z } from "zod";

export const agentSchema = z.object({
  name: z
    .string()
    .min(1, "Agent name is required")
    .max(100, "Name must be 100 characters or less")
    .min(2, "Name must be at least 2 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Name can only contain letters, numbers, spaces, hyphens, and underscores",
    )
    .refine((val) => val.trim().length > 0, "Name cannot be only whitespace"),
  // ... other fields following pattern
});
```

### 2. Create AgentFormData Type

**File:** `packages/ui-shared/src/types/settings/AgentFormData.ts`

Follow the exact pattern from `RoleFormData.ts`:

```typescript
import { z } from "zod";
import { agentSchema } from "../../schemas";

export type AgentFormData = z.infer<typeof agentSchema>;
```

### 3. Create AgentViewModel Type

**File:** `packages/ui-shared/src/types/settings/AgentViewModel.ts`

Follow the exact pattern from `RoleViewModel.ts`:

```typescript
import type { AgentFormData } from "./AgentFormData";

export interface AgentViewModel extends AgentFormData {
  /** Unique identifier for the agent */
  id: string;
  /** When the agent was created (nullable) */
  createdAt?: string;
  /** When the agent was last updated (nullable) */
  updatedAt?: string;
}
```

## Testing Requirements

### Unit Tests for Schema Validation

**File:** `packages/ui-shared/src/schemas/__tests__/agentSchema.test.ts`

Follow the pattern from `roleSchema.test.ts`:

- Test valid agent data passes validation
- Test name validation rules (length, character restrictions, whitespace)
- Test required fields (name, model, role, personality)
- Test number field ranges (temperature, maxTokens, topP)
- Test optional system prompt validation
- Test edge cases and boundary values

```typescript
import { agentSchema } from "../agentSchema";

describe("agentSchema", () => {
  it("should validate correct agent data", () => {
    const validAgent = {
      name: "Test Agent",
      model: "Claude 3.5 Sonnet",
      role: "role-id",
      personality: "personality-id",
      temperature: 1.0,
      maxTokens: 2000,
      topP: 0.95,
      systemPrompt: "You are a helpful assistant.",
    };

    const result = agentSchema.safeParse(validAgent);
    expect(result.success).toBe(true);
  });

  // ... additional test cases
});
```

## Acceptance Criteria

- ✅ `agentSchema` validates all required fields with proper constraints
- ✅ Temperature validation: 0-2 range, number type
- ✅ MaxTokens validation: 1-4000 range, integer type
- ✅ TopP validation: 0-1 range, number type
- ✅ Name validation: 2-100 characters, alphanumeric with spaces/hyphens/underscores
- ✅ Model, role, personality fields marked as required strings
- ✅ SystemPrompt optional with max 5000 characters
- ✅ `AgentFormData` type correctly derived from schema
- ✅ `AgentViewModel` extends form data with id and timestamps
- ✅ All files follow existing naming and structure patterns
- ✅ Unit tests cover all validation rules and edge cases
- ✅ TypeScript compilation passes without errors

## Security Considerations

- Validate name field prevents injection attacks through regex constraints
- System prompt length limitation prevents excessively large inputs
- Number ranges prevent invalid configuration values
- Required field validation ensures data integrity

## Dependencies

None - this is the foundational task for agent data types.
