import type { TransactionIsolationLevel } from "../TransactionIsolationLevel";

describe("TransactionIsolationLevel", () => {
  describe("Type Validation", () => {
    it("should accept all valid isolation level values", () => {
      const readUncommitted: TransactionIsolationLevel = "READ_UNCOMMITTED";
      const readCommitted: TransactionIsolationLevel = "READ_COMMITTED";
      const repeatableRead: TransactionIsolationLevel = "REPEATABLE_READ";
      const serializable: TransactionIsolationLevel = "SERIALIZABLE";

      expect(readUncommitted).toBe("READ_UNCOMMITTED");
      expect(readCommitted).toBe("READ_COMMITTED");
      expect(repeatableRead).toBe("REPEATABLE_READ");
      expect(serializable).toBe("SERIALIZABLE");
    });

    it("should work in arrays", () => {
      const levels: TransactionIsolationLevel[] = [
        "READ_UNCOMMITTED",
        "READ_COMMITTED",
        "REPEATABLE_READ",
        "SERIALIZABLE",
      ];

      expect(levels).toHaveLength(4);
      expect(levels[0]).toBe("READ_UNCOMMITTED");
      expect(levels[1]).toBe("READ_COMMITTED");
      expect(levels[2]).toBe("REPEATABLE_READ");
      expect(levels[3]).toBe("SERIALIZABLE");
    });

    it("should work in function parameters", () => {
      function setIsolationLevel(level: TransactionIsolationLevel): string {
        return `Setting isolation level to: ${level}`;
      }

      expect(setIsolationLevel("READ_COMMITTED")).toBe(
        "Setting isolation level to: READ_COMMITTED",
      );
      expect(setIsolationLevel("SERIALIZABLE")).toBe(
        "Setting isolation level to: SERIALIZABLE",
      );
    });

    it("should work in object properties", () => {
      interface TestConfig {
        isolation: TransactionIsolationLevel;
        name: string;
      }

      const configs: TestConfig[] = [
        { isolation: "READ_UNCOMMITTED", name: "Low isolation" },
        { isolation: "READ_COMMITTED", name: "Default isolation" },
        { isolation: "REPEATABLE_READ", name: "Medium isolation" },
        { isolation: "SERIALIZABLE", name: "High isolation" },
      ];

      expect(configs).toHaveLength(4);
      configs.forEach((config) => {
        expect(typeof config.isolation).toBe("string");
        expect(typeof config.name).toBe("string");
      });
    });
  });

  describe("String Literal Validation", () => {
    it("should match exact string values", () => {
      function testLevel(level: TransactionIsolationLevel): boolean {
        return level === "READ_COMMITTED";
      }

      // These should validate exact string matching behavior
      expect(testLevel("READ_COMMITTED")).toBe(true);
      expect(testLevel("READ_UNCOMMITTED")).toBe(false);
      expect(testLevel("REPEATABLE_READ")).toBe(false);
      expect(testLevel("SERIALIZABLE")).toBe(false);
    });

    it("should work with switch statements", () => {
      function getIsolationDescription(
        level: TransactionIsolationLevel,
      ): string {
        switch (level) {
          case "READ_UNCOMMITTED":
            return "Lowest isolation level";
          case "READ_COMMITTED":
            return "Default isolation level";
          case "REPEATABLE_READ":
            return "Medium isolation level";
          case "SERIALIZABLE":
            return "Highest isolation level";
          default: {
            // TypeScript should ensure this is never reached
            const exhaustiveCheck: never = level;
            return exhaustiveCheck;
          }
        }
      }

      expect(getIsolationDescription("READ_UNCOMMITTED")).toBe(
        "Lowest isolation level",
      );
      expect(getIsolationDescription("READ_COMMITTED")).toBe(
        "Default isolation level",
      );
      expect(getIsolationDescription("REPEATABLE_READ")).toBe(
        "Medium isolation level",
      );
      expect(getIsolationDescription("SERIALIZABLE")).toBe(
        "Highest isolation level",
      );
    });
  });

  describe("Type Safety", () => {
    it("should prevent assignment of invalid values at compile time", () => {
      // These tests verify that TypeScript compilation will catch invalid values
      // The tests themselves demonstrate the expected valid usage

      const validLevel: TransactionIsolationLevel = "READ_COMMITTED";
      expect(validLevel).toBe("READ_COMMITTED");

      // Note: The following would cause TypeScript compilation errors:
      // const invalidLevel: TransactionIsolationLevel = "INVALID_LEVEL";
      // const invalidLevel2: TransactionIsolationLevel = "read_committed"; // wrong case
      // const invalidLevel3: TransactionIsolationLevel = 123; // wrong type
    });

    it("should work with optional properties", () => {
      interface ConfigWithOptionalIsolation {
        level?: TransactionIsolationLevel;
        timeout: number;
      }

      const config1: ConfigWithOptionalIsolation = {
        timeout: 5000,
      };

      const config2: ConfigWithOptionalIsolation = {
        level: "SERIALIZABLE",
        timeout: 10000,
      };

      expect(config1.level).toBeUndefined();
      expect(config1.timeout).toBe(5000);
      expect(config2.level).toBe("SERIALIZABLE");
      expect(config2.timeout).toBe(10000);
    });
  });

  describe("Runtime Validation", () => {
    it("should support runtime validation functions", () => {
      function isValidIsolationLevel(
        value: string,
      ): value is TransactionIsolationLevel {
        return [
          "READ_UNCOMMITTED",
          "READ_COMMITTED",
          "REPEATABLE_READ",
          "SERIALIZABLE",
        ].includes(value);
      }

      expect(isValidIsolationLevel("READ_COMMITTED")).toBe(true);
      expect(isValidIsolationLevel("SERIALIZABLE")).toBe(true);
      expect(isValidIsolationLevel("INVALID_LEVEL")).toBe(false);
      expect(isValidIsolationLevel("read_committed")).toBe(false);
      expect(isValidIsolationLevel("")).toBe(false);
    });

    it("should work with value mapping", () => {
      const isolationLevelMap: Record<TransactionIsolationLevel, number> = {
        READ_UNCOMMITTED: 1,
        READ_COMMITTED: 2,
        REPEATABLE_READ: 3,
        SERIALIZABLE: 4,
      };

      expect(isolationLevelMap.READ_UNCOMMITTED).toBe(1);
      expect(isolationLevelMap.READ_COMMITTED).toBe(2);
      expect(isolationLevelMap.REPEATABLE_READ).toBe(3);
      expect(isolationLevelMap.SERIALIZABLE).toBe(4);
    });
  });
});
