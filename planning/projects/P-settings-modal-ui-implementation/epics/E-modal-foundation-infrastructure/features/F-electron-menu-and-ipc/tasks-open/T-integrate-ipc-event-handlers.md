---
kind: task
id: T-integrate-ipc-event-handlers
title: Integrate IPC event handlers with settings modal store
status: open
priority: high
prerequisites:
  - T-create-ipc-channel
created: "2025-07-26T17:20:18.893942"
updated: "2025-07-26T17:20:18.893942"
schema_version: "1.1"
parent: F-electron-menu-and-ipc
---

# Integrate IPC Event Handlers with Settings Modal Store

## Context

Connect the IPC infrastructure to the existing settings modal system by integrating IPC event listeners with the Zustand store from `@fishbowl-ai/shared`. This enables menu items and keyboard shortcuts to trigger the settings modal through the established state management system.

## Technical Approach

Add IPC event handling to the settings modal component or create a dedicated IPC integration hook that connects `window.electronAPI.onOpenSettings` to the `useSettingsModal` store's `openModal()` action.

## Implementation Requirements

### Create IPC Integration Hook:

Create `apps/desktop/src/hooks/useElectronIPC.ts` to encapsulate IPC event handling:

```typescript
import { useEffect } from "react";
import { useSettingsModal } from "@fishbowl-ai/shared";

export function useElectronIPC() {
  const { openModal } = useSettingsModal();

  useEffect(() => {
    // Check if running in Electron environment
    if (!window.electronAPI?.onOpenSettings) {
      console.log("Electron IPC not available (likely running in browser)");
      return;
    }

    const handleOpenSettings = () => {
      console.log("Received open-settings IPC message");
      try {
        // Open modal with default section (general)
        openModal("general");
      } catch (error) {
        console.error("Failed to open settings modal via IPC:", error);
      }
    };

    // Set up IPC event listener
    const cleanup = window.electronAPI.onOpenSettings(handleOpenSettings);

    // Cleanup on unmount
    return () => {
      try {
        if (cleanup && typeof cleanup === "function") {
          cleanup();
        }
        // Additional cleanup if needed
        window.electronAPI?.removeAllListeners?.("open-settings");
      } catch (error) {
        console.error("Error cleaning up IPC listeners:", error);
      }
    };
  }, [openModal]);
}
```

### Integrate with App Component:

Update `apps/desktop/src/App.tsx` to use the IPC integration:

```typescript
import { useElectronIPC } from "./hooks/useElectronIPC";

function App() {
  // Enable IPC integration
  useElectronIPC();

  // ... existing app code
}
```

## Acceptance Criteria

- [ ] `useElectronIPC` hook created and properly typed
- [ ] IPC event listeners integrate with `useSettingsModal` store
- [ ] Settings modal opens with 'general' section by default via IPC
- [ ] Proper error handling prevents crashes from IPC failures
- [ ] Cleanup prevents memory leaks from event listeners
- [ ] Works gracefully when not running in Electron (browser mode)
- [ ] Integration works with existing settings modal functionality
- [ ] Multiple rapid IPC messages handled without duplicate modals

## Dependencies

- **Prerequisite**: T-create-ipc-channel (requires IPC infrastructure)
- **Integration**: Uses existing `@fishbowl-ai/shared` settings modal store
- **Enables**: Complete end-to-end IPC functionality

## Security Considerations

- Validates IPC environment before setting up listeners
- Error boundaries prevent IPC failures from crashing app
- Proper cleanup prevents event listener accumulation
- Type-safe integration with existing store

## Testing Requirements

- Unit tests for `useElectronIPC` hook
- Integration tests with settings modal store
- Error handling tests for IPC failures
- Memory leak tests for event listener cleanup
- Browser compatibility tests (graceful degradation)

## Files to Create/Modify

- **Create**: `apps/desktop/src/hooks/useElectronIPC.ts` - IPC integration hook
- **Modify**: `apps/desktop/src/App.tsx` - Add IPC hook usage

## Error Handling

- Graceful degradation when Electron APIs unavailable
- Error logging for debugging IPC issues
- Fallback behavior prevents application crashes
- User feedback for IPC communication failures

## Performance Considerations

- IPC event handling under 50ms response time
- No blocking operations in event handlers
- Efficient cleanup prevents memory leaks
- Minimal overhead for browser environment detection

### Log
