import { readFile } from "fs/promises";
import path from "path";
import type { setupAgentsTestSuite } from "./setupAgentsTestSuite";

export const readAgentsFile = async (
  testSuite: ReturnType<typeof setupAgentsTestSuite>,
) => {
  const userDataPath = await testSuite
    .getElectronApp()
    .evaluate(async ({ app }) => {
      return app.getPath("userData");
    });
  const agentsPath = path.join(userDataPath, "agents.json");
  const agentsContent = await readFile(agentsPath, "utf-8");
  return JSON.parse(agentsContent);
};
