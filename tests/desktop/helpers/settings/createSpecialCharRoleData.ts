import { randomUUID } from "crypto";
import type { MockRoleData } from "./MockRoleData";

export const createSpecialCharRoleData = (): MockRoleData => {
  const roleId = randomUUID().slice(0, 8);

  return {
    name: `Test-Role_${roleId}`,
    description: `Test role with special characters: !@#$%^&*() - ${roleId}`,
    systemPrompt: `Test prompt with "quotes", 'apostrophes', and other special chars: <>&{}[]`,
  };
};
