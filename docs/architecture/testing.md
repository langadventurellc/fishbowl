# Fishbowl AI - Tauri + React Native Testing Architecture

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

### Desktop E2E Tests (WebdriverIO)

**tests/desktop/wdio.conf.ts**

```typescript
export const config = {
  runner: "local",
  specs: ["./features/**/*.spec.ts"],
  maxInstances: 1,
  capabilities: [
    {
      browserName: "tauri",
      "tauri:options": {
        application: "../../apps/desktop/src-tauri/target/debug/fishbowl-ai",
        webdriverOptions: {
          host: "localhost",
          port: 4444,
        },
      },
    },
  ],
  logLevel: "warn",
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ["tauri"],
  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
};
```

**tests/desktop/features/ai-configuration.spec.ts**

```typescript
describe("Feature: AI Provider Configuration", () => {
  beforeAll(async () => {
    await browser.url("tauri://localhost");
  });

  describe("Scenario: Add OpenAI API key", () => {
    it("should save API key securely", async () => {
      // Given - User is on settings page
      await $('[data-testid="settings-button"]').click();
      await expect($('[data-testid="settings-page"]')).toBeDisplayed();

      // When - User enters OpenAI API key
      await $('[data-testid="add-provider-button"]').click();
      await $('[data-testid="provider-select"]').selectByAttribute(
        "value",
        "openai",
      );
      await $('[data-testid="api-key-input"]').setValue("sk-test-key-123");
      await $('[data-testid="save-api-key"]').click();

      // Then - API key is saved and provider is available
      await expect($('[data-testid="provider-openai"]')).toBeDisplayed();
      await expect($('[data-testid="provider-openai-status"]')).toHaveText(
        "Active",
      );
    });
  });

  describe("Scenario: Test AI provider connection", () => {
    it("should verify API key works", async () => {
      // Given - Provider is configured
      await $('[data-testid="settings-button"]').click();

      // When - User tests the connection
      await $('[data-testid="test-openai-connection"]').click();

      // Then - Connection test passes
      await expect($('[data-testid="connection-status"]')).toHaveText(
        "Connected",
      );
    });
  });
});
```

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
      type: "ios.simulator",
      device: { type: "iPhone 14" },
    },
    emulator: {
      type: "android.emulator",
      device: { avdName: "Pixel_6_API_33" },
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

### Unit Testing

**packages/shared/src/services/ai/**tests**/ai-service.test.ts**

```typescript
import { AIService } from "../index";
import { SecureStorage } from "../../secure-storage";

// Mock secure storage
const mockSecureStorage: SecureStorage = {
  saveAPIKey: jest.fn(),
  getAPIKey: jest.fn(),
  getAPIKeys: jest.fn().mockResolvedValue([]),
  removeAPIKey: jest.fn(),
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

describe("AIService", () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService(mockSecureStorage);
    jest.clearAllMocks();
  });

  describe("addProvider", () => {
    it("should save API key and initialize provider", async () => {
      // Given
      const provider = "openai";
      const apiKey = "sk-test-123";

      // When
      await aiService.addProvider(provider, apiKey);

      // Then
      expect(mockSecureStorage.saveAPIKey).toHaveBeenCalledWith(
        provider,
        apiKey,
      );
      expect(aiService.getAvailableProviders()).toContain(provider);
    });

    it("should throw error for unknown provider", async () => {
      // Given
      const provider = "unknown";
      const apiKey = "test-key";

      // When/Then
      await expect(aiService.addProvider(provider, apiKey)).rejects.toThrow(
        "Unknown provider: unknown",
      );
    });
  });
});
```
