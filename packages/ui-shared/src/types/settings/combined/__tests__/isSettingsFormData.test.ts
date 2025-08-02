/**
 * Tests for isSettingsFormData type guard
 */

import { isSettingsFormData } from "../isSettingsFormData";

describe("isSettingsFormData", () => {
  const validData = {
    general: {
      responseDelay: 2000,
      maximumMessages: 50,
      maximumWaitTime: 30000,
      defaultMode: "manual",
      maximumAgents: 4,
      checkUpdates: true,
    },
    appearance: {
      theme: "dark",
      showTimestamps: "always",
      showActivityTime: true,
      compactList: false,
      fontSize: 14,
      messageSpacing: "normal",
    },
    advanced: {
      debugLogging: false,
      experimentalFeatures: false,
    },
  };

  it("should accept valid settings data", () => {
    expect(isSettingsFormData(validData)).toBe(true);
  });

  it("should reject invalid data structures", () => {
    expect(isSettingsFormData(null)).toBe(false);
    expect(isSettingsFormData(undefined)).toBe(false);
    expect(isSettingsFormData("string")).toBe(false);
    expect(isSettingsFormData(123)).toBe(false);
    expect(isSettingsFormData([])).toBe(false);
    expect(isSettingsFormData({})).toBe(false);
    expect(isSettingsFormData({ general: {} })).toBe(false);
    expect(
      isSettingsFormData({
        general: {},
        appearance: {},
      }),
    ).toBe(false);
  });

  it("should reject data with null categories", () => {
    expect(
      isSettingsFormData({
        general: null,
        appearance: {},
        advanced: {},
      }),
    ).toBe(false);
  });

  it("should reject data with non-object categories", () => {
    expect(
      isSettingsFormData({
        general: "not an object",
        appearance: {},
        advanced: {},
      }),
    ).toBe(false);
  });

  it("should handle array inputs", () => {
    expect(isSettingsFormData([])).toBe(false);
    expect(isSettingsFormData([1, 2, 3])).toBe(false);
  });

  it("should handle complex invalid structures", () => {
    const complexInvalid = {
      general: {
        nested: {
          deeply: {
            invalid: "structure",
          },
        },
      },
      appearance: "not an object",
      advanced: 123,
    };

    expect(isSettingsFormData(complexInvalid)).toBe(false);
  });
});
