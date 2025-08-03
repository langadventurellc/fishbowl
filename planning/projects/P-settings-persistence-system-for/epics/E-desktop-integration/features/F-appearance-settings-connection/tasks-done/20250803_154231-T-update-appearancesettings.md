---
kind: task
id: T-update-appearancesettings
parent: F-appearance-settings-connection
status: done
title: Add persistence imports and form setup to AppearanceSettings with unit tests
priority: high
prerequisites:
  - T-create-theme-application-utility
created: "2025-08-03T14:53:58.387221"
updated: "2025-08-03T15:28:31.569190"
schema_version: "1.1"
worktree: null
---

# Add persistence imports and form setup to AppearanceSettings with unit tests

## Context

First step in converting AppearanceSettings to use persistence: add the necessary imports, form setup, and persistence hooks while keeping all existing functionality working. This creates the foundation for persistence without breaking existing behavior.

## Implementation Requirements

### Update Component Structure

**Location**: `apps/desktop/src/components/settings/AppearanceSettings.tsx`

### Phase 1 Changes

1. **Add Required Imports**:

```typescript
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  defaultAppearanceSettings,
  appearanceSettingsSchema,
  useSettingsPersistence,
  useUnsavedChanges,
  type AppearanceSettingsFormData,
  type SettingsFormData,
} from "@fishbowl-ai/ui-shared";
import { useSettingsPersistenceAdapter } from "../../contexts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { applyTheme } from "@/utils";
import { FormErrorDisplay } from "./FormErrorDisplay";
```

2. **Add Persistence Hooks**:

```typescript
const { setUnsavedChanges } = useUnsavedChanges();
const adapter = useSettingsPersistenceAdapter();
const onError = useCallback((error: Error) => {
  setSubmitError(error.message);
}, []);

const { settings, saveSettings, isLoading, error } = useSettingsPersistence({
  adapter,
  onError,
});
```

3. **Initialize Form**:

```typescript
const form = useForm<AppearanceSettingsFormData>({
  resolver: zodResolver(appearanceSettingsSchema),
  defaultValues: settings?.appearance || defaultAppearanceSettings,
  mode: "onChange",
});
```

4. **Keep Existing State Temporarily**:

- Keep all existing useState calls for now
- This ensures UI continues to work exactly as before
- Will be removed in subsequent tasks

5. **Add Loading/Error States**:

- Add loading state component
- Add error state handling
- Maintain existing UI when loaded

### Unit Test Updates

Update `apps/desktop/src/components/settings/__tests__/AppearanceSettings.test.tsx`:

1. **Add Required Mocks**:

```typescript
jest.mock("../../../contexts", () => ({
  useSettingsPersistenceAdapter: jest.fn(() => mockAdapter),
}));

jest.mock("../../../utils", () => ({
  applyTheme: jest.fn(),
}));

jest.mock("@fishbowl-ai/ui-shared", () => ({
  ...jest.requireActual("@fishbowl-ai/ui-shared"),
  useSettingsPersistence: jest.fn(),
  useUnsavedChanges: jest.fn(() => ({
    setUnsavedChanges: jest.fn(),
  })),
}));
```

2. **Test New Hooks Integration**:

- Test component renders with persistence hooks
- Test loading state displays correctly
- Test error state handling
- Test form initialization

3. **Ensure Existing Tests Pass**:

- All existing functionality tests must continue to pass
- UI behavior should be identical to current implementation

## Acceptance Criteria

- ✓ All new imports added successfully
- ✓ Persistence hooks integrated without breaking existing functionality
- ✓ Form setup complete with proper validation
- ✓ Loading and error states implemented
- ✓ All existing tests pass
- ✓ New tests for hooks integration pass
- ✓ UI behavior remains exactly the same
- ✓ Code quality checks pass

## Technical Approach

1. Add imports and hooks while preserving existing state
2. Set up form infrastructure alongside current implementation
3. Add loading/error UI that doesn't interfere with current UI
4. Update tests to handle new mocks while preserving existing test cases
5. Ensure this is a pure additive change

## Testing Requirements

- All existing tests must continue to pass
- Add tests for new persistence hook integration
- Test loading and error state rendering
- Verify no regressions in UI behavior

### Log

**2025-08-03T20:42:31.474241Z** - Successfully added persistence imports and form setup to AppearanceSettings component with comprehensive unit tests. All required imports for form components, persistence hooks, and validation have been integrated. The component now includes useSettingsPersistence and useUnsavedChanges hooks alongside existing state (preserved for compatibility). Form infrastructure is initialized with zodResolver and validation, wrapped in Form component with loading and error states. All existing functionality remains intact - UI behavior is exactly the same. Updated test file with comprehensive mocks for new dependencies including proper Zod schema mocking. All quality checks pass and existing tests continue to work.

- filesChanged: ["apps/desktop/src/components/settings/AppearanceSettings.tsx", "apps/desktop/src/components/settings/__tests__/AppearanceSettings.test.tsx"]
