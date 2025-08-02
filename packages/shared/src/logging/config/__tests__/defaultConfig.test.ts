import { getDefaultConfig } from "../getDefaultConfig";
import { mergeConfig as mergeConfigFn } from "../defaultConfig";
import { productionConfig } from "../productionConfig";
import { developmentConfig } from "../developmentConfig";
import { testConfig } from "../testConfig";

describe("defaultConfig", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("getDefaultConfig", () => {
    it("should return production config for production environment", () => {
      const config = getDefaultConfig("production");
      expect(config).toEqual(productionConfig);
      expect(config.level).toBe("info");
      expect(config.transports).toBeDefined();
      expect(config.transports?.[0]?.type).toBe("console");
    });

    it("should return development config for development environment", () => {
      const config = getDefaultConfig("development");
      expect(config).toEqual(developmentConfig);
      expect(config.level).toBe("debug");
    });

    it("should return test config for test environment", () => {
      const config = getDefaultConfig("test");
      expect(config).toEqual(testConfig);
      expect(config.level).toBe("error");
      expect(config.transports).toHaveLength(0);
    });

    it("should use NODE_ENV when environment is not provided", () => {
      process.env.NODE_ENV = "production";
      const config = getDefaultConfig();
      expect(config).toEqual(productionConfig);
    });

    it("should default to development when no environment is specified", () => {
      delete process.env.NODE_ENV;
      const config = getDefaultConfig();
      expect(config).toEqual(developmentConfig);
    });
  });

  describe("mergeConfig", () => {
    it("should merge user config over base config", () => {
      const base = { name: "base", level: "info" as const };
      const user = { name: "user", includeDeviceInfo: true };

      const merged = mergeConfigFn(base, user);

      expect(merged).toEqual({
        name: "user",
        level: "info",
        includeDeviceInfo: true,
      });
    });

    it("should replace transports array entirely", () => {
      const base = {
        transports: [{ type: "console" as const, level: "info" }],
      };
      const user = {
        transports: [{ type: "file" as const, filePath: "/logs/app.log" }],
      };

      const merged = mergeConfigFn(base, user);

      expect(merged.transports).toBeDefined();
      expect(merged.transports).toHaveLength(1);
      expect(merged.transports?.[0]?.type).toBe("file");
    });

    it("should deep merge globalContext", () => {
      const base = {
        globalContext: { app: "test", version: "1.0.0" },
      };
      const user = {
        globalContext: { version: "2.0.0", env: "prod" },
      };

      const merged = mergeConfigFn(base, user);

      expect(merged.globalContext).toEqual({
        app: "test",
        version: "2.0.0",
        env: "prod",
      });
    });

    it("should handle missing globalContext", () => {
      const base = { name: "app" };
      const user = { globalContext: { userId: 123 } };

      const merged = mergeConfigFn(base, user);

      expect(merged.globalContext).toEqual({ userId: 123 });
    });
  });

  describe("config presets", () => {
    it("should have valid production config", () => {
      expect(productionConfig).toMatchObject({
        name: "app",
        level: "info",
        includeDeviceInfo: true,
      });
      expect(productionConfig.transports).toHaveLength(1);
      expect(productionConfig.transports?.[0]?.type).toBe("console");
    });

    it("should have valid development config", () => {
      expect(developmentConfig).toMatchObject({
        name: "app",
        level: "debug",
        includeDeviceInfo: true,
      });
      expect(developmentConfig.transports?.[0]?.formatter).toBe("console");
      expect(
        developmentConfig.transports?.[0]?.formatterOptions?.prettyPrint,
      ).toBe(true);
    });

    it("should have valid test config", () => {
      expect(testConfig).toMatchObject({
        name: "test",
        level: "error",
        includeDeviceInfo: false,
        transports: [],
      });
    });
  });
});
