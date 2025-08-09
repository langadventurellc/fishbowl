import type { Page } from "playwright";

import type { TestHelpers } from "./TestHelpers";

export interface TestWindow extends Page {
  testHelpers: TestHelpers | undefined;
}
