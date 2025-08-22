import { DatabaseError } from "../DatabaseError";
import { DatabaseErrorCode } from "../DatabaseErrorCode";

class TestDatabaseError extends DatabaseError {
  constructor(
    code: DatabaseErrorCode,
    message: string,
    context?: Record<string, unknown>,
    cause?: Error,
  ) {
    super(code, message, context, cause);
  }
}

describe("DatabaseError", () => {
  describe("constructor", () => {
    it("should set all properties correctly", () => {
      const cause = new Error("Original error");
      const context = { table: "users", operation: "insert" };
      const error = new TestDatabaseError(
        DatabaseErrorCode.QUERY_EXECUTION_ERROR,
        "Test message",
        context,
        cause,
      );

      expect(error.message).toBe("Test message");
      expect(error.code).toBe(DatabaseErrorCode.QUERY_EXECUTION_ERROR);
      expect(error.context).toEqual(context);
      expect(error.cause).toBe(cause);
      expect(error.name).toBe("TestDatabaseError");
    });

    it("should work without context and cause parameters", () => {
      const error = new TestDatabaseError(
        DatabaseErrorCode.CONNECTION_FAILED,
        "Test message",
      );

      expect(error.message).toBe("Test message");
      expect(error.code).toBe(DatabaseErrorCode.CONNECTION_FAILED);
      expect(error.context).toBeUndefined();
      expect(error.cause).toBeUndefined();
      expect(error.name).toBe("TestDatabaseError");
    });

    it("should be instance of Error", () => {
      const error = new TestDatabaseError(
        DatabaseErrorCode.UNKNOWN_ERROR,
        "Test",
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatabaseError);
    });

    it("should have proper stack trace", () => {
      const error = new TestDatabaseError(
        DatabaseErrorCode.PERMISSION_DENIED,
        "Test",
      );

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });
  });

  describe("toJSON", () => {
    it("should serialize error with all properties", () => {
      const cause = new Error("Original error");
      const context = { table: "users" };
      const error = new TestDatabaseError(
        DatabaseErrorCode.CONSTRAINT_VIOLATION,
        "Test message",
        context,
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "TestDatabaseError",
        code: DatabaseErrorCode.CONSTRAINT_VIOLATION,
        message: "Test message",
        context: { table: "users" },
        cause: "Original error",
      });
    });

    it("should serialize error without context and cause", () => {
      const error = new TestDatabaseError(
        DatabaseErrorCode.TRANSACTION_FAILED,
        "Test",
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "TestDatabaseError",
        code: DatabaseErrorCode.TRANSACTION_FAILED,
        message: "Test",
        context: undefined,
        cause: undefined,
      });
    });

    it("should not include stack trace in JSON", () => {
      const error = new TestDatabaseError(
        DatabaseErrorCode.DATABASE_BUSY,
        "Test",
      );
      const json = error.toJSON();

      expect(json).not.toHaveProperty("stack");
    });

    it("should be properly serializable", () => {
      const error = new TestDatabaseError(
        DatabaseErrorCode.QUERY_SYNTAX_ERROR,
        "Test",
      );
      const json = error.toJSON();

      expect(() => JSON.stringify(json)).not.toThrow();
      const serialized = JSON.stringify(json);
      expect(() => JSON.parse(serialized)).not.toThrow();
    });
  });

  describe("error properties immutability", () => {
    it("should have readonly code property", () => {
      const error = new TestDatabaseError(
        DatabaseErrorCode.CONNECTION_FAILED,
        "Test",
      );

      expect(error.code).toBe(DatabaseErrorCode.CONNECTION_FAILED);
    });

    it("should have readonly context property", () => {
      const context = { operation: "test" };
      const error = new TestDatabaseError(
        DatabaseErrorCode.PERMISSION_DENIED,
        "Test",
        context,
      );

      expect(error.context).toBe(context);
    });

    it("should have readonly cause property", () => {
      const cause = new Error("Original");
      const error = new TestDatabaseError(
        DatabaseErrorCode.UNKNOWN_ERROR,
        "Test",
        undefined,
        cause,
      );

      expect(error.cause).toBe(cause);
    });
  });
});
