import { FishbowlApp } from "support/FishbowlApp";

/**
 * Global helper function to create a new app instance
 */

export async function createFishbowlApp(options?: {
  timeout?: number;
  headless?: boolean;
  recordVideo?: boolean;
  videoDir?: string;
}): Promise<FishbowlApp> {
  const app = new FishbowlApp();
  await app.launch(options);
  return app;
}
