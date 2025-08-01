import type { SettingsPersistenceConfig } from "../SettingsPersistenceConfig";

describe("SettingsPersistenceConfig", () => {
  it("should accept all optional configuration properties", () => {
    const config: SettingsPersistenceConfig = {
      encryptionKey: "test-encryption-key-123",
      storageKey: "custom-storage-identifier",
      debug: true,
    };

    expect(config.encryptionKey).toBe("test-encryption-key-123");
    expect(config.storageKey).toBe("custom-storage-identifier");
    expect(config.debug).toBe(true);
  });

  it("should work with empty configuration", () => {
    const config: SettingsPersistenceConfig = {};

    expect(config.encryptionKey).toBeUndefined();
    expect(config.storageKey).toBeUndefined();
    expect(config.debug).toBeUndefined();
  });

  it("should work with partial configuration", () => {
    const configWithOnlyDebug: SettingsPersistenceConfig = {
      debug: false,
    };

    const configWithOnlyStorage: SettingsPersistenceConfig = {
      storageKey: "fishbowl-settings",
    };

    const configWithOnlyEncryption: SettingsPersistenceConfig = {
      encryptionKey: "secret-key",
    };

    expect(configWithOnlyDebug.debug).toBe(false);
    expect(configWithOnlyDebug.encryptionKey).toBeUndefined();
    expect(configWithOnlyDebug.storageKey).toBeUndefined();

    expect(configWithOnlyStorage.storageKey).toBe("fishbowl-settings");
    expect(configWithOnlyStorage.debug).toBeUndefined();
    expect(configWithOnlyStorage.encryptionKey).toBeUndefined();

    expect(configWithOnlyEncryption.encryptionKey).toBe("secret-key");
    expect(configWithOnlyEncryption.debug).toBeUndefined();
    expect(configWithOnlyEncryption.storageKey).toBeUndefined();
  });

  it("should enforce correct types", () => {
    // This test verifies TypeScript compilation with correct types
    const config: SettingsPersistenceConfig = {
      encryptionKey: "must-be-string",
      storageKey: "must-be-string",
      debug: true, // must be boolean
    };

    expect(typeof config.encryptionKey).toBe("string");
    expect(typeof config.storageKey).toBe("string");
    expect(typeof config.debug).toBe("boolean");
  });

  it("should support real-world configuration scenarios", () => {
    // Development configuration
    const devConfig: SettingsPersistenceConfig = {
      debug: true,
      storageKey: "fishbowl-dev-settings",
    };

    // Production configuration with encryption
    const prodConfig: SettingsPersistenceConfig = {
      encryptionKey: "production-encryption-key",
      storageKey: "fishbowl-settings",
      debug: false,
    };

    // Testing configuration
    const testConfig: SettingsPersistenceConfig = {
      storageKey: "fishbowl-test-settings",
      debug: true,
    };

    expect(devConfig.debug).toBe(true);
    expect(devConfig.storageKey).toBe("fishbowl-dev-settings");

    expect(prodConfig.encryptionKey).toBe("production-encryption-key");
    expect(prodConfig.debug).toBe(false);

    expect(testConfig.storageKey).toBe("fishbowl-test-settings");
    expect(testConfig.debug).toBe(true);
  });
});
