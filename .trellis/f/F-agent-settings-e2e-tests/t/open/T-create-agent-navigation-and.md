---
id: T-create-agent-navigation-and
title: Create Agent Navigation and UI Helpers
status: open
priority: high
parent: F-agent-settings-e2e-tests
prerequisites:
  - T-create-agent-test-infrastructu
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T00:28:24.690Z
updated: 2025-08-21T00:28:24.690Z
---

# Create Agent Navigation and UI Helpers

## Context

Create navigation and UI interaction helper functions for agent settings tests, following established patterns from existing settings test helpers. These utilities enable reliable interaction with the agents section of the settings modal.

## Implementation Requirements

### Files to Create

1. **`tests/desktop/helpers/settings/openAgentsSection.ts`**
   - Navigate to agents section within settings modal
   - Handle modal opening and section switching
   - Wait for agents section to be fully loaded

2. **`tests/desktop/helpers/settings/waitForAgentModal.ts`**
   - Wait for agent form modal to appear/disappear
   - Handle modal loading states and animations
   - Provide reliable modal interaction patterns

3. **`tests/desktop/helpers/settings/waitForAgentsList.ts`**
   - Wait for agent grid/list to load and render
   - Handle loading states and empty states
   - Ensure agent cards are interactive

## Technical Approach

### openAgentsSection.ts Implementation

```typescript
import type { TestWindow } from "../index";

export const openAgentsSection = async (window: TestWindow) => {
  // Open settings modal if not already open
  await window.evaluate(() => {
    if (!window.testHelpers?.isSettingsModalOpen()) {
      window.testHelpers!.openSettingsModal();
    }
  });

  // Wait for settings modal to be visible
  await expect(window.locator('[data-testid="settings-modal"]')).toBeVisible();

  // Click on agents navigation item
  const agentsNavItem = window.locator('[data-testid="nav-agents"]');
  await agentsNavItem.click();

  // Wait for agents section to be visible
  await expect(window.locator('[data-testid="agents-section"]')).toBeVisible();

  // Small delay for any animations to complete
  await window.waitForTimeout(200);
};
```

### waitForAgentModal.ts Implementation

```typescript
import { expect } from "@playwright/test";
import type { TestWindow } from "../index";

export const waitForAgentModal = async (
  window: TestWindow,
  shouldBeVisible: boolean = true,
) => {
  const modalSelector = '[data-testid="agent-form-modal"]';

  if (shouldBeVisible) {
    await expect(window.locator(modalSelector)).toBeVisible({ timeout: 5000 });
    // Wait for modal content to be fully loaded
    await expect(
      window.locator('[data-testid="agent-name-input"]'),
    ).toBeVisible();
  } else {
    await expect(window.locator(modalSelector)).not.toBeVisible({
      timeout: 5000,
    });
  }
};
```

### waitForAgentsList.ts Implementation

```typescript
import { expect } from "@playwright/test";
import type { TestWindow } from "../index";

export const waitForAgentsList = async (
  window: TestWindow,
  shouldHaveAgents: boolean = true,
) => {
  // Wait for agents section to be visible
  await expect(window.locator('[data-testid="agents-section"]')).toBeVisible();

  if (shouldHaveAgents) {
    // Wait for at least one agent card to appear
    await expect(
      window.locator('[data-testid="agent-card"]').first(),
    ).toBeVisible({ timeout: 5000 });
  } else {
    // Wait for empty state to be visible
    await expect(
      window.locator('[data-testid="empty-agents-state"]'),
    ).toBeVisible({ timeout: 5000 });
  }

  // Small delay for grid layout to stabilize
  await window.waitForTimeout(200);
};
```

## Integration with Existing Patterns

### Follow Established Helper Patterns

- Study `/tests/desktop/helpers/settings/openLlmSetupSection.ts`
- Study `/tests/desktop/helpers/settings/waitForPersonalityModal.ts`
- Study `/tests/desktop/helpers/settings/waitForRolesList.ts`
- Follow consistent naming conventions and error handling

### Selector Strategy

Use data-testid attributes for reliable element selection:

- `[data-testid="agents-section"]` - Main agents section
- `[data-testid="nav-agents"]` - Navigation item for agents
- `[data-testid="agent-form-modal"]` - Create/edit agent modal
- `[data-testid="agent-card"]` - Individual agent cards
- `[data-testid="empty-agents-state"]` - Empty state display
- `[data-testid="agent-name-input"]` - Agent name input field

## Acceptance Criteria

### Functional Requirements

- ✅ openAgentsSection reliably navigates to agents section
- ✅ Handles case where settings modal is already open
- ✅ Waits for agents section to be fully loaded and interactive
- ✅ waitForAgentModal handles both visible and hidden states
- ✅ Waits for modal content to be fully loaded before returning
- ✅ waitForAgentsList handles both populated and empty states
- ✅ Provides appropriate timeouts for all waiting operations

### Technical Requirements

- ✅ Follow exact patterns from existing settings test helpers
- ✅ Use proper TypeScript types from existing helpers
- ✅ Include robust error handling and timeouts
- ✅ Handle animations and loading states appropriately
- ✅ Export functions in consistent format

### Integration Requirements

- ✅ Works seamlessly with setupAgentsTestSuite infrastructure
- ✅ Integrates properly with Playwright test assertions
- ✅ Supports reliable test execution across different timing scenarios
- ✅ Functions can be imported cleanly via index.ts barrel exports

## Implementation Guidance

### File Locations

- `tests/desktop/helpers/settings/openAgentsSection.ts`
- `tests/desktop/helpers/settings/waitForAgentModal.ts`
- `tests/desktop/helpers/settings/waitForAgentsList.ts`

### Dependencies to Study

- `/tests/desktop/helpers/settings/openLlmSetupSection.ts`
- `/tests/desktop/helpers/settings/waitForPersonalityModal.ts`
- `/tests/desktop/helpers/settings/waitForRolesList.ts`
- `/tests/desktop/helpers/settings/openRolesSection.ts`

### Error Handling

- Include appropriate timeouts (5000ms for critical operations)
- Provide meaningful error messages when selectors fail
- Handle edge cases like slow loading or network delays

## Security Considerations

- No sensitive data handling required
- Selector-based interactions only
- No file system operations in these helpers

## Testing Strategy

- Functions should be reliable across different system performance levels
- Support both fast and slow test execution environments
- Handle various agent count scenarios (0, 1, many agents)

## Notes

These helpers enable the test files to focus on test logic rather than UI interaction mechanics. They must be robust and follow established patterns exactly to ensure consistency across all agent test scenarios.
