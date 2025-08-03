import log from "loglevel";

// Create and export a default logger instance for the shared package
export const logger = log.getLogger("fishbowl-shared");

// Set default log level (can be overridden by consuming applications)
logger.setLevel("info");

// Export the default log instance for backward compatibility
export default log;
