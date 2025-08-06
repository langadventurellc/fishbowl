export interface FormatterOptions {
  mode?: "development" | "production";
  includeStackTrace?: boolean;
  includeRawData?: boolean;
  maxErrorCount?: number;
}
