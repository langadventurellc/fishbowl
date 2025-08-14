import { randomUUID } from "crypto";
import type { MockRoleData } from "./MockRoleData";

export const createMinimalRoleData = (): MockRoleData => {
  const roleId = randomUUID().slice(0, 8);

  return {
    name: `TR ${roleId}`,
    description: "Test role",
    systemPrompt: "Test prompt",
  };
};
