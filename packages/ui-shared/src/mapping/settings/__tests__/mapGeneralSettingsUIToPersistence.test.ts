import { mapGeneralSettingsUIToPersistence } from "../mapGeneralSettingsUIToPersistence";
import type { GeneralSettingsFormData } from "../../../types/settings/generalSettings";

describe("mapGeneralSettingsUIToPersistence", () => {
  it("should map all fields correctly with valid data", () => {
    const uiData: GeneralSettingsFormData = {
      responseDelay: 2500,
      maximumMessages: 150,
      maximumWaitTime: 45000,
      defaultMode: "auto",
      maximumAgents: 5,
      checkUpdates: true,
    };

    const result = mapGeneralSettingsUIToPersistence(uiData);

    expect(result).toEqual({
      responseDelay: 2500,
      maximumMessages: 150,
      maximumWaitTime: 45000,
      defaultMode: "auto",
      maximumAgents: 5,
      checkUpdates: true,
    });
  });

  it("should clamp responseDelay to valid range", () => {
    const tooLow: GeneralSettingsFormData = {
      responseDelay: 500,
      maximumMessages: 50,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 4,
      checkUpdates: true,
    };

    const tooHigh: GeneralSettingsFormData = {
      responseDelay: 25000,
      maximumMessages: 50,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 4,
      checkUpdates: true,
    };

    expect(mapGeneralSettingsUIToPersistence(tooLow).responseDelay).toBe(1000);
    expect(mapGeneralSettingsUIToPersistence(tooHigh).responseDelay).toBe(
      25000,
    );
  });

  it("should clamp maximumMessages to valid range", () => {
    const negative: GeneralSettingsFormData = {
      responseDelay: 2000,
      maximumMessages: -10,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 4,
      checkUpdates: true,
    };

    const tooHigh: GeneralSettingsFormData = {
      responseDelay: 2000,
      maximumMessages: 1000,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 4,
      checkUpdates: true,
    };

    expect(mapGeneralSettingsUIToPersistence(negative).maximumMessages).toBe(0);
    expect(mapGeneralSettingsUIToPersistence(tooHigh).maximumMessages).toBe(
      500,
    );
  });

  it("should clamp maximumWaitTime to valid range", () => {
    const tooLow: GeneralSettingsFormData = {
      responseDelay: 2000,
      maximumMessages: 100,
      maximumWaitTime: 1000,
      defaultMode: "manual",
      maximumAgents: 4,
      checkUpdates: true,
    };

    const tooHigh: GeneralSettingsFormData = {
      ...tooLow,
      maximumWaitTime: 200000,
    };

    expect(mapGeneralSettingsUIToPersistence(tooLow).maximumWaitTime).toBe(
      5000,
    );
    expect(mapGeneralSettingsUIToPersistence(tooHigh).maximumWaitTime).toBe(
      120000,
    );
  });

  it("should clamp maximumAgents to valid range", () => {
    const tooLow: GeneralSettingsFormData = {
      responseDelay: 2000,
      maximumMessages: 100,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 0,
      checkUpdates: true,
    };

    const tooHigh: GeneralSettingsFormData = {
      ...tooLow,
      maximumAgents: 20,
    };

    expect(mapGeneralSettingsUIToPersistence(tooLow).maximumAgents).toBe(1);
    expect(mapGeneralSettingsUIToPersistence(tooHigh).maximumAgents).toBe(8);
  });

  it("should handle edge case values at boundaries", () => {
    const minValues: GeneralSettingsFormData = {
      responseDelay: 1000,
      maximumMessages: 0,
      maximumWaitTime: 5000,
      defaultMode: "manual",
      maximumAgents: 1,
      checkUpdates: false,
    };

    const maxValues: GeneralSettingsFormData = {
      responseDelay: 30000,
      maximumMessages: 500,
      maximumWaitTime: 120000,
      defaultMode: "auto",
      maximumAgents: 8,
      checkUpdates: true,
    };

    expect(mapGeneralSettingsUIToPersistence(minValues)).toEqual(minValues);
    expect(mapGeneralSettingsUIToPersistence(maxValues)).toEqual(maxValues);
  });

  it("should pass schema validation with valid data", () => {
    const validData: GeneralSettingsFormData = {
      responseDelay: 2000,
      maximumMessages: 100,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 4,
      checkUpdates: true,
    };

    expect(() => mapGeneralSettingsUIToPersistence(validData)).not.toThrow();
  });

  it("should throw error for invalid enum values", () => {
    const invalidMode = {
      responseDelay: 2000,
      maximumMessages: 100,
      maximumWaitTime: 30000,
      defaultMode: "invalid",
      maximumAgents: 4,
      checkUpdates: true,
    } as unknown as GeneralSettingsFormData;

    expect(() => mapGeneralSettingsUIToPersistence(invalidMode)).toThrow();
  });
});
