import type { TransactionOptions } from "../TransactionOptions";
import type { TransactionIsolationLevel } from "../TransactionIsolationLevel";

describe("TransactionOptions", () => {
  describe("Type Validation", () => {
    it("should accept all optional properties", () => {
      const options: TransactionOptions = {
        timeout: 60000,
        isolationLevel: "READ_COMMITTED",
        retryOnFailure: true,
        maxRetries: 3,
        retryDelay: 100,
        readOnly: false,
      };

      expect(options).toBeDefined();
      expect(options.timeout).toBe(60000);
      expect(options.isolationLevel).toBe("READ_COMMITTED");
      expect(options.retryOnFailure).toBe(true);
      expect(options.maxRetries).toBe(3);
      expect(options.retryDelay).toBe(100);
      expect(options.readOnly).toBe(false);
    });

    it("should accept empty options object", () => {
      const options: TransactionOptions = {};
      expect(options).toBeDefined();
    });

    it("should accept partial options", () => {
      const options: TransactionOptions = {
        isolationLevel: "SERIALIZABLE",
        retryOnFailure: true,
      };

      expect(options.isolationLevel).toBe("SERIALIZABLE");
      expect(options.retryOnFailure).toBe(true);
      expect(options.timeout).toBeUndefined();
    });
  });

  describe("Isolation Level Validation", () => {
    it("should accept all valid isolation levels", () => {
      const isolationLevels: TransactionIsolationLevel[] = [
        "READ_UNCOMMITTED",
        "READ_COMMITTED",
        "REPEATABLE_READ",
        "SERIALIZABLE",
      ];

      isolationLevels.forEach((level) => {
        const options: TransactionOptions = { isolationLevel: level };
        expect(options.isolationLevel).toBe(level);
      });
    });

    it("should work with different isolation level combinations", () => {
      const readUncommitted: TransactionOptions = {
        isolationLevel: "READ_UNCOMMITTED",
        readOnly: true,
      };

      const serializable: TransactionOptions = {
        isolationLevel: "SERIALIZABLE",
        retryOnFailure: true,
        maxRetries: 5,
      };

      expect(readUncommitted.isolationLevel).toBe("READ_UNCOMMITTED");
      expect(readUncommitted.readOnly).toBe(true);

      expect(serializable.isolationLevel).toBe("SERIALIZABLE");
      expect(serializable.retryOnFailure).toBe(true);
      expect(serializable.maxRetries).toBe(5);
    });
  });

  describe("Retry Configuration", () => {
    it("should handle retry settings correctly", () => {
      const retryOptions: TransactionOptions = {
        retryOnFailure: true,
        maxRetries: 5,
        retryDelay: 250,
      };

      expect(retryOptions.retryOnFailure).toBe(true);
      expect(retryOptions.maxRetries).toBe(5);
      expect(retryOptions.retryDelay).toBe(250);
    });

    it("should work with disabled retries", () => {
      const noRetryOptions: TransactionOptions = {
        retryOnFailure: false,
        maxRetries: 0,
      };

      expect(noRetryOptions.retryOnFailure).toBe(false);
      expect(noRetryOptions.maxRetries).toBe(0);
    });

    it("should handle edge case retry values", () => {
      const edgeCaseOptions: TransactionOptions = {
        retryOnFailure: true,
        maxRetries: 100,
        retryDelay: 1,
      };

      expect(edgeCaseOptions.maxRetries).toBe(100);
      expect(edgeCaseOptions.retryDelay).toBe(1);
    });
  });

  describe("Read-Only Transactions", () => {
    it("should support read-only transaction configuration", () => {
      const readOnlyOptions: TransactionOptions = {
        readOnly: true,
        isolationLevel: "REPEATABLE_READ",
      };

      expect(readOnlyOptions.readOnly).toBe(true);
      expect(readOnlyOptions.isolationLevel).toBe("REPEATABLE_READ");
    });

    it("should support read-write transaction configuration", () => {
      const readWriteOptions: TransactionOptions = {
        readOnly: false,
        retryOnFailure: true,
      };

      expect(readWriteOptions.readOnly).toBe(false);
      expect(readWriteOptions.retryOnFailure).toBe(true);
    });
  });

  describe("Option Merging", () => {
    it("should support merging transaction options", () => {
      const baseOptions: TransactionOptions = {
        timeout: 30000,
        isolationLevel: "READ_COMMITTED",
        retryOnFailure: false,
      };

      const overrideOptions: TransactionOptions = {
        timeout: 45000,
        readOnly: true,
      };

      const mergedOptions: TransactionOptions = {
        ...baseOptions,
        ...overrideOptions,
      };

      expect(mergedOptions.timeout).toBe(45000); // overridden
      expect(mergedOptions.isolationLevel).toBe("READ_COMMITTED"); // from base
      expect(mergedOptions.retryOnFailure).toBe(false); // from base
      expect(mergedOptions.readOnly).toBe(true); // new option
    });
  });

  describe("Default Behavior", () => {
    it("should work without any specified options", () => {
      const options: TransactionOptions = {};

      // All properties should be undefined (allowing defaults to be applied elsewhere)
      expect(options.timeout).toBeUndefined();
      expect(options.isolationLevel).toBeUndefined();
      expect(options.retryOnFailure).toBeUndefined();
      expect(options.maxRetries).toBeUndefined();
      expect(options.retryDelay).toBeUndefined();
      expect(options.readOnly).toBeUndefined();
    });
  });
});
