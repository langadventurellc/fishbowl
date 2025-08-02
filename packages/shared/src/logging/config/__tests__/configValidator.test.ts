import { ConfigValidator } from "../configValidator";
import type { LoggerConfig } from "../LogConfig";

describe("ConfigValidator", () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  describe("valid configurations", () => {
    it("should validate minimal config", () => {
      const config: LoggerConfig = { name: "test" };
      const result = validator.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should validate complete config", () => {
      const config: LoggerConfig = {
        name: "app",
        level: "info",
        includeDeviceInfo: true,
        transports: [
          {
            type: "console",
            formatter: "simple",
            level: "debug",
          },
        ],
        globalContext: { app: "test" },
        bufferSize: 100,
        flushInterval: 1000,
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });
  });

  describe("log level validation", () => {
    it("should accept valid log levels", () => {
      const levels = ["trace", "debug", "info", "warn", "error", "silent"];

      levels.forEach((level) => {
        const config: LoggerConfig = {
          level: level as
            | "trace"
            | "debug"
            | "info"
            | "warn"
            | "error"
            | "silent",
        };
        const result = validator.validate(config);
        expect(result.valid).toBe(true);
      });
    });

    it("should reject invalid log levels", () => {
      const config = { level: "invalid" } as unknown as LoggerConfig;
      const result = validator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Invalid log level: invalid. Must be one of: trace, debug, info, warn, error, silent",
      );
    });
  });

  describe("transport validation", () => {
    it("should reject invalid transport type", () => {
      const config = {
        transports: [{ type: "invalid" }],
      } as unknown as LoggerConfig;

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Invalid transport type at index 0: invalid",
      );
    });

    it("should reject invalid formatter", () => {
      const config = {
        transports: [{ type: "console", formatter: "invalid" }],
      } as unknown as LoggerConfig;

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Invalid formatter at transport 0: invalid",
      );
    });

    it("should require filePath for file transport", () => {
      const config: LoggerConfig = {
        transports: [{ type: "file" }],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "File transport at index 0 requires filePath",
      );
    });

    it("should validate transport level", () => {
      const config: LoggerConfig = {
        transports: [{ type: "console", level: "invalid" }],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Invalid transport level at index 0: invalid",
      );
    });

    it("should accept valid console transport", () => {
      const config: LoggerConfig = {
        transports: [
          {
            type: "console",
            formatter: "simple",
            level: "info",
          },
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });

    it("should accept valid file transport", () => {
      const config: LoggerConfig = {
        transports: [
          {
            type: "file",
            filePath: "/logs/app.log",
            formatter: "json",
            level: "debug",
          },
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });
  });

  describe("performance options validation", () => {
    it("should reject negative buffer size", () => {
      const config: LoggerConfig = { bufferSize: -1 };
      const result = validator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Buffer size must be non-negative");
    });

    it("should reject negative flush interval", () => {
      const config: LoggerConfig = { flushInterval: -100 };
      const result = validator.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Flush interval must be non-negative");
    });

    it("should accept zero values", () => {
      const config: LoggerConfig = { bufferSize: 0, flushInterval: 0 };
      const result = validator.validate(config);

      expect(result.valid).toBe(true);
    });

    it("should accept positive values", () => {
      const config: LoggerConfig = { bufferSize: 100, flushInterval: 5000 };
      const result = validator.validate(config);

      expect(result.valid).toBe(true);
    });
  });

  it("should collect multiple errors", () => {
    const config = {
      level: "invalid",
      transports: [
        { type: "invalid" },
        { type: "file" }, // Missing filePath
        { type: "console", level: "invalid" },
      ],
      bufferSize: -1,
      flushInterval: -100,
    } as unknown as LoggerConfig;

    const result = validator.validate(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(6);
    expect(result.errors).toContain(
      "Invalid log level: invalid. Must be one of: trace, debug, info, warn, error, silent",
    );
    expect(result.errors).toContain(
      "Invalid transport type at index 0: invalid",
    );
    expect(result.errors).toContain(
      "File transport at index 1 requires filePath",
    );
    expect(result.errors).toContain(
      "Invalid transport level at index 2: invalid",
    );
    expect(result.errors).toContain("Buffer size must be non-negative");
    expect(result.errors).toContain("Flush interval must be non-negative");
  });

  it("should handle empty config", () => {
    const config: LoggerConfig = {};
    const result = validator.validate(config);

    expect(result.valid).toBe(true);
  });

  it("should handle config with empty transports array", () => {
    const config: LoggerConfig = {
      name: "test",
      transports: [],
    };

    const result = validator.validate(config);
    expect(result.valid).toBe(true);
  });
});
