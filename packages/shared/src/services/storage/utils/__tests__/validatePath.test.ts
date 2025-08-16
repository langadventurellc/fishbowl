import * as path from "path";
import { validatePath } from "../../../../validation/validatePath";
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

describe("validatePath", () => {
  it("should return true for valid relative paths", () => {
    expect(validatePath(mockPathUtils, "settings.json")).toBe(true);
    expect(validatePath(mockPathUtils, "config/app.json")).toBe(true);
    expect(validatePath(mockPathUtils, "data/user-preferences.json")).toBe(
      true,
    );
  });

  it("should return false for directory traversal attempts", () => {
    expect(validatePath(mockPathUtils, "../settings.json")).toBe(false);
    expect(validatePath(mockPathUtils, "../../etc/passwd")).toBe(false);
    expect(validatePath(mockPathUtils, "..\\..\\windows\\system32")).toBe(
      false,
    );
    expect(validatePath(mockPathUtils, "config/../../../secret")).toBe(false);
  });

  it("should return false for paths with dangerous characters", () => {
    expect(validatePath(mockPathUtils, "file<test>.json")).toBe(false);
    expect(validatePath(mockPathUtils, "file|pipe.json")).toBe(false);
    expect(validatePath(mockPathUtils, 'file"quote.json')).toBe(false);
    expect(validatePath(mockPathUtils, "file?query.json")).toBe(false);
    expect(validatePath(mockPathUtils, "file*wildcard.json")).toBe(false);
  });

  it("should return false for control characters and null bytes", () => {
    expect(validatePath(mockPathUtils, "file\x00null.json")).toBe(false);
    expect(validatePath(mockPathUtils, "file\x01control.json")).toBe(false);
    expect(validatePath(mockPathUtils, "file\x1fcontrol.json")).toBe(false);
    expect(validatePath(mockPathUtils, "file\nnewline.json")).toBe(false);
    expect(validatePath(mockPathUtils, "file\ttab.json")).toBe(false);
  });

  it("should return false for URL-encoded dangerous patterns", () => {
    expect(validatePath(mockPathUtils, "..%2F..%2Fetc%2Fpasswd")).toBe(false);
    expect(validatePath(mockPathUtils, "%2E%2E%2Fsecret")).toBe(false);
    expect(validatePath(mockPathUtils, "file%00null.json")).toBe(false);
  });

  it("should return false for Windows reserved names", () => {
    expect(validatePath(mockPathUtils, "con.json")).toBe(false);
    expect(validatePath(mockPathUtils, "CON")).toBe(false);
    expect(validatePath(mockPathUtils, "prn.txt")).toBe(false);
    expect(validatePath(mockPathUtils, "aux")).toBe(false);
    expect(validatePath(mockPathUtils, "com1.log")).toBe(false);
    expect(validatePath(mockPathUtils, "lpt9")).toBe(false);
  });

  it("should return false for home directory paths", () => {
    expect(validatePath(mockPathUtils, "~/settings.json")).toBe(false);
    expect(validatePath(mockPathUtils, "~/.config/app.json")).toBe(false);
  });

  it("should return false for empty or overly long paths", () => {
    expect(validatePath(mockPathUtils, "")).toBe(false);
    expect(validatePath(mockPathUtils, "   ")).toBe(false);
    expect(validatePath(mockPathUtils, "a".repeat(1001))).toBe(false);
  });

  it("should handle unicode characters", () => {
    expect(validatePath(mockPathUtils, "café.json")).toBe(true);
    expect(validatePath(mockPathUtils, "файл.json")).toBe(true);
    expect(validatePath(mockPathUtils, "文件.json")).toBe(true);
  });

  it("should handle multiple dots in filename", () => {
    expect(validatePath(mockPathUtils, "backup.2023.12.31.json")).toBe(true);
    expect(validatePath(mockPathUtils, ".hidden.json")).toBe(true);
  });

  it("should handle very long file names", () => {
    const longName = "file" + "x".repeat(250) + ".json";
    expect(validatePath(mockPathUtils, longName)).toBe(true);
  });
});
