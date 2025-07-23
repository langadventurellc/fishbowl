# Mobile E2E Tests

This directory contains end-to-end tests for the mobile application using Detox.

## Structure

- `features/` - Test feature files organized by functionality
- `support/` - Test support utilities and helpers
- `jest.config.js` - Jest configuration for Detox tests
- `package.json` - Dependencies and scripts

## Usage

### Prerequisites

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Ensure the mobile app is built and configured for testing

### Running Tests

```bash
# Run all mobile E2E tests
pnpm test:e2e:mobile

# Run tests headless
pnpm test:e2e:mobile:headless
```

## Test Structure

Tests follow BDD (Behavior Driven Development) patterns using Detox:

```javascript
describe("Feature: Application Launch", () => {
  describe("Scenario: Mobile app starts successfully", () => {
    it("should launch without errors", async () => {
      // Given - Application is starting up
      // When - Application loads
      // Then - Application content is displayed and responsive
    });
  });
});
```

## Configuration

The Jest configuration is set up to:

- Run tests from the `features/` directory
- Use Detox test environment
- Load setup files from `support/`
- Set appropriate timeouts for mobile testing

## Troubleshooting

- **"Device not found"**: Ensure emulator/simulator is running
- **"App not installed"**: Build and install the mobile app first
- **Timeout issues**: Increase test timeout values in jest.config.js
