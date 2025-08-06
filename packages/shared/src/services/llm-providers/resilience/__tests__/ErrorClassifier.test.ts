import { ErrorClassifier } from "../ErrorClassifier";

interface TestSystemError extends Error {
  code: string;
}

describe("ErrorClassifier", () => {
  describe("isRetryable", () => {
    it.each([
      ["ENOENT", true],
      ["EBUSY", true],
      ["EMFILE", true],
      ["ENOTFOUND", true],
      ["ETIMEDOUT", true],
      ["EAGAIN", true],
      ["ECONNRESET", true],
      ["EPIPE", true],
    ])("should classify %s as retryable: %s", (code, expected) => {
      const error: TestSystemError = new Error("Test error") as TestSystemError;
      error.code = code;

      expect(ErrorClassifier.isRetryable(error)).toBe(expected);
    });

    it.each([
      ["EACCES", false],
      ["EPERM", false],
      ["EISDIR", false],
      ["ENOTDIR", false],
      ["EROFS", false],
    ])("should classify %s as not retryable: %s", (code, expected) => {
      const error: TestSystemError = new Error("Test error") as TestSystemError;
      error.code = code;

      expect(ErrorClassifier.isRetryable(error)).toBe(expected);
    });

    it("should classify SyntaxError as not retryable", () => {
      const error = new SyntaxError("Invalid JSON");

      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });

    it("should classify errors with JSON-related messages as not retryable", () => {
      const error1 = new Error("Invalid JSON syntax");
      const error2 = new Error("Unexpected token in JSON");

      expect(ErrorClassifier.isRetryable(error1)).toBe(false);
      expect(ErrorClassifier.isRetryable(error2)).toBe(false);
    });

    it("should classify errors without codes as not retryable", () => {
      const error = new Error("Generic error");

      expect(ErrorClassifier.isRetryable(error)).toBe(false);
    });
  });

  describe("isPermanent", () => {
    it.each([
      ["EACCES", true],
      ["EPERM", true],
      ["EISDIR", true],
      ["ENOTDIR", true],
      ["EROFS", true],
    ])("should classify %s as permanent: %s", (code, expected) => {
      const error: TestSystemError = new Error("Test error") as TestSystemError;
      error.code = code;

      expect(ErrorClassifier.isPermanent(error)).toBe(expected);
    });

    it.each([
      ["ENOENT", false],
      ["EBUSY", false],
      ["ETIMEDOUT", false],
    ])("should classify %s as not permanent: %s", (code, expected) => {
      const error: TestSystemError = new Error("Test error") as TestSystemError;
      error.code = code;

      expect(ErrorClassifier.isPermanent(error)).toBe(expected);
    });

    it("should classify SyntaxError as permanent", () => {
      const error = new SyntaxError("Invalid JSON");

      expect(ErrorClassifier.isPermanent(error)).toBe(true);
    });

    it("should classify regular errors without codes as not permanent", () => {
      const error = new Error("Generic error");

      expect(ErrorClassifier.isPermanent(error)).toBe(false);
    });
  });

  describe("isTransient", () => {
    it("should identify transient errors correctly", () => {
      const transientError: TestSystemError = new Error(
        "File busy",
      ) as TestSystemError;
      transientError.code = "EBUSY";

      const permanentError: TestSystemError = new Error(
        "Permission denied",
      ) as TestSystemError;
      permanentError.code = "EACCES";

      const syntaxError = new SyntaxError("Invalid JSON");

      expect(ErrorClassifier.isTransient(transientError)).toBe(true);
      expect(ErrorClassifier.isTransient(permanentError)).toBe(false);
      expect(ErrorClassifier.isTransient(syntaxError)).toBe(false);
    });
  });

  describe("getErrorCategory", () => {
    it("should categorize transient errors", () => {
      const error: TestSystemError = new Error(
        "Resource busy",
      ) as TestSystemError;
      error.code = "EBUSY";

      expect(ErrorClassifier.getErrorCategory(error)).toBe("transient");
    });

    it("should categorize permanent errors", () => {
      const error: TestSystemError = new Error(
        "Permission denied",
      ) as TestSystemError;
      error.code = "EACCES";

      expect(ErrorClassifier.getErrorCategory(error)).toBe("permanent");
    });

    it("should categorize syntax errors as permanent", () => {
      const error = new SyntaxError("Invalid JSON");

      expect(ErrorClassifier.getErrorCategory(error)).toBe("permanent");
    });

    it("should categorize unknown errors", () => {
      const error = new Error("Generic error");

      expect(ErrorClassifier.getErrorCategory(error)).toBe("unknown");
    });
  });

  describe("getSuggestedAction", () => {
    it("should suggest actions for transient errors", () => {
      const busyError: TestSystemError = new Error(
        "Resource busy",
      ) as TestSystemError;
      busyError.code = "EBUSY";

      const fileError: TestSystemError = new Error(
        "Too many files",
      ) as TestSystemError;
      fileError.code = "EMFILE";

      const genericTransient: TestSystemError = new Error(
        "Timeout",
      ) as TestSystemError;
      genericTransient.code = "ETIMEDOUT";

      expect(ErrorClassifier.getSuggestedAction(busyError)).toBe(
        "Wait for resource to become available and retry",
      );
      expect(ErrorClassifier.getSuggestedAction(fileError)).toBe(
        "Close unused file handles and retry",
      );
      expect(ErrorClassifier.getSuggestedAction(genericTransient)).toBe(
        "Retry operation after a short delay",
      );
    });

    it("should suggest actions for permanent errors", () => {
      const permissionError: TestSystemError = new Error(
        "Access denied",
      ) as TestSystemError;
      permissionError.code = "EACCES";

      const syntaxError = new SyntaxError("Invalid JSON");

      const genericPermanent: TestSystemError = new Error(
        "Read-only filesystem",
      ) as TestSystemError;
      genericPermanent.code = "EROFS";

      expect(ErrorClassifier.getSuggestedAction(permissionError)).toBe(
        "Check file permissions and user privileges",
      );
      expect(ErrorClassifier.getSuggestedAction(syntaxError)).toBe(
        "Fix JSON syntax errors in configuration file",
      );
      expect(ErrorClassifier.getSuggestedAction(genericPermanent)).toBe(
        "Manual intervention required to fix the issue",
      );
    });

    it("should suggest generic actions for unknown errors", () => {
      const unknownError = new Error("Unknown error");

      expect(ErrorClassifier.getSuggestedAction(unknownError)).toBe(
        "Review error details and determine appropriate action",
      );
    });
  });
});
