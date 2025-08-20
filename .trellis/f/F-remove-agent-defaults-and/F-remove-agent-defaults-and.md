---
id: F-remove-agent-defaults-and
title: Remove Agent Defaults and Enhance Personality Configuration
status: done
priority: medium
prerequisites: []
affectedFiles:
  packages/ui-shared/src/constants/behaviorData.ts: "Added three new behavior
    configurations to BEHAVIOR_GROUPS: responseLength (Brief to Comprehensive),
    randomness (Predictable to Creative), and focus (Exploratory to Focused).
    Maintains existing structure and follows established patterns."
  apps/desktop/src/components/settings/personalities/PersonalityForm.tsx:
    "Updated default values to include new behaviors (responseLength: 50,
    randomness: 50, focus: 50). Integrated new behaviors with existing form
    structure, validation, and change detection logic."
  apps/desktop/src/components/settings/personalities/__tests__/PersonalityForm.test.tsx:
    Created comprehensive unit tests verifying new behavior integration, form
    structure support, edit mode functionality, and component error handling.
    All 7 tests pass successfully.
  apps/desktop/src/components/settings/SettingsNavigation.tsx:
    Modified navigationSections array to remove agents subsections - changed
    hasSubTabs from true to false and removed subTabs property containing
    Library and Defaults items
  apps/desktop/src/components/settings/agents/DefaultsTab.tsx: Deleted - removed entire DefaultsTab component file
  apps/desktop/src/components/settings/agents/__tests__/DefaultsTab.test.tsx: Deleted - removed DefaultsTab test file
  apps/desktop/src/components/settings/agents/index.ts: Removed DefaultsTab export from barrel file
  apps/desktop/src/components/settings/agents/AgentsSection.tsx:
    Removed DefaultsTab import, removed defaults tab from tabs array, updated
    component description to reflect library-only functionality
  apps/desktop/src/components/settings/agents/__tests__/AgentsSection.test.tsx:
    Removed DefaultsTab reference comment and updated all tests to expect only
    Library tab functionality; Updated unit tests to verify simplified component
    structure. Added tests to ensure no tab navigation elements are present and
    LibraryTab renders directly. Updated mocks to remove TabContainer
    dependency.
  apps/desktop/src/components/settings/agents/AgentForm.tsx:
    Removed temperature,
    maxTokens, and topP FormField components, cleaned up unused imports
    (getSliderDescription, Slider, useAgentsStore), updated getDefaultValues
    function to exclude LLM parameters, and removed defaults dependency from
    useEffect
  packages/ui-shared/src/schemas/agentSchema.ts: Removed temperature, maxTokens,
    and topP validation rules from agentSchema, simplifying form validation to
    only include name, model, role, personality, and optional systemPrompt
    fields
  packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts:
    Removed temperature, maxTokens, and topP fields from persistedAgentSchema,
    eliminated agentDefaultsSchema entirely, and removed defaults field from
    persistedAgentsSettingsSchema; Added PersonalityBehaviorsSchema with full
    validation for all 7 personality behaviors (including new responseLength,
    randomness, focus). Updated persistedAgentSchema to include
    personalityBehaviors field. Schema validates behavior values in -100 to 100
    range with clear error messages.
  packages/shared/src/types/agents/index.ts: Removed agentDefaultsSchema export
    since it was deleted from persistence schema
  packages/ui-shared/src/mapping/agents/utils/normalizeAgentFields.ts:
    Updated function signature and implementation to exclude LLM parameters from
    normalization process
  packages/ui-shared/src/mapping/agents/mapSingleAgentPersistenceToUI.ts:
    Removed temperature, maxTokens, and topP field mappings from persistence to
    UI transformation
  packages/ui-shared/src/mapping/agents/mapSingleAgentUIToPersistence.ts:
    Removed temperature, maxTokens, and topP field mappings from UI to
    persistence transformation
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsUIToPersistence.test.ts:
    Removed LLM parameter properties from test data objects to match updated
    AgentSettingsViewModel interface
  packages/ui-shared/src/schemas/__tests__/agentSchema.test.ts:
    Removed all LLM parameter validation tests (temperature, maxTokens, topP
    range and missing field tests)
  packages/ui-shared/src/stores/__tests__/useAgentsStore.test.ts:
    Removed LLM parameters from test agent data and updated test expectations to
    focus on other agent properties like name and model
  apps/desktop/src/components/settings/agents/__tests__/LibraryTab.test.tsx:
    Removed temperature, maxTokens, and topP properties from mock agent data and
    test expectations to match updated AgentSettingsViewModel interface
  packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts:
    "Completely rewrote test file to remove all LLM parameter validation tests
    and replaced them with tests for remaining schema validation (required
    fields, name validation, system prompt length limits); Added comprehensive
    unit tests for PersonalityBehaviorsSchema and updated
    persistedAgentsSettingsSchema tests. Added 8 new test cases covering all
    validation scenarios: full behaviors, partial behaviors, empty behaviors,
    out-of-range values, non-numeric values, boundary values, and agent schema
    validation with personality behaviors."
  packages/ui-shared/src/mapping/agents/__tests__/roundTripMapping.test.ts:
    Removed LLM parameter properties from test data and assertions, simplified
    to test essential agent properties only
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsPersistenceToUI.test.ts:
    Completely rewrote test file to remove LLM parameter references from test
    data and expectations, focusing on core agent properties and optional fields
    handling
  apps/desktop/src/components/Settings/agents/AgentsSection.tsx:
    Simplified component by removing TabContainer and tab navigation, displaying
    LibraryTab directly. Removed TabConfiguration import and tabs array. Updated
    JSDoc comments to reflect simplified architecture.
  packages/shared/src/types/agent/PersonalityBehaviors.ts: Created
    PersonalityBehaviors type with 7 optional number properties for agent
    personality configuration
  packages/shared/src/types/agent/Agent.ts: Created Agent interface with core
    properties (id, name, description, etc.) and personalityBehaviors, excluding
    LLM parameters
  packages/shared/src/types/agent/index.ts: Created barrel file to export PersonalityBehaviors and Agent types
  packages/shared/src/types/agent/__tests__/agent.test.ts: Created comprehensive
    unit tests covering type definitions, partial updates, and TypeScript
    validation
  packages/shared/src/types/index.ts: Added export for agent types to make them
    available throughout the application
  packages/ui-shared/src/stores/AgentsState.ts: Removed defaults property and AgentDefaults import from interface
  packages/ui-shared/src/stores/AgentsActions.ts: Removed all defaults-related
    methods (setDefaults, getDefaults, loadDefaults, saveDefaults,
    resetDefaults) and AgentDefaults import
  packages/ui-shared/src/stores/useAgentsStore.ts: Removed AgentDefaults import,
    DEFAULT_AGENT_DEFAULTS constant, defaultsDebounceTimer variable,
    debouncedDefaultsSave function, defaults property from initial state, and
    all defaults management methods
  packages/ui-shared/src/stores/__tests__/AgentsState.test.ts: Removed AgentDefaults import and defaults property references from test mocks
  packages/ui-shared/src/stores/__tests__/AgentsActions.test.ts:
    Removed AgentDefaults import, defaults property from mock exportAgents
    return, all defaults method mocks, and related test expectations
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-three-new-personality
  - T-remove-agents-subsections
  - T-remove-defaultstab-component
  - T-remove-llm-parameters-from
  - T-simplify-agentssection
  - T-update-agent-types-to-remove
  - T-update-agents-store-to-remove
  - T-update-persistence-schemas-to
created: 2025-08-20T18:18:06.361Z
updated: 2025-08-20T18:18:06.361Z
---

## Overview

Remove the agent defaults functionality from the Fishbowl application and enhance the personality configuration system with three new behaviors: response length, randomness, and focus. This feature eliminates the defaults tab from settings and removes LLM parameters from agent configuration while expanding personality customization options.

## Purpose and Functionality

**Primary Goals:**

1. Remove the defaults tab and associated functionality from agent settings
2. Remove LLM parameters (temperature, max tokens, top P) from agent creation/editing
3. Add three new personality behaviors: response length, randomness, and focus
4. Simplify the settings navigation by eliminating sub-tabs under agents
5. Clean up backend data structures and persistence schemas

**Key Components to Implement:**

### 1. UI Component Updates

- **AgentsSection**: Remove tab navigation, display only AgentsTab directly
- **SettingsSidebar**: Remove subsections under agents (no more defaults sub-tab)
- **AgentForm**: Remove temperature, maxTokens, and topP form fields and validation
- **PersonalityForm**: Add three new behavior sliders with appropriate labels and descriptions

### 2. Backend Data Structure Updates

- **Agent Store**: Remove defaultAgentSettings state and related methods
- **Persistence Schema**: Remove AgentDefaultsSchema and defaults from AgentsDataSchema
- **Agent Types**: Remove temperature, maxTokens, topP fields; add new personality behavior types

### 3. Component Removal

- **DefaultsTab**: Completely remove component and associated imports
- Remove all imports and references to DefaultsTab throughout the codebase

## Detailed Acceptance Criteria

### Functional Requirements

**Defaults Removal:**

- [ ] Defaults tab no longer appears in Settings > Agents section
- [ ] Settings sidebar shows only "Agents" without sub-tabs underneath
- [ ] DefaultsTab component is completely removed from the codebase
- [ ] Agent creation form no longer includes temperature, max tokens, or top P fields
- [ ] Agent editing form no longer includes temperature, max tokens, or top P fields
- [ ] Agents store no longer maintains defaultAgentSettings state
- [ ] Persistence schema excludes AgentDefaults and related default settings

**Personality Enhancement:**

- [ ] PersonalityForm displays 7 total behaviors (4 existing + 3 new)
- [ ] New "Response Length" slider with labels "Brief" to "Comprehensive"
- [ ] New "Randomness" slider with labels "Predictable" to "Creative"
- [ ] New "Focus" slider with labels "Exploratory" to "Focused"
- [ ] All personality behaviors save correctly when creating/editing agents
- [ ] New personality behaviors initialize properly to default value (0)
- [ ] New personality behaviors persist across application restarts

**Schema Updates:**

- [ ] Agent schema excludes temperature, maxTokens, topP fields completely
- [ ] Personality behaviors include all 7 behaviors (4 existing + 3 new)
- [ ] Settings import/export works with new simplified schema (no defaults)

### User Interface Requirements

**Settings Navigation:**

- [ ] Settings modal > Agents displays only the agents list/management interface
- [ ] No tab navigation present in AgentsSection component
- [ ] Sidebar navigation under "Agents" has no sub-items
- [ ] Navigation flows smoothly without broken links or 404-style states

**Agent Form Interface:**

- [ ] Agent creation form excludes LLM parameter sections entirely
- [ ] Agent editing form excludes LLM parameter sections entirely
- [ ] Personality section shows all 7 sliders in logical order
- [ ] Form validation works correctly with removed fields
- [ ] Submit/save operations complete successfully

**Visual Consistency:**

- [ ] UI maintains consistent styling and spacing after tab removal
- [ ] Personality sliders follow existing design patterns
- [ ] No visual artifacts or layout issues from removed components
- [ ] Form maintains proper responsive behavior

### Technical Requirements

**Code Quality:**

- [ ] No TypeScript compilation errors after changes
- [ ] All imports and references to removed components cleaned up
- [ ] No unused imports or dead code remaining
- [ ] Consistent naming conventions for new personality behavior types

**State Management:**

- [ ] Zustand store methods work correctly without defaults functionality
- [ ] Store export/import operations handle simplified schema
- [ ] Component re-renders work properly with updated state structure
- [ ] No memory leaks or stale references to removed functionality

**Schema Validation:**

- [ ] Zod schemas validate correctly with removed and added fields
- [ ] Personality behavior validation accepts values in expected range (-100 to 100)
- [ ] Agent creation/editing validation works without LLM parameters
- [ ] Data serialization/deserialization handles schema changes gracefully

### Performance Requirements

**Load Time:**

- [ ] Settings modal opens without performance degradation
- [ ] Agent creation/editing forms render without noticeable delay
- [ ] No performance impact from removing defaults functionality

**Memory Usage:**

- [ ] Reduced memory footprint from eliminating unused defaults state
- [ ] No memory leaks from removed component references
- [ ] Personality form performance remains smooth with additional sliders

### Security Considerations

**Input Validation:**

- [ ] New personality behavior values properly validated and sanitized
- [ ] Form submission validates personality ranges (-100 to 100)
- [ ] No security vulnerabilities introduced by schema changes

**Data Protection:**

- [ ] Personality behavior data stored securely in local database

### Testing Requirements

**Unit Testing:**

- [ ] Agent store methods tested without defaults functionality
- [ ] Personality form validation tested for all 7 behaviors
- [ ] Schema validation tested with new structure
- [ ] Component rendering tested for AgentsSection without tabs
- [ ] Form submission tested without LLM parameters

**Component Testing:**

- [ ] PersonalityForm renders correctly with 7 sliders
- [ ] AgentForm submission works without temperature/tokens/topP fields
- [ ] SettingsSidebar navigation updated correctly
- [ ] AgentsSection displays properly without tab navigation

## Implementation Guidance

### Technical Approach

**Phase 1: UI Component Updates**

1. Update `AgentsSection.tsx` to remove Tabs component and display AgentsTab directly
2. Update `SettingsSidebar.tsx` to remove agents subsections
3. Remove `DefaultsTab.tsx` component file entirely
4. Clean up all imports referencing DefaultsTab

**Phase 2: Form Modifications**

1. Update `AgentForm.tsx` to remove temperature, maxTokens, topP FormField components
2. Update form schema to exclude removed fields
3. Update default values and validation logic
4. Update `PersonalityForm.tsx` to include three new behaviors in the behaviors array

**Phase 3: Backend Schema Changes**

1. Update `agentsSchema.ts` to remove AgentDefaultsSchema
2. Update AgentsDataSchema to remove defaultAgentSettings field
3. Update Agent type definition to remove LLM parameters and add new personality behaviors
4. Update AgentSchema validation to match new structure

**Phase 4: State Management Updates**

1. Update `agents.ts` store to remove defaultAgentSettings from interface
2. Remove setDefaultAgentSettings method and related functionality
3. Update store methods to work with simplified schema

**Phase 5: Testing and Quality**

1. Add unit tests for new personality behaviors
2. Add tests for simplified agent creation flow
3. Run quality checks (lint, format, type-check)

### Implementation Notes

Since this is a greenfield project with no existing users, no data migration logic is required. All schema and type changes can be implemented directly without backward compatibility considerations.

### File Structure Impact

**Modified Files:**

- `apps/desktop/src/components/Settings/agents/AgentsSection.tsx`
- `apps/desktop/src/components/Settings/sidebar/SettingsSidebar.tsx`
- `apps/desktop/src/components/Agent/AgentForm.tsx`
- `apps/desktop/src/components/Agent/PersonalityForm.tsx`
- `packages/shared/src/store/agents.ts`
- `packages/shared/src/schemas/persistence/agentsSchema.ts`
- `packages/shared/src/types/agent.ts`

**Removed Files:**

- `apps/desktop/src/components/Settings/agents/DefaultsTab.tsx`

## Dependencies

- No new external dependencies required
- Utilizes existing React Hook Form, Zod validation, Zustand state management
- Uses existing shadcn/ui components for form elements

## Testing Requirements

**Unit Tests (Jest):**

- Test personality behavior validation for all 7 behaviors
- Test agent store methods without defaults functionality
- Test form submission without LLM parameters
- Test schema validation with updated structure

**Component Tests:**

- Test PersonalityForm rendering with 7 sliders
- Test AgentForm submission flow
- Test AgentsSection rendering without tabs
- Test SettingsSidebar navigation structure

**No Integration/Performance/E2E Tests** (as specified in requirements)

## Security Considerations

**Input Validation:**

- New personality behaviors validated to range -100 to 100
- Form validation prevents invalid personality values

**Data Protection:**

- Secure storage of personality configuration data

## Performance Requirements

**Load Time:** Settings and agent creation forms maintain current performance levels
**Memory Usage:** Reduced memory footprint from removing unused defaults state
**Rendering:** Smooth UI interaction with additional personality sliders

## Success Criteria

1. **Simplified Navigation:** Settings shows only one agents section without sub-tabs
2. **Streamlined Agent Creation:** Forms exclude LLM parameters completely
3. **Enhanced Personality:** Seven total personality behaviors available and functional
4. **Clean Codebase:** No dead code, unused imports, or references to removed defaults
5. **Quality Standards:** All lint, format, and type-check requirements pass
6. **Functional Testing:** All unit tests pass with updated functionality

This feature represents a significant simplification of the agent configuration system while simultaneously enhancing the personality customization capabilities, resulting in a more focused and user-friendly interface.
