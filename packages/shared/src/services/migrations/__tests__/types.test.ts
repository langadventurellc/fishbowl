import type { MigrationFile } from "../MigrationFile";
import type { AppliedMigration } from "../AppliedMigration";
import type { MigrationResult } from "../MigrationResult";
import { MigrationStatus } from "../MigrationStatus";
import { MigrationOperation } from "../MigrationOperation";

describe("Migration types", () => {
  describe("MigrationFile interface", () => {
    it("should allow creation with all required properties", () => {
      const migrationFile: MigrationFile = {
        filename: "001_create_users_table.sql",
        order: 1,
        path: "/migrations/001_create_users_table.sql",
      };

      expect(migrationFile.filename).toBe("001_create_users_table.sql");
      expect(migrationFile.order).toBe(1);
      expect(migrationFile.path).toBe("/migrations/001_create_users_table.sql");
    });

    it("should work with different filename patterns", () => {
      const files: MigrationFile[] = [
        {
          filename: "001_initial_schema.sql",
          order: 1,
          path: "/db/migrations/001_initial_schema.sql",
        },
        {
          filename: "002_add_user_table.sql",
          order: 2,
          path: "/db/migrations/002_add_user_table.sql",
        },
        {
          filename: "010_refactor_indexes.sql",
          order: 10,
          path: "/db/migrations/010_refactor_indexes.sql",
        },
      ];

      expect(files).toHaveLength(3);
      expect(files[0]!.order).toBe(1);
      expect(files[1]!.order).toBe(2);
      expect(files[2]!.order).toBe(10);
    });

    it("should handle absolute and relative paths", () => {
      const absolutePathFile: MigrationFile = {
        filename: "005_permissions.sql",
        order: 5,
        path: "/usr/local/app/migrations/005_permissions.sql",
      };

      const relativePathFile: MigrationFile = {
        filename: "006_indexes.sql",
        order: 6,
        path: "./migrations/006_indexes.sql",
      };

      expect(absolutePathFile.path).toMatch(/^\/usr\/local/);
      expect(relativePathFile.path).toMatch(/^\.\/migrations/);
    });

    it("should work in arrays and sorting", () => {
      const migrations: MigrationFile[] = [
        {
          filename: "003_third.sql",
          order: 3,
          path: "/migrations/003_third.sql",
        },
        {
          filename: "001_first.sql",
          order: 1,
          path: "/migrations/001_first.sql",
        },
        {
          filename: "002_second.sql",
          order: 2,
          path: "/migrations/002_second.sql",
        },
      ];

      const sortedMigrations = migrations.sort((a, b) => a.order - b.order);

      expect(sortedMigrations[0]!.filename).toBe("001_first.sql");
      expect(sortedMigrations[1]!.filename).toBe("002_second.sql");
      expect(sortedMigrations[2]!.filename).toBe("003_third.sql");
    });
  });

  describe("AppliedMigration interface", () => {
    it("should allow creation with all properties", () => {
      const appliedMigration: AppliedMigration = {
        id: 1,
        filename: "001_create_users_table.sql",
        checksum: "sha256:abc123def456",
        applied_at: "2025-08-23T16:45:00.000Z",
      };

      expect(appliedMigration.id).toBe(1);
      expect(appliedMigration.filename).toBe("001_create_users_table.sql");
      expect(appliedMigration.checksum).toBe("sha256:abc123def456");
      expect(appliedMigration.applied_at).toBe("2025-08-23T16:45:00.000Z");
    });

    it("should allow creation without optional checksum", () => {
      const appliedMigration: AppliedMigration = {
        id: 2,
        filename: "002_add_indexes.sql",
        applied_at: "2025-08-23T16:50:00.000Z",
      };

      expect(appliedMigration.id).toBe(2);
      expect(appliedMigration.filename).toBe("002_add_indexes.sql");
      expect(appliedMigration.checksum).toBeUndefined();
      expect(appliedMigration.applied_at).toBe("2025-08-23T16:50:00.000Z");
    });

    it("should work with database result simulation", () => {
      // Simulating results from database query
      const dbResults: AppliedMigration[] = [
        {
          id: 1,
          filename: "001_initial.sql",
          applied_at: "2025-08-23T10:00:00.000Z",
        },
        {
          id: 2,
          filename: "002_users.sql",
          checksum: "sha256:user_table_hash",
          applied_at: "2025-08-23T11:00:00.000Z",
        },
      ];

      expect(dbResults).toHaveLength(2);
      expect(dbResults[0]!.checksum).toBeUndefined();
      expect(dbResults[1]!.checksum).toBeDefined();
    });

    it("should handle ISO timestamp validation", () => {
      const migration: AppliedMigration = {
        id: 3,
        filename: "003_test.sql",
        applied_at: new Date().toISOString(),
      };

      // Should be a valid ISO timestamp
      expect(() => new Date(migration.applied_at)).not.toThrow();
      expect(new Date(migration.applied_at).toISOString()).toBe(
        migration.applied_at,
      );
    });
  });

  describe("MigrationResult discriminated union", () => {
    describe("Success case", () => {
      it("should allow creation of successful result", () => {
        const successResult: MigrationResult = {
          success: true,
          filename: "001_create_users.sql",
          executionTime: 1250,
        };

        expect(successResult.success).toBe(true);
        expect(successResult.filename).toBe("001_create_users.sql");
        expect(successResult.executionTime).toBe(1250);
      });

      it("should work with zero execution time", () => {
        const fastResult: MigrationResult = {
          success: true,
          filename: "002_quick_migration.sql",
          executionTime: 0,
        };

        expect(fastResult.success).toBe(true);
        expect(fastResult.executionTime).toBe(0);
      });

      it("should work with float execution times", () => {
        const preciseResult: MigrationResult = {
          success: true,
          filename: "003_precise.sql",
          executionTime: 125.75,
        };

        expect(preciseResult.executionTime).toBe(125.75);
      });
    });

    describe("Failure case", () => {
      it("should allow creation of failed result", () => {
        const failureResult: MigrationResult = {
          success: false,
          filename: "004_failed_migration.sql",
          error: "SQL syntax error on line 15",
        };

        expect(failureResult.success).toBe(false);
        expect(failureResult.filename).toBe("004_failed_migration.sql");
        expect(failureResult.error).toBe("SQL syntax error on line 15");
      });

      it("should work with detailed error messages", () => {
        const detailedFailure: MigrationResult = {
          success: false,
          filename: "005_constraint_error.sql",
          error:
            "UNIQUE constraint failed: users.email (SQLITE_CONSTRAINT_UNIQUE)",
        };

        expect(detailedFailure.error).toContain("UNIQUE constraint failed");
        expect(detailedFailure.error).toContain("SQLITE_CONSTRAINT_UNIQUE");
      });
    });

    describe("Type-safe handling", () => {
      it("should enable type-safe result handling with type guards", () => {
        const results: MigrationResult[] = [
          {
            success: true,
            filename: "001_success.sql",
            executionTime: 100,
          },
          {
            success: false,
            filename: "002_failure.sql",
            error: "Table already exists",
          },
        ];

        const successResults = results.filter((r) => r.success);
        const failureResults = results.filter((r) => !r.success);

        expect(successResults).toHaveLength(1);
        expect(failureResults).toHaveLength(1);

        // Type narrowing should work
        successResults.forEach((result) => {
          if (result.success) {
            expect(typeof result.executionTime).toBe("number");
          }
        });

        failureResults.forEach((result) => {
          if (!result.success) {
            expect(typeof result.error).toBe("string");
          }
        });
      });

      it("should work with switch statement for exhaustive checking", () => {
        function handleMigrationResult(result: MigrationResult): string {
          if (result.success) {
            return `Migration ${result.filename} completed in ${result.executionTime}ms`;
          } else {
            return `Migration ${result.filename} failed: ${result.error}`;
          }
        }

        const success: MigrationResult = {
          success: true,
          filename: "test.sql",
          executionTime: 50,
        };

        const failure: MigrationResult = {
          success: false,
          filename: "test2.sql",
          error: "Error occurred",
        };

        expect(handleMigrationResult(success)).toContain("completed in 50ms");
        expect(handleMigrationResult(failure)).toContain(
          "failed: Error occurred",
        );
      });
    });
  });

  describe("MigrationStatus enum", () => {
    it("should have all expected status values", () => {
      expect(MigrationStatus.PENDING).toBe("pending");
      expect(MigrationStatus.RUNNING).toBe("running");
      expect(MigrationStatus.APPLIED).toBe("applied");
      expect(MigrationStatus.FAILED).toBe("failed");
      expect(MigrationStatus.SKIPPED).toBe("skipped");
    });

    it("should work in arrays and loops", () => {
      const allStatuses = Object.values(MigrationStatus);
      expect(allStatuses).toHaveLength(5);
      expect(allStatuses).toContain("pending");
      expect(allStatuses).toContain("running");
      expect(allStatuses).toContain("applied");
      expect(allStatuses).toContain("failed");
      expect(allStatuses).toContain("skipped");
    });

    it("should work with switch statements", () => {
      function getStatusDescription(status: MigrationStatus): string {
        switch (status) {
          case MigrationStatus.PENDING:
            return "Ready to execute";
          case MigrationStatus.RUNNING:
            return "Currently executing";
          case MigrationStatus.APPLIED:
            return "Successfully completed";
          case MigrationStatus.FAILED:
            return "Execution failed";
          case MigrationStatus.SKIPPED:
            return "Execution skipped";
          default: {
            const exhaustiveCheck: never = status;
            return exhaustiveCheck;
          }
        }
      }

      expect(getStatusDescription(MigrationStatus.PENDING)).toBe(
        "Ready to execute",
      );
      expect(getStatusDescription(MigrationStatus.RUNNING)).toBe(
        "Currently executing",
      );
      expect(getStatusDescription(MigrationStatus.APPLIED)).toBe(
        "Successfully completed",
      );
      expect(getStatusDescription(MigrationStatus.FAILED)).toBe(
        "Execution failed",
      );
      expect(getStatusDescription(MigrationStatus.SKIPPED)).toBe(
        "Execution skipped",
      );
    });

    it("should work in status tracking objects", () => {
      interface MigrationTracker {
        filename: string;
        status: MigrationStatus;
        timestamp: string;
      }

      const trackers: MigrationTracker[] = [
        {
          filename: "001_init.sql",
          status: MigrationStatus.APPLIED,
          timestamp: "2025-08-23T10:00:00Z",
        },
        {
          filename: "002_users.sql",
          status: MigrationStatus.RUNNING,
          timestamp: "2025-08-23T10:05:00Z",
        },
        {
          filename: "003_future.sql",
          status: MigrationStatus.PENDING,
          timestamp: "2025-08-23T10:10:00Z",
        },
      ];

      expect(trackers[0]!.status).toBe("applied");
      expect(trackers[1]!.status).toBe("running");
      expect(trackers[2]!.status).toBe("pending");
    });
  });

  describe("MigrationOperation enum", () => {
    it("should have all expected operation values", () => {
      expect(MigrationOperation.APPLY).toBe("apply");
      expect(MigrationOperation.ROLLBACK).toBe("rollback");
      expect(MigrationOperation.DISCOVER).toBe("discover");
      expect(MigrationOperation.VALIDATE).toBe("validate");
      expect(MigrationOperation.INITIALIZE).toBe("initialize");
    });

    it("should work in operation logging", () => {
      interface OperationLog {
        operation: MigrationOperation;
        filename?: string;
        timestamp: string;
        success: boolean;
      }

      const logs: OperationLog[] = [
        {
          operation: MigrationOperation.INITIALIZE,
          timestamp: "2025-08-23T09:00:00Z",
          success: true,
        },
        {
          operation: MigrationOperation.DISCOVER,
          timestamp: "2025-08-23T09:01:00Z",
          success: true,
        },
        {
          operation: MigrationOperation.APPLY,
          filename: "001_init.sql",
          timestamp: "2025-08-23T09:02:00Z",
          success: true,
        },
      ];

      expect(logs[0]!.operation).toBe("initialize");
      expect(logs[1]!.operation).toBe("discover");
      expect(logs[2]!.operation).toBe("apply");
    });

    it("should work with operation categorization", () => {
      function isDestructiveOperation(operation: MigrationOperation): boolean {
        return operation === MigrationOperation.ROLLBACK;
      }

      function isReadOnlyOperation(operation: MigrationOperation): boolean {
        return [
          MigrationOperation.DISCOVER,
          MigrationOperation.VALIDATE,
        ].includes(operation);
      }

      expect(isDestructiveOperation(MigrationOperation.ROLLBACK)).toBe(true);
      expect(isDestructiveOperation(MigrationOperation.APPLY)).toBe(false);

      expect(isReadOnlyOperation(MigrationOperation.DISCOVER)).toBe(true);
      expect(isReadOnlyOperation(MigrationOperation.VALIDATE)).toBe(true);
      expect(isReadOnlyOperation(MigrationOperation.APPLY)).toBe(false);
    });

    it("should work in switch statements for operation handling", () => {
      function getOperationVerb(operation: MigrationOperation): string {
        switch (operation) {
          case MigrationOperation.APPLY:
            return "Applying";
          case MigrationOperation.ROLLBACK:
            return "Rolling back";
          case MigrationOperation.DISCOVER:
            return "Discovering";
          case MigrationOperation.VALIDATE:
            return "Validating";
          case MigrationOperation.INITIALIZE:
            return "Initializing";
          default: {
            const exhaustiveCheck: never = operation;
            return exhaustiveCheck;
          }
        }
      }

      expect(getOperationVerb(MigrationOperation.APPLY)).toBe("Applying");
      expect(getOperationVerb(MigrationOperation.ROLLBACK)).toBe(
        "Rolling back",
      );
      expect(getOperationVerb(MigrationOperation.DISCOVER)).toBe("Discovering");
      expect(getOperationVerb(MigrationOperation.VALIDATE)).toBe("Validating");
      expect(getOperationVerb(MigrationOperation.INITIALIZE)).toBe(
        "Initializing",
      );
    });
  });

  describe("Type integration", () => {
    it("should work together in complex migration scenarios", () => {
      interface MigrationExecutionContext {
        file: MigrationFile;
        operation: MigrationOperation;
        status: MigrationStatus;
        result?: MigrationResult;
        appliedRecord?: AppliedMigration;
      }

      const context: MigrationExecutionContext = {
        file: {
          filename: "005_add_indexes.sql",
          order: 5,
          path: "/migrations/005_add_indexes.sql",
        },
        operation: MigrationOperation.APPLY,
        status: MigrationStatus.APPLIED,
        result: {
          success: true,
          filename: "005_add_indexes.sql",
          executionTime: 2500,
        },
        appliedRecord: {
          id: 5,
          filename: "005_add_indexes.sql",
          checksum: "sha256:index_creation_hash",
          applied_at: "2025-08-23T12:00:00.000Z",
        },
      };

      expect(context.file.filename).toBe(context.appliedRecord!.filename);
      expect(context.operation).toBe("apply");
      expect(context.status).toBe("applied");
      expect(context.result!.success).toBe(true);
    });

    it("should support migration workflow state machines", () => {
      const migrationWorkflow: Array<{
        step: number;
        operation: MigrationOperation;
        expectedStatus: MigrationStatus;
      }> = [
        {
          step: 1,
          operation: MigrationOperation.DISCOVER,
          expectedStatus: MigrationStatus.PENDING,
        },
        {
          step: 2,
          operation: MigrationOperation.VALIDATE,
          expectedStatus: MigrationStatus.PENDING,
        },
        {
          step: 3,
          operation: MigrationOperation.APPLY,
          expectedStatus: MigrationStatus.RUNNING,
        },
        {
          step: 4,
          operation: MigrationOperation.APPLY,
          expectedStatus: MigrationStatus.APPLIED,
        },
      ];

      expect(migrationWorkflow).toHaveLength(4);
      expect(migrationWorkflow[0]!.operation).toBe("discover");
      expect(migrationWorkflow[3]!.expectedStatus).toBe("applied");
    });
  });
});
