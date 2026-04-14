import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

/**
 * Computes auto-layout positions for a tree using dagre.
 * Nodes slide to new positions via React Flow's animation — no manual dragging.
 */
export function getLayoutedElements<T extends Record<string, unknown>>(
  nodes: Node<T>[],
  edges: Edge[],
  options: {
    direction?: "TB" | "LR";
    nodeWidth?: number;
    nodeHeight?: number;
    rankSep?: number;
    nodeSep?: number;
  } = {}
): { nodes: Node<T>[]; edges: Edge[] } {
  const {
    direction = "TB",
    nodeWidth = 240,   // matches fixed card width
    nodeHeight = 130,  // overestimate to account for taller cards (collapse button, long titles)
    rankSep = 64,      // guaranteed vertical gap between row edges
    nodeSep = 24,      // horizontal gap between siblings
  } = options;

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = graph.node(node.id);
    return {
      ...node,
      position: {
        x: dagreNode.x - nodeWidth / 2,
        y: dagreNode.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
