import { app } from "electron";
import { readFile } from "fs/promises";
import fs from "node:fs";
import path from "path";
import { z } from "zod";
import {
  PersonalityDefinitionsService,
  PersonalityDefinitions,
  PersonalitySectionDef,
  PersonalityError,
  PersonalityParseError,
  PersonalityFileAccessError,
  PersonalityValidationError,
  DiscreteValue,
} from "@fishbowl-ai/shared";
import { createLoggerSync } from "@fishbowl-ai/shared";

/**
 * Zod schema for validating the personality definitions JSON structure
 */
const PersonalityValueMetaSchema = z.object({
  short: z.string(),
  prompt: z.string().optional(),
  numeric: z.number().optional(),
});

const PersonalityTraitDefSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.record(
    z.enum(["0", "20", "40", "60", "80", "100"]),
    PersonalityValueMetaSchema,
  ),
});

const PersonalitySectionDefSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  values: z.array(PersonalityTraitDefSchema),
});

const PersonalityDefinitionsSchema = z.object({
  sections: z.array(PersonalitySectionDefSchema),
});

/**
 * Desktop main process implementation of the personality definitions service.
 * Handles file I/O, JSON parsing, Zod validation, and in-memory caching.
 * Detects runtime environment and loads from appropriate paths.
 */
export class DesktopPersonalityDefinitionsService
  implements PersonalityDefinitionsService
{
  private static instance: DesktopPersonalityDefinitionsService | null = null;
  private cachedDefinitions: PersonalityDefinitions | null = null;
  private logger = createLoggerSync({
    context: {
      metadata: { component: "DesktopPersonalityDefinitionsService" },
    },
  });

  /**
   * Get singleton instance of DesktopPersonalityDefinitionsService
   */
  public static getInstance(): DesktopPersonalityDefinitionsService {
    if (!DesktopPersonalityDefinitionsService.instance) {
      DesktopPersonalityDefinitionsService.instance =
        new DesktopPersonalityDefinitionsService();
    }
    return DesktopPersonalityDefinitionsService.instance;
  }

  /**
   * Get the appropriate path for personality definitions JSON based on environment
   */
  private getPersonalityDefinitionsPath(): string {
    // Always prefer userData (dev/test/prod) after ensure step
    const userDataPath = app.getPath("userData");
    const userDataDefinitions = path.join(
      userDataPath,
      "personality_definitions.json",
    );

    if (app.isPackaged) {
      // Packaged: always from userData
      this.logger.debug("Using production personality definitions path", {
        path: userDataDefinitions,
      });
      return userDataDefinitions;
    }

    // Development/E2E: prefer userData if present
    if (fs.existsSync(userDataDefinitions)) {
      this.logger.debug(
        "Using userData personality definitions path in development",
        { path: userDataDefinitions },
      );
      return userDataDefinitions;
    }

    // Fallback to project resources (mirrors migrations path logic)
    const appPath = app.getAppPath();
    const isTest = process.env.NODE_ENV === "test";
    const projectRoot = isTest
      ? path.resolve(appPath, "..", "..", "..", "..")
      : path.resolve(appPath, "..", "..");
    const fallbackPath = path.join(
      projectRoot,
      "resources",
      "personality_definitions.json",
    );
    this.logger.debug(
      "Using development fallback personality definitions path",
      { path: fallbackPath, appPath, projectRoot },
    );
    return fallbackPath;
  }

  /**
   * Parse JSON content and handle parsing errors
   */
  private parseJsonContent(fileContent: string): unknown {
    try {
      return JSON.parse(fileContent);
    } catch (parseError) {
      throw new PersonalityParseError(
        `Invalid JSON syntax: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`,
        parseError instanceof Error ? parseError : undefined,
      );
    }
  }

  /**
   * Validate JSON data structure with Zod
   */
  private validateJsonStructure(
    jsonData: unknown,
    startTime: number,
  ): PersonalityDefinitions {
    try {
      const validatedData = PersonalityDefinitionsSchema.parse(jsonData);
      const totalDuration = Date.now() - startTime;

      this.logger.info(
        "Personality definitions loaded and validated successfully",
        {
          sectionCount: validatedData.sections.length,
          traitCount: validatedData.sections.reduce(
            (sum, section) => sum + section.values.length,
            0,
          ),
          totalDurationMs: totalDuration,
        },
      );

      return validatedData;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const validationDetails = validationError.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
        throw new PersonalityValidationError(
          validationDetails,
          validationError,
        );
      }
      throw new PersonalityValidationError(
        `Schema validation failed: ${validationError instanceof Error ? validationError.message : "Unknown validation error"}`,
        validationError instanceof Error ? validationError : undefined,
      );
    }
  }

  /**
   * Handle file system errors and convert to appropriate PersonalityError types
   */
  private handleFileSystemError(error: unknown): never {
    if (error instanceof PersonalityError) {
      throw error; // Re-throw personality-specific errors
    }

    // Handle file system errors
    if (error instanceof Error) {
      const nodeError = error as { code?: string };
      if (nodeError.code === "ENOENT") {
        throw new PersonalityFileAccessError("File not found", error);
      }
      if (nodeError.code === "EACCES") {
        throw new PersonalityFileAccessError("Permission denied", error);
      }
      if (nodeError.code === "EMFILE" || nodeError.code === "ENFILE") {
        throw new PersonalityFileAccessError("Too many open files", error);
      }
    }

    throw new PersonalityFileAccessError(
      `File access failed: ${error instanceof Error ? error.message : "Unknown file system error"}`,
      error instanceof Error ? error : undefined,
    );
  }

  /**
   * Load and validate personality definitions from JSON file
   */
  private async loadDefinitionsFromFile(): Promise<PersonalityDefinitions> {
    const filePath = this.getPersonalityDefinitionsPath();

    try {
      this.logger.debug("Loading personality definitions from file", {
        path: filePath,
        isPackaged: app.isPackaged,
      });

      // Read file with timeout protection (100ms requirement)
      const startTime = Date.now();
      const fileContent = await readFile(filePath, "utf-8");
      const readDuration = Date.now() - startTime;

      this.logger.debug("Personality definitions file read successfully", {
        path: filePath,
        fileSize: fileContent.length,
        readDurationMs: readDuration,
      });

      // Parse JSON content
      const jsonData = this.parseJsonContent(fileContent);

      // Validate structure with Zod
      return this.validateJsonStructure(jsonData, startTime);
    } catch (error) {
      this.handleFileSystemError(error);
    }
  }

  /**
   * Load personality definitions from the configured source.
   * Results are cached in memory for subsequent calls.
   */
  async loadDefinitions(): Promise<PersonalityDefinitions> {
    if (this.cachedDefinitions) {
      this.logger.debug("Returning cached personality definitions");
      return this.cachedDefinitions;
    }

    this.logger.debug("Loading personality definitions from storage");
    this.cachedDefinitions = await this.loadDefinitionsFromFile();
    return this.cachedDefinitions;
  }

  /**
   * Get all personality sections after definitions have been loaded.
   * Returns cached results if available, otherwise loads definitions first.
   */
  async getSections(): Promise<PersonalitySectionDef[]> {
    const definitions = await this.loadDefinitions();
    return definitions.sections;
  }

  /**
   * Get the short description for a specific trait value.
   * Useful for displaying current slider values in the UI.
   */
  async getShortDescription(
    traitId: string,
    value: DiscreteValue,
  ): Promise<string | undefined> {
    const sections = await this.getSections();

    for (const section of sections) {
      const trait = section.values.find((t) => t.id === traitId);
      if (trait) {
        const valueKey = value.toString() as keyof typeof trait.values;
        return trait.values[valueKey]?.short;
      }
    }

    return undefined;
  }

  /**
   * Get the prompt text for a specific trait value.
   * Used for configuring AI behavior based on personality settings.
   */
  async getPromptText(
    traitId: string,
    value: DiscreteValue,
  ): Promise<string | undefined> {
    const sections = await this.getSections();

    for (const section of sections) {
      const trait = section.values.find((t) => t.id === traitId);
      if (trait) {
        const valueKey = value.toString() as keyof typeof trait.values;
        return trait.values[valueKey]?.prompt;
      }
    }

    return undefined;
  }

  /**
   * Clear any cached definitions and force reload on next access.
   * Useful for development or when definitions are updated at runtime.
   */
  clearCache(): void {
    this.logger.debug("Clearing personality definitions cache");
    this.cachedDefinitions = null;
  }

  /**
   * Check if definitions are currently loaded and cached.
   */
  isLoaded(): boolean {
    return this.cachedDefinitions !== null;
  }
}
