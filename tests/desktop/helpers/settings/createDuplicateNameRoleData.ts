import { randomUUID } from "crypto";
import type { MockRoleData } from "./MockRoleData";

export const createDuplicateNameRoleData = (
  existingName: string,
): MockRoleData => {
  const roleId = randomUUID().slice(0, 8);

  return {
    name: existingName,
    description: `Duplicate role test - ${roleId}`,
    systemPrompt: `Test duplicate name handling - ${roleId}`,
  };
};
