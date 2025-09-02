import { ChatErrorType } from "../ChatErrorType";

describe("ChatErrorType", () => {
  it("should define all required error types", () => {
    expect(ChatErrorType.NETWORK_ERROR).toBe("network_error");
    expect(ChatErrorType.AUTH_ERROR).toBe("auth_error");
    expect(ChatErrorType.RATE_LIMIT_ERROR).toBe("rate_limit_error");
    expect(ChatErrorType.VALIDATION_ERROR).toBe("validation_error");
    expect(ChatErrorType.PROVIDER_ERROR).toBe("provider_error");
    expect(ChatErrorType.TIMEOUT_ERROR).toBe("timeout_error");
    expect(ChatErrorType.UNKNOWN_ERROR).toBe("unknown_error");
  });

  it("should have exactly 7 error types", () => {
    const errorTypes = Object.values(ChatErrorType);
    expect(errorTypes).toHaveLength(7);
  });

  it("should have unique string values", () => {
    const errorTypes = Object.values(ChatErrorType);
    const uniqueTypes = new Set(errorTypes);
    expect(uniqueTypes.size).toBe(errorTypes.length);
  });

  it("should use snake_case naming convention", () => {
    const errorTypes = Object.values(ChatErrorType);
    errorTypes.forEach((errorType) => {
      expect(errorType).toMatch(/^[a-z]+(_[a-z]+)*$/);
    });
  });

  it("should be usable in switch statements", () => {
    const processErrorType = (errorType: ChatErrorType): string => {
      switch (errorType) {
        case ChatErrorType.NETWORK_ERROR:
          return "network";
        case ChatErrorType.AUTH_ERROR:
          return "auth";
        case ChatErrorType.RATE_LIMIT_ERROR:
          return "rate_limit";
        case ChatErrorType.VALIDATION_ERROR:
          return "validation";
        case ChatErrorType.PROVIDER_ERROR:
          return "provider";
        case ChatErrorType.TIMEOUT_ERROR:
          return "timeout";
        case ChatErrorType.UNKNOWN_ERROR:
          return "unknown";
        default:
          return "unexpected";
      }
    };

    expect(processErrorType(ChatErrorType.NETWORK_ERROR)).toBe("network");
    expect(processErrorType(ChatErrorType.AUTH_ERROR)).toBe("auth");
    expect(processErrorType(ChatErrorType.UNKNOWN_ERROR)).toBe("unknown");
  });
});
