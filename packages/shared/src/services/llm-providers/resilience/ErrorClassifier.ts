import type { SystemError } from "../../../types/SystemError";

export class ErrorClassifier {
  private static readonly RETRYABLE_CODES = [
    "ENOENT",
    "EBUSY",
    "EMFILE",
    "ENOTFOUND",
    "ETIMEDOUT",
    "EAGAIN",
    "ECONNRESET",
    "EPIPE",
  ];

  private static readonly PERMANENT_CODES = [
    "EACCES",
    "EPERM",
    "EISDIR",
    "ENOTDIR",
    "EROFS",
  ];

  static isRetryable(error: Error): boolean {
    const errorCode = (error as SystemError).code;
    if (errorCode) {
      return this.RETRYABLE_CODES.includes(errorCode);
    }

    if (error instanceof SyntaxError) {
      return false;
    }

    if (
      error.message.includes("Invalid JSON") ||
      error.message.includes("Unexpected token")
    ) {
      return false;
    }

    return false;
  }

  static isTransient(error: Error): boolean {
    return this.isRetryable(error) && !this.isPermanent(error);
  }

  static isPermanent(error: Error): boolean {
    const errorCode = (error as SystemError).code;
    if (errorCode) {
      return this.PERMANENT_CODES.includes(errorCode);
    }

    if (error instanceof SyntaxError) {
      return true;
    }

    return false;
  }

  static getErrorCategory(error: Error): "transient" | "permanent" | "unknown" {
    if (this.isPermanent(error)) {
      return "permanent";
    }
    if (this.isTransient(error)) {
      return "transient";
    }
    return "unknown";
  }

  static getSuggestedAction(error: Error): string {
    const category = this.getErrorCategory(error);
    const errorCode = (error as SystemError).code;

    switch (category) {
      case "transient":
        if (errorCode === "EBUSY") {
          return "Wait for resource to become available and retry";
        }
        if (errorCode === "EMFILE") {
          return "Close unused file handles and retry";
        }
        return "Retry operation after a short delay";

      case "permanent":
        if (errorCode === "EACCES" || errorCode === "EPERM") {
          return "Check file permissions and user privileges";
        }
        if (error instanceof SyntaxError) {
          return "Fix JSON syntax errors in configuration file";
        }
        return "Manual intervention required to fix the issue";

      default:
        return "Review error details and determine appropriate action";
    }
  }
}
