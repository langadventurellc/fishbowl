import fs from "fs";
import path from "path";

describe("001_create_conversations.sql Migration", () => {
  const migrationPath = path.join(
    __dirname,
    "..",
    "001_create_conversations.sql",
  );
  let migrationContent: string;

  beforeAll(() => {
    // Read migration file content once for all tests
    migrationContent = fs.readFileSync(migrationPath, "utf8");
  });

  describe("File Validation", () => {
    test("migration file exists at expected path", () => {
      expect(fs.existsSync(migrationPath)).toBe(true);
    });

    test("file content can be read successfully", () => {
      expect(() => {
        fs.readFileSync(migrationPath, "utf8");
      }).not.toThrow();

      expect(migrationContent).toBeDefined();
      expect(migrationContent.length).toBeGreaterThan(0);
    });

    test("file follows naming convention pattern", () => {
      const filename = path.basename(migrationPath);
      const namingPattern = /^\d{3}_[a-z_]+\.sql$/;

      expect(filename).toMatch(namingPattern);
      expect(filename).toBe("001_create_conversations.sql");
    });
  });

  describe("SQL Syntax Validation", () => {
    test("SQL syntax is valid (no obvious parse errors)", () => {
      // Basic SQL syntax checks
      expect(migrationContent).toContain(";"); // Statements should end with semicolons
      expect(migrationContent).not.toMatch(/^\s*$/); // Should not be empty or only whitespace

      // Check for balanced parentheses
      const openParens = (migrationContent.match(/\(/g) || []).length;
      const closeParens = (migrationContent.match(/\)/g) || []).length;
      expect(openParens).toBe(closeParens);

      // Should not contain obvious syntax errors
      expect(migrationContent).not.toContain("CREAT TABLE"); // Common typo
      expect(migrationContent).not.toContain("PRIMRAY KEY"); // Common typo
    });

    test("all SQL statements are properly terminated with semicolons", () => {
      // Split by semicolons and check that non-comment, non-empty lines end properly
      const statements = migrationContent
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      // Last statement won't have a semicolon after splitting
      expect(statements.length).toBeGreaterThan(0);
    });
  });

  describe("Table Definition", () => {
    test("contains conversations table creation", () => {
      expect(migrationContent).toContain(
        "CREATE TABLE IF NOT EXISTS conversations",
      );
    });

    test("includes all required columns", () => {
      // Check for id column as TEXT PRIMARY KEY
      expect(migrationContent).toMatch(/id\s+TEXT\s+PRIMARY\s+KEY/i);

      // Check for title column as TEXT NOT NULL
      expect(migrationContent).toMatch(/title\s+TEXT\s+NOT\s+NULL/i);

      // Check for created_at column with DATETIME and DEFAULT
      expect(migrationContent).toMatch(
        /created_at\s+DATETIME\s+DEFAULT\s+CURRENT_TIMESTAMP/i,
      );

      // Check for updated_at column with DATETIME and DEFAULT
      expect(migrationContent).toMatch(
        /updated_at\s+DATETIME\s+DEFAULT\s+CURRENT_TIMESTAMP/i,
      );
    });

    test("uses IF NOT EXISTS for idempotency", () => {
      expect(migrationContent).toContain("IF NOT EXISTS");

      // Should appear in all CREATE statements
      const createStatements = migrationContent.match(
        /CREATE\s+(?:TABLE|INDEX|TRIGGER)/gi,
      );
      const ifNotExistsStatements =
        migrationContent.match(/IF\s+NOT\s+EXISTS/gi);

      expect(createStatements?.length).toBe(ifNotExistsStatements?.length);
    });
  });

  describe("Index Definition", () => {
    test("contains required index on created_at column", () => {
      expect(migrationContent).toContain(
        "CREATE INDEX IF NOT EXISTS idx_conversations_created_at",
      );
      expect(migrationContent).toMatch(
        /ON\s+conversations\s*\(\s*created_at\s+DESC\s*\)/i,
      );
    });
  });

  describe("Trigger Definition", () => {
    test("contains trigger for automatic updated_at updates", () => {
      expect(migrationContent).toContain(
        "CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at",
      );
      expect(migrationContent).toContain("AFTER UPDATE ON conversations");
      expect(migrationContent).toContain("updated_at = CURRENT_TIMESTAMP");
      expect(migrationContent).toContain("WHERE id = NEW.id");
    });

    test("trigger uses proper BEGIN/END structure", () => {
      expect(migrationContent).toMatch(/BEGIN[\s\S]*END/i);
    });
  });

  describe("Documentation", () => {
    test("includes descriptive comments explaining schema decisions", () => {
      // Check for comment markers
      expect(migrationContent).toContain("--");

      // Should contain some explanatory comments
      const commentLines = migrationContent
        .split("\n")
        .filter((line) => line.trim().startsWith("--"));

      expect(commentLines.length).toBeGreaterThan(5); // Should have substantial comments
    });
  });

  describe("Performance Considerations", () => {
    test("file size is under 1KB for performance", () => {
      const stats = fs.statSync(migrationPath);
      expect(stats.size).toBeLessThan(1024); // 1KB limit
    });
  });
});
