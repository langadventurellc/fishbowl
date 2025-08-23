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

    it("should not call close multiple times", async () => {
      await bridge.close();
      await bridge.close(); // Second call should not close again

      expect(mockDatabase.close).toHaveBeenCalledTimes(1);
    });

    it("should handle close when not connected", async () => {
      await bridge.close(); // First close

      // Clear the close mock to track subsequent calls
      mockDatabase.close.mockClear();

      await bridge.close(); // Second close should do nothing

      expect(mockDatabase.close).not.toHaveBeenCalled();
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
