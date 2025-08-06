export interface ValidationOptions {
  mode: "development" | "production";
  includeStackTrace?: boolean;
  includeRawData?: boolean;
  maxErrorCount?: number;
  enableWarnings?: boolean;
}
