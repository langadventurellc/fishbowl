import type { CreateSettingsPersistenceAdapter } from "../CreateSettingsPersistenceAdapter";
import type { SettingsPersistenceAdapter } from "../SettingsPersistenceAdapter";
import type { SettingsPersistenceConfig } from "../SettingsPersistenceConfig";

describe("CreateSettingsPersistenceAdapter", () => {
  it("should define factory function type correctly", () => {
    const mockFactory: CreateSettingsPersistenceAdapter = (_config) => {
      return {
        save: jest.fn().mockResolvedValue(undefined),
        load: jest.fn().mockResolvedValue(null),
        reset: jest.fn().mockResolvedValue(undefined),
      };
    };

    const adapter = mockFactory({ debug: true });
    expect(adapter).toBeDefined();
    expect(adapter.save).toBeDefined();
    expect(adapter.load).toBeDefined();
    expect(adapter.reset).toBeDefined();
  });

  it("should work without configuration parameter", () => {
    const mockFactory: CreateSettingsPersistenceAdapter = () => {
      return {
        save: jest.fn().mockResolvedValue(undefined),
        load: jest.fn().mockResolvedValue(null),
        reset: jest.fn().mockResolvedValue(undefined),
      };
    };

    const adapter = mockFactory();
    expect(adapter).toBeDefined();
    expect(typeof adapter.save).toBe("function");
    expect(typeof adapter.load).toBe("function");
    expect(typeof adapter.reset).toBe("function");
  });

  it("should accept configuration and return valid adapter", () => {
    const mockFactory: CreateSettingsPersistenceAdapter = (
      config?: SettingsPersistenceConfig,
    ) => {
      // Factory could use config to customize the adapter
      const debugLogging = config?.debug ?? false;

      return {
        save: jest.fn().mockImplementation(async () => {
          if (debugLogging) {
            console.log("Debug: Saving settings");
          }
        }),
        load: jest.fn().mockResolvedValue(null),
        reset: jest.fn().mockResolvedValue(undefined),
      };
    };

    const config: SettingsPersistenceConfig = {
      debug: true,
      storageKey: "test-storage",
      encryptionKey: "test-key",
    };

    const adapter = mockFactory(config);
    expect(adapter).toBeDefined();

    // Verify it returns a properly typed adapter
    const typedAdapter: SettingsPersistenceAdapter = adapter;
    expect(typedAdapter.save).toBeDefined();
    expect(typedAdapter.load).toBeDefined();
    expect(typedAdapter.reset).toBeDefined();
  });

  it("should support different factory implementations", () => {
    // Desktop factory
    const createDesktopAdapter: CreateSettingsPersistenceAdapter = (
      _config,
    ) => ({
      save: jest.fn().mockResolvedValue(undefined),
      load: jest.fn().mockResolvedValue(null),
      reset: jest.fn().mockResolvedValue(undefined),
    });

    // Mobile factory
    const createMobileAdapter: CreateSettingsPersistenceAdapter = (
      _config,
    ) => ({
      save: jest.fn().mockResolvedValue(undefined),
      load: jest.fn().mockResolvedValue(null),
      reset: jest.fn().mockResolvedValue(undefined),
    });

    // Test factory
    const createTestAdapter: CreateSettingsPersistenceAdapter = (_config) => ({
      save: jest.fn().mockResolvedValue(undefined),
      load: jest.fn().mockResolvedValue(null),
      reset: jest.fn().mockResolvedValue(undefined),
    });

    const desktopAdapter = createDesktopAdapter({ debug: true });
    const mobileAdapter = createMobileAdapter({
      storageKey: "mobile-settings",
    });
    const testAdapter = createTestAdapter();

    expect(desktopAdapter).toBeDefined();
    expect(mobileAdapter).toBeDefined();
    expect(testAdapter).toBeDefined();

    // All should implement the same interface
    [desktopAdapter, mobileAdapter, testAdapter].forEach((adapter) => {
      expect(adapter.save).toBeDefined();
      expect(adapter.load).toBeDefined();
      expect(adapter.reset).toBeDefined();
    });
  });

  it("should handle factory function parameters correctly", () => {
    let capturedConfig: SettingsPersistenceConfig | undefined;

    const mockFactory: CreateSettingsPersistenceAdapter = (config) => {
      capturedConfig = config;
      return {
        save: jest.fn(),
        load: jest.fn(),
        reset: jest.fn(),
      };
    };

    const testConfig = { debug: true, storageKey: "test" };
    mockFactory(testConfig);

    expect(capturedConfig).toEqual(testConfig);
  });
});
