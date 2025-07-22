---
kind: task
id: T-set-up-detox-e2e-testing
title: Set up Detox E2E testing framework for mobile app
status: open
priority: normal
prerequisites:
  - T-create-hello-world-mobile-app
  - T-set-up-mobile-app-scripts-and
created: "2025-07-22T11:42:11.623748"
updated: "2025-07-22T11:42:11.623748"
schema_version: "1.1"
---

Configure Detox for end-to-end testing of the React Native mobile app, providing minimal but essential E2E test coverage.

**Context**: The desktop app uses Playwright for E2E testing. The mobile app needs equivalent E2E testing using Detox, the standard for React Native E2E testing, as documented in the architecture.

**Technical Approach**:

1. Install and configure Detox for React Native testing
2. Set up test configuration for iOS and Android simulators
3. Create basic E2E test for app startup and navigation
4. Configure test scripts and CI readiness
5. Follow architecture patterns from docs/architecture/testing.md

**Detailed Implementation Requirements**:

**Detox installation and setup**:

- Install detox, detox CLI, and dependencies
- Configure detox.config.js following the documented structure from architecture/testing.md
- Set up iOS simulator configuration (iPhone 14)
- Set up Android emulator configuration (Pixel_6_API_33)

**Test configuration**:

```javascript
// detox.config.js structure based on docs
- Configure iOS and Android app builds
- Set up device configurations for simulators
- Configure test runner (Jest)
- Set up proper build commands for each platform
```

**E2E test implementation**:

- Create `e2e/` directory in mobile app root
- Implement basic app startup test
- Add navigation test between Dashboard and Settings tabs
- Test Hello World content display
- Follow BDD patterns with Given/When/Then structure

**Example test structure**:

```typescript
// e2e/app-startup.e2e.ts
describe("Mobile App Startup", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it("should display Hello World on Dashboard", async () => {
    // Test implementation following documented patterns
  });

  it("should navigate between tabs", async () => {
    // Tab navigation testing
  });
});
```

**Build integration**:

- Configure detox build commands in package.json
- Set up debug builds for testing
- Configure proper test:e2e script that builds and tests

**Minimal test coverage**:

- App launches successfully
- Basic navigation works
- Key UI elements are accessible
- No critical crashes during basic user flows

**Acceptance Criteria**:

- Detox configuration works for both iOS and Android
- `pnpm test:e2e` runs basic E2E tests successfully
- Tests can launch the app in simulator
- Basic navigation test passes
- Hello World content is verified programmatically
- Test runs are deterministic and reliable
- Integration with monorepo E2E testing pipeline
- Proper cleanup after test runs

**Dependencies**: Requires T-create-hello-world-mobile-app and T-set-up-mobile-app-scripts-and

**Security Considerations**: Ensure test builds don't include production secrets or API keys

**Testing Requirements**: E2E tests should be fast, reliable, and provide meaningful validation of core app functionality

### Log
