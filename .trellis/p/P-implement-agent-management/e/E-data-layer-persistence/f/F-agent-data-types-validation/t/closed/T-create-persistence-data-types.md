---
id: T-create-persistence-data-types
title: Create Persistence Data Types for Shared Package
status: done
priority: high
parent: F-agent-data-types-validation
prerequisites:
  - T-create-agent-data-types-and
affectedFiles:
  packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts:
    Created comprehensive Zod schema for agent persistence validation with
    security limits and clear error messages
  packages/shared/src/types/agents/PersistedAgentData.ts: Created type definition for individual agent data derived from schema
  packages/shared/src/types/agents/PersistedAgentsSettingsData.ts: Created type definition for complete agents settings file structure
  packages/shared/src/services/storage/utils/agents/createDefaultAgentsSettings.ts: Created utility function for generating default empty agents settings
  packages/shared/src/services/storage/utils/agents/index.ts: Created barrel export file for agents utilities
  packages/shared/src/services/storage/utils/agents/__tests__/createDefaultAgentsSettings.test.ts: Created comprehensive unit tests for default settings utility
  packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts:
    Created extensive unit tests for schema validation including edge cases and
    validation failures
log:
  - Successfully implemented persistence data types and schema for agent storage
    in the shared package, following exact patterns from roles and personalities
    implementations. Created complete type system with Zod validation, default
    settings utility, and comprehensive test coverage. All files follow existing
    naming conventions and directory patterns. Schema includes proper validation
    for agent fields including temperature (0-2), maxTokens (1-4000), topP
    (0-1), and optional systemPrompt with 5000 character limit. Default settings
    utility creates empty agents array with proper timestamps and schema
    versioning for future migrations.
schema: v1.0
childrenIds: []
created: 2025-08-18T23:08:31.003Z
updated: 2025-08-18T23:08:31.003Z
---

## Context

Create the persistence data types and schema in the shared package for agent storage, following the exact patterns from roles and personalities implementations. These types define the JSON file structure for storing agent configurations.

**Reference implementations:**

- `packages/shared/src/types/roles/PersistedRolesSettingsData.ts`
- `packages/shared/src/types/personalities/PersistedPersonalitiesSettingsData.ts`
- `packages/shared/src/services/storage/utils/roles/createDefaultRolesSettings.ts`
- `packages/shared/src/services/storage/utils/personalities/createDefaultPersonalitiesSettings.ts`

## Implementation Requirements

### 1. Create Persistence Data Type

**File:** `packages/shared/src/types/agents/PersistedAgentsSettingsData.ts`

Follow the exact pattern from `PersistedRolesSettingsData.ts`:

```typescript
/**
 * Persisted agent settings data structure for JSON storage
 *
 * @module types/agents/PersistedAgentsSettingsData
 */

/**
 * Individual agent configuration as stored in persistence
 */
export interface PersistedAgentData {
  /** Unique identifier for the agent */
  id: string;
  /** Agent name */
  name: string;
  /** LLM model identifier */
  model: string;
  /** Role identifier */
  role: string;
  /** Personality identifier */
  personality: string;
  /** Temperature setting (0-2) */
  temperature: number;
  /** Maximum tokens setting (1-4000) */
  maxTokens: number;
  /** Top P setting (0-1) */
  topP: number;
  /** Optional system prompt */
  systemPrompt?: string;
  /** When the agent was created */
  createdAt: string;
  /** When the agent was last updated */
  updatedAt: string;
}

/**
 * Complete persisted agents settings data structure
 */
export interface PersistedAgentsSettingsData {
  /** Array of agent configurations */
  agents: PersistedAgentData[];
  /** Schema version for future migrations */
  version: string;
  /** When the settings were last updated */
  lastUpdated: string;
}
```

### 2. Create Persistence Schema Validation

**File:** `packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts`

Follow the pattern from roles/personalities persistence schemas:

```typescript
import { z } from "zod";

const persistedAgentDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  model: z.string(),
  role: z.string(),
  personality: z.string(),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4000),
  topP: z.number().min(0).max(1),
  systemPrompt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const persistedAgentsSettingsSchema = z.object({
  agents: z.array(persistedAgentDataSchema),
  version: z.string(),
  lastUpdated: z.string(),
});
```

### 3. Create Default Settings Utility

**File:** `packages/shared/src/services/storage/utils/agents/createDefaultAgentsSettings.ts`

Follow the exact pattern from `createDefaultRolesSettings.ts`:

```typescript
import type { PersistedAgentsSettingsData } from "../../../../types/agents";

/**
 * Creates default empty agents settings data
 *
 * @returns Default agents settings with empty array and current timestamp
 */
export function createDefaultAgentsSettings(): PersistedAgentsSettingsData {
  const now = new Date().toISOString();

  return {
    agents: [],
    version: "1.0.0",
    lastUpdated: now,
  };
}
```

### 4. Create Barrel Export for Agents

**File:** `packages/shared/src/services/storage/utils/agents/index.ts`

```typescript
export { createDefaultAgentsSettings } from "./createDefaultAgentsSettings";
```

## Testing Requirements

### Unit Tests for Default Settings

**File:** `packages/shared/src/services/storage/utils/agents/__tests__/createDefaultAgentsSettings.test.ts`

Follow the pattern from roles/personalities tests:

```typescript
import { createDefaultAgentsSettings } from "../createDefaultAgentsSettings";

describe("createDefaultAgentsSettings", () => {
  it("should create default agents settings with empty array", () => {
    const settings = createDefaultAgentsSettings();

    expect(settings.agents).toEqual([]);
    expect(settings.version).toBe("1.0.0");
    expect(settings.lastUpdated).toBeDefined();
    expect(new Date(settings.lastUpdated)).toBeInstanceOf(Date);
  });

  it("should create settings with recent timestamp", () => {
    const before = new Date().toISOString();
    const settings = createDefaultAgentsSettings();
    const after = new Date().toISOString();

    expect(settings.lastUpdated >= before).toBe(true);
    expect(settings.lastUpdated <= after).toBe(true);
  });
});
```

### Unit Tests for Schema Validation

**File:** `packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts`

```typescript
import { persistedAgentsSettingsSchema } from "../persistedAgentsSettingsSchema";
import { createDefaultAgentsSettings } from "../../../services/storage/utils/agents";

describe("persistedAgentsSettingsSchema", () => {
  it("should validate default settings structure", () => {
    const defaultSettings = createDefaultAgentsSettings();
    const result = persistedAgentsSettingsSchema.safeParse(defaultSettings);

    expect(result.success).toBe(true);
  });

  it("should validate complete agent data", () => {
    const settingsWithAgent = {
      agents: [
        {
          id: "test-id",
          name: "Test Agent",
          model: "Claude 3.5 Sonnet",
          role: "role-id",
          personality: "personality-id",
          temperature: 1.0,
          maxTokens: 2000,
          topP: 0.95,
          systemPrompt: "Test prompt",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
    };

    const result = persistedAgentsSettingsSchema.safeParse(settingsWithAgent);
    expect(result.success).toBe(true);
  });

  // Test validation failures for invalid data
});
```

## Acceptance Criteria

- ✅ `PersistedAgentsSettingsData` interface matches roles/personalities pattern
- ✅ Contains agents array, version, and lastUpdated fields
- ✅ `PersistedAgentData` contains all required fields with proper types
- ✅ Schema validation properly validates structure and field constraints
- ✅ `createDefaultAgentsSettings()` returns proper default structure
- ✅ Default settings have empty agents array and valid timestamps
- ✅ All files follow existing naming and directory patterns
- ✅ Unit tests verify schema validation and default settings creation
- ✅ TypeScript compilation passes without errors
- ✅ Barrel exports properly expose utilities

## Security Considerations

- Schema validation prevents malformed data from being stored
- All fields properly typed to prevent injection attacks
- Version field enables future schema migration if needed
- Timestamp validation ensures proper date formats

## Performance Requirements

- Schema validation completes quickly (< 10ms)
- Default settings creation is lightweight
- Memory usage minimal for data structures
- Efficient JSON serialization/deserialization

## Dependencies

- T-create-agent-data-types-and (for type consistency)
