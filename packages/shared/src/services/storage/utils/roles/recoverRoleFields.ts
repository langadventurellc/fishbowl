import type { PersistedRoleData } from "../../../../types/settings";

export function recoverRoleFields(
  roleData: unknown,
  fieldErrors: Array<{ path: string; message: string }>,
): Partial<PersistedRoleData> | null {
  if (typeof roleData !== "object" || roleData === null) {
    return null;
  }

  const role = { ...roleData } as Record<string, unknown>;
  let recovered = false;

  for (const error of fieldErrors) {
    const fieldName = error.path.split(".").pop();

    if (!fieldName) continue;

    if (handleCharacterLimitViolation(role, fieldName, error.message)) {
      recovered = true;
    }

    if (handleMissingRequiredField(role, fieldName, error.message)) {
      recovered = true;
    }

    if (handleInvalidTimestamp(role, fieldName, error.message)) {
      recovered = true;
    }
  }

  return recovered ? (role as Partial<PersistedRoleData>) : null;
}

function handleCharacterLimitViolation(
  role: Record<string, unknown>,
  fieldName: string,
  message: string,
): boolean {
  if (!message.includes("cannot exceed")) {
    return false;
  }

  const limitMatch = message.match(/(\d+) characters/);
  if (limitMatch?.[1] && typeof role[fieldName] === "string") {
    const limit = parseInt(limitMatch[1], 10);
    role[fieldName] = (role[fieldName] as string).slice(0, limit);
    return true;
  }

  return false;
}

function handleMissingRequiredField(
  role: Record<string, unknown>,
  fieldName: string,
  message: string,
): boolean {
  if (
    !message.includes("is required") &&
    !message.includes("cannot be empty")
  ) {
    return false;
  }

  if (fieldName === "id" && !role.id) {
    role.id = `recovered-${Date.now()}`;
    return true;
  }

  if (fieldName === "name" && !role.name) {
    role.name = "Recovered Role";
    return true;
  }

  return false;
}

function handleInvalidTimestamp(
  role: Record<string, unknown>,
  fieldName: string,
  message: string,
): boolean {
  if (message.includes("valid ISO datetime")) {
    role[fieldName] = null;
    return true;
  }

  return false;
}
