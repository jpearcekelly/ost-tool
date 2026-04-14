import type { Node, Edge } from "@xyflow/react";
import type { TreeNodeData } from "@/store/tree-store";

/**
 * Raw node shape returned by the Drizzle query (project with nested nodes).
 */
type DbNode = {
  id: string;
  parentId: string | null;
  type: string;
  title: string;
  description: string | null;
  status: string;
  sortOrder: number;
};

/**
 * Transforms a flat list of DB nodes into React Flow nodes and edges.
 * Dagre computes positions client-side — we just need the topology.
 */
export function dbNodesToFlowElements(dbNodes: DbNode[]): {
  nodes: Node<TreeNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<TreeNodeData>[] = dbNodes.map((n) => ({
    id: n.id,
    type: "treeNode",
    position: { x: 0, y: 0 }, // dagre will compute
    data: {
      label: n.title,
      nodeType: n.type as TreeNodeData["nodeType"],
      status: n.status,
      description: n.description ?? undefined,
      hasEvidence: false, // TODO: derive from data point count in Phase 3
      collapsed: false,
    },
  }));

  const edges: Edge[] = dbNodes
    .filter((n) => n.parentId != null)
    .map((n) => ({
      id: `${n.parentId}-${n.id}`,
      source: n.parentId!,
      target: n.id,
    }));

  return { nodes, edges };
}
