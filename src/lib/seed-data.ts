import type { Node, Edge } from "@xyflow/react";
import type { TreeNodeData } from "@/store/tree-store";

/**
 * Sample tree for development — a realistic Fin Resolutions OST.
 * This will be replaced by database-driven data once the API is wired up.
 */

const n = (
  id: string,
  label: string,
  nodeType: TreeNodeData["nodeType"],
  status: string,
  hasEvidence = false
): Node<TreeNodeData> => ({
  id,
  type: "treeNode",
  position: { x: 0, y: 0 }, // auto-layout will overwrite
  data: { label, nodeType, status, hasEvidence },
});

export const sampleNodes: Node<TreeNodeData>[] = [
  // Metric (root)
  n("m1", "Fin Resolution Rate", "metric", "active", true),

  // Opportunities
  n("o1", "Users can't find answers to complex questions", "opportunity", "exploring", true),
  n("o2", "Agents lack context about user history", "opportunity", "identified", false),
  n("o3", "Handoff to human agent is too slow", "opportunity", "pursuing", true),

  // Solutions under o1
  n("s1", "Multi-turn conversation memory", "solution", "building", true),
  n("s2", "Semantic search over help center", "solution", "proposed", false),

  // Solutions under o3
  n("s3", "Priority routing based on sentiment", "solution", "exploring", true),
  n("s4", "Pre-fill context summary for agent", "solution", "proposed", false),

  // Assumptions under s1
  n("a1", "Users expect Fin to remember previous messages", "assumption", "validated", true),
  n("a2", "Multi-turn adds latency users will accept", "assumption", "testing", false),

  // Assumptions under s3
  n("a3", "Sentiment analysis is accurate enough for routing", "assumption", "untested", false),

  // Experiments under a1
  n("e1", "5-user prototype test with multi-turn", "experiment", "completed", true),

  // Experiments under a2
  n("e2", "Latency benchmark: multi-turn vs single", "experiment", "running", false),
];

export const sampleEdges: Edge[] = [
  // Metric → Opportunities
  { id: "m1-o1", source: "m1", target: "o1" },
  { id: "m1-o2", source: "m1", target: "o2" },
  { id: "m1-o3", source: "m1", target: "o3" },

  // Opportunity → Solutions
  { id: "o1-s1", source: "o1", target: "s1" },
  { id: "o1-s2", source: "o1", target: "s2" },
  { id: "o3-s3", source: "o3", target: "s3" },
  { id: "o3-s4", source: "o3", target: "s4" },

  // Solution → Assumptions
  { id: "s1-a1", source: "s1", target: "a1" },
  { id: "s1-a2", source: "s1", target: "a2" },
  { id: "s3-a3", source: "s3", target: "a3" },

  // Assumption → Experiments
  { id: "a1-e1", source: "a1", target: "e1" },
  { id: "a2-e2", source: "a2", target: "e2" },
];
