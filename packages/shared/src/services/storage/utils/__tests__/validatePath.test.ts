import { validatePath } from "../../../../validation/validatePath";

describe("validatePath", () => {
  it("should return true for valid relative paths", () => {
    expect(validatePath("settings.json")).toBe(true);
    expect(validatePath("config/app.json")).toBe(true);
    expect(validatePath("data/user-preferences.json")).toBe(true);
  });

  it("should return false for directory traversal attempts", () => {
    expect(validatePath("../settings.json")).toBe(false);
    expect(validatePath("../../etc/passwd")).toBe(false);
    expect(validatePath("..\\..\\windows\\system32")).toBe(false);
    expect(validatePath("config/../../../secret")).toBe(false);
  });

  it("should return false for paths with dangerous characters", () => {
    expect(validatePath("file<test>.json")).toBe(false);
    expect(validatePath("file|pipe.json")).toBe(false);
    expect(validatePath('file"quote.json')).toBe(false);
    expect(validatePath("file?query.json")).toBe(false);
    expect(validatePath("file*wildcard.json")).toBe(false);
  });

  it("should return false for control characters and null bytes", () => {
    expect(validatePath("file\x00null.json")).toBe(false);
    expect(validatePath("file\x01control.json")).toBe(false);
    expect(validatePath("file\x1fcontrol.json")).toBe(false);
    expect(validatePath("file\nnewline.json")).toBe(false);
    expect(validatePath("file\ttab.json")).toBe(false);
  });

  it("should return false for URL-encoded dangerous patterns", () => {
    expect(validatePath("..%2F..%2Fetc%2Fpasswd")).toBe(false);
    expect(validatePath("%2E%2E%2Fsecret")).toBe(false);
    expect(validatePath("file%00null.json")).toBe(false);
  });

  it("should return false for Windows reserved names", () => {
    expect(validatePath("con.json")).toBe(false);
    expect(validatePath("CON")).toBe(false);
    expect(validatePath("prn.txt")).toBe(false);
    expect(validatePath("aux")).toBe(false);
    expect(validatePath("com1.log")).toBe(false);
    expect(validatePath("lpt9")).toBe(false);
  });

  it("should return false for home directory paths", () => {
    expect(validatePath("~/settings.json")).toBe(false);
    expect(validatePath("~/.config/app.json")).toBe(false);
  });

  it("should return false for empty or overly long paths", () => {
    expect(validatePath("")).toBe(false);
    expect(validatePath("   ")).toBe(false);
    expect(validatePath("a".repeat(1001))).toBe(false);
  });

  it("should handle unicode characters", () => {
    expect(validatePath("café.json")).toBe(true);
    expect(validatePath("файл.json")).toBe(true);
    expect(validatePath("文件.json")).toBe(true);
  });

  it("should handle multiple dots in filename", () => {
    expect(validatePath("backup.2023.12.31.json")).toBe(true);
    expect(validatePath(".hidden.json")).toBe(true);
  });

  it("should handle very long file names", () => {
    const longName = "file" + "x".repeat(250) + ".json";
    expect(validatePath(longName)).toBe(true);
  });
});
