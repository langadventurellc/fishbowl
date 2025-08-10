import { isPathSafe } from "../../../../validation/isPathSafe";

describe("isPathSafe", () => {
  it("should return true for safe paths without base restriction", () => {
    expect(isPathSafe("settings.json")).toBe(true);
    expect(isPathSafe("config/app.json")).toBe(true);
  });

  it("should return false for unsafe paths without base restriction", () => {
    expect(isPathSafe("../secret")).toBe(false);
    expect(isPathSafe("file\x00.json")).toBe(false);
    expect(isPathSafe("con.json")).toBe(false);
  });

  it("should return true for paths within allowed base", () => {
    const base = "/safe/directory";
    expect(isPathSafe("settings.json", base)).toBe(true);
    expect(isPathSafe("config/app.json", base)).toBe(true);
  });

  it("should return false for paths escaping allowed base", () => {
    const base = "/safe/directory";
    expect(isPathSafe("../secret", base)).toBe(false);
    expect(isPathSafe("/etc/passwd", base)).toBe(false);
  });

  it("should return false for invalid base directory", () => {
    expect(isPathSafe("settings.json", "../invalid")).toBe(false);
    expect(isPathSafe("settings.json", "   ")).toBe(false);
  });

  it("should handle complex scenarios", () => {
    const base = "/app/data";
    expect(isPathSafe("users/profile.json", base)).toBe(true);
    expect(isPathSafe("../users/profile.json", base)).toBe(false);
    expect(isPathSafe("../../etc/passwd", base)).toBe(false);
  });

  it("should validate paths with dangerous characters", () => {
    expect(isPathSafe("file<test>.json")).toBe(false);
    expect(isPathSafe("file|pipe.json")).toBe(false);
    expect(isPathSafe('file"quote.json')).toBe(false);
  });

  it("should validate URL-encoded dangerous patterns", () => {
    expect(isPathSafe("..%2F..%2Fetc%2Fpasswd")).toBe(false);
    expect(isPathSafe("%2E%2E%2Fsecret")).toBe(false);
    expect(isPathSafe("file%00null.json")).toBe(false);
  });

  it("should validate Windows reserved names", () => {
    expect(isPathSafe("con.json")).toBe(false);
    expect(isPathSafe("CON")).toBe(false);
    expect(isPathSafe("prn.txt")).toBe(false);
    expect(isPathSafe("aux")).toBe(false);
  });

  it("should handle home directory paths", () => {
    expect(isPathSafe("~/settings.json")).toBe(false);
    expect(isPathSafe("~/.config/app.json")).toBe(false);
  });
});
