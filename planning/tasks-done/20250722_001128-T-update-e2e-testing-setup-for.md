---
kind: task
id: T-update-e2e-testing-setup-for
status: done
title: Replace WebdriverIO with Playwright for Electron E2E testing
priority: normal
prerequisites:
  - T-update-build-scripts-and
created: "2025-07-21T22:49:54.403263"
updated: "2025-07-22T00:00:48.400759"
schema_version: "1.1"
worktree: null
---

Replace the current WebdriverIO E2E testing setup with Playwright following BDD principles for better Electron application testing.

**Detailed Context:**
The current E2E testing setup uses WebdriverIO with tauri-driver for testing the Tauri application. With the migration to Electron, we want to replace this entire testing stack with Playwright using BDD structure and Given-When-Then patterns as specified in the project's BDD guidelines.

**Current E2E Setup (to replace):**

- WebdriverIO configuration in tests/desktop/wdio.conf.ts
- WebdriverIO dependencies: @wdio/cli, @wdio/local-runner, @wdio/mocha-framework, @wdio/spec-reporter
- Scripts: test:e2e, test:e2e:headless, test:e2e:container
- Container-based testing with virtual display (Xvfb)

**BDD Structure Requirements:**
Following /Users/zach/.claude/commands/bdd-playwright.md guidelines:

- Feature level: `describe('Feature: [Feature Name]', () => {})`
- Scenario level: `describe('Scenario: [Scenario Description]', () => {})`
- Test level: `it('should [expected behavior]', async () => {})`
- Given-When-Then pattern with clear comments
- Focus on business capabilities, not technical implementation

**Reference Documentation:**
Use context7 MCP tool to research:

- Playwright Electron testing capabilities and setup
- Playwright configuration for desktop applications
- Modern Playwright best practices (2025)
- Container-based Playwright testing with Electron

**Specific Implementation Requirements:**

1. Remove WebdriverIO dependencies from apps/desktop/package.json:
   - @wdio/cli, @wdio/local-runner, @wdio/mocha-framework, @wdio/spec-reporter
   - webdriverio package
2. Install Playwright dependencies:
   - @playwright/test
   - playwright (with Electron support)
3. Replace tests/desktop/wdio.conf.ts with playwright.config.ts
4. Create BDD-structured test files following naming conventions:
   - Use `.spec.ts` suffix and kebab-case naming
   - Organize by business features: `__tests__/features/`
   - Create `app-startup.spec.ts` for Hello World verification
5. Update test scripts in package.json to use Playwright
6. Create support utilities following BDD guidelines:
   - `app-helpers.ts` for Electron launch/control utilities
   - `test-data.ts` for test data builders

**Technical Approach:**

1. Remove all WebdriverIO related dependencies
2. Install Playwright with Electron support:
   ```bash
   pnpm add -D @playwright/test playwright
   ```
3. Create playwright.config.ts configuration:
   - Configure for Electron application testing
   - Set up test directories following BDD structure
   - Configure browsers and test environments
4. Create BDD test structure:
   ```
   __tests__/
   ├── features/
   │   └── shared/
   │       └── app-startup.spec.ts
   ├── support/
   │   ├── app-helpers.ts
   │   └── test-data.ts
   └── fixtures/
   ```
5. Update package.json scripts:
   - Replace wdio commands with playwright commands
   - Maintain headless and container testing modes
6. Create basic BDD test for Hello World Electron app using Given-When-Then structure
7. Ensure Xvfb compatibility for container testing

**BDD Test Structure Example:**

```typescript
describe("Feature: Application Startup", () => {
  describe("Scenario: First application launch", () => {
    it("should display Hello World message", async () => {
      // Given - Fresh application state
      // When - Application is launched
      // Then - Hello World is visible
    });
  });
});
```

**Files to Create/Update:**

- tests/desktop/playwright.config.ts (new, replaces wdio.conf.ts)
- **tests**/features/shared/app-startup.spec.ts (new BDD test)
- **tests**/support/app-helpers.ts (new Electron utilities)
- apps/desktop/package.json (update dependencies and scripts)
- Root package.json (update E2E commands)

**New Script Structure:**

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headless": "Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 & sleep 2 && DISPLAY=:99 playwright test",
    "test:e2e:container": "playwright test --headed=false"
  }
}
```

**Detailed Acceptance Criteria:**

- All WebdriverIO dependencies removed from package.json
- Playwright successfully configured for Electron testing
- BDD test structure follows project guidelines:
  - Feature/Scenario/Test hierarchy using describe/it blocks
  - Given-When-Then comments in test implementations
  - Business-focused naming (not technical implementation)
  - Files organized by business domains in **tests**/features/
- Basic E2E test launches Electron app and verifies Hello World display
- Support utilities created (app-helpers.ts, test-data.ts)
- Headless mode works in CI/CD environment
- Container testing works with virtual display (Xvfb)
- Test scripts (headless, container modes) function correctly
- No WebdriverIO configuration files remain
- Tests use Playwright best practices:
  - `data-testid` selectors where applicable
  - Proper async/await patterns
  - Built-in Playwright assertions (`toBeVisible()`, etc.)

**Dependencies on Other Tasks:**

- Must complete T-update-build-scripts-and to have working Electron app
- Can run in parallel with T-update-documentation-for

**Security Considerations:**

- Ensure Playwright tests don't expose application internals
- Verify test environment isolation
- Test security features like CSP in Playwright environment
- Configure secure test data handling

**Testing Requirements:**

- Basic BDD test launches Electron app and verifies Hello World display
- Test follows Given-When-Then structure with clear business language
- Screenshots and test artifacts are captured appropriately
- Headless mode works without GUI dependencies
- Test teardown properly closes Electron processes
- Playwright test runner integrates with development workflow
- Test reports are generated in appropriate format for CI/CD
- File organization matches BDD guidelines (business domains, not technical layers)

### Log

**2025-07-22T05:11:28.813993Z** - Successfully replaced WebdriverIO with Playwright for Electron E2E testing following BDD principles. Removed all WebdriverIO dependencies and configuration, installed Playwright with Electron support, created BDD-structured test files with Given-When-Then patterns, and implemented comprehensive support utilities. All quality checks passed including linting, formatting, and building. The new setup supports headless testing, container environments with Xvfb, and proper test isolation.

- filesChanged: ["apps/desktop/package.json", "tests/desktop/playwright.config.ts", "tests/desktop/features/shared/app-startup.spec.ts", "tests/desktop/support/app-helpers.ts", "tests/desktop/support/test-data.ts"]
