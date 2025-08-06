import { LlmConfigurationLoader } from "./LlmConfigurationLoader";
import type { LoaderOptions } from "./types/LoaderOptions";
import { createLoggerSync } from "../../logging/createLoggerSync";

/**
 * Factory service for creating and managing LlmConfigurationLoader instances.
 * Supports both singleton and multi-instance patterns.
 */
export class ConfigurationService {
  private static instance: LlmConfigurationLoader | null = null;
  private static readonly instances = new Map<string, LlmConfigurationLoader>();
  private static readonly logger = createLoggerSync({
    context: { metadata: { component: "ConfigurationService" } },
  });

  /**
   * Create a new configuration loader instance.
   *
   * @param filePath - Path to configuration file
   * @param options - Loader options
   * @returns New LlmConfigurationLoader instance
   */
  static create(
    filePath: string,
    options?: LoaderOptions,
  ): LlmConfigurationLoader {
    const loader = new LlmConfigurationLoader(filePath, options);
    this.logger.debug("Created new configuration loader", { filePath });
    return loader;
  }

  /**
   * Get or create a singleton instance.
   *
   * @param filePath - Path to configuration file
   * @param options - Loader options (used only on first call)
   * @returns Singleton LlmConfigurationLoader instance
   */
  static createSingleton(
    filePath: string,
    options?: LoaderOptions,
  ): LlmConfigurationLoader {
    if (!this.instance) {
      this.instance = new LlmConfigurationLoader(filePath, options);
      this.logger.info("Created singleton configuration loader", { filePath });
    } else if (this.instance.getConfiguration().filePath !== filePath) {
      this.logger.warn("Singleton already exists with different file path", {
        existing: this.instance.getConfiguration().filePath,
        requested: filePath,
      });
    }
    return this.instance;
  }

  /**
   * Get the singleton instance if it exists.
   *
   * @returns Singleton instance or null
   */
  static getInstance(): LlmConfigurationLoader | null {
    return this.instance;
  }

  /**
   * Get or create a named instance.
   * Useful for managing multiple configuration files.
   *
   * @param name - Instance name
   * @param filePath - Path to configuration file
   * @param options - Loader options (used only on first call)
   * @returns Named LlmConfigurationLoader instance
   */
  static getOrCreateNamed(
    name: string,
    filePath: string,
    options?: LoaderOptions,
  ): LlmConfigurationLoader {
    if (!this.instances.has(name)) {
      const loader = new LlmConfigurationLoader(filePath, options);
      this.instances.set(name, loader);
      this.logger.debug("Created named configuration loader", {
        name,
        filePath,
      });
    }
    return this.instances.get(name)!;
  }

  /**
   * Dispose singleton instance.
   */
  static async disposeSingleton(): Promise<void> {
    if (this.instance) {
      await this.instance.dispose();
      this.instance = null;
      this.logger.info("Disposed singleton configuration loader");
    }
  }

  /**
   * Dispose a named instance.
   *
   * @param name - Instance name
   */
  static async disposeNamed(name: string): Promise<void> {
    const instance = this.instances.get(name);
    if (instance) {
      await instance.dispose();
      this.instances.delete(name);
      this.logger.debug("Disposed named configuration loader", { name });
    }
  }

  /**
   * Dispose all instances.
   */
  static async disposeAll(): Promise<void> {
    // Dispose singleton
    await this.disposeSingleton();

    // Dispose all named instances
    for (const [name, instance] of this.instances) {
      await instance.dispose();
      this.logger.debug("Disposed named instance", { name });
    }
    this.instances.clear();

    this.logger.info("Disposed all configuration loaders");
  }
}
