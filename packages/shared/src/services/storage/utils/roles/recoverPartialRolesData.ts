import type { PersistedRoleData } from "../../../../types/settings";
import { SettingsValidationError } from "../../errors/SettingsValidationError";
import { createLoggerSync } from "../../../../logging";
import { validateRolesArray } from "./validateRolesArray";

const logger = createLoggerSync({
  context: { metadata: { component: "RolesValidationRecovery" } },
});

export function recoverPartialRolesData(
  rolesArray: unknown[],
  _validationErrors: SettingsValidationError[],
): { validRoles: PersistedRoleData[]; skippedRoles: number } {
  const { validRoles } = validateRolesArray(rolesArray, true);

  logger.info("Partial roles recovery completed", {
    totalRoles: rolesArray.length,
    validRoles: validRoles.length,
    skippedRoles: rolesArray.length - validRoles.length,
  });

  return {
    validRoles,
    skippedRoles: rolesArray.length - validRoles.length,
  };
}
