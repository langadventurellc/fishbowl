import * as path from "path";
import { resolvePath } from "../resolvePath";
import { PathValidationError } from "../PathValidationError";

describe("resolvePath", () => {
  const baseDir = "/safe/directory";

  it("should resolve valid relative paths", () => {
    const result = resolvePath(baseDir, "settings.json");
    expect(result).toBe(path.resolve(baseDir, "settings.json"));
  });

  it("should resolve nested relative paths", () => {
    const result = resolvePath(baseDir, "config/app.json");
    expect(result).toBe(path.resolve(baseDir, "config/app.json"));
  });

  it("should throw for directory traversal attempts", () => {
    expect(() => resolvePath(baseDir, "../secret")).toThrow(
      PathValidationError,
    );
    expect(() => resolvePath(baseDir, "../../etc/passwd")).toThrow(
      PathValidationError,
    );
    expect(() => resolvePath(baseDir, "config/../../../secret")).toThrow(
      PathValidationError,
    );
  });

  it("should throw for absolute paths that escape base", () => {
    expect(() => resolvePath(baseDir, "/etc/passwd")).toThrow(
      PathValidationError,
    );
    expect(() => resolvePath(baseDir, "/tmp/malicious")).toThrow(
      PathValidationError,
    );
  });

  it("should throw for invalid base path", () => {
    expect(() => resolvePath("../invalid", "file.json")).toThrow(
      PathValidationError,
    );
    expect(() => resolvePath("", "file.json")).toThrow(PathValidationError);
  });

  it("should throw for invalid relative path", () => {
    expect(() => resolvePath(baseDir, "")).toThrow(PathValidationError);
    expect(() => resolvePath(baseDir, "file\x00.json")).toThrow(
      PathValidationError,
    );
  });

  it("should throw with descriptive error messages", () => {
    expect(() => resolvePath(baseDir, "../secret")).toThrow(
      /Directory traversal not allowed/,
    );
    expect(() => resolvePath(baseDir, "../../etc/passwd")).toThrow(
      /Directory traversal not allowed/,
    );
  });

  it("should handle complex nested paths", () => {
    const result = resolvePath(baseDir, "config/sub1/sub2/file.json");
    expect(result).toBe(path.resolve(baseDir, "config/sub1/sub2/file.json"));
  });
});
