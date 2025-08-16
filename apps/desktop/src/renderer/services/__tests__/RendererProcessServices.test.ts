import { RendererProcessServices } from "../RendererProcessServices";
import { BrowserCryptoUtils } from "../../utils/BrowserCryptoUtils";
import { BrowserDeviceInfo } from "../../utils/BrowserDeviceInfo";

// Mock the createLoggerSync function to avoid actual logger creation
jest.mock("@fishbowl-ai/shared", () => ({
  createLoggerSync: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    setLevel: jest.fn(),
    getLevel: jest.fn(),
    child: jest.fn(),
    addTransport: jest.fn(),
    removeTransport: jest.fn(),
    setFormatter: jest.fn(),
  })),
}));

describe("RendererProcessServices", () => {
  let services: RendererProcessServices;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    services = new RendererProcessServices();
  });

  describe("constructor", () => {
    it("should create browser crypto utils instance", () => {
      expect(services.cryptoUtils).toBeInstanceOf(BrowserCryptoUtils);
    });

    it("should create browser device info instance", () => {
      expect(services.deviceInfo).toBeInstanceOf(BrowserDeviceInfo);
    });

    it("should create configured logger", () => {
      expect(services.logger).toBeDefined();
      expect(typeof services.logger.debug).toBe("function");
      expect(typeof services.logger.info).toBe("function");
      expect(typeof services.logger.warn).toBe("function");
      expect(typeof services.logger.error).toBe("function");
    });
  });

  describe("logger configuration", () => {
    it("should call createLoggerSync with correct renderer configuration", () => {
      const { createLoggerSync } = require("@fishbowl-ai/shared");

      expect(createLoggerSync).toHaveBeenCalledWith({
        config: {
          name: "desktop-renderer",
          level: "info",
          includeDeviceInfo: true,
        },
        context: {
          platform: "desktop",
          metadata: {
            process: "renderer",
            userAgent: expect.any(String),
            renderer: "electron",
          },
        },
      });
    });
  });

  describe("service integration", () => {
    it("should provide all necessary browser implementations", () => {
      expect(services.cryptoUtils).toBeDefined();
      expect(services.deviceInfo).toBeDefined();
      expect(services.logger).toBeDefined();
    });

    it("should not create file system bridge (not needed in renderer)", () => {
      expect(services).not.toHaveProperty("fileSystemBridge");
    });
  });

  describe("fallback logger", () => {
    beforeEach(() => {
      // Clear mocks and mock createLoggerSync to throw an error
      jest.clearAllMocks();
      const { createLoggerSync } = require("@fishbowl-ai/shared");
      createLoggerSync.mockImplementation(() => {
        throw new Error("Logger creation failed");
      });

      // Spy on console methods
      jest.spyOn(console, "error").mockImplementation();
      jest.spyOn(console, "debug").mockImplementation();
      jest.spyOn(console, "info").mockImplementation();
      jest.spyOn(console, "warn").mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create fallback logger when createLoggerSync fails", () => {
      const fallbackServices = new RendererProcessServices();

      expect(console.error).toHaveBeenCalledWith(
        "Failed to create configured logger:",
        expect.any(Error),
      );

      expect(fallbackServices.logger).toBeDefined();
      expect(typeof fallbackServices.logger.debug).toBe("function");
      expect(typeof fallbackServices.logger.info).toBe("function");
      expect(typeof fallbackServices.logger.warn).toBe("function");
      expect(typeof fallbackServices.logger.error).toBe("function");
    });

    it("should use console methods in fallback logger", () => {
      const fallbackServices = new RendererProcessServices();

      fallbackServices.logger.debug("test debug", { data: "test" });
      fallbackServices.logger.info("test info", { data: "test" });
      fallbackServices.logger.warn("test warn", { data: "test" });
      fallbackServices.logger.error("test error", new Error("test error"), {
        data: "test",
      });

      expect(console.debug).toHaveBeenCalledWith("test debug", {
        data: "test",
      });
      expect(console.info).toHaveBeenCalledWith("test info", { data: "test" });
      expect(console.warn).toHaveBeenCalledWith("test warn", { data: "test" });
      expect(console.error).toHaveBeenCalledWith(
        "test error",
        new Error("test error"),
        { data: "test" },
      );
    });
  });
});
