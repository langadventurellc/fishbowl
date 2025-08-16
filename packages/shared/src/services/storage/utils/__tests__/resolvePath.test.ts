import * as path from "path";
import { resolvePath } from "../resolvePath";
import { PathValidationError } from "../PathValidationError";
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

describe("resolvePath", () => {
  const baseDir = "/safe/directory";

  it("should resolve valid relative paths", () => {
    const result = resolvePath(mockPathUtils, baseDir, "settings.json");
    expect(result).toBe(path.resolve(baseDir, "settings.json"));
  });

  it("should resolve nested relative paths", () => {
    const result = resolvePath(mockPathUtils, baseDir, "config/app.json");
    expect(result).toBe(path.resolve(baseDir, "config/app.json"));
  });

  it("should throw for directory traversal attempts", () => {
    expect(() => resolvePath(mockPathUtils, baseDir, "../secret")).toThrow(
      PathValidationError,
    );
    expect(() =>
      resolvePath(mockPathUtils, baseDir, "../../etc/passwd"),
    ).toThrow(PathValidationError);
    expect(() =>
      resolvePath(mockPathUtils, baseDir, "config/../../../secret"),
    ).toThrow(PathValidationError);
  });

  it("should throw for absolute paths that escape base", () => {
    expect(() => resolvePath(mockPathUtils, baseDir, "/etc/passwd")).toThrow(
      PathValidationError,
    );
    expect(() => resolvePath(mockPathUtils, baseDir, "/tmp/malicious")).toThrow(
      PathValidationError,
    );
  });

  it("should throw for invalid base path", () => {
    expect(() => resolvePath(mockPathUtils, "../invalid", "file.json")).toThrow(
      PathValidationError,
    );
    expect(() => resolvePath(mockPathUtils, "", "file.json")).toThrow(
      PathValidationError,
    );
  });

  it("should throw for invalid relative path", () => {
    expect(() => resolvePath(mockPathUtils, baseDir, "")).toThrow(
      PathValidationError,
    );
    expect(() => resolvePath(mockPathUtils, baseDir, "file\x00.json")).toThrow(
      PathValidationError,
    );
  });

  it("should throw with descriptive error messages", () => {
    expect(() => resolvePath(mockPathUtils, baseDir, "../secret")).toThrow(
      /Directory traversal not allowed/,
    );
    expect(() =>
      resolvePath(mockPathUtils, baseDir, "../../etc/passwd"),
    ).toThrow(/Directory traversal not allowed/);
  });

  it("should handle complex nested paths", () => {
    const result = resolvePath(
      mockPathUtils,
      baseDir,
      "config/sub1/sub2/file.json",
    );
    expect(result).toBe(path.resolve(baseDir, "config/sub1/sub2/file.json"));
  });
});
