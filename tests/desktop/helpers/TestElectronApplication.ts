import type { ElectronApplication } from "playwright";

import type { TestWindow } from "./TestWindow";

export interface TestElectronApplication extends ElectronApplication {
  window: TestWindow;
}
