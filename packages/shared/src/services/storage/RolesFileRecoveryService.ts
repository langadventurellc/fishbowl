import { FileStorageService } from "./FileStorageService";
import { SettingsValidationError } from "./errors/SettingsValidationError";
import type { PersistedRolesSettingsData } from "../../types/settings";
import { persistedRolesSettingsSchema } from "../../types/settings/rolesSettingsSchema";
import { validateRolesData } from "./utils/validateRolesData";
import { recoverFromInvalidRolesFile } from "./utils/roles/recoverFromInvalidRolesFile";
import { createFileBackup } from "./utils/createFileBackup";
import { createLoggerSync } from "../../logging";

const logger = createLoggerSync({
  context: { metadata: { component: "RolesFileRecoveryService" } },
});

export class RolesFileRecoveryService {
  constructor(
    private readonly fileStorage: FileStorageService<PersistedRolesSettingsData>,
  ) {}

  async loadRolesWithRecovery(filePath: string): Promise<{
    data: PersistedRolesSettingsData;
    recovered: boolean;
    backupPath?: string;
    errors?: Array<{ path: string; message: string }>;
  }> {
    try {
      const rawData = await this.fileStorage.readJsonFile(filePath);
      const validatedData = validateRolesData(
        rawData,
        persistedRolesSettingsSchema,
        filePath,
        "loadRoles",
      );

      return {
        data: validatedData,
        recovered: false,
      };
    } catch (error) {
      if (!(error instanceof SettingsValidationError)) {
        throw error;
      }

      logger.warn("Roles validation failed, attempting recovery", {
        errorCount: error.fieldErrors.length,
      });

      const backupPath = await createFileBackup(filePath);

      const rawData = await this.fileStorage.readJsonFile(filePath);
      const recoveryResult = recoverFromInvalidRolesFile(
        filePath,
        rawData,
        error,
      );

      if (recoveryResult.recovered) {
        await this.fileStorage.writeJsonFile(filePath, recoveryResult.data);
        logger.info("Recovered data saved to file", {
          recoveryType: recoveryResult.recoveryType,
        });
      }

      return {
        data: recoveryResult.data,
        recovered: true,
        backupPath: backupPath ?? undefined,
        errors: recoveryResult.errors,
      };
    }
  }
}
