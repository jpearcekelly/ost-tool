import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/*
 * OST Tool — Drizzle Schema (Postgres)
 * Source of truth for the data model. Keep DATA_MODEL.md in sync but this file wins.
 *
 * Conventions:
 * - UUIDs stored as text (generated client-side with crypto.randomUUID())
 * - Timestamps use Postgres native `timestamp` type
 * - Booleans use Postgres native `boolean` type
 * - JSON uses Postgres `jsonb` for indexable structured data
 * - Enums enforced at the application layer via Zod, not DB constraints
 */

// ─── Project ───

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  nodes: many(nodes),
}));

// ─── Node ───
// The universal tree node. Every item — from "Total ARR" to "Prototype test" — is a Node.

export type NodeType =
  | "metric"
  | "opportunity"
  | "solution"
  | "assumption"
  | "experiment";

export const NODE_TYPES: NodeType[] = [
  "metric",
  "opportunity",
  "solution",
  "assumption",
  "experiment",
];

export type MetricStatus = "active" | "deprecated";
export type OpportunityStatus =
  | "identified"
  | "exploring"
  | "pursuing"
  | "parked";
export type SolutionStatus =
  | "proposed"
  | "exploring"
  | "building"
  | "shipped"
  | "abandoned";
export type AssumptionStatus =
  | "untested"
  | "testing"
  | "validated"
  | "invalidated";
export type ExperimentStatus =
  | "planned"
  | "running"
  | "completed"
  | "abandoned";

export const nodes = pgTable("nodes", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  parentId: text("parent_id"), // null = root node
  type: text("type").notNull(), // NodeType — validated by Zod
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(), // Type-specific — validated by Zod
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const nodesRelations = relations(nodes, ({ one, many }) => ({
  project: one(projects, {
    fields: [nodes.projectId],
    references: [projects.id],
  }),
  parent: one(nodes, {
    fields: [nodes.parentId],
    references: [nodes.id],
    relationName: "parentChild",
  }),
  children: many(nodes, { relationName: "parentChild" }),
  metricDetail: one(metricDetails, {
    fields: [nodes.id],
    references: [metricDetails.nodeId],
  }),
  opportunityDetail: one(opportunityDetails, {
    fields: [nodes.id],
    references: [opportunityDetails.nodeId],
  }),
  solutionDetail: one(solutionDetails, {
    fields: [nodes.id],
    references: [solutionDetails.nodeId],
  }),
  assumptionDetail: one(assumptionDetails, {
    fields: [nodes.id],
    references: [assumptionDetails.nodeId],
  }),
  experimentDetail: one(experimentDetails, {
    fields: [nodes.id],
    references: [experimentDetails.nodeId],
  }),
  treeLayout: one(treeLayouts, {
    fields: [nodes.id],
    references: [treeLayouts.nodeId],
  }),
}));

// ─── MetricDetail ───

export type MetricType = "business" | "product" | "traction";
export type JourneyStage =
  | "go_to_market"
  | "onboarding"
  | "conversion"
  | "activation"
  | "retention"
  | "referral";
export type RefreshFrequency = "manual" | "daily" | "weekly";
export type SourceType = "manual" | "snowflake" | "api";

export const metricDetails = pgTable("metric_details", {
  id: text("id").primaryKey(),
  nodeId: text("node_id")
    .notNull()
    .unique()
    .references(() => nodes.id, { onDelete: "cascade" }),
  metricType: text("metric_type").notNull(), // MetricType
  currentValue: doublePrecision("current_value"),
  targetValue: doublePrecision("target_value"),
  unit: text("unit"), // e.g., "%", "$", "count"
  sourceType: text("source_type").notNull().default("manual"), // SourceType
  sourceConfig: jsonb("source_config"), // connection details
  lastRefreshedAt: timestamp("last_refreshed_at", { mode: "date" }),
  refreshFrequency: text("refresh_frequency").notNull().default("manual"), // RefreshFrequency
  journeyStage: text("journey_stage"), // JourneyStage — determines horizontal ordering
});

export const metricDetailsRelations = relations(metricDetails, ({ one }) => ({
  node: one(nodes, {
    fields: [metricDetails.nodeId],
    references: [nodes.id],
  }),
}));

// ─── OpportunityDetail ───

export type OpportunitySource =
  | "interview"
  | "survey"
  | "analytics"
  | "feedback"
  | "assumption";

export const opportunityDetails = pgTable("opportunity_details", {
  id: text("id").primaryKey(),
  nodeId: text("node_id")
    .notNull()
    .unique()
    .references(() => nodes.id, { onDelete: "cascade" }),
  source: text("source"), // OpportunitySource
  reach: integer("reach"),
  impact: integer("impact"), // 1-5
  confidence: integer("confidence"), // 10-100
  effort: doublePrecision("effort"), // person-weeks
  riceScore: doublePrecision("rice_score"), // computed: (reach * impact * confidence%) / effort
});

export const opportunityDetailsRelations = relations(
  opportunityDetails,
  ({ one }) => ({
    node: one(nodes, {
      fields: [opportunityDetails.nodeId],
      references: [nodes.id],
    }),
  })
);

// ─── SolutionDetail ───

export const solutionDetails = pgTable("solution_details", {
  id: text("id").primaryKey(),
  nodeId: text("node_id")
    .notNull()
    .unique()
    .references(() => nodes.id, { onDelete: "cascade" }),
  reach: integer("reach"),
  impact: integer("impact"), // 1-5
  confidence: integer("confidence"), // 10-100
  effort: doublePrecision("effort"),
  riceScore: doublePrecision("rice_score"),
});

export const solutionDetailsRelations = relations(
  solutionDetails,
  ({ one }) => ({
    node: one(nodes, {
      fields: [solutionDetails.nodeId],
      references: [nodes.id],
    }),
  })
);

// ─── AssumptionDetail ───

export type AssumptionCategory =
  | "desirability"
  | "usability"
  | "feasibility"
  | "viability";
export type EvidenceStrength = "none" | "weak" | "moderate" | "strong";

export const assumptionDetails = pgTable("assumption_details", {
  id: text("id").primaryKey(),
  nodeId: text("node_id")
    .notNull()
    .unique()
    .references(() => nodes.id, { onDelete: "cascade" }),
  category: text("category"), // AssumptionCategory
  isLeapOfFaith: boolean("is_leap_of_faith").notNull().default(false),
  evidenceStrength: text("evidence_strength").notNull().default("none"), // EvidenceStrength
});

export const assumptionDetailsRelations = relations(
  assumptionDetails,
  ({ one }) => ({
    node: one(nodes, {
      fields: [assumptionDetails.nodeId],
      references: [nodes.id],
    }),
  })
);

// ─── ExperimentDetail ───

export type ExperimentType =
  | "prototype_test"
  | "concierge"
  | "wizard_of_oz"
  | "survey"
  | "data_analysis"
  | "one_question"
  | "other";
export type ExperimentOutcome =
  | "pending"
  | "validated"
  | "invalidated"
  | "inconclusive";

export const experimentDetails = pgTable("experiment_details", {
  id: text("id").primaryKey(),
  nodeId: text("node_id")
    .notNull()
    .unique()
    .references(() => nodes.id, { onDelete: "cascade" }),
  experimentType: text("experiment_type"), // ExperimentType
  hypothesis: text("hypothesis"),
  method: text("method"),
  successCriteria: text("success_criteria"),
  result: text("result"),
  outcome: text("outcome").notNull().default("pending"), // ExperimentOutcome
  startedAt: timestamp("started_at", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
});

export const experimentDetailsRelations = relations(
  experimentDetails,
  ({ one }) => ({
    node: one(nodes, {
      fields: [experimentDetails.nodeId],
      references: [nodes.id],
    }),
  })
);

// ─── TreeLayout ───
// Visual position of each node on the React Flow canvas. Decoupled from domain data.

export const treeLayouts = pgTable("tree_layouts", {
  id: text("id").primaryKey(),
  nodeId: text("node_id")
    .notNull()
    .unique()
    .references(() => nodes.id, { onDelete: "cascade" }),
  positionX: doublePrecision("position_x").notNull().default(0),
  positionY: doublePrecision("position_y").notNull().default(0),
  collapsed: boolean("collapsed").notNull().default(false),
});

export const treeLayoutsRelations = relations(treeLayouts, ({ one }) => ({
  node: one(nodes, {
    fields: [treeLayouts.nodeId],
    references: [nodes.id],
  }),
}));
