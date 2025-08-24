import { PermissionError } from "../PermissionError";
import { DatabaseError } from "../DatabaseError";
import { DatabaseErrorCode } from "../DatabaseErrorCode";

describe("PermissionError", () => {
  describe("constructor", () => {
    it("should create error with resource", () => {
      const error = new PermissionError(
        "Access denied to database file",
        "/path/to/database.db",
      );

      expect(error.message).toBe("Access denied to database file");
      expect(error.code).toBe(DatabaseErrorCode.PERMISSION_DENIED);
      expect(error.context).toEqual({ resource: "/path/to/database.db" });
      expect(error.name).toBe("PermissionError");
    });

    it("should create error without resource", () => {
      const error = new PermissionError("Insufficient privileges");

      expect(error.message).toBe("Insufficient privileges");
      expect(error.code).toBe(DatabaseErrorCode.PERMISSION_DENIED);
      expect(error.context).toBeUndefined();
      expect(error.name).toBe("PermissionError");
    });

    it("should create error with cause", () => {
      const cause = new Error("EACCES: permission denied");
      const error = new PermissionError(
        "Cannot write to database",
        "/readonly/db.sqlite",
        cause,
      );

      expect(error.message).toBe("Cannot write to database");
      expect(error.code).toBe(DatabaseErrorCode.PERMISSION_DENIED);
      expect(error.context).toEqual({ resource: "/readonly/db.sqlite" });
      expect(error.cause).toBe(cause);
    });

    it("should be instance of DatabaseError", () => {
      const error = new PermissionError("Test error");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error).toBeInstanceOf(PermissionError);
    });
  });

  describe("serialization", () => {
    it("should serialize properly with resource and cause", () => {
      const cause = new Error("File system error");
      const error = new PermissionError(
        "Access denied",
        "/secure/database.db",
        cause,
      );
      const json = error.toJSON();

      expect(json).toEqual({
        name: "PermissionError",
        code: DatabaseErrorCode.PERMISSION_DENIED,
        message: "Access denied",
        context: { resource: "/secure/database.db" },
        cause: "File system error",
      });
    });

    it("should serialize properly without optional parameters", () => {
      const error = new PermissionError("Generic permission error");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "PermissionError",
        code: DatabaseErrorCode.PERMISSION_DENIED,
        message: "Generic permission error",
        context: undefined,
        cause: undefined,
      });
    });
  });
});
