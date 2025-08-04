---
kind: task
id: T-update-settingscontent-component
title: Update SettingsContent component mapping
status: open
priority: normal
prerequisites:
  - T-create-llmsetupsection-wrapper
created: "2025-08-04T11:15:17.717117"
updated: "2025-08-04T11:15:17.717117"
schema_version: "1.1"
parent: F-code-migration-and-setup
---

## Context

This task updates the SettingsContent component to import and use the new LlmSetupSection instead of ApiKeysSettings. This is the integration point where the section components are mapped to their respective IDs for rendering.

**Related Feature**: F-code-migration-and-setup
**File Location**: `/Users/zach/code/fishbowl/apps/desktop/src/components/settings/SettingsContent.tsx`
**Pattern Reference**: Existing component imports and mapping at lines 28 and 40

## Implementation Requirements

1. Update the import statement to import LlmSetupSection
2. Update the sectionComponents mapping from "api-keys" to "llm-setup"
3. Map "llm-setup" to the LlmSetupSection component
4. Keep ApiKeysSettings import temporarily (may be needed elsewhere)

## Technical Approach

1. Open `apps/desktop/src/components/settings/SettingsContent.tsx`
2. Add import for LlmSetupSection (around line 28)
3. Update the sectionComponents object (around line 40)
4. Change key from "api-keys" to "llm-setup"
5. Change value from ApiKeysSettings to LlmSetupSection

## Detailed Acceptance Criteria

- ✓ LlmSetupSection imported at the top of the file
- ✓ sectionComponents mapping updated to use "llm-setup" key
- ✓ "llm-setup" maps to LlmSetupSection component
- ✓ Other section mappings remain unchanged
- ✓ TypeScript compilation succeeds
- ✓ No ESLint errors introduced

## Code Changes

Current import (around line 28):

```typescript
import { ApiKeysSettings } from "./ApiKeysSettings";
```

Updated imports:

```typescript
import { ApiKeysSettings } from "./ApiKeysSettings";
import { LlmSetupSection } from "./LlmSetupSection";
```

Current mapping (around line 40):

```typescript
const sectionComponents = {
  "api-keys": ApiKeysSettings,
  agents: AgentsSection,
  personalities: PersonalitiesSection,
  roles: RolesSection,
} as const;
```

Updated mapping:

```typescript
const sectionComponents = {
  "llm-setup": LlmSetupSection,
  agents: AgentsSection,
  personalities: PersonalitiesSection,
  roles: RolesSection,
} as const;
```

## Testing Requirements

After making this change:

1. Run `pnpm type-check` to ensure no TypeScript errors
2. Run `pnpm lint` to ensure code quality
3. Open the application and navigate to Settings
4. Click on "LLM Setup" and verify the existing API Keys interface appears
5. Verify no console errors or warnings

## Dependencies

**Prerequisites**:

- T-create-llmsetupsection-wrapper (LlmSetupSection component must exist)

**Impact**: This change connects the navigation to the new component, completing the basic migration path.

## Migration Notes

- Keep ApiKeysSettings import for now in case it's referenced elsewhere
- The functionality should remain identical to users
- This enables the navigation → component → content flow to work

## Security Considerations

No security implications - this is a component routing change only.

### Log
