import { z } from "zod";

/**
 * @fileoverview Model Capabilities Schema
 *
 * Defines detailed capabilities and characteristics of AI models.
 */

export const ModelCapabilitiesSchema = z.object({
  /** Maximum context length in tokens */
  maxContextLength: z.number().int().positive(),
  /** Maximum output length in tokens */
  maxOutputLength: z.number().int().positive(),
  /** Supported input modalities */
  inputModalities: z.array(z.enum(["text", "image", "audio", "video"])),
  /** Supported output modalities */
  outputModalities: z.array(z.enum(["text", "image", "audio", "video"])),
  /** Function calling support */
  supportsFunctionCalling: z.boolean(),
  /** Streaming response support */
  supportsStreaming: z.boolean(),
  /** Performance characteristics */
  performance: z.object({
    /** Average response time in milliseconds */
    avgResponseTime: z.number().positive(),
    /** Requests per minute limit */
    rpmLimit: z.number().int().positive(),
    /** Tokens per minute limit */
    tpmLimit: z.number().int().positive(),
  }),
  /** Cost characteristics */
  cost: z.object({
    /** Cost per input token */
    inputTokenCost: z.number().positive(),
    /** Cost per output token */
    outputTokenCost: z.number().positive(),
    /** Currency for pricing */
    currency: z.string().default("USD"),
  }),
  /** Model specializations */
  specializations: z.array(
    z.enum([
      "general",
      "coding",
      "analysis",
      "creative",
      "reasoning",
      "multimodal",
    ]),
  ),
});

export type ModelCapabilities = z.infer<typeof ModelCapabilitiesSchema>;
