---
id: T-fix-ci-environment-variables
title: Fix CI environment variables for Electron safeStorage support
status: done
priority: high
prerequisites: []
affectedFiles:
  .github/workflows/ci.yml: Added XDG_CURRENT_DESKTOP=GNOME environment variable
    to the 'Run E2E tests' step to enable Electron safeStorage support in
    headless CI environment
log:
  - Fixed CI environment variables for Electron safeStorage support by adding
    XDG_CURRENT_DESKTOP=GNOME to the desktop E2E test step in GitHub Actions
    workflow. This resolves the issue where LLM setup tests were failing in CI
    due to Electron's safeStorage API hanging when desktop environment is not
    recognized in headless Linux environments. The fix enables safeStorage to
    properly detect the desktop environment and use the appropriate key storage
    backend, preventing modal timeout failures in tests that create or edit LLM
    configurations.
schema: v1.0
childrenIds: []
created: 2025-08-09T02:40:56.177Z
updated: 2025-08-09T02:40:56.177Z
---

# Fix CI Environment Variables for Electron safeStorage Support

## Context

The desktop end-to-end tests are failing in CI with modal timeouts in LLM setup tests. Research shows this is caused by Electron's safeStorage API failing in headless Linux environments when `XDG_CURRENT_DESKTOP` is not set to a recognized desktop environment.

## Problem Details

- All 18 failed tests involve creating LLM configurations that use safeStorage for API keys
- Tests pass locally (proper desktop environment) but fail in CI (headless Xvfb)
- Error pattern: `await expect(modal).not.toBeVisible({ timeout: 5000 })` fails because modal never closes
- Root cause: safeStorage write operations hang when desktop environment is unrecognized

## Research References

- Electron Issue #39789: safeStorage detection fails on Linux outside of predefined desktop environments
- Electron docs: safeStorage requires XDG_CURRENT_DESKTOP set to values like "GNOME", "ubuntu:GNOME", "X-Cinnamon", "Deepin", "Pantheon", "XFCE", "UKUI", or "unity"

## Implementation Requirements

### 1. Update GitHub Actions Workflow

**File**: `.github/workflows/[workflow-name].yml` (find the workflow that runs `pnpm test:e2e:desktop:headless`)

Add environment variable before the test step:

```yaml
- name: Run Desktop E2E Tests
  env:
    XDG_CURRENT_DESKTOP: GNOME
  run: pnpm test:e2e:desktop:headless
```

### 2. Update Package.json Script (Alternative)

**File**: `apps/desktop/package.json`

Current failing command:

```json
"test:e2e:headless": "pnpm --filter=@fishbowl-ai/shared build && pnpm run build:renderer && pnpm run build:main && (Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 & sleep 2; DISPLAY=:99 playwright test -c ../../tests/desktop/playwright.config.ts)"
```

Update to:

```json
"test:e2e:headless": "pnpm --filter=@fishbowl-ai/shared build && pnpm run build:renderer && pnpm run build:main && (Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 & sleep 2; XDG_CURRENT_DESKTOP=GNOME DISPLAY=:99 playwright test -c ../../tests/desktop/playwright.config.ts)"
```

## Acceptance Criteria

- [ ] CI environment has `XDG_CURRENT_DESKTOP=GNOME` set during desktop E2E test execution
- [ ] LLM setup tests that create configurations pass in CI
- [ ] Existing non-LLM tests continue to pass
- [ ] No regression in local test execution
- [ ] Tests that previously timed out on modal close operations now complete successfully

## Testing Instructions

1. Implement the environment variable fix
2. Push to a feature branch and open PR to trigger CI
3. Monitor the desktop E2E test results in GitHub Actions
4. Verify that tests like "creates Anthropic configuration successfully" and "edits existing configuration successfully" now pass
5. Check that the test summary shows 0 failed tests instead of 18 failed tests

## Dependencies

- Requires access to modify CI workflow files or package.json
- Must coordinate with existing CI pipeline configuration

## Security Considerations

- Setting XDG_CURRENT_DESKTOP=GNOME only affects desktop environment detection
- No security implications as this is only used for CI testing
- Does not change production application behavior
