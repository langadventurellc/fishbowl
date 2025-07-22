import { PlaywrightTestConfig } from "@playwright/test";
import path from "path";

const config: PlaywrightTestConfig = {
  // Test directory for Electron E2E tests
  testDir: "./features",

  // Test timeout configuration
  timeout: 60000, // 60 seconds for Electron app startup
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  // Global timeout for entire test run
  globalTimeout: 600000, // 10 minutes

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Run tests in parallel
  fullyParallel: false, // Set to false for Electron to avoid conflicts
  workers: 1, // Single worker for Electron to prevent port conflicts

  // Reporter configuration
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  // Output directory for test artifacts
  outputDir: "test-results",

  use: {
    // Collect trace when retrying failed tests
    trace: "on-first-retry",

    // Capture screenshots on failure
    screenshot: "only-on-failure",

    // Record video on first retry
    video: "on-first-retry",

    // Electron-specific configurations will be in projects
    headless: false,
  },

  // Configure Electron testing project
  projects: [
    {
      name: "electron",
      testMatch: "**/*.spec.ts",
      use: {
        // Electron configuration is handled in test fixtures
        viewport: { width: 1200, height: 800 },
      },
    },
  ],

  // Web server configuration - not needed for Electron but keeping structure
  // webServer: undefined,
};

export default config;
