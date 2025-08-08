---
id: F-llm-setup-end-to-end-testing
title: LLM Setup End-to-End Testing
status: draft
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-08T05:22:12.656Z
updated: 2025-08-08T05:22:12.656Z
---

# LLM Setup End-to-End Testing Feature

## Purpose

Implement comprehensive end-to-end tests for the LLM setup functionality using Playwright, covering the complete user journey of adding, editing, and deleting LLM configurations in the desktop application.

## Key Components

Based on analysis of existing codebase:

### Target Components

- `/apps/desktop/src/components/settings/llm-setup/LlmSetupSection.tsx` - Main LLM setup interface
- `/apps/desktop/src/components/settings/llm-setup/EmptyLlmState.tsx` - Empty state with provider selection
- `/apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx` - Add/edit configuration modal
- `/apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx` - Configuration display cards
- `/apps/desktop/src/components/settings/llm-setup/OpenAiProviderFields.tsx` - OpenAI-specific form fields
- `/apps/desktop/src/components/settings/llm-setup/AnthropicProviderFields.tsx` - Anthropic-specific form fields

## Test Infrastructure Requirements

### Storage Cleanup Strategy

The LLM setup uses dual storage that requires different cleanup approaches:

1. **JSON Configuration File (`llm_config.json`)**
   - Similar to existing `preferences.json` cleanup pattern
   - Can be deleted using file system operations in test setup/teardown
   - Location: User data directory (obtained via `electronApp.evaluate(() => app.getPath("userData"))`)

2. **Electron Secure Storage (API Keys)**
   - Requires IPC calls to clear sensitive data
   - Need to expose test-only cleanup methods or use existing delete operations
   - Critical for test isolation to prevent key leakage between tests

### Test Environment Setup

Follow existing pattern from `advanced-settings.spec.ts`:

- Launch Electron app with `NODE_ENV: "test"`
- Use test helpers for modal operations (`window.__TEST_HELPERS__`)
- Implement clean state setup/teardown for each test
- Handle both file cleanup and secure storage cleanup

## Detailed Acceptance Criteria

### Functional Behavior Requirements

#### 1. Empty State Interaction

- **Given** no LLM configurations exist
- **When** user navigates to LLM setup tab
- **Then** empty state component displays with provider dropdown
- **And** dropdown contains OpenAI and Anthropic options
- **And** setup button text changes based on selected provider
- **When** user clicks setup button
- **Then** configuration modal opens for selected provider

#### 2. Add LLM Configuration - OpenAI

- **Given** user is in empty state
- **When** user selects OpenAI and clicks setup
- **Then** modal opens with "Add OpenAI Configuration" title
- **And** form displays with fields: Custom Name, API Key, Base URL (optional), Auth Header toggle
- **And** Base URL defaults to "https://api.openai.com/v1"
- **When** user fills required fields (Custom Name, API Key) and saves
- **Then** modal closes and configuration card appears
- **And** llm_config.json contains configuration metadata (no API key)
- **And** Electron secure storage contains API key
- **And** "Add Another Provider" button appears

#### 3. Add LLM Configuration - Anthropic

- **Given** user is in empty state
- **When** user selects Anthropic and clicks setup
- **Then** modal opens with "Add Anthropic Configuration" title
- **And** form displays Anthropic-specific fields
- **And** Base URL defaults to "https://api.anthropic.com"
- **When** user completes and saves configuration
- **Then** Anthropic configuration card appears with correct provider branding

#### 4. Edit Existing Configuration

- **Given** one or more LLM configurations exist
- **When** user clicks edit button on configuration card
- **Then** modal opens in edit mode with existing data populated
- **And** API key field shows placeholder (not actual key)
- **And** modal title shows "Edit [Provider] Configuration"
- **When** user modifies fields and saves
- **Then** configuration card updates with new data
- **And** changes persist in both storage locations

#### 5. Delete Configuration with Confirmation

- **Given** user has existing LLM configurations
- **When** user clicks delete button on configuration card
- **Then** confirmation dialog appears with "Delete API Configuration?" title
- **And** dialog warns "This action cannot be undone"
- **When** user clicks "Yes" to confirm
- **Then** configuration card disappears
- **And** configuration removed from llm_config.json
- **And** API key removed from Electron secure storage
- **When** user clicks "No" to cancel
- **Then** dialog closes and configuration remains unchanged

#### 6. Multiple Configurations Management

- **Given** user has multiple LLM configurations
- **Then** each configuration displays as separate card
- **And** cards show provider-specific branding
- **And** each card has independent edit/delete actions
- **When** user deletes all configurations
- **Then** returns to empty state with provider selection

### User Interface Requirements

#### Modal Interaction Patterns

- Modal opens/closes smoothly without errors
- Form validation prevents saving with missing required fields
- Save button enables/disables based on form validity
- Cancel/Close buttons discard unsaved changes
- Error handling displays user-friendly messages

#### Accessibility Standards

- All interactive elements have proper ARIA labels
- Modal maintains focus trap
- Keyboard navigation works throughout interface
- Screen reader announcements for state changes

#### Provider-Specific UI Elements

- OpenAI: Distinctive branding and field layout
- Anthropic: Appropriate provider styling and defaults
- Base URL fields show correct default values per provider
- Auth header toggle behavior per provider requirements

### Data Validation and Error Handling

#### Input Validation

- Custom name required and non-empty
- API key required and non-empty
- Base URL optional but must be valid URL format if provided
- Duplicate custom names handled gracefully

#### Error Recovery

- Network errors during save operations display user feedback
- Storage errors don't leave app in inconsistent state
- Form errors don't close modal prematurely
- Validation errors highlight specific problematic fields

### Integration Points

#### IPC Communication

- Modal communicates with Electron main process for CRUD operations
- Secure storage operations complete successfully
- File system operations don't conflict with running app
- Error handling preserves data integrity

#### State Management

- Configuration list updates reflect CRUD operations immediately
- Optimistic updates with rollback on errors
- Loading states display during async operations
- Cache invalidation works correctly after modifications

### Performance Requirements

#### Response Time Expectations

- Modal opens within 100ms of user action
- Save operations complete within 2 seconds
- Configuration list updates within 500ms
- Delete operations with confirmation complete within 1 second

#### Resource Usage

- No memory leaks during repeated CRUD operations
- File I/O operations don't block UI thread
- Secure storage operations complete efficiently
- Modal rendering doesn't impact main app performance

### Security Validation

#### API Key Handling

- API keys never logged to console or visible in DOM
- Secure storage encryption verified (where testable)
- No API keys persist in JSON configuration file
- Edit operations don't expose existing API keys in UI

#### Data Isolation

- Test data doesn't interfere with user's actual configurations
- Cleanup operations remove all test artifacts
- No test data survives test completion
- Cross-test contamination prevented

### Browser/Platform Compatibility

#### Electron Environment

- Tests run reliably on Electron application
- IPC mechanisms work correctly in test environment
- File system access functions properly
- Secure storage integration operational

### Testing Implementation Guidelines

#### Test Structure

- Follow existing pattern from `advanced-settings.spec.ts`
- Use `test.beforeEach` for clean state setup
- Use `test.afterEach` for cleanup operations
- Implement helper functions for common operations

#### Test Data Management

- Create mock API keys for testing (non-functional)
- Use deterministic test configuration names
- Implement data factories for different scenarios
- Ensure complete cleanup after each test

#### Error Simulation

- Test network failure scenarios
- Test storage operation failures
- Test invalid input handling
- Test concurrent operation conflicts

#### Async Operation Handling

- Use `waitFor` for state changes
- Implement proper timeouts for operations
- Handle loading states appropriately
- Verify final state after async operations complete

## Implementation Approach

### Test File Organization

- Create `tests/desktop/features/llm-setup.spec.ts`
- Follow existing test structure and patterns
- Implement comprehensive test scenarios
- Use proper test isolation and cleanup

### Storage Cleanup Implementation

```typescript
// Pattern for llm_config.json cleanup
const llmConfigPath = path.join(userDataPath, "llm_config.json");
await fs.unlink(llmConfigPath).catch(() => {}); // Ignore if doesn't exist

// Pattern for secure storage cleanup
// May require IPC call or iterating through known config IDs
```

### Test Helper Integration

Leverage existing `window.__TEST_HELPERS__` pattern:

- `openSettingsModal()` - Open settings modal
- `closeSettingsModal()` - Close settings modal
- `isSettingsModalOpen()` - Check modal state
- Navigate to LLM Setup tab programmatically

## Success Criteria

- All CRUD operations (Create, Read, Update, Delete) tested comprehensively
- Both OpenAI and Anthropic providers supported
- Storage cleanup prevents test pollution
- Error scenarios handled gracefully
- Tests run reliably in CI/CD environment
- No test flakiness due to async operations
- Complete coverage of user interaction flows
