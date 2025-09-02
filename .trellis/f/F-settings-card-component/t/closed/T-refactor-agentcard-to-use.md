---
id: T-refactor-agentcard-to-use
title: Replace AgentCard with SettingsCard in LibraryTab
status: done
priority: medium
parent: F-settings-card-component
prerequisites:
  - T-create-settingscard-component
affectedFiles:
  apps/desktop/src/components/settings/agents/LibraryTab.tsx: Replaced AgentCard
    usage with SettingsCard, moved model and role resolution business logic from
    AgentCard into AgentGrid component, updated imports to include getRoleById
    and useLlmModels, combined model and role names into content string format
  apps/desktop/src/components/settings/agents/AgentCard.tsx: Deleted -
    intermediate component no longer needed after refactoring LibraryTab to use
    SettingsCard directly
  apps/desktop/src/components/settings/agents/index.ts: Removed AgentCard export from barrel file since component was deleted
log:
  - >-
    Successfully replaced AgentCard component with SettingsCard in LibraryTab
    while preserving all business logic. The intermediate AgentCard component
    has been removed, simplifying the architecture.


    Key accomplishments:

    - Moved LLM model resolution logic (models.find() with configId and model
    matching) from AgentCard into LibraryTab  

    - Moved role display name resolution (getRoleById() with fallback) from
    AgentCard into LibraryTab

    - Updated LibraryTab to use SettingsCard directly with combined model and
    role content format

    - Preserved all accessibility features, keyboard navigation, and
    confirmation dialogs

    - Removed AgentCard.tsx file entirely and updated barrel exports

    - All quality checks pass (lint, format, type-check)
schema: v1.0
childrenIds: []
created: 2025-09-02T02:47:34.664Z
updated: 2025-09-02T02:47:34.664Z
---

## Context

Replace the AgentCard component entirely by updating LibraryTab to use SettingsCard directly, while preserving the complex LLM model resolution logic and role display functionality. This removes the intermediate AgentCard component and simplifies the architecture.

Reference the feature specification: F-settings-card-component
Target file: `apps/desktop/src/components/settings/agents/LibraryTab.tsx`
Component to remove: `apps/desktop/src/components/settings/agents/AgentCard.tsx`
Depends on: T-create-settingscard-component

## Implementation Requirements

Update LibraryTab to use SettingsCard directly instead of AgentCard, preserving all business logic.

**Files to modify**:

- `apps/desktop/src/components/settings/agents/LibraryTab.tsx` - Replace AgentCard usage with SettingsCard
- `apps/desktop/src/components/settings/agents/AgentCard.tsx` - Remove this file entirely

### Content Transformation in LibraryTab

For each agent, transform the rendering to use SettingsCard directly:

- **Title**: `agent.name` (unchanged)
- **Content**: `${modelDisplayName} • ${roleDisplayName}` (combined model and role)

### Preserve Complex Logic in LibraryTab

Move the business logic from AgentCard into LibraryTab:

- Keep LLM model resolution: `models.find()` with configId and model matching
- Keep role display name resolution: `getRoleById(agent.role)?.name || agent.role`
- Keep useLlmModels hook usage
- Maintain model display name fallback logic

### Handler Transformation

Transform handlers to work with SettingsCard signature:

- `onEdit: () => onEditAgent?.(agent.id)` (wrap existing handler)
- `onDelete: () => onDeleteAgent?.(agent.id)` (wrap existing handler)

### Import Updates

Update LibraryTab imports:

- Remove: `import { AgentCard } from "./AgentCard"`
- Add: `import { SettingsCard } from "../../ui/SettingsCard"`
- Add: `import { getRoleById } from "@fishbowl-ai/ui-shared"`
- Keep: `import { useLlmModels } from "../../../hooks/useLlmModels"`

## Detailed Acceptance Criteria

### Functional Requirements

- ✅ LibraryTab renders using SettingsCard directly instead of AgentCard
- ✅ Displays agent.name as title for each agent
- ✅ Displays model and role names as combined content
- ✅ Edit button triggers onEditAgent with agent.id
- ✅ Delete button triggers onDeleteAgent with agent.id
- ✅ All agents display correctly in the library grid

### Business Logic Preservation

- ✅ Resolves LLM model using configId and model id matching in LibraryTab
- ✅ Falls back to agent.model string if model not found
- ✅ Resolves role display name using getRoleById in LibraryTab
- ✅ Falls back to agent.role string if role not found
- ✅ Maintains useLlmModels hook for model lookup in LibraryTab
- ✅ Content format: "{modelName} • {roleName}"

### Code Quality Requirements

- ✅ Uses SettingsCard import from ui components
- ✅ Preserves useLlmModels and getRoleById imports in LibraryTab
- ✅ Clean, readable implementation without intermediate component
- ✅ Removes AgentCard.tsx file entirely
- ✅ Updates any AgentCard imports to use SettingsCard directly
- ✅ TypeScript strict mode compliance

### Integration Requirements

- ✅ Works with existing agents settings/library page layout
- ✅ Maintains same visual consistency as other SettingsCard implementations
- ✅ Preserves agent data display accuracy
- ✅ Grid layout and spacing work correctly with SettingsCard

## Technical Approach

1. **Remove Intermediate Component**:
   - Delete AgentCard.tsx entirely
   - Move all business logic directly into LibraryTab
   - Use SettingsCard directly in the agent mapping

2. **Business Logic Integration**:
   - Move model resolution logic from AgentCard into LibraryTab
   - Move role resolution logic from AgentCard into LibraryTab
   - Combine resolved names into content format in LibraryTab
   - Maintain all fallback logic and error handling

3. **Handler Integration**:
   - Use inline arrow functions to wrap existing onEditAgent/onDeleteAgent callbacks
   - Pass agent.id directly to parent handlers
   - Maintain optional callback pattern

4. **Import Cleanup**:
   - Remove AgentCard import
   - Add SettingsCard import
   - Add getRoleById import
   - Keep useLlmModels import

## Dependencies

- T-create-settingscard-component (must complete first)
- Existing useLlmModels hook (unchanged)
- getRoleById utility from ui-shared (unchanged)
- LibraryTab component structure (preserve grid layout)

## Testing Requirements

### Unit Testing (included in implementation)

- ✅ LibraryTab renders with SettingsCard components
- ✅ Title displays agent.name correctly for each agent
- ✅ Model resolution works with configId and model matching
- ✅ Role resolution works with getRoleById lookup
- ✅ Content format combines model and role with bullet separator
- ✅ Edit handler passes agent.id to onEditAgent when provided
- ✅ Delete handler passes agent.id to onDeleteAgent when provided
- ✅ Handles multiple agents in grid layout
- ✅ Fallback logic works when model or role not found

### Integration Testing

- ✅ Works correctly in agents library page layout
- ✅ Agent data displays properly with resolved names
- ✅ Edit and delete operations function correctly
- ✅ Model and role lookups work in real data scenarios
- ✅ Grid spacing and layout maintained

## Security Considerations

- ✅ Agent data safely displayed without XSS risks
- ✅ Model and role resolution properly scoped
- ✅ Callback functions validated before execution
- ✅ No sensitive model or agent data exposed

## Out of Scope

- Changes to LibraryTab grid layout or styling beyond SettingsCard integration
- Modifications to useLlmModels hook or getRoleById utility
- Changes to parent components that use LibraryTab
- Model or role data validation beyond existing patterns
- Advanced model resolution algorithms or caching
