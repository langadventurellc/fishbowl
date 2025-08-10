import type { PersistedRolesSettingsData } from "../../../../types/settings";
import { SettingsValidationError } from "../../errors/SettingsValidationError";
import { createLoggerSync } from "../../../../logging";
import { createDefaultRolesSettings } from "../../../../types/settings/createDefaultRolesSettings";
import { validateRolesArray } from "./validateRolesArray";
import type { RecoveryResult } from "./RecoveryResult";

const logger = createLoggerSync({
  context: { metadata: { component: "RolesValidationRecovery" } },
});

export function recoverFromInvalidRolesFile(
  filePath: string,
  invalidData: unknown,
  error: SettingsValidationError,
): RecoveryResult {
  logger.warn("Attempting recovery from invalid roles file", {
    filePath,
  });

  const partialResult = attemptPartialRecovery(invalidData);
  if (partialResult.recovered) {
    logger.info("Partial recovery successful", {
      filePath,
      validRoles: partialResult.data.roles.length,
      skippedRoles: partialResult.skippedRoles,
    });
    return partialResult;
  }

  logger.warn("Falling back to default configuration", { filePath });
  return {
    data: createDefaultRolesSettings(),
    recovered: true,
    recoveryType: "default",
    errors: error.fieldErrors,
  };
}

function attemptPartialRecovery(data: unknown): RecoveryResult {
  if (typeof data !== "object" || data === null || !("roles" in data)) {
    return {
      data: createDefaultRolesSettings(),
      recovered: false,
    };
  }

  const dataObj = data as Record<string, unknown>;

  const rolesField = dataObj.roles;
  if (!Array.isArray(rolesField)) {
    return {
      data: createDefaultRolesSettings(),
      recovered: false,
    };
  }

  const { validRoles, errors } = validateRolesArray(rolesField, true);

  if (validRoles.length === 0) {
    return {
      data: createDefaultRolesSettings(),
      recovered: false,
    };
  }

  const recoveredData: PersistedRolesSettingsData = {
    schemaVersion:
      typeof dataObj.schemaVersion === "string"
        ? dataObj.schemaVersion
        : "1.0.0",
    roles: validRoles,
    lastUpdated:
      typeof dataObj.lastUpdated === "string"
        ? dataObj.lastUpdated
        : new Date().toISOString(),
  };

  return {
    data: recoveredData,
    recovered: true,
    recoveryType: "partial",
    skippedRoles: rolesField.length - validRoles.length,
    errors,
  };
}
