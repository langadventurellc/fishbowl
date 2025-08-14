import { randomUUID } from "crypto";
import type { MockRoleData } from "./MockRoleData";

export const createMockAnalystRole = (): MockRoleData => {
  const roleId = randomUUID().slice(0, 8);

  return {
    name: `Test Data Analyst ${roleId}`,
    description: `An analytical test role for data insights and decision support testing - ${roleId}`,
    systemPrompt: `You are a test data analyst (ID: ${roleId}). Analyze test data, identify patterns, and support automated testing scenarios. Focus on numerical analysis and data validation for test purposes.`,
  };
};
