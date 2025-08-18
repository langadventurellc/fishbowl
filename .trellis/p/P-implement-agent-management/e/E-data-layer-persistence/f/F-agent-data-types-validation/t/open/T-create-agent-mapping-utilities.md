---
id: T-create-agent-mapping-utilities
title: Create Agent Mapping Utilities
status: open
priority: medium
parent: F-agent-data-types-validation
prerequisites:
  - T-create-agent-data-types-and
  - T-create-persistence-data-types
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-18T23:09:28.373Z
updated: 2025-08-18T23:09:28.373Z
---

## Context

Create mapping utilities to convert between UI and persistence data formats for agent configurations, following the exact patterns from roles and personalities implementations. These functions ensure data integrity during transformation between different data layers.

**Reference implementations:**

- `packages/ui-shared/src/mapping/roles/mapRolesPersistenceToUI.ts`
- `packages/ui-shared/src/mapping/roles/mapRolesUIToPersistence.ts`
- `packages/ui-shared/src/mapping/personalities/mapPersonalitiesPersistenceToUI.ts`
- `packages/ui-shared/src/mapping/personalities/mapPersonalitiesUIToPersistence.ts`

## Implementation Requirements

### 1. Create Persistence to UI Mapping

**File:** `packages/ui-shared/src/mapping/agents/mapAgentsPersistenceToUI.ts`

Follow the exact pattern from `mapRolesPersistenceToUI.ts`:

```typescript
/**
 * Maps persisted agent settings data to UI view models
 *
 * This function transforms an array of persistence agent records into the format expected
 * by UI components, adding any necessary computed properties and ensuring
 * consistent data structure for the view layer.
 *
 * @param persistedData - Persisted agent settings data from storage
 * @returns Array of agent view models ready for UI display
 */

import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";
import type { AgentViewModel } from "../../types/settings/AgentViewModel";

export function mapAgentsPersistenceToUI(
  persistedData: PersistedAgentsSettingsData,
): AgentViewModel[] {
  return persistedData.agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    model: agent.model,
    role: agent.role,
    personality: agent.personality,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    topP: agent.topP,
    systemPrompt: agent.systemPrompt,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  }));
}
```

### 2. Create UI to Persistence Mapping

**File:** `packages/ui-shared/src/mapping/agents/mapAgentsUIToPersistence.ts`

Follow the exact pattern from `mapRolesUIToPersistence.ts`:

```typescript
/**
 * Maps UI agent view models to persistence data format
 *
 * This function transforms an array of agent view models into the format expected
 * by the persistence layer, ensuring all required fields are present and
 * properly formatted for storage.
 *
 * @param agents - Array of UI agent view models to transform
 * @returns Persistence-ready agents settings data
 */

import type {
  PersistedAgentsSettingsData,
  PersistedAgentData,
} from "@fishbowl-ai/shared";
import type { AgentViewModel } from "../../types/settings/AgentViewModel";

export function mapAgentsUIToPersistence(
  agents: AgentViewModel[],
): PersistedAgentsSettingsData {
  const persistedAgents: PersistedAgentData[] = agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    model: agent.model,
    role: agent.role,
    personality: agent.personality,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    topP: agent.topP,
    systemPrompt: agent.systemPrompt,
    createdAt: agent.createdAt || new Date().toISOString(),
    updatedAt: agent.updatedAt || new Date().toISOString(),
  }));

  return {
    agents: persistedAgents,
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
  };
}
```

### 3. Create Single Agent Mapping Utilities

**File:** `packages/ui-shared/src/mapping/agents/mapSingleAgentPersistenceToUI.ts`

Follow the pattern from `mapSingleRolePersistenceToUI.ts`:

```typescript
/**
 * Maps a single persisted agent record to UI view model
 *
 * @param persistedAgent - Single persisted agent data
 * @returns Agent view model for UI
 */

import type { PersistedAgentData } from "@fishbowl-ai/shared";
import type { AgentViewModel } from "../../types/settings/AgentViewModel";

export function mapSingleAgentPersistenceToUI(
  persistedAgent: PersistedAgentData,
): AgentViewModel {
  return {
    id: persistedAgent.id,
    name: persistedAgent.name,
    model: persistedAgent.model,
    role: persistedAgent.role,
    personality: persistedAgent.personality,
    temperature: persistedAgent.temperature,
    maxTokens: persistedAgent.maxTokens,
    topP: persistedAgent.topP,
    systemPrompt: persistedAgent.systemPrompt,
    createdAt: persistedAgent.createdAt,
    updatedAt: persistedAgent.updatedAt,
  };
}
```

### 4. Create Barrel Export

**File:** `packages/ui-shared/src/mapping/agents/index.ts`

```typescript
export { mapAgentsPersistenceToUI } from "./mapAgentsPersistenceToUI";
export { mapAgentsUIToPersistence } from "./mapAgentsUIToPersistence";
export { mapSingleAgentPersistenceToUI } from "./mapSingleAgentPersistenceToUI";
```

## Testing Requirements

### Unit Tests for Persistence to UI Mapping

**File:** `packages/ui-shared/src/mapping/agents/__tests__/mapAgentsPersistenceToUI.test.ts`

Follow the pattern from roles/personalities mapping tests:

```typescript
import { mapAgentsPersistenceToUI } from "../mapAgentsPersistenceToUI";
import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";

describe("mapAgentsPersistenceToUI", () => {
  it("should map empty agents array correctly", () => {
    const persistedData: PersistedAgentsSettingsData = {
      agents: [],
      version: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const result = mapAgentsPersistenceToUI(persistedData);
    expect(result).toEqual([]);
  });

  it("should map single agent correctly", () => {
    const persistedData: PersistedAgentsSettingsData = {
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
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ],
      version: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const result = mapAgentsPersistenceToUI(persistedData);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "test-id",
      name: "Test Agent",
      model: "Claude 3.5 Sonnet",
      role: "role-id",
      personality: "personality-id",
      temperature: 1.0,
      maxTokens: 2000,
      topP: 0.95,
      systemPrompt: "Test prompt",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
    });
  });

  it("should handle agents without optional fields", () => {
    const persistedData: PersistedAgentsSettingsData = {
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
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ],
      version: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const result = mapAgentsPersistenceToUI(persistedData);
    expect(result[0].systemPrompt).toBeUndefined();
  });
});
```

### Unit Tests for UI to Persistence Mapping

**File:** `packages/ui-shared/src/mapping/agents/__tests__/mapAgentsUIToPersistence.test.ts`

```typescript
import { mapAgentsUIToPersistence } from "../mapAgentsUIToPersistence";
import type { AgentViewModel } from "../../../types/settings/AgentViewModel";

describe("mapAgentsUIToPersistence", () => {
  it("should map empty agents array correctly", () => {
    const agents: AgentViewModel[] = [];
    const result = mapAgentsUIToPersistence(agents);

    expect(result.agents).toEqual([]);
    expect(result.version).toBe("1.0.0");
    expect(result.lastUpdated).toBeDefined();
  });

  it("should map agents with all fields correctly", () => {
    const agents: AgentViewModel[] = [
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
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2023-01-01T00:00:00.000Z",
      },
    ];

    const result = mapAgentsUIToPersistence(agents);
    expect(result.agents).toHaveLength(1);
    expect(result.agents[0]).toEqual(agents[0]);
  });

  it("should handle missing timestamps by adding current date", () => {
    const agents: AgentViewModel[] = [
      {
        id: "test-id",
        name: "Test Agent",
        model: "Claude 3.5 Sonnet",
        role: "role-id",
        personality: "personality-id",
        temperature: 1.0,
        maxTokens: 2000,
        topP: 0.95,
      },
    ];

    const result = mapAgentsUIToPersistence(agents);
    expect(result.agents[0].createdAt).toBeDefined();
    expect(result.agents[0].updatedAt).toBeDefined();
    expect(new Date(result.agents[0].createdAt)).toBeInstanceOf(Date);
    expect(new Date(result.agents[0].updatedAt)).toBeInstanceOf(Date);
  });
});
```

### Round-Trip Data Integrity Tests

**File:** `packages/ui-shared/src/mapping/agents/__tests__/roundTripMapping.test.ts`

```typescript
import { mapAgentsPersistenceToUI } from "../mapAgentsPersistenceToUI";
import { mapAgentsUIToPersistence } from "../mapAgentsUIToPersistence";
import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";

describe("Agent Mapping Round Trip", () => {
  it("should preserve data integrity in round trip conversion", () => {
    const originalData: PersistedAgentsSettingsData = {
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
          createdAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
        },
      ],
      version: "1.0.0",
      lastUpdated: "2023-01-01T00:00:00.000Z",
    };

    const uiData = mapAgentsPersistenceToUI(originalData);
    const backToPersistence = mapAgentsUIToPersistence(uiData);

    expect(backToPersistence.agents[0]).toEqual(originalData.agents[0]);
  });
});
```

## Acceptance Criteria

- ✅ `mapAgentsPersistenceToUI` correctly transforms persistence data to UI models
- ✅ `mapAgentsUIToPersistence` correctly transforms UI models to persistence data
- ✅ All required fields properly mapped between formats
- ✅ Optional fields (systemPrompt) handled correctly (undefined vs missing)
- ✅ Timestamp handling preserves existing values or adds current time
- ✅ Round-trip conversion preserves data integrity
- ✅ Empty arrays handled correctly
- ✅ Multiple agents handled correctly in arrays
- ✅ All mapping functions follow existing patterns exactly
- ✅ Unit tests cover all transformation scenarios and edge cases
- ✅ TypeScript compilation passes without errors

## Security Considerations

- No data transformation that could introduce vulnerabilities
- Proper handling of optional fields prevents undefined/null issues
- Timestamp generation uses secure date methods
- All fields properly typed to prevent injection

## Performance Requirements

- Mapping functions handle arrays of 100+ agents efficiently
- Minimal memory allocation during transformation
- No unnecessary object copying or deep cloning
- Efficient iteration over agent arrays

## Dependencies

- T-create-agent-data-types-and (for UI types)
- T-create-persistence-data-types (for persistence types)
