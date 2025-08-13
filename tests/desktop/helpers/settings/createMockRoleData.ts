import { randomUUID } from "crypto";
import type { MockRoleData } from "./MockRoleData";

export const createMockRoleData = (
  overrides?: Partial<MockRoleData>,
): MockRoleData => {
  const roleId = randomUUID().slice(0, 8);

  return {
    name: `Test Role ${roleId}`,
    description: `A test role for automated testing purposes - ${roleId}. This role helps verify role management functionality.`,
    systemPrompt: `You are a test assistant role (ID: ${roleId}). Help with testing and verification tasks. Always provide clear, actionable responses for test scenarios. Remember you are part of an automated test suite.`,
    ...overrides,
  };
};
