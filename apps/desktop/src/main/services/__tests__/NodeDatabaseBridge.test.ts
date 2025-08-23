// Mock better-sqlite3 at the top level with hoisted mock
const mockDatabase = {
  pragma: jest.fn(),
  close: jest.fn(),
  prepare: jest.fn(),
  exec: jest.fn(),
  backup: jest.fn(),
  name: "/test/database.db",
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

// Mock fs modules
jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
}));

jest.mock("fs/promises", () => ({
  stat: jest.fn().mockResolvedValue({ size: 1048576 }),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

// Import after mocking
import Database from "better-sqlite3";
import { NodeDatabaseBridge } from "../NodeDatabaseBridge";
import {
  DatabaseBridge,
  ConnectionError,
  ConstraintViolationError,
  QueryError,
  TransactionError,
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
    mockDatabase.name = "/test/database.db";
    mockDatabase.pragma.mockReset();
    mockDatabase.close.mockReset();
    mockDatabase.prepare.mockReset();
    mockDatabase.backup.mockReset();

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

  describe("backup method", () => {
    it("should successfully backup database to provided path", async () => {
      const backupPath = "/backup/database-backup.db";
      mockDatabase.backup = jest.fn();

      await bridge.backup!(backupPath);

      expect(mockDatabase.backup).toHaveBeenCalledWith(backupPath);
      expect(mockLogger.info).toHaveBeenCalledWith("Starting database backup", {
        destination: backupPath,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Database backup completed successfully",
        { destination: backupPath },
      );
    });

    it("should throw ConnectionError if database not connected", async () => {
      // Mock disconnected state
      mockDatabase.open = false;

      await expect(bridge.backup!("/backup/test.db")).rejects.toThrow(
        ConnectionError,
      );
      await expect(bridge.backup!("/backup/test.db")).rejects.toThrow(
        "Database connection is not active",
      );
    });

    it("should throw QueryError for empty backup path", async () => {
      await expect(bridge.backup!("")).rejects.toThrow(QueryError);
      await expect(bridge.backup!("   ")).rejects.toThrow(QueryError);
      await expect(bridge.backup!("")).rejects.toThrow(
        "Backup path cannot be empty",
      );
    });

    it("should handle backup API failures", async () => {
      const backupError = new Error("Backup failed");
      mockDatabase.backup = jest.fn().mockImplementation(() => {
        throw backupError;
      });

      await expect(bridge.backup!("/backup/test.db")).rejects.toThrow(
        ConnectionError,
      );
      await expect(bridge.backup!("/backup/test.db")).rejects.toThrow(
        "Failed to backup database: Backup failed",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Database backup failed",
        backupError,
        { path: "/backup/test.db" },
      );
    });

    it("should create backup directory if it doesn't exist", async () => {
      const fs = require("fs");
      const fsPromises = require("fs/promises");

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
      mockDatabase.backup = jest.fn();

      await bridge.backup!("/new/directory/backup.db");

      expect(fsPromises.mkdir).toHaveBeenCalledWith("/new/directory", {
        recursive: true,
      });
      expect(mockDatabase.backup).toHaveBeenCalledWith(
        "/new/directory/backup.db",
      );
    });
  });

  describe("vacuum method", () => {
    it("should successfully execute VACUUM command", async () => {
      await bridge.vacuum!();

      expect(mockDatabase.exec).toHaveBeenCalledWith("VACUUM");
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Starting database vacuum operation",
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Database vacuum completed successfully",
      );
    });

    it("should throw ConnectionError if database not connected", async () => {
      // Mock disconnected state
      mockDatabase.open = false;

      await expect(bridge.vacuum!()).rejects.toThrow(ConnectionError);
      await expect(bridge.vacuum!()).rejects.toThrow(
        "Database connection is not active",
      );
    });

    it("should throw TransactionError if executed within transaction", async () => {
      // Start a transaction to set the isTransactionActive flag
      await bridge.transaction(async (db) => {
        // Try to vacuum within transaction - should throw error
        await expect(db.vacuum!()).rejects.toThrow(TransactionError);
        await expect(db.vacuum!()).rejects.toThrow(
          "VACUUM cannot be performed within a transaction",
        );
      });
    });

    it("should handle VACUUM command failures", async () => {
      const vacuumError = new Error("VACUUM failed");
      mockDatabase.exec.mockImplementation((sql: string) => {
        if (sql === "VACUUM") {
          throw vacuumError;
        }
      });

      await expect(bridge.vacuum!()).rejects.toThrow(QueryError);
      await expect(bridge.vacuum!()).rejects.toThrow(
        "Failed to vacuum database: VACUUM failed",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Database vacuum failed",
        vacuumError,
      );
    });
  });

  describe("getSize method", () => {
    it("should successfully return database file size", async () => {
      const fsPromises = require("fs/promises");
      const mockStats = { size: 1048576 }; // 1MB
      (fsPromises.stat as jest.Mock).mockResolvedValue(mockStats);

      const size = await bridge.getSize!();

      expect(size).toBe(1048576);
      expect(fsPromises.stat).toHaveBeenCalledWith("/test/database.db");
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Getting database file size",
        { path: "/test/database.db" },
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Database file size retrieved",
        {
          path: "/test/database.db",
          sizeInBytes: 1048576,
          sizeInMB: "1.00",
        },
      );
    });

    it("should throw ConnectionError if database not connected", async () => {
      // Mock disconnected state
      mockDatabase.open = false;

      await expect(bridge.getSize!()).rejects.toThrow(ConnectionError);
      await expect(bridge.getSize!()).rejects.toThrow(
        "Database connection is not active",
      );
    });

    it("should throw QueryError for in-memory database", async () => {
      mockDatabase.name = ":memory:";

      await expect(bridge.getSize!()).rejects.toThrow(QueryError);
      await expect(bridge.getSize!()).rejects.toThrow(
        "Cannot get file size for in-memory database",
      );
    });

    it("should handle file stat failures", async () => {
      const fsPromises = require("fs/promises");
      const statError = new Error("File not found");
      (fsPromises.stat as jest.Mock).mockRejectedValue(statError);

      await expect(bridge.getSize!()).rejects.toThrow(ConnectionError);
      await expect(bridge.getSize!()).rejects.toThrow(
        "Failed to get database size: File not found",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to get database size",
        statError,
        { path: "/test/database.db" },
      );
    });

    it("should return correct size for various file sizes", async () => {
      const fsPromises = require("fs/promises");
      const testCases = [
        { size: 0, expectedMB: "0.00" },
        { size: 1024, expectedMB: "0.00" },
        { size: 1048576, expectedMB: "1.00" }, // 1MB
        { size: 10485760, expectedMB: "10.00" }, // 10MB
        { size: 1073741824, expectedMB: "1024.00" }, // 1GB
      ];

      for (const testCase of testCases) {
        (fsPromises.stat as jest.Mock).mockResolvedValue({
          size: testCase.size,
        });

        const size = await bridge.getSize!();

        expect(size).toBe(testCase.size);
        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Database file size retrieved",
          expect.objectContaining({
            sizeInMB: testCase.expectedMB,
          }),
        );

        jest.clearAllMocks();
        mockLogger.debug.mockReset();
      }
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

  describe("transaction", () => {
    let mockStatement: any;

    beforeEach(() => {
      // Reset exec mock
      mockDatabase.exec.mockReset();

      // Setup mock statement for transaction tests
      mockStatement = {
        all: jest.fn(),
        run: jest.fn().mockReturnValue({ changes: 1, lastInsertRowid: 1 }),
      };
      mockDatabase.prepare.mockReset().mockReturnValue(mockStatement);
    });

    it("should commit transaction on successful callback", async () => {
      const mockResult = { changes: 1, lastInsertRowid: 1 };
      mockStatement.run.mockReturnValue(mockResult);

      const result = await bridge.transaction(async (tx) => {
        await tx.execute("INSERT INTO users (name) VALUES (?)", ["John"]);
        return "success";
      });

      expect(result).toBe("success");
      expect(mockDatabase.exec).toHaveBeenCalledWith("BEGIN");
      expect(mockDatabase.exec).toHaveBeenCalledWith("COMMIT");
      expect(mockDatabase.exec).not.toHaveBeenCalledWith("ROLLBACK");
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Transaction committed successfully",
        expect.objectContaining({ duration: expect.any(Number) }),
      );
    });

    it("should rollback transaction on callback error", async () => {
      await expect(
        bridge.transaction(async () => {
          throw new Error("Simulated failure");
        }),
      ).rejects.toThrow(TransactionError);

      expect(mockDatabase.exec).toHaveBeenCalledWith("BEGIN");
      expect(mockDatabase.exec).toHaveBeenCalledWith("ROLLBACK");
      expect(mockDatabase.exec).not.toHaveBeenCalledWith("COMMIT");
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Transaction rolled back due to error",
        expect.any(Error),
        expect.objectContaining({ duration: expect.any(Number) }),
      );
    });

    it("should handle nested operations within transaction", async () => {
      const mockQueryResult = [{ id: 1, name: "John" }];
      const mockExecuteResult = { changes: 1, lastInsertRowid: 2 };

      mockStatement.all.mockReturnValue(mockQueryResult);
      mockStatement.run.mockReturnValue(mockExecuteResult);

      const result = await bridge.transaction(async (tx) => {
        await tx.execute("INSERT INTO users (name) VALUES (?)", ["John"]);
        const users = await tx.query("SELECT * FROM users WHERE name = ?", [
          "John",
        ]);
        await tx.execute("UPDATE users SET active = ? WHERE id = ?", [true, 1]);
        return users;
      });

      expect(result).toEqual(mockQueryResult);
      expect(mockDatabase.prepare).toHaveBeenCalledTimes(3); // 2 execute, 1 query
      expect(mockDatabase.exec).toHaveBeenCalledWith("BEGIN");
      expect(mockDatabase.exec).toHaveBeenCalledWith("COMMIT");
    });

    it("should handle nested transaction calls correctly", async () => {
      const result = await bridge.transaction(async (tx) => {
        await tx.execute("INSERT INTO users (name) VALUES (?)", ["outer"]);

        // Nested transaction should execute within same transaction
        const nestedResult = await tx.transaction(async (inner) => {
          await inner.execute("INSERT INTO users (name) VALUES (?)", ["inner"]);
          return "inner-result";
        });

        expect(nestedResult).toBe("inner-result");
        return "outer-result";
      });

      expect(result).toBe("outer-result");
      expect(mockDatabase.exec).toHaveBeenCalledWith("BEGIN");
      expect(mockDatabase.exec).toHaveBeenCalledWith("COMMIT");
      expect(mockDatabase.exec).toHaveBeenCalledTimes(2); // Only one BEGIN and one COMMIT
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Nested transaction detected, executing within parent transaction",
      );
    });

    it("should preserve generic type of callback return value", async () => {
      interface CustomResult {
        id: number;
        name: string;
      }

      const expectedResult: CustomResult = { id: 1, name: "test" };
      const result = await bridge.transaction<CustomResult>(async () => {
        return expectedResult;
      });

      expect(result).toEqual(expectedResult);
      expect(result.id).toBe(1); // TypeScript should infer the type
      expect(result.name).toBe("test");
    });

    it("should convert callback errors to TransactionError", async () => {
      const originalError = new Error("Database constraint violation");

      await expect(
        bridge.transaction(async () => {
          throw originalError;
        }),
      ).rejects.toThrow(TransactionError);

      try {
        await bridge.transaction(async () => {
          throw originalError;
        });
      } catch (error: any) {
        expect(error).toBeInstanceOf(TransactionError);
        expect(error.message).toContain(
          "Transaction failed and was rolled back",
        );
        expect(error.message).toContain("Database constraint violation");
        expect(error.cause).toBe(originalError);
      }
    });

    it("should extract failed operation from QueryError", async () => {
      const queryError = new QueryError(
        "SQL syntax error",
        "SELECT * FROM invalid_table",
        ["param"],
      );

      await expect(
        bridge.transaction(async () => {
          throw queryError;
        }),
      ).rejects.toThrow(TransactionError);

      try {
        await bridge.transaction(async () => {
          throw queryError;
        });
      } catch (error: any) {
        expect(error).toBeInstanceOf(TransactionError);
        expect(error.context?.operation).toBe("SELECT * FROM invalid_table");
      }
    });

    it("should throw ConnectionError when not connected", async () => {
      // Simulate disconnected state
      mockDatabase.open = false;

      await expect(bridge.transaction(async () => "test")).rejects.toThrow(
        ConnectionError,
      );

      expect(mockDatabase.exec).not.toHaveBeenCalled();
    });

    it("should handle BEGIN transaction failures", async () => {
      mockDatabase.exec.mockImplementation((sql: string) => {
        if (sql === "BEGIN") {
          throw new Error("Cannot begin transaction");
        }
      });

      await expect(bridge.transaction(async () => "test")).rejects.toThrow(
        TransactionError,
      );

      try {
        await bridge.transaction(async () => "test");
      } catch (error: any) {
        expect(error).toBeInstanceOf(TransactionError);
        expect(error.message).toContain("Failed to start transaction");
        expect(error.context?.operation).toBe("BEGIN");
      }
    });

    it("should handle ROLLBACK failures gracefully", async () => {
      const originalError = new Error("Callback failure");
      mockDatabase.exec.mockImplementation((sql: string) => {
        if (sql === "ROLLBACK") {
          throw new Error("Rollback failed");
        }
      });

      await expect(
        bridge.transaction(async () => {
          throw originalError;
        }),
      ).rejects.toThrow(TransactionError);

      try {
        await bridge.transaction(async () => {
          throw originalError;
        });
      } catch (error: any) {
        expect(error).toBeInstanceOf(TransactionError);
        expect(error.cause).toBe(originalError); // Original error preserved
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to rollback transaction",
          expect.any(Error),
          expect.objectContaining({ originalError }),
        );
      }
    });

    it("should log transaction lifecycle events", async () => {
      await bridge.transaction(async () => "test");

      expect(mockLogger.debug).toHaveBeenCalledWith("Starting transaction");
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Transaction begun successfully",
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Transaction committed successfully",
        expect.objectContaining({ duration: expect.any(Number) }),
      );
    });

    it("should reset transaction state after completion", async () => {
      await bridge.transaction(async () => "test");

      // Transaction state should be reset - next transaction should work normally
      await bridge.transaction(async () => "test2");

      expect(mockDatabase.exec).toHaveBeenCalledWith("BEGIN");
      expect(mockDatabase.exec).toHaveBeenCalledWith("COMMIT");
      expect(mockDatabase.exec).toHaveBeenCalledTimes(4); // 2 BEGINs, 2 COMMITs
    });

    it("should reset transaction state even after errors", async () => {
      // First transaction fails
      try {
        await bridge.transaction(async () => {
          throw new Error("First transaction fails");
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TransactionError);
      }

      // Second transaction should work normally
      const result = await bridge.transaction(async () => "success");
      expect(result).toBe("success");

      expect(mockDatabase.exec).toHaveBeenCalledWith("BEGIN");
      expect(mockDatabase.exec).toHaveBeenCalledWith("ROLLBACK");
      expect(mockDatabase.exec).toHaveBeenCalledWith("COMMIT");
    });
  });
});
