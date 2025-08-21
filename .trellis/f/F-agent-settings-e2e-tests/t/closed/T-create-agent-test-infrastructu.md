---
id: T-create-agent-test-infrastructu
title: Create Agent Test Infrastructure Setup
status: done
priority: high
parent: F-agent-settings-e2e-tests
prerequisites: []
affectedFiles:
  tests/desktop/features/settings/agents/setupAgentsTestSuite.ts:
    Core test suite setup following LLM patterns with Electron app management,
    modal cleanup, and agents.json cleanup
  tests/desktop/helpers/settings/cleanupAgentsStorage.ts: Utility for robust
    agents.json file deletion with retry logic and error handling
  tests/desktop/features/settings/agents/index.ts: Barrel exports for agent test helper functions and infrastructure
  tests/desktop/features/settings/agents/infrastructure-test.spec.ts: Verification test to ensure infrastructure works correctly
log:
  - Successfully created the complete agent test infrastructure following
    established LLM test patterns. Implemented setupAgentsTestSuite.ts for
    managing single Electron app instance per test suite with proper
    beforeAll/beforeEach/afterEach cleanup. Created cleanupAgentsStorage.ts
    utility for robust agents.json file deletion with retry logic. Added
    index.ts barrel exports for clean imports. Infrastructure supports modal
    state management, file cleanup between tests, and provides foundation for
    all subsequent agent test files. All files follow existing code conventions
    and pass type checking.
schema: v1.0
childrenIds: []
created: 2025-08-21T00:27:50.999Z
updated: 2025-08-21T00:27:50.999Z
---

# Create Agent Test Infrastructure Setup

## Context

Create the core test infrastructure for agent settings end-to-end tests, following the established patterns from existing LLM setup tests in `/tests/desktop/features/settings/llm-setup/`. This task establishes the foundation that all other agent test files will depend on.

## Implementation Requirements

### Files to Create

1. **`tests/desktop/features/settings/agents/setupAgentsTestSuite.ts`**
   - Follow the pattern from `tests/desktop/helpers/settings/setupLlmTestSuite.ts`
   - Create single Electron app instance per test suite (NOT per test)
   - Handle agents.json cleanup between tests
   - Manage modal state cleanup

2. **`tests/desktop/helpers/settings/cleanupAgentsStorage.ts`**
   - Follow the pattern from `tests/desktop/helpers/settings/cleanupLlmStorage.ts`
   - Handle agents.json file deletion with retries
   - Provide robust error handling for file operations

3. **`tests/desktop/features/settings/agents/index.ts`**
   - Follow the pattern from `tests/desktop/features/settings/llm-setup/index.ts`
   - Export all helper functions and types for agent tests
   - Create barrel exports for clean imports

## Technical Approach

### setupAgentsTestSuite.ts Implementation

```typescript
// Follow this structure from setupLlmTestSuite.ts but adapt for agents:
export const setupAgentsTestSuite = () => {
  let electronApp: TestElectronApplication;
  let window: TestWindow;
  let userDataPath: string;
  let agentsConfigPath: string;

  test.beforeAll(async () => {
    // Create single Electron app instance
    // Similar to LLM setup pattern
  });

  test.beforeEach(async () => {
    // Delete agents.json file for clean state
    // Close any open modals
    // Wait for cleanup to complete
  });

  test.afterEach(async () => {
    // Ensure modal is closed
    // Clean up agents.json file
  });

  test.afterAll(async () => {
    // Close Electron app
  });

  return {
    getElectronApp: () => electronApp,
    getWindow: () => window,
    getUserDataPath: () => userDataPath,
    getAgentsConfigPath: () => agentsConfigPath,
  };
};
```

### cleanupAgentsStorage.ts Implementation

```typescript
// Follow cleanupLlmStorage.ts pattern:
export const cleanupAgentsStorage = async (configPath: string) => {
  // Delete agents.json file with retries
  // Handle ENOENT errors gracefully
  // Provide console warnings for persistent failures
};
```

### Key Differences from LLM Tests

- Use `agents.json` instead of `llm_config.json` and `secure_keys.json`
- No need for secure key storage (agents don't store API keys)
- Single file cleanup pattern vs multiple files

## Acceptance Criteria

### Functional Requirements

- ✅ setupAgentsTestSuite creates single Electron app per test suite
- ✅ beforeEach deletes agents.json file for clean test state
- ✅ Modal state is properly reset between tests
- ✅ afterEach ensures modal is closed and data is cleaned
- ✅ cleanupAgentsStorage handles file deletion with retries
- ✅ Error handling for missing files (ENOENT) works gracefully
- ✅ index.ts exports all necessary functions and types

### Technical Requirements

- ✅ Follow exact patterns from existing LLM setup test infrastructure
- ✅ Use proper TypeScript types for all functions
- ✅ Include proper async/await error handling
- ✅ Add appropriate timeouts for modal operations
- ✅ Include console warnings for debugging failed operations

### Integration Requirements

- ✅ Exported functions work seamlessly with Playwright test files
- ✅ Path handling works correctly across different operating systems
- ✅ Agent data cleanup doesn't interfere with other test suites
- ✅ Infrastructure supports parallel test execution

## Implementation Guidance

### File Locations

- `tests/desktop/features/settings/agents/setupAgentsTestSuite.ts`
- `tests/desktop/helpers/settings/cleanupAgentsStorage.ts`
- `tests/desktop/features/settings/agents/index.ts`

### Dependencies

- Study existing patterns in `/tests/desktop/features/settings/llm-setup/`
- Import utilities from `/tests/desktop/helpers/`
- Follow naming conventions from existing test infrastructure

### Testing Strategy

- Test infrastructure should support the 6 planned test files
- Ensure robust cleanup prevents test interference
- Verify modal state management works consistently

## Security Considerations

- File operations limited to userData directory
- No sensitive data handling required for agents.json
- Proper error handling prevents test data leakage

## Notes

This task creates the foundation that all subsequent agent test tasks will depend on. The infrastructure must be robust and follow established patterns exactly to ensure consistency across the test suite.
