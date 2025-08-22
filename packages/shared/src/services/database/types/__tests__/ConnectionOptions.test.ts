import type { ConnectionOptions } from "../ConnectionOptions";

describe("ConnectionOptions", () => {
  describe("Type Validation", () => {
    it("should accept all optional properties", () => {
      const options: ConnectionOptions = {
        timeout: 10000,
        maxConnections: 5,
        idleTimeout: 300000,
        retryAttempts: 3,
        retryDelay: 1000,
        pragmas: {
          journal_mode: "WAL",
          synchronous: "NORMAL",
          cache_size: -64000,
          foreign_keys: "ON",
        },
        walMode: true,
        databasePath: "/custom/path/database.db",
        createIfNotExists: true,
      };

      expect(options).toBeDefined();
      expect(options.timeout).toBe(10000);
      expect(options.maxConnections).toBe(5);
      expect(options.idleTimeout).toBe(300000);
      expect(options.retryAttempts).toBe(3);
      expect(options.retryDelay).toBe(1000);
      expect(options.pragmas).toBeDefined();
      expect(options.walMode).toBe(true);
      expect(options.databasePath).toBe("/custom/path/database.db");
      expect(options.createIfNotExists).toBe(true);
    });

    it("should accept empty options object", () => {
      const options: ConnectionOptions = {};
      expect(options).toBeDefined();
    });

    it("should accept partial options", () => {
      const options: ConnectionOptions = {
        timeout: 5000,
        walMode: false,
      };

      expect(options.timeout).toBe(5000);
      expect(options.walMode).toBe(false);
      expect(options.maxConnections).toBeUndefined();
    });
  });

  describe("Pragma Configuration", () => {
    it("should accept various pragma configurations", () => {
      const options: ConnectionOptions = {
        pragmas: {
          journal_mode: "WAL",
          synchronous: "NORMAL",
          cache_size: -64000,
          foreign_keys: "ON",
          temp_store: "MEMORY",
          mmap_size: 67108864,
        },
      };

      expect(options.pragmas).toBeDefined();
      expect(options.pragmas!.journal_mode).toBe("WAL");
      expect(options.pragmas!.synchronous).toBe("NORMAL");
      expect(options.pragmas!.cache_size).toBe(-64000);
      expect(options.pragmas!.foreign_keys).toBe("ON");
      expect(options.pragmas!.temp_store).toBe("MEMORY");
      expect(options.pragmas!.mmap_size).toBe(67108864);
    });

    it("should handle string pragma values", () => {
      const options: ConnectionOptions = {
        pragmas: {
          journal_mode: "DELETE",
          synchronous: "FULL",
          encoding: "UTF-8",
        },
      };

      expect(typeof options.pragmas!.journal_mode).toBe("string");
      expect(typeof options.pragmas!.synchronous).toBe("string");
      expect(typeof options.pragmas!.encoding).toBe("string");
    });

    it("should handle numeric pragma values", () => {
      const options: ConnectionOptions = {
        pragmas: {
          cache_size: 2000,
          page_size: 4096,
          max_page_count: 1073741823,
        },
      };

      expect(typeof options.pragmas!.cache_size).toBe("number");
      expect(typeof options.pragmas!.page_size).toBe("number");
      expect(typeof options.pragmas!.max_page_count).toBe("number");
    });

    it("should work without pragmas", () => {
      const options: ConnectionOptions = {
        timeout: 5000,
        maxConnections: 1,
      };

      expect(options.pragmas).toBeUndefined();
      expect(options.timeout).toBe(5000);
    });
  });

  describe("Connection Pool Configuration", () => {
    it("should handle connection pool settings", () => {
      const options: ConnectionOptions = {
        maxConnections: 10,
        idleTimeout: 120000,
        retryAttempts: 5,
        retryDelay: 500,
      };

      expect(options.maxConnections).toBe(10);
      expect(options.idleTimeout).toBe(120000);
      expect(options.retryAttempts).toBe(5);
      expect(options.retryDelay).toBe(500);
    });

    it("should handle single connection configuration", () => {
      const options: ConnectionOptions = {
        maxConnections: 1,
        idleTimeout: 0,
      };

      expect(options.maxConnections).toBe(1);
      expect(options.idleTimeout).toBe(0);
    });
  });

  describe("File Path Configuration", () => {
    it("should handle custom database paths", () => {
      const options: ConnectionOptions = {
        databasePath: "/Users/test/databases/app.db",
        createIfNotExists: true,
      };

      expect(options.databasePath).toBe("/Users/test/databases/app.db");
      expect(options.createIfNotExists).toBe(true);
    });

    it("should handle relative paths", () => {
      const options: ConnectionOptions = {
        databasePath: "./data/database.db",
        createIfNotExists: false,
      };

      expect(options.databasePath).toBe("./data/database.db");
      expect(options.createIfNotExists).toBe(false);
    });

    it("should work without custom path", () => {
      const options: ConnectionOptions = {
        timeout: 5000,
      };

      expect(options.databasePath).toBeUndefined();
      expect(options.createIfNotExists).toBeUndefined();
    });
  });

  describe("WAL Mode Configuration", () => {
    it("should enable WAL mode", () => {
      const options: ConnectionOptions = {
        walMode: true,
        pragmas: {
          journal_mode: "WAL",
        },
      };

      expect(options.walMode).toBe(true);
      expect(options.pragmas!.journal_mode).toBe("WAL");
    });

    it("should disable WAL mode", () => {
      const options: ConnectionOptions = {
        walMode: false,
        pragmas: {
          journal_mode: "DELETE",
        },
      };

      expect(options.walMode).toBe(false);
      expect(options.pragmas!.journal_mode).toBe("DELETE");
    });
  });

  describe("Option Merging", () => {
    it("should support merging connection options", () => {
      const baseOptions: ConnectionOptions = {
        timeout: 10000,
        maxConnections: 1,
        walMode: true,
        pragmas: {
          journal_mode: "WAL",
          foreign_keys: "ON",
        },
      };

      const overrideOptions: ConnectionOptions = {
        timeout: 15000,
        retryAttempts: 5,
        pragmas: {
          cache_size: -32000,
        },
      };

      const mergedOptions: ConnectionOptions = {
        ...baseOptions,
        ...overrideOptions,
        pragmas: {
          ...baseOptions.pragmas,
          ...overrideOptions.pragmas,
        },
      };

      expect(mergedOptions.timeout).toBe(15000); // overridden
      expect(mergedOptions.maxConnections).toBe(1); // from base
      expect(mergedOptions.walMode).toBe(true); // from base
      expect(mergedOptions.retryAttempts).toBe(5); // new option

      // Pragmas should be merged
      expect(mergedOptions.pragmas!.journal_mode).toBe("WAL"); // from base
      expect(mergedOptions.pragmas!.foreign_keys).toBe("ON"); // from base
      expect(mergedOptions.pragmas!.cache_size).toBe(-32000); // from override
    });
  });

  describe("Default Behavior", () => {
    it("should work without any specified options", () => {
      const options: ConnectionOptions = {};

      // All properties should be undefined (allowing defaults to be applied elsewhere)
      expect(options.timeout).toBeUndefined();
      expect(options.maxConnections).toBeUndefined();
      expect(options.idleTimeout).toBeUndefined();
      expect(options.retryAttempts).toBeUndefined();
      expect(options.retryDelay).toBeUndefined();
      expect(options.pragmas).toBeUndefined();
      expect(options.walMode).toBeUndefined();
      expect(options.databasePath).toBeUndefined();
      expect(options.createIfNotExists).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero and negative values appropriately", () => {
      const options: ConnectionOptions = {
        timeout: 0,
        maxConnections: 0,
        idleTimeout: -1,
        retryAttempts: 0,
        retryDelay: 0,
      };

      expect(options.timeout).toBe(0);
      expect(options.maxConnections).toBe(0);
      expect(options.idleTimeout).toBe(-1);
      expect(options.retryAttempts).toBe(0);
      expect(options.retryDelay).toBe(0);
    });

    it("should handle large numeric values", () => {
      const options: ConnectionOptions = {
        timeout: Number.MAX_SAFE_INTEGER,
        maxConnections: 1000,
        idleTimeout: 86400000, // 24 hours
      };

      expect(options.timeout).toBe(Number.MAX_SAFE_INTEGER);
      expect(options.maxConnections).toBe(1000);
      expect(options.idleTimeout).toBe(86400000);
    });
  });
});
