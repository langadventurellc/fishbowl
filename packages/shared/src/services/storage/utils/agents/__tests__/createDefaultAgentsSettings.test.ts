import { createDefaultAgentsSettings } from "../createDefaultAgentsSettings";

describe("createDefaultAgentsSettings", () => {
  it("should create default agents settings with empty array", () => {
    const settings = createDefaultAgentsSettings();

    expect(settings.agents).toEqual([]);
    expect(settings.schemaVersion).toBe("1.0.0");
    expect(settings.lastUpdated).toBeDefined();
    expect(new Date(settings.lastUpdated)).toBeInstanceOf(Date);
  });

  it("should create settings with recent timestamp", () => {
    const before = new Date().toISOString();
    const settings = createDefaultAgentsSettings();
    const after = new Date().toISOString();

    expect(settings.lastUpdated >= before).toBe(true);
    expect(settings.lastUpdated <= after).toBe(true);
  });
});
