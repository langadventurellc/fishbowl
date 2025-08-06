import { CircuitBreaker, CircuitState } from "../";
import { setTimeout } from "node:timers/promises";

describe("CircuitBreaker", () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      recoveryTimeoutMs: 1000,
      monitoringWindowMs: 5000,
      successThreshold: 2,
    });
  });

  describe("initial state", () => {
    it("should start in CLOSED state", () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });
  });

  describe("successful operations", () => {
    it("should execute successful operations in CLOSED state", async () => {
      const mockOperation = jest.fn().mockResolvedValue("success");

      const result = await circuitBreaker.execute(mockOperation);

      expect(result).toBe("success");
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });

    it("should reset failure count on successful operation in CLOSED state", async () => {
      const error = new Error("Test error");

      // Execute failing operations
      await expect(
        circuitBreaker.execute(() => Promise.reject(error)),
      ).rejects.toThrow("Test error");
      await expect(
        circuitBreaker.execute(() => Promise.reject(error)),
      ).rejects.toThrow("Test error");

      expect(circuitBreaker.getFailureCount()).toBe(2);

      // Execute successful operation
      const result = await circuitBreaker.execute(() =>
        Promise.resolve("success"),
      );

      expect(result).toBe("success");
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });
  });

  describe("state transitions", () => {
    it("should transition from CLOSED to OPEN after failure threshold", async () => {
      const error = new Error("Test error");

      // Execute failing operations up to threshold
      for (let i = 0; i < 3; i++) {
        await expect(
          circuitBreaker.execute(() => Promise.reject(error)),
        ).rejects.toThrow("Test error");
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
      expect(circuitBreaker.getFailureCount()).toBe(3);
    });

    it("should block operations in OPEN state", async () => {
      const error = new Error("Test error");

      // Trip the circuit breaker
      for (let i = 0; i < 3; i++) {
        await expect(
          circuitBreaker.execute(() => Promise.reject(error)),
        ).rejects.toThrow("Test error");
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

      // Next operation should be blocked
      await expect(
        circuitBreaker.execute(() => Promise.resolve("success")),
      ).rejects.toThrow("Circuit breaker is open, operation blocked");
    });

    it("should transition from OPEN to HALF_OPEN after recovery timeout", async () => {
      const error = new Error("Test error");

      // Trip the circuit breaker
      for (let i = 0; i < 3; i++) {
        await expect(
          circuitBreaker.execute(() => Promise.reject(error)),
        ).rejects.toThrow("Test error");
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

      // Wait for recovery timeout
      await setTimeout(1100);

      // Next operation should trigger HALF_OPEN state
      const result = await circuitBreaker.execute(() =>
        Promise.resolve("success"),
      );

      expect(result).toBe("success");
      expect(circuitBreaker.getState()).toBe(CircuitState.HALF_OPEN);
    });

    it("should transition from HALF_OPEN to CLOSED after success threshold", async () => {
      const error = new Error("Test error");

      // Trip the circuit breaker
      for (let i = 0; i < 3; i++) {
        await expect(
          circuitBreaker.execute(() => Promise.reject(error)),
        ).rejects.toThrow("Test error");
      }

      // Wait for recovery timeout
      await setTimeout(1100);

      // Execute successful operations to meet success threshold
      await circuitBreaker.execute(() => Promise.resolve("success1"));
      expect(circuitBreaker.getState()).toBe(CircuitState.HALF_OPEN);

      await circuitBreaker.execute(() => Promise.resolve("success2"));
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
      expect(circuitBreaker.getFailureCount()).toBe(0);
    });

    it("should transition from HALF_OPEN back to OPEN on failure", async () => {
      const error = new Error("Test error");

      // Trip the circuit breaker
      for (let i = 0; i < 3; i++) {
        await expect(
          circuitBreaker.execute(() => Promise.reject(error)),
        ).rejects.toThrow("Test error");
      }

      // Wait for recovery timeout
      await setTimeout(1100);

      // Execute one successful operation to enter HALF_OPEN
      await circuitBreaker.execute(() => Promise.resolve("success"));
      expect(circuitBreaker.getState()).toBe(CircuitState.HALF_OPEN);

      // Execute failing operation should transition back to OPEN
      await expect(
        circuitBreaker.execute(() => Promise.reject(error)),
      ).rejects.toThrow("Test error");

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe("monitoring window", () => {
    it("should reset failure count after monitoring window expires", async () => {
      const shortWindowBreaker = new CircuitBreaker({
        failureThreshold: 3,
        monitoringWindowMs: 100,
      });

      const error = new Error("Test error");

      // Execute failing operations
      await expect(
        shortWindowBreaker.execute(() => Promise.reject(error)),
      ).rejects.toThrow("Test error");
      await expect(
        shortWindowBreaker.execute(() => Promise.reject(error)),
      ).rejects.toThrow("Test error");

      expect(shortWindowBreaker.getFailureCount()).toBe(2);

      // Wait for monitoring window to expire
      await setTimeout(150);

      // Next failure should start fresh count
      await expect(
        shortWindowBreaker.execute(() => Promise.reject(error)),
      ).rejects.toThrow("Test error");

      expect(shortWindowBreaker.getFailureCount()).toBe(1);
      expect(shortWindowBreaker.getState()).toBe(CircuitState.CLOSED);
    });
  });

  describe("reset functionality", () => {
    it("should reset circuit breaker to initial state", async () => {
      const error = new Error("Test error");

      // Trip the circuit breaker
      for (let i = 0; i < 3; i++) {
        await expect(
          circuitBreaker.execute(() => Promise.reject(error)),
        ).rejects.toThrow("Test error");
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
      expect(circuitBreaker.getFailureCount()).toBe(3);

      // Reset the circuit breaker
      circuitBreaker.reset();

      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
      expect(circuitBreaker.getFailureCount()).toBe(0);

      // Should be able to execute operations normally
      const result = await circuitBreaker.execute(() =>
        Promise.resolve("success"),
      );
      expect(result).toBe("success");
    });
  });
});
