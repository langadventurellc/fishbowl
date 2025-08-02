import { getPlatform } from "../getPlatform";

describe("getPlatform", () => {
  it("should return a valid platform info object", () => {
    const result = getPlatform();

    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("isElectron");
    expect(result).toHaveProperty("isElectronMain");
    expect(result).toHaveProperty("isElectronRenderer");
    expect(result).toHaveProperty("isReactNative");
    expect(result).toHaveProperty("isWeb");
  });

  it("should return consistent results when called multiple times", () => {
    const result1 = getPlatform();
    const result2 = getPlatform();
    const result3 = getPlatform();

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);

    // Should return the exact same object reference (cached)
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });

  it("should return web platform in test environment", () => {
    const result = getPlatform();

    expect(result.type).toBe("web");
    expect(result.isWeb).toBe(true);
    expect(result.isElectron).toBe(false);
    expect(result.isReactNative).toBe(false);
  });
});
