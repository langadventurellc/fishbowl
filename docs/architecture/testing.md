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

### Desktop E2E Tests (WebdriverIO)

**tests/desktop/wdio.conf.ts**

```typescript
export const config = {
  runner: "local",
  specs: ["./features/**/*.spec.ts"],
  maxInstances: 1,
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        binary: "../../apps/desktop/dist-electron/main.js",
        args: ["--no-sandbox", "--disable-web-security"],
      },
    },
  ],
  logLevel: "warn",
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ["chromedriver"],
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
    await browser.url("http://localhost:5173");
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

unknown
