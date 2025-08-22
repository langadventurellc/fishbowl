import { ConnectionError } from "../ConnectionError";
import { DatabaseError } from "../DatabaseError";
import { DatabaseErrorCode } from "../DatabaseErrorCode";

describe("ConnectionError", () => {
  describe("constructor", () => {
    it("should create error with database path", () => {
      const error = new ConnectionError(
        "Failed to connect",
        "/path/to/database.db",
      );

      expect(error.message).toBe("Failed to connect");
      expect(error.code).toBe(DatabaseErrorCode.CONNECTION_FAILED);
      expect(error.context).toEqual({ databasePath: "/path/to/database.db" });
      expect(error.name).toBe("ConnectionError");
    });

    it("should create error without database path", () => {
      const error = new ConnectionError("Connection timeout");

      expect(error.message).toBe("Connection timeout");
      expect(error.code).toBe(DatabaseErrorCode.CONNECTION_FAILED);
      expect(error.context).toBeUndefined();
      expect(error.name).toBe("ConnectionError");
    });

    it("should create error with cause", () => {
      const cause = new Error("Network error");
      const error = new ConnectionError("Failed to connect", "/db/path", cause);

      expect(error.message).toBe("Failed to connect");
      expect(error.code).toBe(DatabaseErrorCode.CONNECTION_FAILED);
      expect(error.context).toEqual({ databasePath: "/db/path" });
      expect(error.cause).toBe(cause);
    });

    it("should be instance of DatabaseError", () => {
      const error = new ConnectionError("Test error");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error).toBeInstanceOf(ConnectionError);
    });
  });

  describe("serialization", () => {
    it("should serialize properly with toJSON", () => {
      const cause = new Error("Network issue");
      const error = new ConnectionError(
        "Connection failed",
        "/path/db.sqlite",
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConnectionError",
        code: DatabaseErrorCode.CONNECTION_FAILED,
        message: "Connection failed",
        context: { databasePath: "/path/db.sqlite" },
        cause: "Network issue",
      });
    });

    it("should serialize properly without optional parameters", () => {
      const error = new ConnectionError("Connection timeout");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "ConnectionError",
        code: DatabaseErrorCode.CONNECTION_FAILED,
        message: "Connection timeout",
        context: undefined,
        cause: undefined,
      });
    });
  });
});
