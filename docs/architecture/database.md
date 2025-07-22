# Fishbowl AI - Electron Database Architecture

See the [monorepo architecture guide](./monorepo.md) for an overview of the project structure and technology stack.

## Database Architecture

### Shared Migration System

**migrations/001_initial_schema.sql** (example migration file)

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table (encrypted)
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, provider, key_name)
);

-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY,
  version INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Database Interface

**packages/shared/src/db/interface.ts**

```typescript
export interface Database {
  // Basic operations
  execute(query: string, params?: any[]): Promise<void>;
  select<T>(query: string, params?: any[]): Promise<T[]>;
  selectOne<T>(query: string, params?: any[]): Promise<T | null>;

  // Transaction support
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;

  // Migration support
  migrate(migrations: Migration[]): Promise<void>;
}

export interface Transaction {
  execute(query: string, params?: any[]): Promise<void>;
  select<T>(query: string, params?: any[]): Promise<T[]>;
  selectOne<T>(query: string, params?: any[]): Promise<T | null>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface Migration {
  version: number;
  name: string;
  sql: string;
}
```

### Platform Implementations

**apps/desktop/src/services/database.ts**

```typescript
import Database from "better-sqlite3";
import { Database as IDatabase, Migration } from "@fishbowl-ai/shared";

export class ElectronDatabase implements IDatabase {
  private db: Database;

  async init() {
    this.db = new Database("fishbowl.db");
  }

  async execute(query: string, params?: any[]) {
    await this.db.execute(query, params || []);
  }

  async select<T>(query: string, params?: any[]): Promise<T[]> {
    return this.db.select(query, params || []);
  }

  async selectOne<T>(query: string, params?: any[]): Promise<T | null> {
    const results = await this.select<T>(query, params);
    return results[0] || null;
  }

  async transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    // Better-sqlite3 handles transactions
    return fn(this as any);
  }

  async migrate(migrations: Migration[]) {
    // Check current version
    await this.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY,
        version INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const applied = await this.select<{ version: number }>(
      "SELECT version FROM migrations",
    );
    const appliedVersions = new Set(applied.map((m) => m.version));

    // Apply new migrations
    for (const migration of migrations) {
      if (!appliedVersions.has(migration.version)) {
        await this.execute(migration.sql);
        await this.execute(
          "INSERT INTO migrations (version, name) VALUES (?, ?)",
          [migration.version, migration.name],
        );
      }
    }
  }
}
```

**apps/mobile/src/services/database.ts**

unknown
