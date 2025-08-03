import type { LogEntry, Formatter } from "../types";

export class SimpleFormatter implements Formatter {
  format(entry: LogEntry): string {
    const parts = [`[${entry.level.toUpperCase()}]`, entry.message];

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(JSON.stringify(entry.context));
    }

    if (entry.error) {
      if (typeof entry.error === "object" && "message" in entry.error) {
        parts.push(String(entry.error.message));
      } else {
        parts.push(String(entry.error));
      }
    }

    return parts.join(" ");
  }
}
