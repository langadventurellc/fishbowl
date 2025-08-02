import log from "loglevel";
import { logger } from "../index";

describe("Logger", () => {
  it("should import loglevel successfully", () => {
    expect(log).toBeDefined();
    expect(typeof log.info).toBe("function");
  });

  it("should create a named logger instance", () => {
    expect(logger).toBeDefined();
    expect(logger.getLevel()).toBe(2); // INFO level (loglevel uses 2 for INFO)
  });

  it("should support all log levels", () => {
    expect(typeof logger.trace).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("should be different instance from default logger", () => {
    expect(logger).not.toBe(log);
  });
});
