export interface ConfigurationErrorContext {
  schemaVersion?: string;
  providersCount?: number;
  fileSize?: number;
  lastModified?: Date;
  previousErrors?: string[];
  environment: "development" | "production";
  includeRawData?: boolean;
  includeStackTrace?: boolean;
}
