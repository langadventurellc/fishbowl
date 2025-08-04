---
kind: task
id: T-create-llmsetupsection-wrapper
title: Create LlmSetupSection wrapper component
status: open
priority: normal
prerequisites:
  - T-update-navigation-to-llm-setup
created: "2025-08-04T11:14:10.688090"
updated: "2025-08-04T11:14:10.688090"
schema_version: "1.1"
parent: F-code-migration-and-setup
---

## Context

This task creates a new LlmSetupSection component that will serve as the main entry point for the LLM Setup settings section. Initially, this component will simply wrap and render the existing ApiKeysSettings component to maintain functionality during the migration.

**Related Feature**: F-code-migration-and-setup
**New File Location**: `/Users/zach/code/fishbowl/apps/desktop/src/components/settings/LlmSetupSection.tsx`
**Pattern Reference**: Follow the pattern of other section components like AgentsSection, PersonalitiesSection, etc.

## Implementation Requirements

Create a new React component that:

1. Imports the existing ApiKeysSettings component
2. Renders ApiKeysSettings with no modifications
3. Includes appropriate TypeScript types
4. Follows the project's component patterns

## Technical Approach

1. Create a new file `apps/desktop/src/components/settings/LlmSetupSection.tsx`
2. Import React and the ApiKeysSettings component
3. Create a functional component that renders ApiKeysSettings
4. Export the component as the default export
5. Add a JSDoc comment explaining the component's temporary nature

## Detailed Acceptance Criteria

- ✓ New file created at the specified location
- ✓ Component named `LlmSetupSection`
- ✓ Imports and renders `ApiKeysSettings` component
- ✓ Uses proper TypeScript/React syntax
- ✓ Includes JSDoc comment explaining migration status
- ✓ Follows project naming conventions
- ✓ No ESLint or TypeScript errors

## Implementation Code

```typescript
/**
 * LLM Setup Settings component for managing LLM provider configurations.
 *
 * @todo This is a temporary wrapper during migration from API Keys to LLM Setup.
 * The ApiKeysSettings component will be replaced with new LLM-specific components.
 */
import { ApiKeysSettings } from "./ApiKeysSettings";

export function LlmSetupSection() {
  return <ApiKeysSettings />;
}
```

## Testing Requirements

After creating this component:

1. Run `pnpm type-check` to ensure no TypeScript errors
2. Run `pnpm lint` to ensure code style compliance
3. The component should render identically to ApiKeysSettings
4. No functional changes should be visible to users

## Dependencies

**Prerequisites**:

- T-update-settingssection-type-to (type must exist)
- T-update-navigation-to-llm-setup (navigation must be updated)

**Components Used**:

- ApiKeysSettings (existing component being wrapped)

## Migration Strategy

This wrapper approach allows us to:

1. Update all integration points to use LlmSetupSection
2. Develop new LLM components incrementally
3. Replace ApiKeysSettings content without breaking the app
4. Maintain a working application throughout the migration

## Security Considerations

No security implications - this is a simple wrapper component with no new logic.

### Log
