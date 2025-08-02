import type { LogLevelNames } from "loglevel";
import type { LogEntry, Formatter, LogContext } from "../types";
import type { ConsoleFormatterOptions } from "./ConsoleFormatterOptions";

export class ConsoleFormatter implements Formatter {
  private options: ConsoleFormatterOptions;

  constructor(options: ConsoleFormatterOptions = {}) {
    this.options = {
      colorize: true,
      includeTimestamp: true,
      includeContext: true,
      prettyPrint: false,
      ...options,
    };
  }

  format(entry: LogEntry): string {
    const parts: string[] = [];

    if (this.options.includeTimestamp) {
      parts.push(this.formatTimestamp(entry.timestamp));
    }

    parts.push(this.formatLevel(entry.level));
    parts.push(entry.message);

    if (
      this.options.includeContext &&
      entry.context &&
      Object.keys(entry.context).length > 0
    ) {
      parts.push(this.formatContext(entry.context));
    }

    if (entry.error) {
      parts.push(this.formatError(entry.error));
    }

    return parts.join(" ");
  }

  private formatTimestamp(timestamp: string): string {
    return `[${timestamp}]`;
  }

  private formatLevel(level: LogLevelNames): string {
    if (this.options.colorize) {
      return this.colorizeLevel(level.toUpperCase(), level);
    }
    return `[${level.toUpperCase()}]`;
  }

  private colorizeLevel(levelName: string, level: LogLevelNames): string {
    const colors: Partial<Record<LogLevelNames, string>> = {
      trace: "\x1b[90m", // gray
      debug: "\x1b[36m", // cyan
      info: "\x1b[32m", // green
      warn: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    return `${colors[level] || ""}[${levelName}]${reset}`;
  }

  private formatContext(context: LogContext): string {
    if (this.options.prettyPrint) {
      return "\n" + JSON.stringify(context, null, 2);
    }
    return JSON.stringify(context);
  }

  private formatError(error: unknown): string {
    if (
      this.options.prettyPrint &&
      error &&
      typeof error === "object" &&
      "stack" in error
    ) {
      return `\n${error.stack || error.toString()}`;
    }
    if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
    }
    return String(error);
  }
}
