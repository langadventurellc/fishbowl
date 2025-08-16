import * as path from "path";
import { sanitizePath } from "../../../../validation/sanitizePath";
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

describe("sanitizePath", () => {
  it("should remove dangerous characters", () => {
    expect(sanitizePath(mockPathUtils, "file<test>.json")).toBe(
      "filetest.json",
    );
    expect(sanitizePath(mockPathUtils, "file|pipe.json")).toBe("filepipe.json");
    expect(sanitizePath(mockPathUtils, 'file"quote.json')).toBe(
      "filequote.json",
    );
  });

  it("should remove control characters and null bytes", () => {
    expect(sanitizePath(mockPathUtils, "file\x00null.json")).toBe(
      "filenull.json",
    );
    expect(sanitizePath(mockPathUtils, "file\x01control.json")).toBe(
      "filecontrol.json",
    );
    expect(sanitizePath(mockPathUtils, "file\nnewline.json")).toBe(
      "filenewline.json",
    );
  });

  it("should decode URL-encoded characters", () => {
    expect(sanitizePath(mockPathUtils, "file%20space.json")).toBe(
      "file space.json",
    );
    expect(sanitizePath(mockPathUtils, "caf%C3%A9.json")).toBe("café.json");
  });

  it("should remove directory traversal attempts", () => {
    expect(sanitizePath(mockPathUtils, "../settings.json")).toBe(
      "settings.json",
    );
    expect(sanitizePath(mockPathUtils, "../../etc/passwd")).toBe("etc/passwd");
    expect(sanitizePath(mockPathUtils, "config/../secret")).toBe("secret");
  });

  it("should normalize path separators", () => {
    const input = "config\\subfolder/file.json";
    const result = sanitizePath(mockPathUtils, input);
    expect(result).toBe(path.normalize(input));
  });

  it("should handle empty input", () => {
    expect(sanitizePath(mockPathUtils, "")).toBe("");
    expect(sanitizePath(mockPathUtils, "   ")).toBe("");
  });

  it("should handle Windows-style paths", () => {
    const windowsPath = "config\\subfolder\\file.json";
    const sanitized = sanitizePath(mockPathUtils, windowsPath);
    expect(sanitized).toBe(path.normalize("config\\subfolder\\file.json"));
  });

  it("should handle Unix-style paths", () => {
    const unixPath = "config/subfolder/file.json";
    expect(sanitizePath(mockPathUtils, unixPath)).toBe(
      path.normalize(unixPath),
    );
  });

  it("should handle mixed separators", () => {
    const mixedPath = "config\\subfolder/file.json";
    const sanitized = sanitizePath(mockPathUtils, mixedPath);
    expect(sanitized).toBe(path.normalize(mixedPath));
  });

  it("should handle very long file names", () => {
    const longName = "file" + "x".repeat(250) + ".json";
    expect(sanitizePath(mockPathUtils, longName)).toBe(longName);
  });
});
