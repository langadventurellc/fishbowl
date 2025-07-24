import path from "path";
import {
  type ElectronApplication,
  type Page,
  _electron as electron,
} from "playwright";
import { AppInstance } from "support/AppInstance";

export class FishbowlApp {
  private electronApp: ElectronApplication | null = null;
  private mainWindow: Page | null = null;

  /**
   * Launch the Fishbowl Electron application
   */
  async launch(
    options: {
      timeout?: number;
      headless?: boolean;
      recordVideo?: boolean;
      videoDir?: string;
    } = {},
  ): Promise<AppInstance> {
    const {
      timeout = 30000,
      recordVideo = false,
      videoDir = "test-results/videos",
    } = options;

    // Path to the main Electron app file
    const electronPath = path.resolve(
      __dirname,
      "../../../apps/desktop/dist-electron/main.js",
    );

    const launchOptions: {
      args: string[];
      timeout: number;
      recordVideo?: { dir: string };
    } = {
      args: [electronPath],
      timeout,
    };

    // Add video recording if requested
    if (recordVideo) {
      launchOptions.recordVideo = {
        dir: videoDir,
      };
    }

    this.electronApp = await electron.launch(launchOptions);

    // Get the first window
    this.mainWindow = await this.electronApp.firstWindow();

    // Wait for the window to be ready
    await this.mainWindow.waitForLoadState("domcontentloaded");

    return {
      app: this.electronApp,
      window: this.mainWindow,
    };
  }

  /**
   * Close the application gracefully
   */
  async close(): Promise<void> {
    if (this.electronApp) {
      await this.electronApp.close();
      this.electronApp = null;
      this.mainWindow = null;
    }
  }

  /**
   * Get the main application window
   */
  getMainWindow(): Page {
    if (!this.mainWindow) {
      throw new Error("Application not launched. Call launch() first.");
    }
    return this.mainWindow;
  }

  /**
   * Wait for the application to be fully ready
   */
  async waitForReady(timeout: number = 10000): Promise<void> {
    const window = this.getMainWindow();
    await window.waitForLoadState("networkidle", { timeout });

    // Additional check - ensure the app content is loaded
    await window.waitForSelector("body", { timeout });
  }

  /**
   * Take a screenshot of the current application state
   */
  async takeScreenshot(
    name: string,
    options: {
      fullPage?: boolean;
      path?: string;
    } = {},
  ): Promise<Buffer> {
    const window = this.getMainWindow();
    const screenshot = await window.screenshot({
      fullPage: options.fullPage || false,
      path: options.path,
    });

    return screenshot;
  }

  /**
   * Simulate user interaction - click on element
   */
  async clickElement(
    selector: string,
    options: {
      timeout?: number;
      force?: boolean;
    } = {},
  ): Promise<void> {
    const window = this.getMainWindow();
    await window.click(selector, {
      timeout: options.timeout || 5000,
      force: options.force || false,
    });
  }

  /**
   * Type text into an input element
   */
  async typeText(
    selector: string,
    text: string,
    options: {
      timeout?: number;
      delay?: number;
    } = {},
  ): Promise<void> {
    const window = this.getMainWindow();
    await window.fill(selector, text, {
      timeout: options.timeout || 5000,
    });
  }

  /**
   * Get text content from an element
   */
  async getTextContent(
    selector: string,
    options: {
      timeout?: number;
    } = {},
  ): Promise<string | null> {
    const window = this.getMainWindow();
    return await window.textContent(selector, {
      timeout: options.timeout || 5000,
    });
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(
    selector: string,
    options: {
      timeout?: number;
    } = {},
  ): Promise<boolean> {
    const window = this.getMainWindow();
    try {
      await window.waitForSelector(selector, {
        state: "visible",
        timeout: options.timeout || 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for an element to be present and visible
   */
  async waitForElement(
    selector: string,
    options: {
      timeout?: number;
      state?: "visible" | "hidden" | "attached" | "detached";
    } = {},
  ): Promise<void> {
    const window = this.getMainWindow();
    await window.waitForSelector(selector, {
      timeout: options.timeout || 5000,
      state: options.state || "visible",
    });
  }

  /**
   * Get the current window title
   */
  async getWindowTitle(): Promise<string> {
    const window = this.getMainWindow();
    return await window.title();
  }

  /**
   * Get the current URL (for Electron apps this might be a custom protocol)
   */
  async getCurrentUrl(): Promise<string> {
    const window = this.getMainWindow();
    return window.url();
  }

  /**
   * Execute JavaScript in the application context
   */
  async executeScript<T>(script: string | (() => T)): Promise<T> {
    const window = this.getMainWindow();
    return await window.evaluate(script);
  }

  /**
   * Check application health/responsiveness
   */
  async isAppResponsive(): Promise<boolean> {
    try {
      const window = this.getMainWindow();
      const title = await window.title();
      return title !== null && title.length > 0;
    } catch {
      return false;
    }
  }
}
