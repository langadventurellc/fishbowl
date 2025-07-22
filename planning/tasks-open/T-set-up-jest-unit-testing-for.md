---
kind: task
id: T-set-up-jest-unit-testing-for
title: Set up Jest unit testing for mobile app
status: open
priority: normal
prerequisites:
  - T-create-hello-world-mobile-app
created: "2025-07-22T11:41:52.856925"
updated: "2025-07-22T11:41:52.856925"
schema_version: "1.1"
---

Configure Jest and React Native Testing Library for unit testing the mobile app, following the desktop app testing patterns.

**Context**: The desktop app has Jest configured for unit testing. The mobile app needs similar testing infrastructure to ensure code quality and enable TDD practices.

**Technical Approach**:

1. Configure Jest for React Native testing environment
2. Set up React Native Testing Library
3. Create test utilities and setup files
4. Add example tests for the Hello World screens
5. Configure test scripts and coverage

**Detailed Implementation Requirements**:

**Jest configuration**:

- Create jest.config.js with React Native preset
- Configure test environment for React Native components
- Set up module mapping for shared packages (@fishbowl-ai/shared, @fishbowl-ai/ui-theme)
- Configure transform and setup files

**Testing library setup**:

- Install and configure @testing-library/react-native
- Install jest-expo for Expo compatibility
- Set up test utilities file similar to desktop pattern
- Configure mock providers for testing

**Test structure**:

- Create `src/__tests__/` directory structure
- Add test files for DashboardScreen and SettingsScreen
- Follow BDD testing patterns: describe/test structure with Given/When/Then comments
- Include navigation testing examples

**Example test implementation**:

```typescript
// src/screens/__tests__/DashboardScreen.test.tsx
- Test that screen renders without crashing
- Test that Hello World message is displayed
- Test screen accessibility features
- Mock navigation prop appropriately
```

**Configuration files**:

- `jest.config.js` - Main Jest configuration
- `src/test-utils.tsx` - Testing utilities and custom render functions
- `jest.setup.js` - Global test setup and mocks

**Coverage configuration**:

- Set up coverage thresholds
- Configure coverage reporting
- Exclude proper files from coverage (config, types, etc.)

**Acceptance Criteria**:

- `pnpm test` runs all mobile unit tests successfully
- Tests pass with meaningful assertions
- Coverage reports are generated properly
- Test utilities work for component testing
- Navigation mocking works correctly
- Integration with monorepo test pipeline
- TypeScript types work correctly in tests
- Tests run fast and provide useful feedback

**Dependencies**: Requires T-create-hello-world-mobile-app to be completed

**Security Considerations**: Ensure test mocks don't expose sensitive data patterns

**Testing Requirements**: Tests themselves should be well-structured and follow established patterns from desktop app

### Log
