import { RetryHandler } from "../RetryHandler";

interface TestSystemError extends Error {
  code: string;
}

describe("RetryHandler", () => {
  let retryHandler: RetryHandler;

  beforeEach(() => {
    retryHandler = new RetryHandler({
      maxAttempts: 3,
      baseDelayMs: 100,
      maxDelayMs: 1000,
      backoffMultiplier: 2,
      jitterMs: 10,
      retryableErrors: ["ENOENT", "EBUSY", "ETIMEDOUT"],
    });
  });

  describe("successful operations", () => {
    it("should execute operation successfully on first attempt", async () => {
      const mockOperation = jest.fn().mockResolvedValue("success");

      const result = await retryHandler.executeWithRetry(mockOperation, {
        operation: "test",
      });

      expect(result).toBe("success");
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe("retry logic", () => {
    it("should retry retryable errors up to max attempts", async () => {
      const error: TestSystemError = new Error(
        "File not found",
      ) as TestSystemError;
      error.code = "ENOENT";

      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const result = await retryHandler.executeWithRetry(mockOperation, {
        operation: "test",
      });

      expect(result).toBe("success");
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it("should not retry non-retryable errors", async () => {
      const error: TestSystemError = new Error(
        "Permission denied",
      ) as TestSystemError;
      error.code = "EACCES";

      const mockOperation = jest.fn().mockRejectedValue(error);

      await expect(
        retryHandler.executeWithRetry(mockOperation, { operation: "test" }),
      ).rejects.toThrow("Permission denied");

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it("should fail after max attempts with retryable error", async () => {
      const error: TestSystemError = new Error(
        "Resource busy",
      ) as TestSystemError;
      error.code = "EBUSY";

      const mockOperation = jest.fn().mockRejectedValue(error);

      await expect(
        retryHandler.executeWithRetry(mockOperation, { operation: "test" }),
      ).rejects.toThrow("Resource busy");

      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it("should respect backoff delay calculations", async () => {
      const error: TestSystemError = new Error("Timeout") as TestSystemError;
      error.code = "ETIMEDOUT";

      const mockOperation = jest.fn().mockRejectedValue(error);

      const startTime = Date.now();

      await expect(
        retryHandler.executeWithRetry(mockOperation, { operation: "test" }),
      ).rejects.toThrow("Timeout");

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should have taken at least the base delay for retries
      expect(duration).toBeGreaterThan(200); // 2 retries * 100ms base delay
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });
  });

  describe("error classification", () => {
    it.each([
      ["ENOENT", true],
      ["EBUSY", true],
      ["ETIMEDOUT", true],
      ["EACCES", false],
      ["EPERM", false],
      [undefined, false],
    ])(
      "should classify error code %s as retryable: %s",
      async (code, shouldRetry) => {
        const error = new Error("Test error") as TestSystemError;
        if (code) {
          error.code = code;
        }

        const mockOperation = jest.fn().mockRejectedValue(error);

        await expect(
          retryHandler.executeWithRetry(mockOperation, { operation: "test" }),
        ).rejects.toThrow("Test error");

        const expectedCalls = shouldRetry ? 3 : 1;
        expect(mockOperation).toHaveBeenCalledTimes(expectedCalls);
      },
    );
  });

  describe("configuration options", () => {
    it("should use custom max attempts", async () => {
      const customHandler = new RetryHandler({ maxAttempts: 5 });
      const error: TestSystemError = new Error("Test") as TestSystemError;
      error.code = "ENOENT";

      const mockOperation = jest.fn().mockRejectedValue(error);

      await expect(
        customHandler.executeWithRetry(mockOperation, { operation: "test" }),
      ).rejects.toThrow("Test");

      expect(mockOperation).toHaveBeenCalledTimes(5);
    });

    it("should use custom retryable error codes", async () => {
      const customHandler = new RetryHandler({
        retryableErrors: ["CUSTOM_ERROR"],
      });

      const error: TestSystemError = new Error(
        "Custom error",
      ) as TestSystemError;
      error.code = "CUSTOM_ERROR";

      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const result = await customHandler.executeWithRetry(mockOperation, {
        operation: "test",
      });

      expect(result).toBe("success");
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });
});
