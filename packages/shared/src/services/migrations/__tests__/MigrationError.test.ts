import { MigrationError } from "../MigrationError";
import { MigrationErrorCode } from "../MigrationErrorCode";

describe("MigrationError", () => {
  describe("constructor", () => {
    it("should set all properties correctly", () => {
      const cause = new Error("SQL syntax error");
      const context = { operation: "apply", path: "/migrations/001_test.sql" };
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_EXECUTION_FAILED,
        "Migration failed to execute",
        "001_test.sql",
        context,
        cause,
      );

      expect(error.message).toBe("Migration failed to execute");
      expect(error.code).toBe(MigrationErrorCode.MIGRATION_EXECUTION_FAILED);
      expect(error.filename).toBe("001_test.sql");
      expect(error.context).toEqual(context);
      expect(error.cause).toBe(cause);
      expect(error.name).toBe("MigrationError");
    });

    it("should work without optional parameters", () => {
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_FILE_NOT_FOUND,
        "Migration file not found",
      );

      expect(error.message).toBe("Migration file not found");
      expect(error.code).toBe(MigrationErrorCode.MIGRATION_FILE_NOT_FOUND);
      expect(error.filename).toBeUndefined();
      expect(error.context).toBeUndefined();
      expect(error.cause).toBeUndefined();
      expect(error.name).toBe("MigrationError");
    });

    it("should work with only filename parameter", () => {
      const error = new MigrationError(
        MigrationErrorCode.INVALID_MIGRATION_FILENAME,
        "Invalid filename format",
        "invalid_name.sql",
      );

      expect(error.message).toBe("Invalid filename format");
      expect(error.code).toBe(MigrationErrorCode.INVALID_MIGRATION_FILENAME);
      expect(error.filename).toBe("invalid_name.sql");
      expect(error.context).toBeUndefined();
      expect(error.cause).toBeUndefined();
      expect(error.name).toBe("MigrationError");
    });

    it("should be instance of Error", () => {
      const error = new MigrationError(
        MigrationErrorCode.UNKNOWN_MIGRATION_ERROR,
        "Test error",
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(MigrationError);
    });

    it("should have proper stack trace", () => {
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_TIMEOUT,
        "Migration timed out",
      );

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });
  });

  describe("toJSON", () => {
    it("should serialize error with all properties", () => {
      const cause = new Error("Database connection lost");
      const context = {
        operation: "apply",
        executionTime: 5000,
        tableName: "users",
      };
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_SQL_ERROR,
        "SQL execution failed",
        "002_create_users.sql",
        context,
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "MigrationError",
        code: MigrationErrorCode.MIGRATION_SQL_ERROR,
        message: "SQL execution failed",
        filename: "002_create_users.sql",
        context: {
          operation: "apply",
          executionTime: 5000,
          tableName: "users",
        },
        cause: "Database connection lost",
      });
    });

    it("should serialize error without optional properties", () => {
      const error = new MigrationError(
        MigrationErrorCode.NO_MIGRATIONS_FOUND,
        "No migration files found in directory",
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "MigrationError",
        code: MigrationErrorCode.NO_MIGRATIONS_FOUND,
        message: "No migration files found in directory",
        filename: undefined,
        context: undefined,
        cause: undefined,
      });
    });

    it("should serialize error with only filename", () => {
      const error = new MigrationError(
        MigrationErrorCode.DUPLICATE_MIGRATION_ORDER,
        "Duplicate migration order detected",
        "003_duplicate.sql",
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "MigrationError",
        code: MigrationErrorCode.DUPLICATE_MIGRATION_ORDER,
        message: "Duplicate migration order detected",
        filename: "003_duplicate.sql",
        context: undefined,
        cause: undefined,
      });
    });

    it("should not include stack trace in JSON", () => {
      const error = new MigrationError(
        MigrationErrorCode.TRACKING_TABLE_CREATE_FAILED,
        "Failed to create migrations table",
      );
      const json = error.toJSON();

      expect(json).not.toHaveProperty("stack");
    });

    it("should be properly serializable", () => {
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_OUT_OF_ORDER,
        "Migration applied out of order",
        "005_out_of_order.sql",
      );
      const json = error.toJSON();

      expect(() => JSON.stringify(json)).not.toThrow();
      const serialized = JSON.stringify(json);
      expect(() => JSON.parse(serialized)).not.toThrow();

      const parsed = JSON.parse(serialized);
      expect(parsed.name).toBe("MigrationError");
      expect(parsed.filename).toBe("005_out_of_order.sql");
    });
  });

  describe("error properties immutability", () => {
    it("should have readonly code property", () => {
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_ROLLBACK_FAILED,
        "Rollback failed",
      );

      expect(error.code).toBe(MigrationErrorCode.MIGRATION_ROLLBACK_FAILED);
    });

    it("should have readonly filename property", () => {
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_FILE_READ_ERROR,
        "Cannot read file",
        "006_test.sql",
      );

      expect(error.filename).toBe("006_test.sql");
    });

    it("should have readonly context property", () => {
      const context = { operation: "validate", lineNumber: 42 };
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_SYSTEM_ERROR,
        "System error",
        "007_system.sql",
        context,
      );

      expect(error.context).toBe(context);
    });

    it("should have readonly cause property", () => {
      const cause = new Error("File system error");
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_DIRECTORY_ACCESS_ERROR,
        "Directory access denied",
        undefined,
        undefined,
        cause,
      );

      expect(error.cause).toBe(cause);
    });
  });

  describe("migration-specific functionality", () => {
    it("should handle migration context information", () => {
      const context = {
        migrationOrder: 5,
        expectedOrder: 3,
        appliedMigrations: ["001_init.sql", "002_users.sql"],
      };
      const error = new MigrationError(
        MigrationErrorCode.PENDING_MIGRATION_EXISTS,
        "Cannot skip pending migrations",
        "005_skip_attempt.sql",
        context,
      );

      expect(error.context?.migrationOrder).toBe(5);
      expect(error.context?.expectedOrder).toBe(3);
      expect(Array.isArray(error.context?.appliedMigrations)).toBe(true);
    });

    it("should preserve filename in error messages", () => {
      const filename = "010_complex_migration.sql";
      const error = new MigrationError(
        MigrationErrorCode.MIGRATION_ALREADY_APPLIED,
        `Migration ${filename} has already been applied`,
        filename,
      );

      expect(error.filename).toBe(filename);
      expect(error.message).toContain(filename);
    });
  });
});
