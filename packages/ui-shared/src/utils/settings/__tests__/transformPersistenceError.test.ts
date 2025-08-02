import { transformPersistenceError } from "../transformPersistenceError";
import { SettingsPersistenceError } from "../../../types/settings/persistence/SettingsPersistenceError";

describe("transformPersistenceError", () => {
  it("should handle save operation errors", () => {
    const error = new SettingsPersistenceError("Failed to write file", "save");

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to save your settings. Your changes may not be preserved.",
    );
  });

  it("should handle load operation errors", () => {
    const error = new SettingsPersistenceError("Failed to read file", "load");

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to load your settings. Default settings will be used.",
    );
  });

  it("should handle reset operation errors", () => {
    const error = new SettingsPersistenceError(
      "Failed to delete file",
      "reset",
    );

    const result = transformPersistenceError(error);
    expect(result).toBe("Unable to reset your settings. Please try again.");
  });

  it("should add contextual guidance for readonly errors", () => {
    const error = new SettingsPersistenceError(
      "EACCES: permission denied",
      "save",
    );

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to save your settings. Your changes may not be preserved. The settings file may be read-only.",
    );
  });

  it("should add contextual guidance for permission errors in message", () => {
    const error = new SettingsPersistenceError(
      "Permission denied writing to file",
      "save",
    );

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to save your settings. Your changes may not be preserved. The settings file may be read-only.",
    );
  });

  it("should add contextual guidance for disk space errors", () => {
    const error = new SettingsPersistenceError(
      "ENOSPC: no space left on device",
      "save",
    );

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to save your settings. Your changes may not be preserved. Please ensure you have sufficient disk space.",
    );
  });

  it("should add contextual guidance for file not found errors", () => {
    const error = new SettingsPersistenceError(
      "ENOENT: no such file or directory",
      "load",
    );

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to load your settings. Default settings will be used. Please restart the application if the issue persists.",
    );
  });

  it("should add contextual guidance for permission errors in cause", () => {
    const cause = new Error("EACCES: permission denied");
    const error = new SettingsPersistenceError(
      "Failed to save settings",
      "save",
      cause,
    );

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to save your settings. Your changes may not be preserved. Please check your application permissions.",
    );
  });

  it("should handle generic Error instances without exposing details", () => {
    const error = new Error(
      "ENOENT: no such file or directory, open '/private/path/settings.json'",
    );
    const result = transformPersistenceError(error);
    expect(result).toBe(
      "An error occurred while managing your settings. Please try again.",
    );
    expect(result).not.toContain("ENOENT");
    expect(result).not.toContain("/private/path");
  });

  it("should handle unknown error types", () => {
    const result = transformPersistenceError("string error");
    expect(result).toBe(
      "An unexpected error occurred. Please try again or contact support if the issue persists.",
    );
  });

  it("should handle null and undefined errors", () => {
    expect(transformPersistenceError(null)).toBe(
      "An unexpected error occurred. Please try again or contact support if the issue persists.",
    );
    expect(transformPersistenceError(undefined)).toBe(
      "An unexpected error occurred. Please try again or contact support if the issue persists.",
    );
  });

  it("should handle SettingsPersistenceError without cause", () => {
    const error = new SettingsPersistenceError("Simple error", "save");
    expect(error.cause).toBeUndefined();

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to save your settings. Your changes may not be preserved.",
    );
  });

  it("should handle SettingsPersistenceError with non-Error cause", () => {
    const error = new SettingsPersistenceError(
      "Error with string cause",
      "save",
      "some string cause",
    );

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to save your settings. Your changes may not be preserved.",
    );
  });

  it("should handle case-insensitive error message matching", () => {
    const error = new SettingsPersistenceError("READONLY file system", "save");

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to save your settings. Your changes may not be preserved. The settings file may be read-only.",
    );
  });

  it("should not add duplicate guidance", () => {
    const error = new SettingsPersistenceError("Permission denied", "save");

    const result = transformPersistenceError(error);
    expect(result).toBe(
      "Unable to save your settings. Your changes may not be preserved. The settings file may be read-only.",
    );

    // Ensure guidance is only added once
    const guidanceCount = (result.match(/read-only/g) || []).length;
    expect(guidanceCount).toBe(1);
  });
});
