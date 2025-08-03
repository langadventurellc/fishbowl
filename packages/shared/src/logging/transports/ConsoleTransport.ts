import * as log from "loglevel";
import type { LogLevelNames } from "loglevel";
import type { LogEntry, Transport, Formatter } from "../types";
import { ConsoleFormatter } from "../formatters/ConsoleFormatter";
import type { ConsoleTransportOptions } from "./ConsoleTransportOptions";

export class ConsoleTransport implements Transport {
  public readonly name: string;
  private formatter: Formatter;
  private logger: log.Logger;
  private minLevel: LogLevelNames;

  constructor(options: ConsoleTransportOptions = {}) {
    this.name = options.name || "ConsoleTransport";
    this.formatter = options.formatter || new ConsoleFormatter();
    this.minLevel = options.minLevel || "info";
    this.logger = log.getLogger(this.name);
    this.logger.setLevel(this.minLevel);
  }

  write(formattedEntry: string | Record<string, unknown>): void {
    if (typeof formattedEntry === "string") {
      this.writeString(formattedEntry);
    } else {
      this.writeString(JSON.stringify(formattedEntry));
    }
  }

  shouldLog(entry: LogEntry): boolean {
    const levelNumbers: Record<LogLevelNames, number> = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
    };

    const entryLevelNumber = levelNumbers[entry.level] ?? 2;
    const minLevelNumber = levelNumbers[this.minLevel] ?? 2;

    return entryLevelNumber >= minLevelNumber;
  }

  log(entry: LogEntry): void {
    if (!this.shouldLog(entry)) {
      return;
    }

    const formatted = this.formatter.format(entry);

    if (typeof formatted === "string") {
      this.routeToConsole(entry.level, formatted);
    } else {
      this.routeToConsole(entry.level, JSON.stringify(formatted));
    }
  }

  setLevel(level: LogLevelNames): void {
    this.minLevel = level;
    this.logger.setLevel(level);
  }

  private writeString(message: string): void {
    console.log(message);
  }

  private routeToConsole(level: LogLevelNames, message: string): void {
    switch (level) {
      case "trace":
        console.debug(message);
        break;
      case "debug":
        console.debug(message);
        break;
      case "info":
        console.log(message);
        break;
      case "warn":
        console.warn(message);
        break;
      case "error":
        console.error(message);
        break;
      default:
        console.log(message);
    }
  }
}
