// Re-export all error handling utilities
export { MappingError } from "./MappingError";
export { createMappingError } from "./createMappingError";
export type { MappingResult } from "./MappingResult";
export { isSuccess } from "./isSuccess";
export { isError } from "./isError";
export { wrapMapper } from "./wrapMapper";
export { unwrapResult } from "./unwrapResult";
export { getOrDefault } from "./getOrDefault";
export { validateAndMap } from "./validateAndMap";
export { chainResults } from "./chainResults";
export { mapArrayWithErrors } from "./mapArrayWithErrors";
