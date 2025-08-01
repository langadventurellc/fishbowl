import { mapGeneralSettingsPersistenceToUI } from "../mapGeneralSettingsPersistenceToUI";
import type { PersistedGeneralSettingsData } from "@fishbowl-ai/shared";
import { defaultGeneralSettings } from "../../../types/settings/generalSettings";

describe("mapGeneralSettingsPersistenceToUI", () => {
  it("should map all fields correctly with valid data", () => {
    const persistedData: PersistedGeneralSettingsData = {
      responseDelay: 3000,
      maximumMessages: 200,
      maximumWaitTime: 60000,
      defaultMode: "auto",
      maximumAgents: 6,
      checkUpdates: false,
    };

    const result = mapGeneralSettingsPersistenceToUI(persistedData);

    expect(result).toEqual({
      responseDelay: 3000,
      maximumMessages: 200,
      maximumWaitTime: 60000,
      defaultMode: "auto",
      maximumAgents: 6,
      checkUpdates: false,
    });
  });

  it("should apply defaults for missing fields", () => {
    const partialData = {
      responseDelay: 5000,
      defaultMode: "auto",
    } as unknown as PersistedGeneralSettingsData;

    const result = mapGeneralSettingsPersistenceToUI(partialData);

    expect(result).toEqual({
      responseDelay: 5000,
      maximumMessages: 50, // defaultGeneralSettings.maximumMessages
      maximumWaitTime: 30000, // defaultGeneralSettings.maximumWaitTime
      defaultMode: "auto",
      maximumAgents: 4, // defaultGeneralSettings.maximumAgents
      checkUpdates: true, // defaultGeneralSettings.checkUpdates
    });
  });

  it("should coerce boolean values", () => {
    const stringBoolean = {
      ...defaultGeneralSettings,
      checkUpdates: "true",
    } as unknown as PersistedGeneralSettingsData;

    const numberBoolean = {
      ...defaultGeneralSettings,
      checkUpdates: 1,
    } as unknown as PersistedGeneralSettingsData;

    expect(mapGeneralSettingsPersistenceToUI(stringBoolean).checkUpdates).toBe(
      true,
    );
    expect(mapGeneralSettingsPersistenceToUI(numberBoolean).checkUpdates).toBe(
      true,
    );
  });

  it("should clamp out-of-range values", () => {
    const outOfRange: PersistedGeneralSettingsData = {
      responseDelay: 100,
      maximumMessages: 1000,
      maximumWaitTime: 200000,
      defaultMode: "manual",
      maximumAgents: 20,
      checkUpdates: true,
    };

    const result = mapGeneralSettingsPersistenceToUI(outOfRange);

    expect(result).toEqual({
      responseDelay: 1000,
      maximumMessages: 500,
      maximumWaitTime: 120000,
      defaultMode: "manual",
      maximumAgents: 8,
      checkUpdates: true,
    });
  });

  it("should handle null/undefined values with defaults", () => {
    const nullishData = {
      responseDelay: null,
      maximumMessages: undefined,
      maximumWaitTime: null,
      defaultMode: undefined,
      maximumAgents: undefined,
      checkUpdates: null,
    } as unknown as PersistedGeneralSettingsData;

    const result = mapGeneralSettingsPersistenceToUI(nullishData);

    expect(result).toEqual(defaultGeneralSettings);
  });

  it("should handle empty object with all defaults", () => {
    const emptyData = {} as PersistedGeneralSettingsData;

    const result = mapGeneralSettingsPersistenceToUI(emptyData);

    expect(result).toEqual(defaultGeneralSettings);
  });

  it("should handle boundary values correctly", () => {
    const minValues: PersistedGeneralSettingsData = {
      responseDelay: 1000,
      maximumMessages: 0,
      maximumWaitTime: 5000,
      defaultMode: "manual",
      maximumAgents: 1,
      checkUpdates: false,
    };

    const maxValues: PersistedGeneralSettingsData = {
      responseDelay: 30000,
      maximumMessages: 500,
      maximumWaitTime: 120000,
      defaultMode: "auto",
      maximumAgents: 8,
      checkUpdates: true,
    };

    expect(mapGeneralSettingsPersistenceToUI(minValues)).toEqual(minValues);
    expect(mapGeneralSettingsPersistenceToUI(maxValues)).toEqual(maxValues);
  });

  it("should handle round-trip conversion maintaining data fidelity", () => {
    const originalData: PersistedGeneralSettingsData = {
      responseDelay: 2500,
      maximumMessages: 150,
      maximumWaitTime: 45000,
      defaultMode: "auto",
      maximumAgents: 5,
      checkUpdates: true,
    };

    const converted = mapGeneralSettingsPersistenceToUI(originalData);

    expect(converted).toEqual({
      responseDelay: 2500,
      maximumMessages: 150,
      maximumWaitTime: 45000,
      defaultMode: "auto",
      maximumAgents: 5,
      checkUpdates: true,
    });
  });

  it("should coerce false-like boolean values to false", () => {
    const falseValues = {
      ...defaultGeneralSettings,
      checkUpdates: "false",
    } as unknown as PersistedGeneralSettingsData;

    const zeroValue = {
      ...defaultGeneralSettings,
      checkUpdates: 0,
    } as unknown as PersistedGeneralSettingsData;

    expect(mapGeneralSettingsPersistenceToUI(falseValues).checkUpdates).toBe(
      false,
    );
    expect(mapGeneralSettingsPersistenceToUI(zeroValue).checkUpdates).toBe(
      false,
    );
  });
});
