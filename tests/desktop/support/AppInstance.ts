import type { ElectronApplication, Page } from "playwright";

export interface AppInstance {
  app: ElectronApplication;
  window: Page;
}
