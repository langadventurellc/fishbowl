import { detectPlatform } from "../detectPlatform";

describe("detectPlatform", () => {
  it("should return a valid PlatformInfo object", () => {
    const result = detectPlatform();

    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("isElectron");
    expect(result).toHaveProperty("isElectronMain");
    expect(result).toHaveProperty("isElectronRenderer");
    expect(result).toHaveProperty("isReactNative");
    expect(result).toHaveProperty("isWeb");

    expect(typeof result.type).toBe("string");
    expect(typeof result.isElectron).toBe("boolean");
    expect(typeof result.isElectronMain).toBe("boolean");
    expect(typeof result.isElectronRenderer).toBe("boolean");
    expect(typeof result.isReactNative).toBe("boolean");
    expect(typeof result.isWeb).toBe("boolean");
  });

  it("should have exactly one platform type as true", () => {
    const result = detectPlatform();

    const platformFlags = [
      result.isElectronMain,
      result.isElectronRenderer,
      result.isReactNative,
      result.isWeb,
    ];

    const trueCount = platformFlags.filter((flag) => flag).length;
    expect(trueCount).toBe(1);
  });

  it("should have consistent isElectron flag", () => {
    const result = detectPlatform();

    const shouldBeElectron = result.isElectronMain || result.isElectronRenderer;
    expect(result.isElectron).toBe(shouldBeElectron);
  });

  it("should have valid platform type values", () => {
    const result = detectPlatform();

    const validTypes = [
      "electron-main",
      "electron-renderer",
      "react-native",
      "web",
    ];
    expect(validTypes).toContain(result.type);
  });

  it("should match type with boolean flags", () => {
    const result = detectPlatform();

    switch (result.type) {
      case "electron-main":
        expect(result.isElectronMain).toBe(true);
        expect(result.isElectron).toBe(true);
        expect(result.isElectronRenderer).toBe(false);
        expect(result.isReactNative).toBe(false);
        expect(result.isWeb).toBe(false);
        break;
      case "electron-renderer":
        expect(result.isElectronRenderer).toBe(true);
        expect(result.isElectron).toBe(true);
        expect(result.isElectronMain).toBe(false);
        expect(result.isReactNative).toBe(false);
        expect(result.isWeb).toBe(false);
        break;
      case "react-native":
        expect(result.isReactNative).toBe(true);
        expect(result.isElectron).toBe(false);
        expect(result.isElectronMain).toBe(false);
        expect(result.isElectronRenderer).toBe(false);
        expect(result.isWeb).toBe(false);
        break;
      case "web":
        expect(result.isWeb).toBe(true);
        expect(result.isElectron).toBe(false);
        expect(result.isElectronMain).toBe(false);
        expect(result.isElectronRenderer).toBe(false);
        expect(result.isReactNative).toBe(false);
        break;
      default:
        throw new Error(`Unexpected platform type: ${result.type}`);
    }
  });

  it("should be deterministic", () => {
    const result1 = detectPlatform();
    const result2 = detectPlatform();

    expect(result1).toEqual(result2);
  });

  it("should default to web in test environment", () => {
    // In Jest test environment, it should detect as web
    const result = detectPlatform();
    expect(result.type).toBe("web");
    expect(result.isWeb).toBe(true);
  });
});
