# Fishbowl AI - Electron Testing Architecture

See the [monorepo architecture guide](./monorepo.md) for an overview of the project structure and technology stack.

## Testing Strategy (BDD)

### Shared Test Utilities

**packages/shared/src/testing/test-data.ts**

```typescript
export const TestData = {
  users: {
    valid: {
      email: "test@fishbowl.ai",
      password: "TestPassword123!",
      name: "Test User",
    },
    invalid: {
      email: "invalid-email",
      password: "123", // Too short
      name: "",
    },
  },

  aiProviders: {
    openai: {
      name: "openai",
      apiKey: "sk-test-key",
      model: "gpt-3.5-turbo",
    },
    anthropic: {
      name: "anthropic",
      apiKey: "test-anthropic-key",
      model: "claude-3-sonnet-20240229",
    },
  },
};
```

### Desktop E2E Tests (Playwright)

(needs playwright setup)

### Mobile E2E Tests (Detox)

**tests/mobile/detox.config.js**

```javascript
module.exports = {
  testRunner: "jest",
  runnerConfig: "e2e/jest.config.js",
  skipLegacyWorkersInjection: true,
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath:
        "apps/mobile/ios/build/Build/Products/Debug-iphonesimulator/FishbowlAI.app",
      build:
        "cd apps/mobile && xcodebuild -workspace ios/FishbowlAI.xcworkspace -scheme FishbowlAI -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
    },
    "android.debug": {
      type: "android.apk",
      binaryPath:
        "apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk",
      build:
        "cd apps/mobile/android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
    },
  },
  devices: {
    simulator: {
      "type": "ios.simulator",
      "device": {
        "type": "iPhone 15" // or latest available simulator
      }
    },
    "emulator": {
      "type": "android.emulator",
      "device": {
        "avdName": "Pixel_7_API_34" // or latest available emulator
    },
  },
  configurations: {
    "ios.sim.debug": {
      device: "simulator",
      app: "ios.debug",
    },
    "android.emu.debug": {
      device: "emulator",
      app: "android.debug",
    },
  },
};
```

**tests/mobile/features/ai-configuration.e2e.ts**

```typescript
describe("Feature: AI Provider Configuration", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe("Scenario: Add OpenAI API key", () => {
    it("should save API key securely", async () => {
      // Given - User is on settings screen
      await element(by.id("settingsTab")).tap();
      await expect(element(by.id("settingsScreen"))).toBeVisible();

      // When - User enters OpenAI API key
      await element(by.id("addProviderButton")).tap();
      await element(by.id("providerPicker")).tap();
      await element(by.text("OpenAI")).tap();
      await element(by.id("apiKeyInput")).typeText("sk-test-key-123");
      await element(by.id("saveApiKeyButton")).tap();

      // Then - API key is saved and provider is available
      await expect(element(by.id("provider-openai"))).toBeVisible();
      await expect(
        element(by.text("Active").withAncestor(by.id("provider-openai"))),
      ).toBeVisible();
    });
  });

  describe("Scenario: Test AI provider connection", () => {
    it("should verify API key works", async () => {
      // Given - Provider is configured
      await element(by.id("settingsTab")).tap();

      // When - User tests the connection
      await element(by.id("testOpenAIConnection")).tap();

      // Then - Connection test passes
      await waitFor(element(by.text("Connected")))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
```
