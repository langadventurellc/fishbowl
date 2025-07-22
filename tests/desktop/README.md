# Desktop E2E Tests

This directory contains end-to-end tests for the desktop application using WebdriverIO.

## Platform Support

**Important**: WebDriver testing with Tauri is currently only supported on **Linux and Windows**. macOS is not supported due to the lack of a WKWebView WebDriver implementation.

### Supported Platforms:
- ✅ Linux (uses WebKitWebDriver)
- ✅ Windows (uses Microsoft Edge Driver)  
- ❌ macOS (WKWebView driver not available)

## Structure

- `features/` - Test feature files
- `support/` - Test support utilities and helpers
- `wdio.conf.ts` - WebdriverIO configuration

## Usage

### Prerequisites

1. Install `tauri-driver` (Linux/Windows only):
   ```bash
   cargo install tauri-driver
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running Tests

**Linux/Windows:**
```bash
pnpm test:e2e:desktop
```

**macOS Alternative Testing:**

Since WebDriver E2E tests aren't supported on macOS, consider these alternatives:

1. **Unit Testing**: Focus on testing business logic in the shared package
   ```bash
   pnpm test:unit
   ```

2. **Manual Testing**: Test the app manually using the development server
   ```bash
   pnpm dev:desktop
   ```

3. **CI/CD Testing**: Set up GitHub Actions to run E2E tests on Linux runners

## Test Structure

Tests follow BDD (Behavior Driven Development) patterns:

```typescript
describe('Feature: Application Launch', () => {
  describe('Scenario: Desktop app starts successfully', () => {
    it('should launch without errors', async () => {
      // Given - Application is starting up
      // When - Application loads  
      // Then - Application window is displayed and responsive
    });
  });
});
```

## CI/CD Setup

Add this to your GitHub Actions workflow for cross-platform testing:

```yaml
- name: Run E2E tests (Linux)
  if: matrix.os == 'ubuntu-latest'
  run: |
    cargo install tauri-driver
    pnpm test:e2e:desktop
```

## Troubleshooting

- **"tauri-driver is not supported on this platform"**: You're on macOS - use alternative testing approaches above
- **App bundle installation prompts**: Tests should use the raw executable, not .app bundles
- **WebDriver connection issues**: Ensure tauri-driver is installed and running