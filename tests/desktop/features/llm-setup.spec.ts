import { expect, test } from "@playwright/test";
import { readFile, unlink } from "fs/promises";
import path from "path";
import type { ElectronApplication, Page } from "playwright";
import playwright from "playwright";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
// Local type definitions for testing
type Provider = "openai" | "anthropic";

const { _electron: electron } = playwright;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test helpers interface matching existing pattern
interface TestHelpers {
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  isSettingsModalOpen: () => boolean;
}

// Test data factory types
interface MockLlmConfig {
  customName: string;
  provider: Provider;
  apiKey: string;
  baseUrl?: string;
  useAuthHeader: boolean;
}

// Storage cleanup helper functions
const cleanupLlmStorage = async (configPath: string, keysPath: string) => {
  // Delete JSON config file
  try {
    await unlink(configPath);
  } catch {
    // File might not exist, that's fine
  }

  // Delete secure keys file
  try {
    await unlink(keysPath);
  } catch {
    // File might not exist, that's fine
  }
};

// Verify storage is clean
const verifyCleanStorage = async (configPath: string, keysPath: string) => {
  try {
    await readFile(configPath, "utf-8");
    return false; // File exists, not clean
  } catch {
    // File doesn't exist, check secure storage
    try {
      await readFile(keysPath, "utf-8");
      return false; // File exists, not clean
    } catch {
      return true; // Both files don't exist, storage is clean
    }
  }
};

test.describe("Feature: LLM Setup Configuration", () => {
  let electronApp: ElectronApplication;
  let window: Page;
  let userDataPath: string;
  let llmConfigPath: string;
  let secureKeysPath: string;

  test.beforeAll(async () => {
    // Launch Electron app with test environment
    const electronPath = path.join(
      __dirname,
      "../../../apps/desktop/dist-electron/electron/main.js",
    );

    const launchArgs = [electronPath];
    if (process.env.CI) {
      launchArgs.push("--no-sandbox");
    }

    electronApp = await electron.launch({
      args: launchArgs,
      timeout: 30000,
      env: {
        ...process.env,
        NODE_ENV: "test", // Enable test helpers
      },
    });

    window = await electronApp.firstWindow();
    await window.waitForLoadState("domcontentloaded");
    await window.waitForLoadState("networkidle");
  });

  test.beforeEach(async () => {
    // Get storage paths
    try {
      userDataPath = await electronApp.evaluate(async ({ app }) => {
        return app.getPath("userData");
      });

      llmConfigPath = path.join(userDataPath, "llm_config.json");
      secureKeysPath = path.join(userDataPath, "secure_keys.json");

      // Clean up both storage locations
      await cleanupLlmStorage(llmConfigPath, secureKeysPath);
    } catch (error) {
      console.warn("Could not setup clean test state:", error);
    }

    // Ensure modal is closed before each test
    await window.evaluate(() => {
      const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
        .__TEST_HELPERS__;
      if (helpers?.isSettingsModalOpen()) {
        helpers!.closeSettingsModal();
      }
    });

    // Force reload the page to ensure fresh state
    await window.reload();
    await window.waitForLoadState("domcontentloaded");
    await window.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    // Ensure modal is closed
    try {
      await window.evaluate(() => {
        const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
          .__TEST_HELPERS__;
        if (helpers?.isSettingsModalOpen()) {
          helpers!.closeSettingsModal();
        }
      });
    } catch {
      // Window might be closed, ignore
    }

    // Clean up storage after each test
    if (llmConfigPath && secureKeysPath) {
      await cleanupLlmStorage(llmConfigPath, secureKeysPath);
    }
  });

  test.afterAll(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  // Navigation helper to open LLM Setup section
  const openLlmSetupSection = async () => {
    // Open settings modal
    await window.evaluate(() => {
      const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
        .__TEST_HELPERS__;
      helpers!.openSettingsModal();
    });

    await expect(
      window.locator('[data-testid="settings-modal"]'),
    ).toBeVisible();

    // Navigate to LLM Setup tab
    const llmSetupNavItem = window
      .locator("button")
      .filter({ hasText: "LLM Setup" });
    await llmSetupNavItem.click();

    // Wait for LLM setup content to be visible
    await expect(
      window.locator("h1").filter({ hasText: "LLM Setup" }),
    ).toBeVisible();
  };

  // Helper to wait for empty state
  const waitForEmptyState = async () => {
    await expect(
      window.locator("text=No LLM providers configured"),
    ).toBeVisible();
  };

  // Helper to wait for configuration list
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const waitForConfigurationList = async () => {
    await expect(
      window.locator('[data-testid="llm-provider-card"]').first(),
    ).toBeVisible({ timeout: 5000 });
  };

  // Test data factory functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createMockOpenAiConfig = (
    overrides?: Partial<MockLlmConfig>,
  ): MockLlmConfig => {
    return {
      customName: `Test OpenAI ${randomUUID().slice(0, 8)}`,
      provider: "openai",
      apiKey: `sk-test-${randomUUID()}`,
      baseUrl: "https://api.openai.com/v1",
      useAuthHeader: false,
      ...overrides,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createMockAnthropicConfig = (
    overrides?: Partial<MockLlmConfig>,
  ): MockLlmConfig => {
    return {
      customName: `Test Anthropic ${randomUUID().slice(0, 8)}`,
      provider: "anthropic",
      apiKey: `sk-ant-test-${randomUUID()}`,
      baseUrl: "https://api.anthropic.com",
      useAuthHeader: false,
      ...overrides,
    };
  };

  // Helper to fill configuration form
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fillConfigurationForm = async (config: MockLlmConfig) => {
    // Fill custom name
    const nameInput = window.locator('[name="customName"]');
    await nameInput.fill(config.customName);

    // Fill API key
    const apiKeyInput = window.locator('[name="apiKey"]');
    await apiKeyInput.fill(config.apiKey);

    // Fill base URL if different from default
    if (config.baseUrl) {
      const baseUrlInput = window.locator('[name="baseUrl"]');
      await baseUrlInput.clear();
      await baseUrlInput.fill(config.baseUrl);
    }

    // Toggle auth header if needed
    if (config.useAuthHeader) {
      const authHeaderSwitch = window.locator(
        '[data-testid="auth-header-switch"]',
      );
      await authHeaderSwitch.click();
    }
  };

  // Placeholder test to verify setup
  test("should initialize test environment correctly", async () => {
    // Verify storage is clean
    const isClean = await verifyCleanStorage(llmConfigPath, secureKeysPath);
    expect(isClean).toBe(true);

    // Verify we can open the settings modal
    await openLlmSetupSection();

    // Verify empty state is shown
    await waitForEmptyState();

    // Close modal
    await window.evaluate(() => {
      const helpers = (window as { __TEST_HELPERS__?: TestHelpers })
        .__TEST_HELPERS__;
      helpers!.closeSettingsModal();
    });
  });
});
