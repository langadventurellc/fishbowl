import { resetPlatformCache } from "../resetPlatformCache";
import { getPlatform } from "../getPlatform";

describe("resetPlatformCache", () => {
  it("should reset the platform cache", () => {
    // Get platform to populate cache
    const result1 = getPlatform();
    const result2 = getPlatform();

    // Should be same reference (cached)
    expect(result1).toBe(result2);

    // Reset cache
    resetPlatformCache();

    // Get platform again after reset
    const result3 = getPlatform();
    const result4 = getPlatform();

    // result3 should be a new object (cache was reset)
    // but result3 and result4 should be same reference (newly cached)
    expect(result1).not.toBe(result3);
    expect(result3).toBe(result4);

    // Content should still be the same
    expect(result1).toEqual(result3);
  });

  it("should not throw when called multiple times", () => {
    expect(() => {
      resetPlatformCache();
      resetPlatformCache();
      resetPlatformCache();
    }).not.toThrow();
  });

  it("should allow cache to work normally after reset", () => {
    // Reset cache
    resetPlatformCache();

    // Cache should work normally
    const result1 = getPlatform();
    const result2 = getPlatform();

    expect(result1).toBe(result2);
    expect(result1.type).toBe("web");
  });
});
