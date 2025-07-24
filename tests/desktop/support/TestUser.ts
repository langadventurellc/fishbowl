import { UserPreferences } from "support/UserPreferences";

export interface TestUser {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}
