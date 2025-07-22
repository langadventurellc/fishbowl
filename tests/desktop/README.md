# Desktop E2E Tests

This directory contains end-to-end tests for the desktop application using WebdriverIO.

## Platform Support

WebDriver testing with Electron is supported on **Linux, Windows, and macOS**. For consistent testing across platforms, use the **dev container** approach.

### Supported Platforms:

- ✅ Linux (uses WebKitWebDriver)
- ✅ Windows (uses Microsoft Edge Driver)
- ✅ macOS (via Linux dev container)

## Structure

- `features/` - Test feature files
- `support/` - Test support utilities and helpers
- `wdio.conf.ts` - WebdriverIO configuration

## Usage

### Prerequisites

**For all platforms (native):**

1. Install WebdriverIO dependencies:
   ```bash
   pnpm install
   ```

**For dev container (any platform):**

1. Open project in dev container (VS Code with Dev Containers extension)
2. Container will automatically install dependencies and set up virtual display

### Running Tests

**Native Linux/Windows:**

```bash
pnpm test:e2e:desktop
```

**Dev Container (any platform including macOS):**

```bash
# Setup virtual display and run tests
pnpm container:test-ready
pnpm test:e2e:desktop:container

# Or run headless tests directly
pnpm test:e2e:desktop:headless
```

**Development in Container:**

```bash
# Build for container (no GUI display)
pnpm dev:desktop:container

# Build production app in container
pnpm build:desktop:container
```

## Test Structure

Tests follow BDD (Behavior Driven Development) patterns:

```typescript
describe("Feature: Application Launch", () => {
  describe("Scenario: Desktop app starts successfully", () => {
    it("should launch without errors", async () => {
      // Given - Application is starting up
      // When - Application loads
      // Then - Application window is displayed and responsive
    });
  });
});
```

## Container Workflow

The dev container provides a Linux environment with all necessary tools pre-installed:

- **Virtual Display**: Xvfb for headless GUI testing
- **WebDriver**: ChromeDriver for Electron app automation
- **Dependencies**: All build tools and dependencies

### Container Commands:

```bash
# Setup virtual display
pnpm container:setup

# Verify container is ready for testing
pnpm container:test-ready

# Run tests in container
DISPLAY=:99 pnpm test:e2e:desktop:headless
```

## CI/CD Setup

Add this to your GitHub Actions workflow:

```yaml
- name: Run E2E tests
  run: |
    # Setup virtual display 
    pnpm container:setup
    # Run tests
    pnpm test:e2e:desktop:container
```

## Troubleshooting

- **"ChromeDriver connection issues"**: Ensure ChromeDriver is installed and running
- **"Display :99 not found"**: Run `pnpm container:setup` first
- **App startup issues**: Ensure Electron app builds successfully before running tests
- **WebDriver connection issues**: Ensure virtual display is active and app is accessible
