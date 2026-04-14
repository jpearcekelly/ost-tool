import { z } from "zod/v4";

// ─── Enums ───

export const nodeTypeSchema = z.enum([
  "metric",
  "opportunity",
  "solution",
  "assumption",
  "experiment",
]);

export const metricStatusSchema = z.enum(["active", "deprecated"]);
export const opportunityStatusSchema = z.enum([
  "identified",
  "exploring",
  "pursuing",
  "parked",
]);
export const solutionStatusSchema = z.enum([
  "proposed",
  "exploring",
  "building",
  "shipped",
  "abandoned",
]);
export const assumptionStatusSchema = z.enum([
  "untested",
  "testing",
  "validated",
  "invalidated",
]);
export const experimentStatusSchema = z.enum([
  "planned",
  "running",
  "completed",
  "abandoned",
]);

export const metricTypeSchema = z.enum(["business", "product", "traction"]);
export const journeyStageSchema = z.enum([
  "go_to_market",
  "onboarding",
  "conversion",
  "activation",
  "retention",
  "referral",
]);
export const sourceTypeSchema = z.enum(["manual", "snowflake", "api"]);
export const refreshFrequencySchema = z.enum(["manual", "daily", "weekly"]);
export const opportunitySourceSchema = z.enum([
  "interview",
  "survey",
  "analytics",
  "feedback",
  "assumption",
]);
export const assumptionCategorySchema = z.enum([
  "desirability",
  "usability",
  "feasibility",
  "viability",
]);
export const evidenceStrengthSchema = z.enum([
  "none",
  "weak",
  "moderate",
  "strong",
]);
export const experimentTypeSchema = z.enum([
  "prototype_test",
  "concierge",
  "wizard_of_oz",
  "survey",
  "data_analysis",
  "one_question",
  "other",
]);
export const experimentOutcomeSchema = z.enum([
  "pending",
  "validated",
  "invalidated",
  "inconclusive",
]);

/**
 * Returns the correct status schema for a given node type.
 */
export function statusSchemaForType(type: z.infer<typeof nodeTypeSchema>) {
  switch (type) {
    case "metric":
      return metricStatusSchema;
    case "opportunity":
      return opportunityStatusSchema;
    case "solution":
      return solutionStatusSchema;
    case "assumption":
      return assumptionStatusSchema;
    case "experiment":
      return experimentStatusSchema;
  }
}

/**
 * Returns the default status for a given node type.
 */
export function defaultStatusForType(
  type: z.infer<typeof nodeTypeSchema>
): string {
  switch (type) {
    case "metric":
      return "active";
    case "opportunity":
      return "identified";
    case "solution":
      return "proposed";
    case "assumption":
      return "untested";
    case "experiment":
      return "planned";
  }
}

// ─── API Input Schemas ───

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const createNodeSchema = z.object({
  parentId: z.string().nullable().optional(),
  type: nodeTypeSchema,
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: z.string().optional(), // validated against type-specific schema in the route
  sortOrder: z.number().int().optional(),
});

export const updateNodeSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.string().optional(),
  sortOrder: z.number().int().optional(),
  parentId: z.string().nullable().optional(),
});

// ─── Type-specific detail schemas ───

export const metricDetailSchema = z.object({
  metricType: metricTypeSchema,
  currentValue: z.number().nullable().optional(),
  targetValue: z.number().nullable().optional(),
  unit: z.string().max(50).optional(),
  sourceType: sourceTypeSchema.optional(),
  refreshFrequency: refreshFrequencySchema.optional(),
  journeyStage: journeyStageSchema.nullable().optional(),
});

export const opportunityDetailSchema = z.object({
  source: opportunitySourceSchema.optional(),
  reach: z.number().int().nullable().optional(),
  impact: z.number().int().min(1).max(5).nullable().optional(),
  confidence: z.number().int().min(10).max(100).nullable().optional(),
  effort: z.number().nullable().optional(),
});

export const solutionDetailSchema = z.object({
  reach: z.number().int().nullable().optional(),
  impact: z.number().int().min(1).max(5).nullable().optional(),
  confidence: z.number().int().min(10).max(100).nullable().optional(),
  effort: z.number().nullable().optional(),
});

export const assumptionDetailSchema = z.object({
  category: assumptionCategorySchema.optional(),
  isLeapOfFaith: z.boolean().optional(),
  evidenceStrength: evidenceStrengthSchema.optional(),
});

export const experimentDetailSchema = z.object({
  experimentType: experimentTypeSchema.optional(),
  hypothesis: z.string().max(2000).optional(),
  method: z.string().max(2000).optional(),
  successCriteria: z.string().max(2000).optional(),
  result: z.string().max(5000).nullable().optional(),
  outcome: experimentOutcomeSchema.optional(),
});
