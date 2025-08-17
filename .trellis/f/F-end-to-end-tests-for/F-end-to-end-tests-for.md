---
id: F-end-to-end-tests-for
title: End-to-End Tests for Personalities Section
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  tests/desktop/helpers/settings/setupPersonalitiesTestSuite.ts:
    Created new test infrastructure setup function following roles pattern with
    personalities-specific configuration and data reset
  tests/desktop/helpers/index.ts: Added export for setupPersonalitiesTestSuite function
log: []
schema: v1.0
childrenIds:
  - T-create-personalities-creation
  - T-create-personalities-default
  - T-create-personalities-deletion
  - T-create-personalities-editing
  - T-create-personalities-mock
  - T-create-personalities-test-1
  - T-create-personalities-test
  - T-create-personalities
created: 2025-08-17T21:07:54.536Z
updated: 2025-08-17T21:07:54.536Z
---

# End-to-End Tests for Personalities Section

Create comprehensive end-to-end tests for the personalities section of the settings modal, following the established patterns from the completed roles tests feature. The tests should verify basic functionality without being comprehensive or performance-focused.

## Overview

This feature implements basic e2e tests for the personalities management functionality in the desktop application. The tests will be organized in multiple test suites (similar to the roles implementation) to prevent large, unmanageable test files.

## Acceptance Criteria

### Core Functionality Testing

- ✅ **Default Personalities Loading**: Verify that the 5 default personalities load correctly from `defaultPersonalities.json`
  - Creative Thinker
  - Analytical Strategist
  - Empathetic Supporter
  - Dynamic Leader
  - Thoughtful Advisor
- ✅ **Personality Editing**: Test editing existing personalities (both default and custom personalities)
- ✅ **Personality Creation**: Test adding new custom personalities
- ✅ **Personality Deletion**: Test deleting personalities (custom personalities only, default personalities should be preserved)

### Test Organization Requirements

- ✅ **Multiple Test Suites**: Follow roles pattern with separate test files for different functionality areas
- ✅ **Shared Test Helpers**: Create reusable helper functions and setup utilities
- ✅ **Modular Structure**: Organize tests to prevent single large test file

## Technical Implementation

### Test Suite Structure

Following the roles pattern, create separate test files:

1. **`personalities-default-loading.spec.ts`** - Test default personalities loading
2. **`personalities-creation.spec.ts`** - Test personality creation functionality
3. **`personalities-editing.spec.ts`** - Test personality editing functionality
4. **`personalities-deletion.spec.ts`** - Test personality deletion functionality

### Helper Functions Required

Create helper functions similar to roles tests:

- `setupPersonalitiesTestSuite()` - Main test suite setup with cleanup
- `openPersonalitiesSection()` - Navigate to personalities section in settings
- `waitForPersonalitiesList()` - Wait for personalities list to load
- `createMockPersonalityData()` - Generate mock personality data for tests
- `cleanupPersonalitiesStorage()` - Clean personalities data between tests

### Test Data Structure

Based on `defaultPersonalities.json` analysis, personalities have:

- `id`: unique identifier
- `name`: display name
- `bigFive`: personality traits (openness, conscientiousness, extraversion, agreeableness, neuroticism)
- `behaviors`: behavioral traits (analytical, empathetic, decisive, curious, patient, humorous, formal, optimistic, cautious, creative, logical, supportive, direct, enthusiastic)
- `customInstructions`: personality-specific instructions
- `createdAt`/`updatedAt`: timestamps

### Mock Data Requirements

- Create mock personality data generators for consistent test data
- Support for both minimal and complete personality data
- Validation test data for error scenarios
- Generate valid bigFive scores (0-100 range)
- Generate valid behavior scores (0-100 range)

## Specific Test Cases

### Default Personalities Loading Tests

- Verify 5 default personalities load on first visit
- Confirm personality names, traits exist
- Test personalities list displays properly
- Verify empty state doesn't show when defaults exist

### Personality Creation Tests

- Create personality with all required fields (name, bigFive, behaviors, customInstructions)
- Test form validation (empty name, duplicate names, invalid trait scores)
- Verify new personality appears in list
- Test modal open/close behavior
- Verify personality persistence after page reload
- Test bigFive and behavior slider interactions

### Personality Editing Tests

- Edit existing personality name and customInstructions
- Edit bigFive trait values
- Edit behavior trait values
- Test form pre-population with existing data
- Verify changes persist after save
- Test cancel functionality (no changes saved)
- Test validation during edit (empty fields, duplicates, invalid scores)

### Personality Deletion Tests

- Delete custom personalities successfully
- Verify confirmation dialog appears
- Test cancel deletion (personality preserved)
- Verify personality removed from list after deletion
- Confirm deletion persistence

## Testing Approach

### Basic Functionality Focus

- Test core happy path scenarios
- Basic error handling and validation
- No comprehensive edge case testing
- No performance or stress testing

### UI Interaction Testing

- Modal opening/closing
- Form field interactions (including sliders for traits)
- Button states and functionality
- List display and updates
- Trait slider interactions and value updates

### Data Persistence Testing

- Changes persist across page reloads
- Storage cleanup between tests
- Proper state management verification

## Technical Requirements

### Test Framework Integration

- Use Playwright for e2e testing
- Follow existing desktop test patterns
- Use existing test helpers and utilities where possible
- Reuse patterns from roles tests implementation

### Storage Management

- Implement proper cleanup between tests
- Handle personalities storage file management
- Ensure clean state for each test

### Error Handling

- Test basic form validation for personality traits
- Verify error messages display correctly for invalid trait values
- Test recovery from error states

## File Structure

```
tests/desktop/features/settings/personalities/
├── index.ts                                     # Barrel file for exports
├── setupPersonalitiesTestSuite.ts              # Main test setup utility
├── openPersonalitiesSection.ts                 # Navigation helper
├── waitForPersonalitiesList.ts                 # Wait helper
├── createMockPersonalityData.ts                # Mock data generator
├── cleanupPersonalitiesStorage.ts              # Storage cleanup
├── personalities-default-loading.spec.ts       # Default personalities tests
├── personalities-creation.spec.ts              # Personality creation tests
├── personalities-editing.spec.ts               # Personality editing tests
└── personalities-deletion.spec.ts              # Personality deletion tests
```

## Success Metrics

- All basic CRUD operations work correctly in e2e environment
- Default personalities load properly on first application start
- Tests run reliably without flakiness
- Test suite is maintainable and follows existing patterns
- Clean separation prevents monolithic test files
- Personality trait validation works correctly

## Implementation Guidance

### Reuse Roles Pattern

- Copy and adapt the exact structure from `tests/desktop/features/settings/roles/`
- Follow the same naming conventions but replace "roles" with "personalities"
- Maintain the same test organization and helper patterns
- Adapt the data generation to match personality structure

### Data Differences from Roles

- Replace `description` and `systemPrompt` with `bigFive`, `behaviors`, and `customInstructions`
- Ensure trait scores are within valid ranges (0-100)
- Test all trait categories (bigFive has 5 traits, behaviors has 14 traits)
- Validate personality form interactions with sliders/inputs

### Navigation and UI

- Personalities section should be accessible in settings modal
- Follow same navigation pattern as roles section
- Adapt UI interaction tests for personality-specific form elements

## Notes

- Follow established patterns from `tests/desktop/features/settings/roles/`
- Reuse existing test infrastructure and helpers where possible
- Focus on user-facing functionality, not internal implementation details
- Ensure tests are simple, focused, and maintainable
- Adapt roles patterns to personality data structure differences
