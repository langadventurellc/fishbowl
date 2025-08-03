import type { LogLevelNames } from "loglevel";
import type { Formatter } from "../types";

export interface ConsoleTransportOptions {
  formatter?: Formatter;
  minLevel?: LogLevelNames;
  name?: string;
}
