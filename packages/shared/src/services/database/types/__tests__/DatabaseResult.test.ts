import type { DatabaseResult } from "../DatabaseResult";
import type { QueryMetadata } from "../QueryMetadata";
import type { QueryResult } from "../QueryResult";
import type { ExecutionResult } from "../ExecutionResult";

describe("DatabaseResult types", () => {
  describe("DatabaseResult interface", () => {
    it("should allow creation with all properties", () => {
      const result: DatabaseResult = {
        lastInsertRowid: 123,
        changes: 1,
        affectedRows: 1,
      };

      expect(result.lastInsertRowid).toBe(123);
      expect(result.changes).toBe(1);
      expect(result.affectedRows).toBe(1);
    });

    it("should allow creation without lastInsertRowid", () => {
      const result: DatabaseResult = {
        changes: 2,
        affectedRows: 2,
      };

      expect(result.lastInsertRowid).toBeUndefined();
      expect(result.changes).toBe(2);
      expect(result.affectedRows).toBe(2);
    });

    it("should require changes and affectedRows properties", () => {
      // TypeScript compilation test - these properties are required
      const result: DatabaseResult = {
        changes: 0,
        affectedRows: 0,
      };

      expect(typeof result.changes).toBe("number");
      expect(typeof result.affectedRows).toBe("number");
    });
  });

  describe("QueryMetadata interface", () => {
    it("should allow creation with all properties", () => {
      const metadata: QueryMetadata = {
        columns: ["id", "name", "email"],
        executionTime: 25.5,
        rowsExamined: 1000,
      };

      expect(metadata.columns).toEqual(["id", "name", "email"]);
      expect(metadata.executionTime).toBe(25.5);
      expect(metadata.rowsExamined).toBe(1000);
    });

    it("should allow creation with no properties", () => {
      const metadata: QueryMetadata = {};

      expect(metadata.columns).toBeUndefined();
      expect(metadata.executionTime).toBeUndefined();
      expect(metadata.rowsExamined).toBeUndefined();
    });

    it("should allow partial property sets", () => {
      const metadata1: QueryMetadata = { columns: ["id"] };
      const metadata2: QueryMetadata = { executionTime: 10 };
      const metadata3: QueryMetadata = { rowsExamined: 500 };

      expect(metadata1.columns).toEqual(["id"]);
      expect(metadata2.executionTime).toBe(10);
      expect(metadata3.rowsExamined).toBe(500);
    });
  });

  describe("QueryResult interface", () => {
    interface TestUser {
      id: number;
      name: string;
      email: string;
    }

    it("should work with typed row data", () => {
      const users: TestUser[] = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
      ];

      const result: QueryResult<TestUser> = {
        rows: users,
        metadata: {
          columns: ["id", "name", "email"],
          executionTime: 15.2,
        },
      };

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]!.name).toBe("John Doe");
      expect(result.rows[1]!.email).toBe("jane@example.com");
      expect(result.metadata?.columns).toEqual(["id", "name", "email"]);
    });

    it("should work with empty result set", () => {
      const result: QueryResult<TestUser> = {
        rows: [],
      };

      expect(result.rows).toHaveLength(0);
      expect(result.metadata).toBeUndefined();
    });

    it("should work without metadata", () => {
      const result: QueryResult<TestUser> = {
        rows: [{ id: 1, name: "Test", email: "test@example.com" }],
      };

      expect(result.rows).toHaveLength(1);
      expect(result.metadata).toBeUndefined();
    });

    it("should work with unknown type (default)", () => {
      const result: QueryResult = {
        rows: [{ dynamic: "data" }, { another: "row" }],
      };

      expect(result.rows).toHaveLength(2);
    });

    it("should preserve type safety for row data", () => {
      const result: QueryResult<TestUser> = {
        rows: [{ id: 1, name: "Test User", email: "test@example.com" }],
      };

      // TypeScript should enforce the correct type
      const user = result.rows[0]!;
      expect(typeof user.id).toBe("number");
      expect(typeof user.name).toBe("string");
      expect(typeof user.email).toBe("string");
    });
  });

  describe("ExecutionResult interface", () => {
    it("should work for successful operations", () => {
      const result: ExecutionResult = {
        success: true,
        lastInsertRowid: 456,
        changes: 1,
        affectedRows: 1,
      };

      expect(result.success).toBe(true);
      expect(result.lastInsertRowid).toBe(456);
      expect(result.changes).toBe(1);
      expect(result.affectedRows).toBe(1);
      expect(result.error).toBeUndefined();
      expect(result.errorCode).toBeUndefined();
    });

    it("should work for failed operations", () => {
      const result: ExecutionResult = {
        success: false,
        changes: 0,
        affectedRows: 0,
        error: "Constraint violation: UNIQUE constraint failed",
        errorCode: "SQLITE_CONSTRAINT_UNIQUE",
      };

      expect(result.success).toBe(false);
      expect(result.changes).toBe(0);
      expect(result.affectedRows).toBe(0);
      expect(result.error).toBe(
        "Constraint violation: UNIQUE constraint failed",
      );
      expect(result.errorCode).toBe("SQLITE_CONSTRAINT_UNIQUE");
      expect(result.lastInsertRowid).toBeUndefined();
    });

    it("should work with numeric error codes", () => {
      const result: ExecutionResult = {
        success: false,
        changes: 0,
        affectedRows: 0,
        error: "Database locked",
        errorCode: 5, // SQLITE_BUSY
      };

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(5);
    });

    it("should extend DatabaseResult properly", () => {
      const result: ExecutionResult = {
        success: true,
        lastInsertRowid: 789,
        changes: 3,
        affectedRows: 3,
      };

      // Should have all DatabaseResult properties
      expect(typeof result.lastInsertRowid).toBe("number");
      expect(typeof result.changes).toBe("number");
      expect(typeof result.affectedRows).toBe("number");

      // Should have ExecutionResult-specific properties
      expect(typeof result.success).toBe("boolean");
    });

    it("should work without optional error properties", () => {
      const successResult: ExecutionResult = {
        success: true,
        changes: 1,
        affectedRows: 1,
      };

      const failureResult: ExecutionResult = {
        success: false,
        changes: 0,
        affectedRows: 0,
      };

      expect(successResult.error).toBeUndefined();
      expect(successResult.errorCode).toBeUndefined();
      expect(failureResult.error).toBeUndefined();
      expect(failureResult.errorCode).toBeUndefined();
    });
  });

  describe("Type compatibility", () => {
    it("should be compatible with better-sqlite3 result format", () => {
      // Simulating better-sqlite3 result structure
      const sqliteResult = {
        lastInsertRowid: 123,
        changes: 1,
      };

      const databaseResult: DatabaseResult = {
        ...sqliteResult,
        affectedRows: sqliteResult.changes,
      };

      expect(databaseResult.lastInsertRowid).toBe(123);
      expect(databaseResult.changes).toBe(1);
      expect(databaseResult.affectedRows).toBe(1);
    });

    it("should work with different result structures", () => {
      // Testing flexibility for different database drivers
      const result1: DatabaseResult = {
        changes: 5,
        affectedRows: 5,
      };

      const result2: DatabaseResult = {
        lastInsertRowid: 999,
        changes: 1,
        affectedRows: 1,
      };

      expect(result1.lastInsertRowid).toBeUndefined();
      expect(result2.lastInsertRowid).toBe(999);
    });
  });

  describe("Generic type inference", () => {
    it("should properly infer types for QueryResult", () => {
      interface Product {
        id: number;
        name: string;
        price: number;
      }

      const products: Product[] = [
        { id: 1, name: "Widget", price: 9.99 },
        { id: 2, name: "Gadget", price: 19.99 },
      ];

      const result: QueryResult<Product> = {
        rows: products,
      };

      // Type inference should work correctly
      result.rows.forEach((product) => {
        expect(typeof product.id).toBe("number");
        expect(typeof product.name).toBe("string");
        expect(typeof product.price).toBe("number");
      });
    });

    it("should handle complex nested types", () => {
      interface UserWithProfile {
        id: number;
        user: {
          name: string;
          email: string;
        };
        profile: {
          bio: string;
          avatar?: string;
        };
      }

      const complexData: UserWithProfile = {
        id: 1,
        user: {
          name: "John Doe",
          email: "john@example.com",
        },
        profile: {
          bio: "Software developer",
          avatar: "avatar.jpg",
        },
      };

      const result: QueryResult<UserWithProfile> = {
        rows: [complexData],
      };

      expect(result.rows[0]!.user.name).toBe("John Doe");
      expect(result.rows[0]!.profile.bio).toBe("Software developer");
    });
  });
});
