import { TransactionError } from "../TransactionError";
import { DatabaseError } from "../DatabaseError";
import { DatabaseErrorCode } from "../DatabaseErrorCode";

describe("TransactionError", () => {
  describe("constructor", () => {
    it("should create error with operation", () => {
      const error = new TransactionError(
        "Transaction failed during commit",
        "commit",
      );

      expect(error.message).toBe("Transaction failed during commit");
      expect(error.code).toBe(DatabaseErrorCode.TRANSACTION_FAILED);
      expect(error.context).toEqual({ operation: "commit" });
      expect(error.name).toBe("TransactionError");
    });

    it("should create error without operation", () => {
      const error = new TransactionError("Transaction deadlock detected");

      expect(error.message).toBe("Transaction deadlock detected");
      expect(error.code).toBe(DatabaseErrorCode.TRANSACTION_FAILED);
      expect(error.context).toBeUndefined();
      expect(error.name).toBe("TransactionError");
    });

    it("should create error with cause", () => {
      const cause = new Error("Database locked");
      const error = new TransactionError(
        "Transaction rollback",
        "rollback",
        cause,
      );

      expect(error.message).toBe("Transaction rollback");
      expect(error.code).toBe(DatabaseErrorCode.TRANSACTION_FAILED);
      expect(error.context).toEqual({ operation: "rollback" });
      expect(error.cause).toBe(cause);
    });

    it("should be instance of DatabaseError", () => {
      const error = new TransactionError("Test error");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error).toBeInstanceOf(TransactionError);
    });
  });

  describe("serialization", () => {
    it("should serialize properly with operation and cause", () => {
      const cause = new Error("Deadlock detected");
      const error = new TransactionError("Transaction failed", "begin", cause);
      const json = error.toJSON();

      expect(json).toEqual({
        name: "TransactionError",
        code: DatabaseErrorCode.TRANSACTION_FAILED,
        message: "Transaction failed",
        context: { operation: "begin" },
        cause: "Deadlock detected",
      });
    });

    it("should serialize properly without optional parameters", () => {
      const error = new TransactionError("Transaction timeout");
      const json = error.toJSON();

      expect(json).toEqual({
        name: "TransactionError",
        code: DatabaseErrorCode.TRANSACTION_FAILED,
        message: "Transaction timeout",
        context: undefined,
        cause: undefined,
      });
    });
  });
});
