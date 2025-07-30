---
kind: task
id: T-create-agentformdata-types-and
parent: F-agents-section-implementation
status: done
title: Create AgentFormData types and validation schema
priority: high
prerequisites: []
created: "2025-07-29T22:08:33.250419"
updated: "2025-07-29T22:15:06.477061"
schema_version: "1.1"
worktree: null
---

# Create AgentFormData Types and Validation Schema

## Context

Implement the type definitions and Zod validation schema for agent form data, following the established patterns used in `RoleFormData` and `PersonalityFormData`. This task provides the foundation for agent creation/editing forms.

**Reference existing patterns:**

- `/packages/shared/src/types/settings/RoleFormData.ts`
- `/packages/shared/src/types/settings/PersonalityFormData.ts`
- `/packages/shared/src/schemas/roleSchema.ts`

## Implementation Requirements

### 1. Create Agent Schema in Shared Package

Create `packages/shared/src/schemas/agentSchema.ts`:

```typescript
import { z } from "zod";

export const agentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Agent name is required")
    .max(50, "Agent name must be 50 characters or less"),

  model: z.string().min(1, "Model selection is required"),

  role: z
    .string()
    .trim()
    .min(1, "Role is required")
    .max(100, "Role must be 100 characters or less"),

  configuration: z.object({
    temperature: z
      .number()
      .min(0, "Temperature must be between 0 and 2")
      .max(2, "Temperature must be between 0 and 2"),

    maxTokens: z
      .number()
      .int("Max tokens must be a whole number")
      .min(1, "Max tokens must be at least 1")
      .max(4000, "Max tokens must be 4000 or less"),

    topP: z
      .number()
      .min(0, "Top P must be between 0 and 1")
      .max(1, "Top P must be between 0 and 1"),

    systemPrompt: z.string().optional(),
  }),
});
```

### 2. Create AgentFormData Type

Create `packages/shared/src/types/settings/AgentFormData.ts`:

```typescript
import { z } from "zod";
import { agentSchema } from "../../schemas";

export type AgentFormData = z.infer<typeof agentSchema>;
```

### 3. Create Agent Form Props Types

Create `packages/shared/src/types/ui/components/AgentFormProps.ts`:

```typescript
import type { AgentFormData } from "../../settings/AgentFormData";
import type { AgentCard, AgentTemplate } from "../../settings";

export interface AgentFormProps {
  mode: "create" | "edit" | "template";
  initialData?: Partial<AgentFormData>;
  templateData?: AgentTemplate;
  onSave: (data: AgentFormData) => void;
  onCancel: () => void;
  existingAgents?: AgentCard[];
  isLoading?: boolean;
}

export interface AgentFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "template";
  agent?: AgentCard;
  template?: AgentTemplate;
  onSave: (data: AgentFormData) => Promise<void>;
  isLoading?: boolean;
}
```

### 4. Update Schema Index

Update `packages/shared/src/schemas/index.ts` to export the new schema:

```typescript
export * from "./agentSchema";
```

### 5. Update Types Index

Update `packages/shared/src/types/ui/components/index.ts`:

```typescript
export * from "./AgentFormProps";
```

Update `packages/shared/src/types/settings/index.ts`:

```typescript
export * from "./AgentFormData";
```

## Acceptance Criteria

- [ ] `agentSchema` created with comprehensive validation rules for all fields
- [ ] `AgentFormData` type properly inferred from schema
- [ ] `AgentFormProps` interface supports create, edit, and template modes
- [ ] `AgentFormModalProps` interface for modal wrapper component
- [ ] All new types properly exported through index files
- [ ] Schema validation covers:
  - Required fields (name, model, role, configuration)
  - String length limits (name ≤50, role ≤100)
  - Number ranges (temperature 0-2, maxTokens 1-4000, topP 0-1)
  - Optional system prompt field
- [ ] Types integrate with existing `AgentCard` and `AgentTemplate` interfaces
- [ ] Follows established naming conventions and file structure
- [ ] Unit tests validate schema behavior with valid/invalid inputs

## Technical Approach

1. **Follow existing patterns**: Mirror the structure used in `roleSchema.ts` and `RoleFormData.ts`
2. **Zod validation**: Use Zod for type-safe form validation with helpful error messages
3. **TypeScript integration**: Leverage `z.infer` for automatic type generation
4. **Modular design**: Keep schemas separate from types for better organization
5. **Interface composition**: Use existing types (`AgentCard`, `AgentTemplate`) for consistency

## Testing Requirements

Create tests for the schema validation:

- Valid agent data passes validation
- Invalid data produces appropriate error messages
- Boundary conditions for numeric fields
- String length validations
- Required field validations

## Dependencies

- Uses existing `AgentCard` and `AgentTemplate` interfaces
- Integrates with Zod validation library
- Follows established shared package structure
- Compatible with react-hook-form resolver pattern

## Security Considerations

- Input sanitization through Zod validation
- Prevent XSS through string length limits
- Validate numeric ranges to prevent overflow
- Required field validation prevents empty submissions

This task establishes the type foundation needed for all subsequent agent form implementation tasks.

### Log

**2025-07-30T03:26:11.807320Z** - Successfully implemented comprehensive AgentFormData types and validation schema following established patterns. Created Zod schema with robust validation rules for all agent form fields including name (1-50 chars), model (required), role (1-100 chars), and configuration object with temperature (0-2), maxTokens (1-4000 integer), topP (0-1), and optional systemPrompt. Implemented TypeScript types inferred from schema and comprehensive props interfaces for form components supporting create/edit/template modes. Added 154 unit tests covering all validation scenarios, boundary conditions, and error messages. All quality checks pass successfully.

- filesChanged: ["packages/shared/src/schemas/agentSchema.ts", "packages/shared/src/types/settings/AgentFormData.ts", "packages/shared/src/types/ui/components/AgentFormProps.ts", "packages/shared/src/types/ui/components/AgentFormModalProps.ts", "packages/shared/src/schemas/index.ts", "packages/shared/src/types/settings/index.ts", "packages/shared/src/types/ui/components/index.ts", "packages/shared/src/schemas/__tests__/agentSchema.test.ts"]
