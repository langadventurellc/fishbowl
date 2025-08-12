import { readFileSync } from "fs";
import { join } from "path";
import { persistedRolesSettingsSchema } from "../../types/settings/rolesSettingsSchema";

describe("defaultRoles.json", () => {
  let rawJsonData: unknown;
  let parsedData: unknown;

  beforeAll(() => {
    const filePath = join(process.cwd(), "src/data/defaultRoles.json");
    const fileContent = readFileSync(filePath, "utf-8");
    rawJsonData = JSON.parse(fileContent);
    parsedData = persistedRolesSettingsSchema.parse(rawJsonData);
  });

  it("should be valid JSON", () => {
    expect(rawJsonData).toBeDefined();
    expect(typeof rawJsonData).toBe("object");
  });

  it("should validate against persistedRolesSettingsSchema", () => {
    expect(() => {
      persistedRolesSettingsSchema.parse(rawJsonData);
    }).not.toThrow();
  });

  it("should have required structure after schema parsing", () => {
    expect(parsedData).toHaveProperty("schemaVersion");
    expect(parsedData).toHaveProperty("roles");
    expect(parsedData).toHaveProperty("lastUpdated");
    expect(Array.isArray((parsedData as { roles: unknown }).roles)).toBe(true);
  });
});
