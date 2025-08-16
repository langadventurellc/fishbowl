import * as path from "path";
import { isPathSafe } from "../../../../validation/isPathSafe";
import type { PathUtilsInterface } from "../../../../utils/PathUtilsInterface";

// Mock PathUtils using Node.js path module for tests
const mockPathUtils: PathUtilsInterface = {
  join: (...paths) => path.join(...paths),
  resolve: (...paths) => path.resolve(...paths),
  dirname: (p) => path.dirname(p),
  basename: (p) => path.basename(p),
  extname: (p) => path.extname(p),
  normalize: (p) => path.normalize(p),
  relative: (from, to) => path.relative(from, to),
  isAbsolute: (p) => path.isAbsolute(p),
};

describe("isPathSafe", () => {
  it("should return true for safe paths without base restriction", () => {
    expect(isPathSafe(mockPathUtils, "settings.json")).toBe(true);
    expect(isPathSafe(mockPathUtils, "config/app.json")).toBe(true);
  });

  it("should return false for unsafe paths without base restriction", () => {
    expect(isPathSafe(mockPathUtils, "../secret")).toBe(false);
    expect(isPathSafe(mockPathUtils, "file\x00.json")).toBe(false);
    expect(isPathSafe(mockPathUtils, "con.json")).toBe(false);
  });

  it("should return true for paths within allowed base", () => {
    const base = "/safe/directory";
    expect(isPathSafe(mockPathUtils, "settings.json", base)).toBe(true);
    expect(isPathSafe(mockPathUtils, "config/app.json", base)).toBe(true);
  });

  it("should return false for paths escaping allowed base", () => {
    const base = "/safe/directory";
    expect(isPathSafe(mockPathUtils, "../secret", base)).toBe(false);
    expect(isPathSafe(mockPathUtils, "/etc/passwd", base)).toBe(false);
  });

  it("should return false for invalid base directory", () => {
    expect(isPathSafe(mockPathUtils, "settings.json", "../invalid")).toBe(
      false,
    );
    expect(isPathSafe(mockPathUtils, "settings.json", "   ")).toBe(false);
  });

  it("should handle complex scenarios", () => {
    const base = "/app/data";
    expect(isPathSafe(mockPathUtils, "users/profile.json", base)).toBe(true);
    expect(isPathSafe(mockPathUtils, "../users/profile.json", base)).toBe(
      false,
    );
    expect(isPathSafe(mockPathUtils, "../../etc/passwd", base)).toBe(false);
  });

  it("should validate paths with dangerous characters", () => {
    expect(isPathSafe(mockPathUtils, "file<test>.json")).toBe(false);
    expect(isPathSafe(mockPathUtils, "file|pipe.json")).toBe(false);
    expect(isPathSafe(mockPathUtils, 'file"quote.json')).toBe(false);
  });

  it("should validate URL-encoded dangerous patterns", () => {
    expect(isPathSafe(mockPathUtils, "..%2F..%2Fetc%2Fpasswd")).toBe(false);
    expect(isPathSafe(mockPathUtils, "%2E%2E%2Fsecret")).toBe(false);
    expect(isPathSafe(mockPathUtils, "file%00null.json")).toBe(false);
  });

  it("should validate Windows reserved names", () => {
    expect(isPathSafe(mockPathUtils, "con.json")).toBe(false);
    expect(isPathSafe(mockPathUtils, "CON")).toBe(false);
    expect(isPathSafe(mockPathUtils, "prn.txt")).toBe(false);
    expect(isPathSafe(mockPathUtils, "aux")).toBe(false);
  });

  it("should handle home directory paths", () => {
    expect(isPathSafe(mockPathUtils, "~/settings.json")).toBe(false);
    expect(isPathSafe(mockPathUtils, "~/.config/app.json")).toBe(false);
  });
});
