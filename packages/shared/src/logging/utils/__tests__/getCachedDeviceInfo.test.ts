import { getCachedDeviceInfo } from "../getCachedDeviceInfo";
import { getDeviceInfo } from "../getDeviceInfo";

// Mock the getDeviceInfo function
jest.mock("../getDeviceInfo", () => ({
  getDeviceInfo: jest.fn(),
}));

const mockGetDeviceInfo = getDeviceInfo as jest.MockedFunction<
  typeof getDeviceInfo
>;

describe("getCachedDeviceInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Set a consistent base time for each test
    jest.setSystemTime(new Date("2023-01-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return device info and cache it", async () => {
    const mockDeviceInfo = {
      platform: "desktop" as const,
      deviceInfo: {
        platform: "darwin",
        arch: "arm64",
      },
    };

    mockGetDeviceInfo.mockResolvedValue(mockDeviceInfo);

    const result = await getCachedDeviceInfo(true); // Force refresh to bypass any cached data

    expect(result).toEqual(mockDeviceInfo);
    expect(mockGetDeviceInfo).toHaveBeenCalledTimes(1);
  });

  it("should return cached result on subsequent calls", async () => {
    const mockDeviceInfo = {
      platform: "desktop" as const,
      deviceInfo: {
        platform: "darwin",
        arch: "arm64",
      },
    };

    mockGetDeviceInfo.mockResolvedValue(mockDeviceInfo);

    // First call
    const result1 = await getCachedDeviceInfo(true); // Force refresh to bypass any cached data

    // Second call (should use cache)
    const result2 = await getCachedDeviceInfo();

    expect(result1).toEqual(mockDeviceInfo);
    expect(result2).toEqual(mockDeviceInfo);
    expect(mockGetDeviceInfo).toHaveBeenCalledTimes(1); // Only called once
  });

  it("should refresh cache after timeout", async () => {
    const mockDeviceInfo1 = {
      platform: "desktop" as const,
      deviceInfo: { platform: "darwin" },
    };

    const mockDeviceInfo2 = {
      platform: "desktop" as const,
      deviceInfo: { platform: "linux" },
    };

    mockGetDeviceInfo
      .mockResolvedValueOnce(mockDeviceInfo1)
      .mockResolvedValueOnce(mockDeviceInfo2);

    // First call
    const result1 = await getCachedDeviceInfo(true); // Force refresh to bypass any cached data
    expect(result1).toEqual(mockDeviceInfo1);

    // Fast forward time beyond cache duration (5 minutes)
    jest.advanceTimersByTime(6 * 60 * 1000);

    // Second call (should refresh cache)
    const result2 = await getCachedDeviceInfo();
    expect(result2).toEqual(mockDeviceInfo2);
    expect(mockGetDeviceInfo).toHaveBeenCalledTimes(2);
  });

  it("should force refresh when requested", async () => {
    const mockDeviceInfo1 = {
      platform: "desktop" as const,
      deviceInfo: { platform: "darwin" },
    };

    const mockDeviceInfo2 = {
      platform: "desktop" as const,
      deviceInfo: { platform: "linux" },
    };

    mockGetDeviceInfo
      .mockResolvedValueOnce(mockDeviceInfo1)
      .mockResolvedValueOnce(mockDeviceInfo2);

    // First call
    const result1 = await getCachedDeviceInfo(true); // Force refresh to bypass any cached data
    expect(result1).toEqual(mockDeviceInfo1);

    // Force refresh (before cache expires)
    const result2 = await getCachedDeviceInfo(true);
    expect(result2).toEqual(mockDeviceInfo2);
    expect(mockGetDeviceInfo).toHaveBeenCalledTimes(2);
  });

  it("should handle errors from getDeviceInfo", async () => {
    const mockError = {
      deviceInfo: {
        platform: "unknown",
        error: "Failed to gather device info",
      },
    };

    mockGetDeviceInfo.mockResolvedValue(mockError);

    const result = await getCachedDeviceInfo(true); // Force refresh to bypass any cached data

    expect(result).toEqual(mockError);
    expect(mockGetDeviceInfo).toHaveBeenCalledTimes(1);
  });
});
