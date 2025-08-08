---
id: T-create-test-file-structure
title: Create test file structure and setup helpers for LLM configuration testing
status: done
priority: high
parent: F-llm-setup-end-to-end-testing
prerequisites: []
affectedFiles:
  tests/desktop/features/llm-setup.spec.ts:
    "New test file with comprehensive test
    infrastructure: Playwright/Electron setup, dual storage cleanup helpers
    (llm_config.json + secure_keys.json), test lifecycle hooks, modal navigation
    helpers, test data factories for OpenAI/Anthropic configs, and placeholder
    test for environment verification"
log:
  - Created comprehensive test file structure and setup helpers for LLM
    configuration testing. Implemented foundational test file with
    Playwright/Electron integration, dual storage cleanup (JSON config + secure
    storage), test lifecycle hooks, navigation helpers, and test data factories.
    All quality checks pass successfully. File follows existing patterns from
    advanced-settings.spec.ts while adapting for LLM-specific testing needs.
    Placeholder test verifies test environment initialization correctly.
schema: v1.0
childrenIds: []
created: 2025-08-08T05:24:32.916Z
updated: 2025-08-08T05:24:32.916Z
---

# Create Test File Structure and Setup Helpers

## Context

Create the foundational test file and helper utilities for testing LLM configuration functionality. This follows the established patterns from existing test files like `advanced-settings.spec.ts` and `general-settings.spec.ts`.

## Implementation Requirements

### File Creation

- Create `tests/desktop/features/llm-setup.spec.ts`
- Import necessary Playwright and Electron testing utilities
- Define TypeScript interfaces for test helpers and data structures

### Test Infrastructure Setup

- Implement test fixture with `electronApp` and `window` setup
- Configure `test.beforeAll` for Electron app initialization
- Set up `test.beforeEach` for clean state initialization
- Implement `test.afterEach` for cleanup operations
- Add `test.afterAll` for app teardown

### Storage Cleanup Helpers

Create helper functions for dual storage cleanup:

1. **JSON Configuration Cleanup**
   - Function to delete `llm_config.json` from user data directory
   - Pattern: `await fs.unlink(llmConfigPath).catch(() => {})`
2. **Secure Storage Cleanup**
   - Helper to clear API keys from Electron secure storage
   - May require IPC calls to delete method or custom test-only cleanup

### Test Data Factories

- Create mock configuration factory for OpenAI configs
- Create mock configuration factory for Anthropic configs
- Generate deterministic test API keys (non-functional)
- Helper to create valid configuration objects

### Modal Navigation Helpers

- Function to navigate to LLM Setup tab in settings
- Helper to wait for LLM setup content to load
- Utility to check current tab selection

## Technical Approach

1. Copy structure from `advanced-settings.spec.ts` as base template
2. Adapt TestHelpers interface if additional methods needed
3. Implement storage path resolution using `electronApp.evaluate`
4. Create reusable helper functions for common operations

## Acceptance Criteria

- [ ] Test file created at correct location with proper imports
- [ ] Test fixtures properly configured for Electron environment
- [ ] Setup/teardown hooks clean both storage locations
- [ ] Mock data factories generate valid test configurations
- [ ] Helper functions are reusable across all test scenarios
- [ ] TypeScript types properly defined for test data
- [ ] File follows existing test patterns and conventions

## File References

- Pattern reference: `tests/desktop/features/advanced-settings.spec.ts`
- TestHelpers interface: `tests/desktop/features/advanced-settings.spec.ts:11-15`
- IPC constants: `apps/desktop/src/shared/ipc/llmConfigConstants.ts`

## Dependencies

None - this is the foundational task
