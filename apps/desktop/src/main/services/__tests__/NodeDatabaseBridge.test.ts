// Mock better-sqlite3 at the top level with hoisted mock
const mockDatabase = {
  pragma: jest.fn(),
  close: jest.fn(),
  prepare: jest.fn(),
  open: true,
};

jest.mock("better-sqlite3", () => {
  return jest.fn().mockImplementation(() => mockDatabase);
});

// Mock the logger
const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.mock("@fishbowl-ai/shared", () => ({
  ...jest.requireActual("@fishbowl-ai/shared"),
  createLoggerSync: jest.fn(() => mockLogger),
}));

// Import after mocking
import Database from "better-sqlite3";
import { NodeDatabaseBridge } from "../NodeDatabaseBridge";
import {
  DatabaseBridge,
  ConnectionError,
  ConstraintViolationError,
  QueryError,
} from "@fishbowl-ai/shared";

// Get the mocked constructor
const MockedDatabase = Database as jest.MockedClass<typeof Database>;

describe("NodeDatabaseBridge", () => {
  let bridge: DatabaseBridge;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset mock database properties
    mockDatabase.open = true;
    mockDatabase.pragma.mockReset();
    mockDatabase.close.mockReset();
    mockDatabase.prepare.mockReset();

    // Reset logger mocks
    mockLogger.info.mockReset();
    mockLogger.debug.mockReset();
    mockLogger.warn.mockReset();
    mockLogger.error.mockReset();

    // Reset the mock implementation to return the normal mockDatabase
    MockedDatabase.mockImplementation(() => mockDatabase as any);

    // Create bridge instance with test database path
    bridge = new NodeDatabaseBridge("/test/database.db");
  });

  describe("constructor", () => {
    it("should create database connection with provided path", () => {
      expect(MockedDatabase).toHaveBeenCalledWith("/test/database.db");
    });

    it("should configure SQLite pragmas for desktop performance", () => {
      expect(mockDatabase.pragma).toHaveBeenCalledWith("journal_mode = WAL");
      expect(mockDatabase.pragma).toHaveBeenCalledWith("synchronous = NORMAL");
      expect(mockDatabase.pragma).toHaveBeenCalledWith("foreign_keys = ON");
    });

    it("should set connected state to true after construction", () => {
      expect(bridge.isConnected?.()).toBe(true);
    });

    it("should work with different database paths", () => {
      const customPath = "/custom/path/app.db";
      const customBridge = new NodeDatabaseBridge(customPath);

      expect(MockedDatabase).toHaveBeenCalledWith(customPath);
      expect(customBridge.isConnected?.()).toBe(true);
    });

    it("should log connection initialization", () => {
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Initializing database connection",
        { databasePath: "/test/database.db" },
      );
    });

    it("should log successful connection establishment", () => {
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Database connection established successfully",
        {
          databasePath: "/test/database.db",
          inMemory: false,
          isOpen: true,
        },
      );
    });

    it("should log connection establishment for in-memory database", () => {
      const _memoryBridge = new NodeDatabaseBridge(":memory:");

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Database connection established successfully",
        expect.objectContaining({
          databasePath: ":memory:",
          inMemory: true,
          isOpen: true,
        }),
      );
    });

    it("should log and re-throw database constructor errors", () => {
      const dbError = new Error("Database creation failed");
      MockedDatabase.mockImplementation(() => {
        throw dbError;
      });

      expect(() => {
        new NodeDatabaseBridge("/invalid/path.db");
      }).toThrow("Database creation failed");

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to initialize database connection",
        dbError,
        { databasePath: "/invalid/path.db" },
      );
    });
  });

  describe("configurePragmas", () => {
    it("should configure all required pragmas in correct order", () => {
      // Constructor already calls configurePragmas, verify the calls
      const pragmaCalls = mockDatabase.pragma.mock.calls;

      expect(pragmaCalls).toHaveLength(3);
      expect(pragmaCalls[0][0]).toBe("journal_mode = WAL");
      expect(pragmaCalls[1][0]).toBe("synchronous = NORMAL");
      expect(pragmaCalls[2][0]).toBe("foreign_keys = ON");
    });
  });

  describe("close", () => {
    it("should close database connection when connected", async () => {
      expect(bridge.isConnected?.()).toBe(true);

      await bridge.close();

      expect(mockDatabase.close).toHaveBeenCalledTimes(1);
      expect(bridge.isConnected?.()).toBe(false);
    });

    it("should log connection closure process", async () => {
      await bridge.close();

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Closing database connection",
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Database connection closed successfully",
      );
    });

    it("should not call close multiple times (idempotent)", async () => {
      await bridge.close();

      // Clear mocks to track second call
      mockDatabase.close.mockClear();
      mockLogger.debug.mockClear();
      mockLogger.info.mockClear();

      await bridge.close(); // Second call should not close again

      expect(mockDatabase.close).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Database connection already closed, skipping close operation",
      );
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        "Closing database connection",
      );
    });

    it("should handle close when not connected", async () => {
      await bridge.close(); // First close

      // Clear the close mock to track subsequent calls
      mockDatabase.close.mockClear();
      mockLogger.debug.mockClear();

      await bridge.close(); // Second close should do nothing

      expect(mockDatabase.close).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Database connection already closed, skipping close operation",
      );
    });

    it("should handle close errors gracefully", async () => {
      const closeError = new Error("Close operation failed");
      mockDatabase.close.mockImplementation(() => {
        throw closeError;
      });

      await expect(bridge.close()).rejects.toThrow(
        "Failed to close database connection",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error occurred while closing database connection",
        closeError,
        {
          connectionWasOpen: true,
          errorMessage: "Close operation failed",
        },
      );

      // Connection state should still be updated to false
      expect(bridge.isConnected?.()).toBe(false);
    });

    it("should update connection state even when close fails", async () => {
      const closeError = new Error("Close operation failed");
      mockDatabase.close.mockImplementation(() => {
        throw closeError;
      });

      try {
        await bridge.close();
      } catch {
        // Expected to throw
      }

      // Connection state should be false even after close error
      expect(bridge.isConnected?.()).toBe(false);

      // Subsequent close should be idempotent
      mockDatabase.close.mockClear();
      mockLogger.debug.mockClear();

      await bridge.close();

      expect(mockDatabase.close).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Database connection already closed, skipping close operation",
      );
    });
  });

  describe("isConnected", () => {
    it("should return true when database is connected and open", () => {
      mockDatabase.open = true;
      expect(bridge.isConnected?.()).toBe(true);
    });

    it("should return false after closing connection", async () => {
      await bridge.close();
      expect(bridge.isConnected?.()).toBe(false);
    });

    it("should return false when database is not open", () => {
      mockDatabase.open = false;
      expect(bridge.isConnected?.()).toBe(false);
    });
  });

  describe("interface compliance", () => {
    it("should implement all required DatabaseBridge methods", () => {
      expect(typeof bridge.query).toBe("function");
      expect(typeof bridge.execute).toBe("function");
      expect(typeof bridge.transaction).toBe("function");
      expect(typeof bridge.close).toBe("function");
    });

    it("should implement all optional DatabaseBridge methods", () => {
      expect(typeof bridge.isConnected).toBe("function");
      expect(typeof bridge.backup).toBe("function");
      expect(typeof bridge.vacuum).toBe("function");
      expect(typeof bridge.getSize).toBe("function");
    });
  });

  describe("error scenarios", () => {
    it("should handle database constructor errors", () => {
      // Mock Database constructor to throw error
      MockedDatabase.mockImplementation(() => {
        throw new Error("Database creation failed");
      });

      expect(() => {
        new NodeDatabaseBridge("/invalid/path.db");
      }).toThrow("Database creation failed");
    });

    it("should handle pragma configuration errors gracefully", () => {
      // Mock pragma to throw error
      const errorMockDatabase = {
        ...mockDatabase,
        pragma: jest.fn().mockImplementation(() => {
          throw new Error("Pragma failed");
        }),
      };

      MockedDatabase.mockImplementation(() => errorMockDatabase as any);

      expect(() => {
        new NodeDatabaseBridge("/test/database.db");
      }).toThrow("Pragma failed");
    });
  });

  describe("connection state tracking", () => {
    it("should maintain connection state correctly through lifecycle", () => {
      // Initially connected after construction
      expect(bridge.isConnected?.()).toBe(true);

      // Still connected
      expect(bridge.isConnected?.()).toBe(true);
    });

    it("should track connection state after close", async () => {
      expect(bridge.isConnected?.()).toBe(true);

      await bridge.close();

      expect(bridge.isConnected?.()).toBe(false);
    });

    it("should handle database open property changes", () => {
      expect(bridge.isConnected?.()).toBe(true);

      // Simulate database becoming unavailable
      mockDatabase.open = false;

      expect(bridge.isConnected?.()).toBe(false);
    });
  });

  describe("query", () => {
    let mockStatement: any;

    beforeEach(() => {
      mockStatement = {
        all: jest.fn(),
      };
      mockDatabase.prepare = jest.fn().mockReturnValue(mockStatement);
    });

    it("should execute SELECT queries and return typed results", async () => {
      const mockRows = [
        { id: 1, name: "John", email: "john@example.com" },
        { id: 2, name: "Jane", email: "jane@example.com" },
      ];
      mockStatement.all.mockReturnValue(mockRows);

      const result = await bridge.query<{
        id: number;
        name: string;
        email: string;
      }>("SELECT * FROM users WHERE active = ?", [true]);

      expect(mockDatabase.prepare).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE active = ?",
      );
      expect(mockStatement.all).toHaveBeenCalledWith([true]);
      expect(result).toEqual(mockRows);
    });

    it("should handle SELECT queries with various data types", async () => {
      interface UserRow {
        id: number;
        name: string;
        age: number;
        active: boolean;
        salary: number;
        created_at: string;
      }

      const mockRows: UserRow[] = [
        {
          id: 1,
          name: "John",
          age: 30,
          active: true,
          salary: 50000.5,
          created_at: "2023-01-01T00:00:00Z",
        },
      ];
      mockStatement.all.mockReturnValue(mockRows);

      const result = await bridge.query<UserRow>(
        "SELECT id, name, age, active, salary, created_at FROM users WHERE id = ?",
        [1],
      );

      expect(result).toEqual(mockRows);
      expect(result.length).toBe(1);
      expect(result[0]!.id).toBe(1);
      expect(result[0]!.name).toBe("John");
      expect(result[0]!.age).toBe(30);
      expect(result[0]!.active).toBe(true);
      expect(result[0]!.salary).toBe(50000.5);
    });

    it("should handle queries with no parameters", async () => {
      const mockRows = [{ count: 5 }];
      mockStatement.all.mockReturnValue(mockRows);

      const result = await bridge.query("SELECT COUNT(*) as count FROM users");

      expect(mockStatement.all).toHaveBeenCalledWith([]);
      expect(result).toEqual(mockRows);
    });

    it("should handle empty result sets", async () => {
      mockStatement.all.mockReturnValue([]);

      const result = await bridge.query<{ id: number; name: string }>(
        "SELECT * FROM users WHERE id = ?",
        [999],
      );

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should handle queries with complex parameters", async () => {
      const mockRows = [
        { id: 1, name: "John", tags: "tag1,tag2" },
        { id: 2, name: "Jane", tags: "tag2,tag3" },
      ];
      mockStatement.all.mockReturnValue(mockRows);

      const params = ["John", 25, true, null, undefined];
      const result = await bridge.query(
        "SELECT * FROM users WHERE name = ? AND age > ? AND active = ? AND metadata IS ? AND notes IS ?",
        params,
      );

      expect(mockStatement.all).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockRows);
    });

    it("should handle large result sets", async () => {
      const mockRows = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `User${i + 1}`,
      }));
      mockStatement.all.mockReturnValue(mockRows);

      const result = await bridge.query<{ id: number; name: string }>(
        "SELECT * FROM users",
      );

      expect(result.length).toBe(1000);
      expect(result[0]).toEqual({ id: 1, name: "User1" });
      expect(result[999]).toEqual({ id: 1000, name: "User1000" });
    });

    it("should maintain type safety with generic parameters", async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const mockRows: User[] = [
        { id: 1, name: "John", email: "john@example.com" },
      ];
      mockStatement.all.mockReturnValue(mockRows);

      const result = await bridge.query<User>(
        "SELECT id, name, email FROM users WHERE id = ?",
        [1],
      );

      // TypeScript should infer result as User[]
      expect(result).toEqual(mockRows);
      expect(result.length).toBe(1);
      expect(result[0]!.id).toBe(1);
      expect(result[0]!.name).toBe("John");
      expect(result[0]!.email).toBe("john@example.com");
    });

    it("should throw ConnectionError when database is not connected", async () => {
      mockDatabase.open = false;

      await expect(bridge.query("SELECT * FROM users", [])).rejects.toThrow(
        ConnectionError,
      );
    });

    it("should throw QueryError for invalid SQL syntax", async () => {
      const sqliteError = new Error('near "INVALID": syntax error');
      (sqliteError as any).code = "SQLITE_ERROR";
      mockStatement.all.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(bridge.query("INVALID SQL SYNTAX", [])).rejects.toThrow(
        QueryError,
      );

      try {
        await bridge.query("INVALID SQL SYNTAX", []);
      } catch (error: any) {
        expect(error).toBeInstanceOf(QueryError);
        expect(error.message).toContain("syntax error");
      }
    });

    it("should throw QueryError for non-existent tables", async () => {
      const sqliteError = new Error("no such table: nonexistent_table");
      (sqliteError as any).code = "SQLITE_ERROR";
      mockStatement.all.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.query("SELECT * FROM nonexistent_table", []),
      ).rejects.toThrow(QueryError);
    });

    it("should throw ConstraintViolationError for unique constraint violations in complex queries", async () => {
      const sqliteError = new Error("UNIQUE constraint failed: temp_table.id");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_UNIQUE";
      mockStatement.all.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.query("SELECT * FROM (INSERT INTO temp_table (id) VALUES (?))", [
          1,
        ]),
      ).rejects.toThrow(ConstraintViolationError);
    });

    it("should throw ConstraintViolationError for foreign key constraints in complex queries", async () => {
      const sqliteError = new Error("FOREIGN KEY constraint failed");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_FOREIGNKEY";
      mockStatement.all.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.query("SELECT * FROM posts WHERE user_id = ?", [999]),
      ).rejects.toThrow(ConstraintViolationError);
    });

    it("should throw ConstraintViolationError for not null constraints", async () => {
      const sqliteError = new Error("NOT NULL constraint failed");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_NOTNULL";
      mockStatement.all.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.query("SELECT * FROM users WHERE name = ?", [null]),
      ).rejects.toThrow(ConstraintViolationError);
    });

    it("should throw ConstraintViolationError for check constraints", async () => {
      const sqliteError = new Error("CHECK constraint failed");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_CHECK";
      mockStatement.all.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.query("SELECT * FROM users WHERE age = ?", [-5]),
      ).rejects.toThrow(ConstraintViolationError);
    });

    it("should throw generic ConstraintViolationError for other constraint errors", async () => {
      const sqliteError = new Error("Some constraint failed");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_GENERIC";
      mockStatement.all.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(bridge.query("SELECT * FROM users", [])).rejects.toThrow(
        ConstraintViolationError,
      );
    });

    it("should handle prepared statement creation failures", async () => {
      mockDatabase.prepare.mockImplementation(() => {
        throw new Error("SQL preparation error");
      });

      await expect(bridge.query("INVALID SQL", [])).rejects.toThrow(QueryError);
    });

    it("should include SQL and parameters in QueryError context", async () => {
      const sqliteError = new Error("SQL execution failed");
      (sqliteError as any).code = "SQLITE_ERROR";
      mockStatement.all.mockImplementation(() => {
        throw sqliteError;
      });

      try {
        await bridge.query("SELECT * FROM users WHERE id = ? AND name = ?", [
          123,
          "John",
        ]);
      } catch (error: any) {
        expect(error).toBeInstanceOf(QueryError);
        // QueryError should include SQL and parameters in context
        expect(error.context?.sql).toBe(
          "SELECT * FROM users WHERE id = ? AND name = ?",
        );
        expect(error.context?.parameters).toEqual([123, "John"]);
      }
    });

    it("should handle queries with JOIN operations", async () => {
      const mockRows = [
        {
          userId: 1,
          userName: "John",
          postId: 1,
          postTitle: "First Post",
        },
        {
          userId: 1,
          userName: "John",
          postId: 2,
          postTitle: "Second Post",
        },
      ];
      mockStatement.all.mockReturnValue(mockRows);

      const result = await bridge.query(
        `SELECT 
          u.id as userId, 
          u.name as userName, 
          p.id as postId, 
          p.title as postTitle 
        FROM users u 
        JOIN posts p ON u.id = p.user_id 
        WHERE u.id = ?`,
        [1],
      );

      expect(result).toEqual(mockRows);
      expect(result.length).toBe(2);
    });

    it("should handle aggregate queries", async () => {
      interface AggregateResult {
        total_users: number;
        active_users: number;
        avg_age: number;
      }

      const mockRows: AggregateResult[] = [
        {
          total_users: 150,
          active_users: 120,
          avg_age: 32.5,
        },
      ];
      mockStatement.all.mockReturnValue(mockRows);

      const result = await bridge.query<AggregateResult>(
        `SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN active = 1 THEN 1 END) as active_users,
          AVG(age) as avg_age
        FROM users`,
      );

      expect(result).toEqual(mockRows);
      expect(result.length).toBe(1);
      expect(result[0]!.total_users).toBe(150);
      expect(result[0]!.active_users).toBe(120);
      expect(result[0]!.avg_age).toBe(32.5);
    });
  });

  describe("execute", () => {
    let mockStatement: any;

    beforeEach(() => {
      mockStatement = {
        run: jest.fn(),
      };
      mockDatabase.prepare = jest.fn().mockReturnValue(mockStatement);
    });

    it("should execute INSERT operations and return DatabaseResult", async () => {
      const mockResult = {
        lastInsertRowid: 123,
        changes: 1,
      };
      mockStatement.run.mockReturnValue(mockResult);

      const result = await bridge.execute(
        "INSERT INTO users (name) VALUES (?)",
        ["John"],
      );

      expect(mockDatabase.prepare).toHaveBeenCalledWith(
        "INSERT INTO users (name) VALUES (?)",
      );
      expect(mockStatement.run).toHaveBeenCalledWith(["John"]);
      expect(result).toEqual({
        lastInsertRowid: 123,
        changes: 1,
        affectedRows: 1,
      });
    });

    it("should execute UPDATE operations and return DatabaseResult", async () => {
      const mockResult = {
        lastInsertRowid: undefined,
        changes: 2,
      };
      mockStatement.run.mockReturnValue(mockResult);

      const result = await bridge.execute(
        "UPDATE users SET name = ? WHERE id > ?",
        ["Updated", 10],
      );

      expect(result).toEqual({
        lastInsertRowid: undefined,
        changes: 2,
        affectedRows: 2,
      });
    });

    it("should execute DELETE operations and return DatabaseResult", async () => {
      const mockResult = {
        lastInsertRowid: undefined,
        changes: 3,
      };
      mockStatement.run.mockReturnValue(mockResult);

      const result = await bridge.execute(
        "DELETE FROM users WHERE active = ?",
        [false],
      );

      expect(result).toEqual({
        lastInsertRowid: undefined,
        changes: 3,
        affectedRows: 3,
      });
    });

    it("should handle BigInt lastInsertRowid by converting to number", async () => {
      const mockResult = {
        lastInsertRowid: BigInt(9007199254740991),
        changes: 1,
      };
      mockStatement.run.mockReturnValue(mockResult);

      const result = await bridge.execute(
        "INSERT INTO users (name) VALUES (?)",
        ["John"],
      );

      expect(result.lastInsertRowid).toBe(9007199254740991);
      expect(typeof result.lastInsertRowid).toBe("number");
    });

    it("should execute operations without parameters", async () => {
      const mockResult = {
        lastInsertRowid: undefined,
        changes: 5,
      };
      mockStatement.run.mockReturnValue(mockResult);

      const result = await bridge.execute("DELETE FROM temp_table");

      expect(mockStatement.run).toHaveBeenCalledWith([]);
      expect(result.changes).toBe(5);
    });

    it("should throw ConnectionError when database is not connected", async () => {
      mockDatabase.open = false;

      await expect(
        bridge.execute("INSERT INTO users (name) VALUES (?)", ["John"]),
      ).rejects.toThrow(ConnectionError);
    });

    it("should throw ConstraintViolationError for unique constraint violations", async () => {
      const sqliteError = new Error("UNIQUE constraint failed: users.email");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_UNIQUE";
      mockStatement.run.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.execute("INSERT INTO users (email) VALUES (?)", [
          "test@example.com",
        ]),
      ).rejects.toThrow(ConstraintViolationError);

      try {
        await bridge.execute("INSERT INTO users (email) VALUES (?)", [
          "test@example.com",
        ]);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ConstraintViolationError);
        expect(error.message).toContain("UNIQUE constraint failed");
      }
    });

    it("should throw ConstraintViolationError for foreign key constraint violations", async () => {
      const sqliteError = new Error("FOREIGN KEY constraint failed");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_FOREIGNKEY";
      mockStatement.run.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.execute("INSERT INTO posts (user_id) VALUES (?)", [999]),
      ).rejects.toThrow(ConstraintViolationError);
    });

    it("should throw ConstraintViolationError for not null constraint violations", async () => {
      const sqliteError = new Error("NOT NULL constraint failed: users.name");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_NOTNULL";
      mockStatement.run.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.execute("INSERT INTO users (name) VALUES (?)", [null]),
      ).rejects.toThrow(ConstraintViolationError);
    });

    it("should throw ConstraintViolationError for check constraint violations", async () => {
      const sqliteError = new Error("CHECK constraint failed: users");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_CHECK";
      mockStatement.run.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.execute("INSERT INTO users (age) VALUES (?)", [-5]),
      ).rejects.toThrow(ConstraintViolationError);
    });

    it("should throw generic ConstraintViolationError for other constraint errors", async () => {
      const sqliteError = new Error("Some constraint failed");
      (sqliteError as any).code = "SQLITE_CONSTRAINT_GENERIC";
      mockStatement.run.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.execute("INSERT INTO users (name) VALUES (?)", ["John"]),
      ).rejects.toThrow(ConstraintViolationError);
    });

    it("should throw QueryError for non-constraint SQL errors", async () => {
      const sqliteError = new Error("no such table: nonexistent");
      (sqliteError as any).code = "SQLITE_ERROR";
      mockStatement.run.mockImplementation(() => {
        throw sqliteError;
      });

      await expect(
        bridge.execute("INSERT INTO nonexistent (name) VALUES (?)", ["John"]),
      ).rejects.toThrow(QueryError);

      try {
        await bridge.execute("INSERT INTO nonexistent (name) VALUES (?)", [
          "John",
        ]);
      } catch (error: any) {
        expect(error).toBeInstanceOf(QueryError);
        expect(error.message).toContain("no such table");
      }
    });

    it("should handle prepared statement creation failures", async () => {
      mockDatabase.prepare.mockImplementation(() => {
        throw new Error("SQL syntax error");
      });

      await expect(bridge.execute("INVALID SQL", [])).rejects.toThrow(
        QueryError,
      );
    });

    it("should include SQL and parameters in QueryError context", async () => {
      const sqliteError = new Error("SQL error");
      (sqliteError as any).code = "SQLITE_ERROR";
      mockStatement.run.mockImplementation(() => {
        throw sqliteError;
      });

      try {
        await bridge.execute("SELECT * FROM users WHERE id = ?", [123]);
      } catch (error: any) {
        expect(error).toBeInstanceOf(QueryError);
        // QueryError should include SQL and parameters in context
        expect(error.context?.sql).toBe("SELECT * FROM users WHERE id = ?");
        expect(error.context?.parameters).toEqual([123]);
      }
    });
  });
});
