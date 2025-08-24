import { QueryError } from "../QueryError";
import { DatabaseError } from "../DatabaseError";
import { DatabaseErrorCode } from "../DatabaseErrorCode";

describe("QueryError", () => {
  describe("constructor", () => {
    it("should create error with SQL and parameters", () => {
      const sql = "SELECT * FROM users WHERE id = ?";
      const parameters = [123];
      const error = new QueryError("Invalid query", sql, parameters);

      expect(error.message).toBe("Invalid query");
      expect(error.code).toBe(DatabaseErrorCode.QUERY_EXECUTION_ERROR);
      expect(error.context).toEqual({ sql, parameters });
      expect(error.name).toBe("QueryError");
    });

    it("should create error with only SQL", () => {
      const sql = "INVALID SQL SYNTAX";
      const error = new QueryError("Syntax error", sql);

      expect(error.message).toBe("Syntax error");
      expect(error.code).toBe(DatabaseErrorCode.QUERY_EXECUTION_ERROR);
      expect(error.context).toEqual({ sql });
    });

    it("should create error with only parameters", () => {
      const parameters = ["test", 456];
      const error = new QueryError(
        "Parameter binding failed",
        undefined,
        parameters,
      );

      expect(error.message).toBe("Parameter binding failed");
      expect(error.code).toBe(DatabaseErrorCode.QUERY_EXECUTION_ERROR);
      expect(error.context).toEqual({ parameters });
    });

    it("should create error without SQL or parameters", () => {
      const error = new QueryError("Generic query error");

      expect(error.message).toBe("Generic query error");
      expect(error.code).toBe(DatabaseErrorCode.QUERY_EXECUTION_ERROR);
      expect(error.context).toBeUndefined();
    });

    it("should create error with cause", () => {
      const cause = new Error("SQLite error");
      const error = new QueryError(
        "Query failed",
        "SELECT * FROM test",
        [1, 2],
        cause,
      );

      expect(error.message).toBe("Query failed");
      expect(error.cause).toBe(cause);
    });

    it("should be instance of DatabaseError", () => {
      const error = new QueryError("Test error");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error).toBeInstanceOf(QueryError);
    });
  });

  describe("context handling", () => {
    it("should not set context when no SQL or parameters provided", () => {
      const error = new QueryError("Error message");
      expect(error.context).toBeUndefined();
    });

    it("should set context only with SQL when parameters are empty", () => {
      const error = new QueryError("Error", "SELECT 1", []);
      expect(error.context).toEqual({ sql: "SELECT 1", parameters: [] });
    });

    it("should handle undefined parameters gracefully", () => {
      const error = new QueryError("Error", "SELECT 1", undefined);
      expect(error.context).toEqual({ sql: "SELECT 1" });
    });
  });

  describe("serialization", () => {
    it("should serialize properly with all context", () => {
      const cause = new Error("Database locked");
      const error = new QueryError(
        "Query execution failed",
        "INSERT INTO users VALUES (?, ?)",
        ["john", "doe"],
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "QueryError",
        code: DatabaseErrorCode.QUERY_EXECUTION_ERROR,
        message: "Query execution failed",
        context: {
          sql: "INSERT INTO users VALUES (?, ?)",
          parameters: ["john", "doe"],
        },
        cause: "Database locked",
      });
    });

    it("should serialize properly without context", () => {
      const error = new QueryError("Generic error");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "QueryError",
        code: DatabaseErrorCode.QUERY_EXECUTION_ERROR,
        message: "Generic error",
        context: undefined,
        cause: undefined,
      });
    });
  });
});
