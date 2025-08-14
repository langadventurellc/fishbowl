import { randomUUID } from "crypto";
import type { MockRoleData } from "./MockRoleData";

export const createMockTechnicalRole = (): MockRoleData => {
  const roleId = randomUUID().slice(0, 8);

  return {
    name: `Test Developer ${roleId}`,
    description: `A technical test role for code review and development testing - ${roleId}`,
    systemPrompt: `You are a test software developer (ID: ${roleId}). Review test code, suggest improvements for test scenarios, and help validate technical testing implementations. Focus on code quality in test contexts.`,
  };
};
