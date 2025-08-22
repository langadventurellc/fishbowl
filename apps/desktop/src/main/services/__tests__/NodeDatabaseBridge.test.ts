// Mock better-sqlite3 at the top level with hoisted mock
const mockDatabase = {
  pragma: jest.fn(),
  close: jest.fn(),
  open: true,
};

jest.mock("better-sqlite3", () => {
  return jest.fn().mockImplementation(() => mockDatabase);
});

// Import after mocking
import Database from "better-sqlite3";
import { NodeDatabaseBridge } from "../NodeDatabaseBridge";
import { DatabaseBridge } from "@fishbowl-ai/shared";

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
});
