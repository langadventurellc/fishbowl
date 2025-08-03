---
kind: task
id: T-write-integration-tests-for
title: Write integration tests for general settings persistence
status: open
priority: normal
prerequisites:
  - T-integrate
  - T-create-settings-context-provider
created: "2025-08-02T21:04:24.751774"
updated: "2025-08-02T21:04:24.751774"
schema_version: "1.1"
parent: F-general-settings-connection
---

# Write integration tests for general settings persistence

## Context

After implementing the settings persistence integration, we need comprehensive integration tests to verify the full save/load cycle works correctly. These tests will ensure that general settings persist across application sessions and that the UI properly reflects saved values.

## Implementation Requirements

### 1. Create Integration Test File

Create `apps/desktop/src/components/settings/__tests__/GeneralSettings.integration.test.tsx`

### 2. Test Setup

- Mock the desktop settings adapter for controlled testing
- Set up test wrapper with SettingsProvider
- Use React Testing Library for component testing

### 3. Key Test Cases to Implement

#### Test: Settings load on component mount

```typescript
it('should load saved settings when component mounts', async () => {
  const mockSettings = {
    general: {
      theme: 'dark',
      language: 'en',
      // other settings...
    }
  };

  mockDesktopSettingsAdapter.load.mockResolvedValue(mockSettings);

  render(<GeneralSettings />, { wrapper: TestWrapper });

  await waitFor(() => {
    expect(screen.getByLabelText('Theme')).toHaveValue('dark');
    expect(screen.getByLabelText('Language')).toHaveValue('en');
  });
});
```

#### Test: Form submission saves settings

```typescript
it('should save settings when form is submitted', async () => {
  render(<GeneralSettings />, { wrapper: TestWrapper });

  const themeSelect = screen.getByLabelText('Theme');
  fireEvent.change(themeSelect, { target: { value: 'light' } });

  const saveButton = screen.getByRole('button', { name: /save/i });
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(mockDesktopSettingsAdapter.save).toHaveBeenCalledWith(
      expect.objectContaining({
        general: expect.objectContaining({
          theme: 'light'
        })
      })
    );
  });
});
```

#### Test: Error handling displays messages

```typescript
it('should display error message when save fails', async () => {
  const errorMessage = 'Failed to save settings';
  mockDesktopSettingsAdapter.save.mockRejectedValue(new Error(errorMessage));

  render(<GeneralSettings />, { wrapper: TestWrapper });

  const saveButton = screen.getByRole('button', { name: /save/i });
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
```

#### Test: Unsaved changes tracking

```typescript
it('should track unsaved changes correctly', async () => {
  const { getByLabelText } = render(<GeneralSettings />, { wrapper: TestWrapper });

  // Initially no unsaved changes
  expect(mockSetUnsavedChanges).toHaveBeenCalledWith(false);

  // Make a change
  fireEvent.change(getByLabelText('Theme'), { target: { value: 'dark' } });

  // Should mark as having unsaved changes
  expect(mockSetUnsavedChanges).toHaveBeenCalledWith(true);

  // Save the changes
  const saveButton = screen.getByRole('button', { name: /save/i });
  fireEvent.click(saveButton);

  await waitFor(() => {
    // Should clear unsaved changes after successful save
    expect(mockSetUnsavedChanges).toHaveBeenLastCalledWith(false);
  });
});
```

#### Test: Settings persist after "app restart" (simulated)

```typescript
it('should persist settings across component remounts', async () => {
  const { rerender, unmount } = render(<GeneralSettings />, { wrapper: TestWrapper });

  // Make and save a change
  fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'es' } });
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  await waitFor(() => {
    expect(mockDesktopSettingsAdapter.save).toHaveBeenCalled();
  });

  // Simulate app restart by unmounting and remounting
  unmount();

  // Mock the adapter returning the saved value
  mockDesktopSettingsAdapter.load.mockResolvedValue({
    general: { language: 'es' }
  });

  rerender(<GeneralSettings />, { wrapper: TestWrapper });

  await waitFor(() => {
    expect(screen.getByLabelText('Language')).toHaveValue('es');
  });
});
```

### 4. Test Utilities

Create test wrapper with providers:

```typescript
const TestWrapper = ({ children }) => (
  <SettingsProvider>
    <UnsavedChangesProvider>
      {children}
    </UnsavedChangesProvider>
  </SettingsProvider>
);
```

## Acceptance Criteria

- ✓ All test cases pass reliably
- ✓ Tests cover happy path and error scenarios
- ✓ Mock setup properly isolates component behavior
- ✓ Tests verify integration between UI and persistence layer
- ✓ Tests run as part of the test suite

## Testing Requirements

- Use Jest and React Testing Library
- Mock the desktop settings adapter to control test scenarios
- Ensure tests are isolated and don't affect actual settings files
- Follow existing test patterns in the codebase

## File Locations

- Test file: `apps/desktop/src/components/settings/__tests__/GeneralSettings.integration.test.tsx`
- Component under test: `apps/desktop/src/components/settings/GeneralSettings.tsx`
- Related test examples: Check existing test files in the settings directory

### Log
