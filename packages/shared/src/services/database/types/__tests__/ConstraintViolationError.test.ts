import { ConstraintViolationError } from "../ConstraintViolationError";
import { DatabaseError } from "../DatabaseError";
import { DatabaseErrorCode } from "../DatabaseErrorCode";

describe("ConstraintViolationError", () => {
  describe("constructor", () => {
    it("should create unique constraint violation error", () => {
      const error = new ConstraintViolationError(
        "Duplicate email address",
        "unique",
        "users",
        "email",
      );

      expect(error.message).toBe("Duplicate email address");
      expect(error.code).toBe(DatabaseErrorCode.UNIQUE_CONSTRAINT_VIOLATION);
      expect(error.context).toEqual({
        constraintType: "unique",
        tableName: "users",
        columnName: "email",
      });
      expect(error.name).toBe("ConstraintViolationError");
    });

    it("should create foreign key constraint violation error", () => {
      const error = new ConstraintViolationError(
        "Referenced record does not exist",
        "foreign_key",
        "orders",
        "user_id",
      );

      expect(error.message).toBe("Referenced record does not exist");
      expect(error.code).toBe(
        DatabaseErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION,
      );
      expect(error.context).toEqual({
        constraintType: "foreign_key",
        tableName: "orders",
        columnName: "user_id",
      });
    });

    it("should create check constraint violation error", () => {
      const error = new ConstraintViolationError(
        "Value out of range",
        "check",
        "products",
        "price",
      );

      expect(error.message).toBe("Value out of range");
      expect(error.code).toBe(DatabaseErrorCode.CHECK_CONSTRAINT_VIOLATION);
      expect(error.context).toEqual({
        constraintType: "check",
        tableName: "products",
        columnName: "price",
      });
    });

    it("should create not null constraint violation error", () => {
      const error = new ConstraintViolationError(
        "Required field cannot be null",
        "not_null",
        "users",
        "name",
      );

      expect(error.message).toBe("Required field cannot be null");
      expect(error.code).toBe(DatabaseErrorCode.NOT_NULL_CONSTRAINT_VIOLATION);
      expect(error.context).toEqual({
        constraintType: "not_null",
        tableName: "users",
        columnName: "name",
      });
    });

    it("should create error without table and column names", () => {
      const error = new ConstraintViolationError(
        "Constraint violated",
        "unique",
      );

      expect(error.message).toBe("Constraint violated");
      expect(error.code).toBe(DatabaseErrorCode.UNIQUE_CONSTRAINT_VIOLATION);
      expect(error.context).toEqual({ constraintType: "unique" });
    });

    it("should create error with cause", () => {
      const cause = new Error("SQLITE_CONSTRAINT_UNIQUE");
      const error = new ConstraintViolationError(
        "Unique constraint failed",
        "unique",
        "users",
        "email",
        cause,
      );

      expect(error.message).toBe("Unique constraint failed");
      expect(error.cause).toBe(cause);
    });

    it("should be instance of DatabaseError", () => {
      const error = new ConstraintViolationError("Test error", "unique");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error).toBeInstanceOf(ConstraintViolationError);
    });
  });

  describe("error code mapping", () => {
    it("should map constraint types to correct error codes", () => {
      const uniqueError = new ConstraintViolationError("Test", "unique");
      expect(uniqueError.code).toBe(
        DatabaseErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
      );

      const fkError = new ConstraintViolationError("Test", "foreign_key");
      expect(fkError.code).toBe(
        DatabaseErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION,
      );

      const checkError = new ConstraintViolationError("Test", "check");
      expect(checkError.code).toBe(
        DatabaseErrorCode.CHECK_CONSTRAINT_VIOLATION,
      );

      const notNullError = new ConstraintViolationError("Test", "not_null");
      expect(notNullError.code).toBe(
        DatabaseErrorCode.NOT_NULL_CONSTRAINT_VIOLATION,
      );
    });
  });

  describe("serialization", () => {
    it("should serialize properly with all context", () => {
      const cause = new Error("SQLite constraint error");
      const error = new ConstraintViolationError(
        "Email already exists",
        "unique",
        "users",
        "email",
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConstraintViolationError",
        code: DatabaseErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
        message: "Email already exists",
        context: {
          constraintType: "unique",
          tableName: "users",
          columnName: "email",
        },
        cause: "SQLite constraint error",
      });
    });

    it("should serialize properly with minimal context", () => {
      const error = new ConstraintViolationError(
        "Constraint violated",
        "check",
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConstraintViolationError",
        code: DatabaseErrorCode.CHECK_CONSTRAINT_VIOLATION,
        message: "Constraint violated",
        context: { constraintType: "check" },
        cause: undefined,
      });
    });
  });
});
