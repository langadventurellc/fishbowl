import * as path from "path";
import { sanitizePath } from "../../../../validation/sanitizePath";

describe("sanitizePath", () => {
  it("should remove dangerous characters", () => {
    expect(sanitizePath("file<test>.json")).toBe("filetest.json");
    expect(sanitizePath("file|pipe.json")).toBe("filepipe.json");
    expect(sanitizePath('file"quote.json')).toBe("filequote.json");
  });

  it("should remove control characters and null bytes", () => {
    expect(sanitizePath("file\x00null.json")).toBe("filenull.json");
    expect(sanitizePath("file\x01control.json")).toBe("filecontrol.json");
    expect(sanitizePath("file\nnewline.json")).toBe("filenewline.json");
  });

  it("should decode URL-encoded characters", () => {
    expect(sanitizePath("file%20space.json")).toBe("file space.json");
    expect(sanitizePath("caf%C3%A9.json")).toBe("café.json");
  });

  it("should remove directory traversal attempts", () => {
    expect(sanitizePath("../settings.json")).toBe("settings.json");
    expect(sanitizePath("../../etc/passwd")).toBe("etc/passwd");
    expect(sanitizePath("config/../secret")).toBe("secret");
  });

  it("should normalize path separators", () => {
    const input = "config\\subfolder/file.json";
    const result = sanitizePath(input);
    expect(result).toBe(path.normalize(input));
  });

  it("should handle empty input", () => {
    expect(sanitizePath("")).toBe("");
    expect(sanitizePath("   ")).toBe("");
  });

  it("should handle Windows-style paths", () => {
    const windowsPath = "config\\subfolder\\file.json";
    const sanitized = sanitizePath(windowsPath);
    expect(sanitized).toBe(path.normalize("config\\subfolder\\file.json"));
  });

  it("should handle Unix-style paths", () => {
    const unixPath = "config/subfolder/file.json";
    expect(sanitizePath(unixPath)).toBe(path.normalize(unixPath));
  });

  it("should handle mixed separators", () => {
    const mixedPath = "config\\subfolder/file.json";
    const sanitized = sanitizePath(mixedPath);
    expect(sanitized).toBe(path.normalize(mixedPath));
  });

  it("should handle very long file names", () => {
    const longName = "file" + "x".repeat(250) + ".json";
    expect(sanitizePath(longName)).toBe(longName);
  });
});
