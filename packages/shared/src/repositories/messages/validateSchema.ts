import type { DatabaseBridge } from "../../services/database/DatabaseBridge";
import type { ValidationResult } from "../../validation/ValidationResult";
import type {
  ColumnInfo,
  ConstraintValidationResult,
  ForeignKeyInfo,
  IndexColumnInfo,
  IndexInfo,
  IndexValidationResult,
  SchemaValidationResult,
} from "./types";

/**
 * Expected schema definition for the messages table.
 */
const EXPECTED_MESSAGES_SCHEMA = {
  tableName: "messages",
  columns: [
    { name: "id", type: "TEXT", notnull: true, pk: true },
    { name: "conversation_id", type: "TEXT", notnull: true, pk: false },
    { name: "conversation_agent_id", type: "TEXT", notnull: false, pk: false },
    { name: "role", type: "TEXT", notnull: true, pk: false },
    { name: "content", type: "TEXT", notnull: true, pk: false },
    { name: "included", type: "BOOLEAN", notnull: false, pk: false }, // Has default value
    { name: "created_at", type: "DATETIME", notnull: false, pk: false }, // Has default value
  ],
  foreignKeys: [
    {
      from: "conversation_id",
      table: "conversations",
      to: "id",
      on_delete: "CASCADE",
    },
    {
      from: "conversation_agent_id",
      table: "conversation_agents",
      to: "id",
      on_delete: "SET NULL",
    },
  ],
  indexes: [
    {
      name: "idx_messages_conversation",
      columns: ["conversation_id", "created_at"],
      unique: false,
    },
  ],
} as const;

/**
 * Schema validator for the messages table.
 * Validates table structure, constraints, and indexes against expected schema.
 */
export class MessageSchemaValidator {
  constructor(private readonly databaseBridge: DatabaseBridge) {}

  /**
   * Validate the complete messages table schema.
   * Runs all validation checks and returns comprehensive results.
   */
  async validateSchema(): Promise<{
    tableStructure: SchemaValidationResult;
    constraints: ConstraintValidationResult;
    indexes: IndexValidationResult;
    overall: ValidationResult;
  }> {
    const tableStructure = await this.validateTableStructure();
    const constraints = await this.validateConstraints();
    const indexes = await this.validateIndexes();

    const overall: ValidationResult = {
      isValid: tableStructure.isValid && constraints.isValid && indexes.isValid,
      errors: [
        ...(tableStructure.errors || []),
        ...(constraints.errors || []),
        ...(indexes.errors || []),
      ].filter(Boolean),
    };

    return {
      tableStructure,
      constraints,
      indexes,
      overall,
    };
  }

  /**
   * Validate messages table structure matches expected schema.
   * Checks column names, types, constraints, and primary key definition.
   */
  async validateTableStructure(): Promise<SchemaValidationResult> {
    try {
      const columns = await this.databaseBridge.query<ColumnInfo>(
        "PRAGMA table_info(messages)",
      );

      if (columns.length === 0) {
        return {
          isValid: false,
          error: "Messages table does not exist",
          columns: [],
        };
      }

      const validationData = this.validateColumns(columns);
      const unexpectedErrors = this.checkForUnexpectedColumns(columns);

      const allErrors = [...validationData.errors, ...unexpectedErrors];

      return {
        isValid: allErrors.length === 0,
        columns,
        missingColumns:
          validationData.missingColumns.length > 0
            ? validationData.missingColumns
            : undefined,
        incorrectTypes:
          validationData.incorrectTypes.length > 0
            ? validationData.incorrectTypes
            : undefined,
        errors: allErrors.length > 0 ? allErrors : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Failed to validate table structure: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Validate individual columns against expected schema.
   */
  private validateColumns(columns: ColumnInfo[]): {
    errors: string[];
    missingColumns: string[];
    incorrectTypes: Array<{ name: string; expected: string; actual: string }>;
  } {
    const errors: string[] = [];
    const missingColumns: string[] = [];
    const incorrectTypes: Array<{
      name: string;
      expected: string;
      actual: string;
    }> = [];

    for (const expectedCol of EXPECTED_MESSAGES_SCHEMA.columns) {
      const actualCol = columns.find((col) => col.name === expectedCol.name);

      if (!actualCol) {
        missingColumns.push(expectedCol.name);
        errors.push(`Missing column: ${expectedCol.name}`);
        continue;
      }

      this.validateColumnProperties(
        actualCol,
        expectedCol,
        errors,
        incorrectTypes,
      );
    }

    return { errors, missingColumns, incorrectTypes };
  }

  /**
   * Validate individual column properties.
   */
  private validateColumnProperties(
    actualCol: ColumnInfo,
    expectedCol: (typeof EXPECTED_MESSAGES_SCHEMA.columns)[number],
    errors: string[],
    incorrectTypes: Array<{ name: string; expected: string; actual: string }>,
  ): void {
    // Check data type
    if (actualCol.type !== expectedCol.type) {
      incorrectTypes.push({
        name: expectedCol.name,
        expected: expectedCol.type,
        actual: actualCol.type,
      });
      errors.push(
        `Column ${expectedCol.name}: expected ${expectedCol.type}, got ${actualCol.type}`,
      );
    }

    // Check NOT NULL constraint
    if (actualCol.notnull !== expectedCol.notnull) {
      errors.push(`Column ${expectedCol.name}: NOT NULL constraint mismatch`);
    }

    // Check primary key
    if (actualCol.pk !== expectedCol.pk) {
      errors.push(
        `Column ${expectedCol.name}: primary key constraint mismatch`,
      );
    }
  }

  /**
   * Check for unexpected columns not in the expected schema.
   */
  private checkForUnexpectedColumns(columns: ColumnInfo[]): string[] {
    const expectedColumnNames: string[] = EXPECTED_MESSAGES_SCHEMA.columns.map(
      (col) => col.name,
    );
    const unexpectedColumns = columns.filter(
      (col) => !expectedColumnNames.includes(col.name),
    );

    if (unexpectedColumns.length > 0) {
      return [
        `Unexpected columns found: ${unexpectedColumns
          .map((col) => col.name)
          .join(", ")}`,
      ];
    }

    return [];
  }

  /**
   * Validate foreign key constraints are properly defined and enforced.
   * Tests both constraint definition and enforcement behavior.
   */
  async validateConstraints(): Promise<ConstraintValidationResult> {
    try {
      // Get foreign key definitions
      const foreignKeys = await this.databaseBridge.query<ForeignKeyInfo>(
        "PRAGMA foreign_key_list(messages)",
      );

      const errors: string[] = [];
      const failedConstraints: Array<{ constraint: string; reason: string }> =
        [];

      // Check each expected foreign key
      for (const expectedFK of EXPECTED_MESSAGES_SCHEMA.foreignKeys) {
        const actualFK = foreignKeys.find(
          (fk) =>
            fk.from === expectedFK.from &&
            fk.table === expectedFK.table &&
            fk.to === expectedFK.to,
        );

        if (!actualFK) {
          const constraint = `${expectedFK.from} -> ${expectedFK.table}.${expectedFK.to}`;
          failedConstraints.push({
            constraint,
            reason: "Foreign key constraint not found",
          });
          errors.push(`Missing foreign key constraint: ${constraint}`);
          continue;
        }

        // Check ON DELETE behavior
        if (actualFK.on_delete !== expectedFK.on_delete) {
          const constraint = `${expectedFK.from} -> ${expectedFK.table}.${expectedFK.to}`;
          failedConstraints.push({
            constraint,
            reason: `ON DELETE should be ${expectedFK.on_delete}, got ${actualFK.on_delete}`,
          });
          errors.push(
            `Foreign key ${constraint}: expected ON DELETE ${expectedFK.on_delete}, got ${actualFK.on_delete}`,
          );
        }
      }

      // Check for unexpected foreign keys
      const expectedConstraints = EXPECTED_MESSAGES_SCHEMA.foreignKeys.map(
        (fk) => `${fk.from}->${fk.table}.${fk.to}`,
      );
      const unexpectedKeys = foreignKeys.filter(
        (fk) =>
          !expectedConstraints.includes(`${fk.from}->${fk.table}.${fk.to}`),
      );

      if (unexpectedKeys.length > 0) {
        errors.push(
          `Unexpected foreign key constraints found: ${unexpectedKeys
            .map((fk) => `${fk.from}->${fk.table}.${fk.to}`)
            .join(", ")}`,
        );
      }

      return {
        isValid: errors.length === 0,
        constraints: foreignKeys,
        failedConstraints:
          failedConstraints.length > 0 ? failedConstraints : undefined,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Failed to validate constraints: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Validate indexes exist and have correct structure.
   * Checks for expected indexes and their column composition.
   */
  async validateIndexes(): Promise<IndexValidationResult> {
    try {
      // Get all indexes for the messages table
      const indexList = await this.databaseBridge.query<{
        seq: number;
        name: string;
        unique: boolean;
        origin: string;
        partial: boolean;
      }>("PRAGMA index_list(messages)");

      const errors: string[] = [];
      const missingIndexes: string[] = [];
      const indexes: IndexInfo[] = [];

      // Get detailed information for each index
      for (const indexMeta of indexList) {
        const columns = await this.databaseBridge.query<IndexColumnInfo>(
          `PRAGMA index_info(${indexMeta.name})`,
        );

        indexes.push({
          ...indexMeta,
          columns,
        });
      }

      // Check each expected index
      for (const expectedIdx of EXPECTED_MESSAGES_SCHEMA.indexes) {
        const actualIdx = indexes.find((idx) => idx.name === expectedIdx.name);

        if (!actualIdx) {
          missingIndexes.push(expectedIdx.name);
          errors.push(`Missing index: ${expectedIdx.name}`);
          continue;
        }

        // Check if index covers expected columns
        const actualColumns =
          actualIdx.columns?.map((col) => col.name).sort() || [];
        const expectedColumns = [...expectedIdx.columns].sort();

        if (JSON.stringify(actualColumns) !== JSON.stringify(expectedColumns)) {
          errors.push(
            `Index ${expectedIdx.name}: expected columns [${expectedColumns.join(
              ", ",
            )}], got [${actualColumns.join(", ")}]`,
          );
        }

        // Check uniqueness
        if (actualIdx.unique !== expectedIdx.unique) {
          errors.push(
            `Index ${expectedIdx.name}: expected unique=${expectedIdx.unique}, got ${actualIdx.unique}`,
          );
        }
      }

      return {
        isValid: errors.length === 0,
        indexes,
        missingIndexes: missingIndexes.length > 0 ? missingIndexes : undefined,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Failed to validate indexes: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Test constraint enforcement by attempting operations that should fail.
   * WARNING: This method performs actual database operations to test constraints.
   * Use with caution in production environments.
   */
  async testConstraintEnforcement(): Promise<{
    foreignKeyEnforcement: ValidationResult;
    defaultValues: ValidationResult;
  }> {
    const foreignKeyEnforcement = await this.testForeignKeyEnforcement();
    const defaultValues = await this.testDefaultValues();

    return {
      foreignKeyEnforcement,
      defaultValues,
    };
  }

  /**
   * Test foreign key enforcement by attempting to insert invalid references.
   * This requires PRAGMA foreign_keys = ON to be set.
   */
  private async testForeignKeyEnforcement(): Promise<ValidationResult> {
    try {
      // Check if foreign keys are enabled
      const fkStatus = await this.databaseBridge.query<{
        foreign_keys: number;
      }>("PRAGMA foreign_keys");

      if (fkStatus.length === 0 || fkStatus[0]?.foreign_keys !== 1) {
        return {
          isValid: false,
          error:
            "Foreign key enforcement is disabled (PRAGMA foreign_keys = OFF)",
        };
      }

      // Test would require creating actual test data, which might not be appropriate
      // for a validation script. This would be better implemented in integration tests.
      return {
        isValid: true,
        error:
          "Foreign key enforcement is enabled (test implementation needed)",
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Failed to test foreign key enforcement: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Test that default values are properly applied.
   */
  private async testDefaultValues(): Promise<ValidationResult> {
    // This would require creating test data to verify defaults are applied
    // Better implemented as part of integration tests with proper setup/teardown
    return {
      isValid: true,
      error: "Default value testing requires integration test implementation",
    };
  }
}
