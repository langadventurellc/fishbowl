import type { DatabaseBridge } from "../DatabaseBridge";
import type { DatabaseResult } from "../types/DatabaseResult";

/**
 * Test suite for DatabaseBridge interface contract and type safety.
 * These tests verify the interface compiles correctly and maintains type safety.
 */

// Test interfaces for type checking
interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

describe("DatabaseBridge Interface", () => {
  // Mock implementation for testing interface compliance
  const createMockBridge = (): DatabaseBridge => ({
    async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
      // Mock implementation - returns empty array
      return [] as T[];
    },

    async execute(sql: string, params?: unknown[]): Promise<DatabaseResult> {
      // Mock implementation - returns minimal result
      return {
        lastInsertRowid: 1,
        changes: 1,
        affectedRows: 1,
      };
    },

    async transaction<T>(
      callback: (db: DatabaseBridge) => Promise<T>,
    ): Promise<T> {
      // Mock implementation - just execute callback with this instance
      return callback(this);
    },

    async close(): Promise<void> {
      // Mock implementation - no-op
    },

    isConnected(): boolean {
      return true;
    },

    async backup(path: string): Promise<void> {
      // Mock implementation - no-op
    },

    async vacuum(): Promise<void> {
      // Mock implementation - no-op
    },

    async getSize(): Promise<number> {
      return 1024;
    },
  });

  describe("Interface Compliance", () => {
    it("should implement all required methods", () => {
      const bridge = createMockBridge();

      // Required methods must exist
      expect(typeof bridge.query).toBe("function");
      expect(typeof bridge.execute).toBe("function");
      expect(typeof bridge.transaction).toBe("function");
      expect(typeof bridge.close).toBe("function");
    });

    it("should implement optional methods correctly", () => {
      const bridge = createMockBridge();

      // Optional methods should be functions when implemented
      expect(typeof bridge.isConnected).toBe("function");
      expect(typeof bridge.backup).toBe("function");
      expect(typeof bridge.vacuum).toBe("function");
      expect(typeof bridge.getSize).toBe("function");
    });

    it("should allow implementations without optional methods", () => {
      // This should compile without error
      const minimalBridge: DatabaseBridge = {
        async query<T>(): Promise<T[]> {
          return [];
        },
        async execute(): Promise<DatabaseResult> {
          return { changes: 0, affectedRows: 0 };
        },
        async transaction<T>(
          callback: (db: DatabaseBridge) => Promise<T>,
        ): Promise<T> {
          return callback(this);
        },
        async close(): Promise<void> {},
      };

      expect(minimalBridge).toBeDefined();
      expect(minimalBridge.isConnected).toBeUndefined();
      expect(minimalBridge.backup).toBeUndefined();
      expect(minimalBridge.vacuum).toBeUndefined();
      expect(minimalBridge.getSize).toBeUndefined();
    });
  });

  describe("Type Safety Tests", () => {
    let bridge: DatabaseBridge;

    beforeEach(() => {
      bridge = createMockBridge();
    });

    it("should support generic query typing", async () => {
      // These should compile with correct types
      const users: User[] = await bridge.query<User>("SELECT * FROM users");
      const products: Product[] = await bridge.query<Product>(
        "SELECT * FROM products WHERE active = ?",
        [true],
      );
      const anyResults: unknown[] = await bridge.query("SELECT * FROM misc");

      expect(Array.isArray(users)).toBe(true);
      expect(Array.isArray(products)).toBe(true);
      expect(Array.isArray(anyResults)).toBe(true);
    });

    it("should support parameter binding types", async () => {
      // Various parameter types should be accepted
      await bridge.query("SELECT * FROM users WHERE id = ?", [123]);
      await bridge.query("SELECT * FROM users WHERE name = ?", ["John"]);
      await bridge.query("SELECT * FROM users WHERE active = ?", [true]);
      await bridge.query("SELECT * FROM users WHERE created_at > ?", [
        new Date(),
      ]);
      await bridge.query("SELECT * FROM users WHERE data = ?", [null]);
      await bridge.query("SELECT * FROM users WHERE settings = ?", [
        { theme: "dark" },
      ]);

      // Arrays of mixed types should work
      await bridge.query(
        "SELECT * FROM users WHERE id = ? AND name = ? AND active = ?",
        [123, "John", true],
      );
    });

    it("should return proper DatabaseResult type for execute", async () => {
      const result = await bridge.execute(
        "INSERT INTO users (name) VALUES (?)",
        ["John"],
      );

      // Result should have DatabaseResult properties
      expect(typeof result.changes).toBe("number");
      expect(typeof result.affectedRows).toBe("number");
      // lastInsertRowid is optional
      if (result.lastInsertRowid !== undefined) {
        expect(typeof result.lastInsertRowid).toBe("number");
      }
    });

    it("should support generic transaction return types", async () => {
      // Transaction should preserve callback return type
      const userId: number = await bridge.transaction(async (db) => {
        const result = await db.execute("INSERT INTO users (name) VALUES (?)", [
          "Jane",
        ]);
        return result.lastInsertRowid || 0;
      });

      const userCount: number = await bridge.transaction(async (db) => {
        const users = await db.query<User>("SELECT * FROM users");
        return users.length;
      });

      const complexResult: { success: boolean; data: User[] } =
        await bridge.transaction(async (db) => {
          const users = await db.query<User>(
            "SELECT * FROM users WHERE active = ?",
            [true],
          );
          return { success: true, data: users };
        });

      expect(typeof userId).toBe("number");
      expect(typeof userCount).toBe("number");
      expect(typeof complexResult.success).toBe("boolean");
      expect(Array.isArray(complexResult.data)).toBe(true);
    });

    it("should support nested transactions", async () => {
      // Transaction callback receives DatabaseBridge, allowing nested operations
      const result = await bridge.transaction(async (db) => {
        const user = await db.execute("INSERT INTO users (name) VALUES (?)", [
          "John",
        ]);

        // Can call any bridge method within transaction
        const users = await db.query<User>("SELECT * FROM users");
        const profile = await db.execute(
          "INSERT INTO profiles (user_id) VALUES (?)",
          [user.lastInsertRowid],
        );

        return {
          userId: user.lastInsertRowid,
          userCount: users.length,
          profileId: profile.lastInsertRowid,
        };
      });

      expect(typeof result.userId).toBe("number");
      expect(typeof result.userCount).toBe("number");
      expect(typeof result.profileId).toBe("number");
    });
  });

  describe("Method Signature Tests", () => {
    let bridge: DatabaseBridge;

    beforeEach(() => {
      bridge = createMockBridge();
    });

    it("should accept SQL strings and optional parameters", async () => {
      // Should work with just SQL
      await bridge.query("SELECT * FROM users");
      await bridge.execute("DELETE FROM users");

      // Should work with parameters
      await bridge.query("SELECT * FROM users WHERE id = ?", [123]);
      await bridge.execute("UPDATE users SET name = ? WHERE id = ?", [
        "John",
        123,
      ]);

      // Should work with empty parameter array
      await bridge.query("SELECT * FROM users", []);
      await bridge.execute("DELETE FROM users", []);
    });

    it("should return promises for all methods", () => {
      // All methods should return promises
      const queryPromise = bridge.query("SELECT 1");
      const executePromise = bridge.execute("SELECT 1");
      const transactionPromise = bridge.transaction(async () => "result");
      const closePromise = bridge.close();

      expect(queryPromise).toBeInstanceOf(Promise);
      expect(executePromise).toBeInstanceOf(Promise);
      expect(transactionPromise).toBeInstanceOf(Promise);
      expect(closePromise).toBeInstanceOf(Promise);
    });

    it("should handle optional methods gracefully", () => {
      const bridge = createMockBridge();

      // Optional methods should exist on this implementation
      expect(bridge.isConnected?.()).toBe(true);

      // Should handle missing optional methods
      const minimalBridge: DatabaseBridge = {
        async query<T>(): Promise<T[]> {
          return [];
        },
        async execute(): Promise<DatabaseResult> {
          return { changes: 0, affectedRows: 0 };
        },
        async transaction<T>(
          callback: (db: DatabaseBridge) => Promise<T>,
        ): Promise<T> {
          return callback(this);
        },
        async close(): Promise<void> {},
      };

      // Accessing undefined optional methods should not throw
      expect(minimalBridge.isConnected?.()).toBeUndefined();
      expect(minimalBridge.backup).toBeUndefined();
      expect(minimalBridge.vacuum).toBeUndefined();
      expect(minimalBridge.getSize).toBeUndefined();
    });
  });

  describe("Type Constraint Tests", () => {
    it("should enforce proper parameter array types", () => {
      const bridge = createMockBridge();

      // These should compile without type errors
      bridge.query("SELECT * FROM users", []);
      bridge.query("SELECT * FROM users", [123, "string", true, null]);
      bridge.query("SELECT * FROM users", undefined);

      // TypeScript should accept these parameter types
      const params: unknown[] = [1, "test", true, { data: "value" }];
      bridge.query("SELECT * FROM users WHERE id = ?", params);
    });

    it("should preserve generic type constraints", async () => {
      const bridge = createMockBridge();

      // TypeScript should infer the correct return types
      const users = await bridge.query<User>("SELECT * FROM users");
      const firstUser = users[0]; // Should be User | undefined

      if (firstUser) {
        // TypeScript should know these properties exist
        const name: string = firstUser.name;
        const id: number = firstUser.id;
        const email: string = firstUser.email;
        const active: boolean = firstUser.active;

        expect(typeof name).toBe("string");
        expect(typeof id).toBe("number");
        expect(typeof email).toBe("string");
        expect(typeof active).toBe("boolean");
      }
    });

    it("should support database result interface requirements", async () => {
      const bridge = createMockBridge();
      const result = await bridge.execute(
        "INSERT INTO users (name) VALUES (?)",
        ["John"],
      );

      // These properties must exist per DatabaseResult interface
      expect(typeof result.changes).toBe("number");
      expect(typeof result.affectedRows).toBe("number");

      // This property is optional
      if (result.lastInsertRowid !== undefined) {
        expect(typeof result.lastInsertRowid).toBe("number");
      }
    });
  });

  describe("Usage Pattern Tests", () => {
    let bridge: DatabaseBridge;

    beforeEach(() => {
      bridge = createMockBridge();
    });

    it("should support common query patterns", async () => {
      // Simple queries
      await bridge.query("SELECT 1");
      await bridge.query<{ count: number }>(
        "SELECT COUNT(*) as count FROM users",
      );

      // Parameterized queries
      await bridge.query<User>("SELECT * FROM users WHERE active = ?", [true]);
      await bridge.query<User>(
        "SELECT * FROM users WHERE id IN (?, ?, ?)",
        [1, 2, 3],
      );

      // Complex queries with joins
      await bridge.query<User & { profile_bio: string }>(
        "SELECT u.*, p.bio as profile_bio FROM users u JOIN profiles p ON u.id = p.user_id WHERE u.active = ?",
        [true],
      );
    });

    it("should support common execution patterns", async () => {
      // INSERT operations
      await bridge.execute("INSERT INTO users (name, email) VALUES (?, ?)", [
        "John",
        "john@example.com",
      ]);

      // UPDATE operations
      await bridge.execute("UPDATE users SET active = ? WHERE id = ?", [
        false,
        123,
      ]);

      // DELETE operations
      await bridge.execute("DELETE FROM users WHERE active = ?", [false]);

      // Batch operations
      await bridge.execute(
        "INSERT INTO users (name, email) VALUES (?, ?), (?, ?)",
        ["John", "john@example.com", "Jane", "jane@example.com"],
      );
    });

    it("should support transaction patterns", async () => {
      // Simple transaction
      await bridge.transaction(async (db) => {
        await db.execute("INSERT INTO users (name) VALUES (?)", ["John"]);
        await db.execute("INSERT INTO audit_log (action) VALUES (?)", [
          "user_created",
        ]);
      });

      // Transaction with return value
      const newUserId = await bridge.transaction(async (db) => {
        const result = await db.execute("INSERT INTO users (name) VALUES (?)", [
          "Jane",
        ]);
        return result.lastInsertRowid;
      });

      // Transaction with queries and executes
      const userData = await bridge.transaction(async (db) => {
        const result = await db.execute("INSERT INTO users (name) VALUES (?)", [
          "Bob",
        ]);
        const users = await db.query<User>("SELECT * FROM users WHERE id = ?", [
          result.lastInsertRowid,
        ]);
        return { userId: result.lastInsertRowid, userCount: users.length };
      });

      expect(typeof newUserId).toBe("number");
      expect(userData).toBeDefined();
      expect(typeof userData.userId).toBe("number");
      expect(typeof userData.userCount).toBe("number");
    });
  });
});
