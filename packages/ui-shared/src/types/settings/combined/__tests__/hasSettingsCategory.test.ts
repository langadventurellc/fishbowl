/**
 * Tests for hasSettingsCategory type guard
 */

import type { SettingsFormData } from "../SettingsFormData";
import { hasSettingsCategory } from "../hasSettingsCategory";

describe("hasSettingsCategory", () => {
  const mockData: SettingsFormData = {
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

  it("should return true for existing categories", () => {
    expect(hasSettingsCategory(mockData, "general")).toBe(true);
    expect(hasSettingsCategory(mockData, "appearance")).toBe(true);
    expect(hasSettingsCategory(mockData, "advanced")).toBe(true);
  });

  it("should handle edge cases", () => {
    const dataWithNullCategory = {
      ...mockData,
      general: null as unknown as SettingsFormData["general"],
    };
    expect(hasSettingsCategory(dataWithNullCategory, "general")).toBe(false);

    const dataWithUndefinedCategory = {
      ...mockData,
      general: undefined as unknown as SettingsFormData["general"],
    };
    expect(hasSettingsCategory(dataWithUndefinedCategory, "general")).toBe(
      false,
    );
  });

  it("should validate object type requirement", () => {
    const dataWithStringCategory = {
      ...mockData,
      general: "not an object" as unknown as SettingsFormData["general"],
    };
    expect(hasSettingsCategory(dataWithStringCategory, "general")).toBe(false);

    const dataWithNumberCategory = {
      ...mockData,
      general: 123 as unknown as SettingsFormData["general"],
    };
    expect(hasSettingsCategory(dataWithNumberCategory, "general")).toBe(false);
  });
});
