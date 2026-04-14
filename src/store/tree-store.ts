import { create } from "zustand";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { getLayoutedElements } from "@/lib/layout";
import type { NodeType } from "@/db/schema";

export type TreeNodeData = {
  label: string;
  nodeType: NodeType;
  status: string;
  description?: string;
  hasEvidence?: boolean;
  collapsed?: boolean;
};

// ─── Helpers ───

function getAncestors(nodeId: string, edges: Edge[]): Set<string> {
  const ancestors = new Set<string>();
  function walkUp(id: string) {
    for (const e of edges) {
      if (e.target === id && !ancestors.has(e.source)) {
        ancestors.add(e.source);
        walkUp(e.source);
      }
    }
  }
  walkUp(nodeId);
  return ancestors;
}

function getDescendants(nodeId: string, edges: Edge[]): Set<string> {
  const descendants = new Set<string>();
  function walkDown(id: string) {
    for (const e of edges) {
      if (e.source === id && !descendants.has(e.target)) {
        descendants.add(e.target);
        walkDown(e.target);
      }
    }
  }
  walkDown(nodeId);
  return descendants;
}

function getCollapsedDescendants(
  nodes: Node<TreeNodeData>[],
  edges: Edge[]
): Set<string> {
  const hidden = new Set<string>();
  function collectDescendants(parentId: string) {
    for (const e of edges) {
      if (e.source === parentId && !hidden.has(e.target)) {
        hidden.add(e.target);
        collectDescendants(e.target);
      }
    }
  }
  for (const node of nodes) {
    if (node.data.collapsed) {
      collectDescendants(node.id);
    }
  }
  return hidden;
}

/**
 * From the full node/edge set, compute visible nodes + edges,
 * apply layout, and return them.
 */
function computeVisible(
  allNodes: Node<TreeNodeData>[],
  allEdges: Edge[],
  focusedNodeId: string | null
): { nodes: Node<TreeNodeData>[]; edges: Edge[] } {
  let visibleIds: Set<string>;

  if (focusedNodeId) {
    const ancestors = getAncestors(focusedNodeId, allEdges);
    const descendants = getDescendants(focusedNodeId, allEdges);
    visibleIds = new Set([focusedNodeId, ...ancestors, ...descendants]);
  } else {
    // Apply collapse filtering
    const collapsedHidden = getCollapsedDescendants(allNodes, allEdges);
    visibleIds = new Set(
      allNodes.filter((n) => !collapsedHidden.has(n.id)).map((n) => n.id)
    );
  }

  const visibleNodes = allNodes.filter((n) => visibleIds.has(n.id));
  const visibleEdges = allEdges.filter(
    (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
  );

  const { nodes: layouted, edges: layoutedEdges } = getLayoutedElements(
    visibleNodes,
    visibleEdges
  );

  return { nodes: layouted, edges: layoutedEdges };
}

// ─── Store ───

type TreeState = {
  projectId: string | null;
  allNodes: Node<TreeNodeData>[];
  allEdges: Edge[];
  selectedNodeId: string | null;
  focusedNodeId: string | null;

  // Derived visible state
  nodes: Node<TreeNodeData>[];
  edges: Edge[];

  onNodesChange: OnNodesChange<Node<TreeNodeData>>;
  onEdgesChange: OnEdgesChange;
  setSelectedNode: (id: string | null) => void;
  setTree: (
    projectId: string,
    nodes: Node<TreeNodeData>[],
    edges: Edge[]
  ) => void;
  addNode: (
    parentId: string | null,
    type: NodeType,
    title: string
  ) => Promise<void>;
  updateNode: (
    id: string,
    updates: { title?: string; status?: string; description?: string | null }
  ) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  toggleCollapse: (id: string) => void;
  focusNode: (id: string) => void;
  clearFocus: () => void;
};

export const useTreeStore = create<TreeState>((set, get) => ({
  projectId: null,
  allNodes: [],
  allEdges: [],
  selectedNodeId: null,
  focusedNodeId: null,
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  setSelectedNode: (id) => {
    set({ selectedNodeId: id });
  },

  setTree: (projectId, nodes, edges) => {
    const visible = computeVisible(nodes, edges, null);
    set({
      projectId,
      allNodes: nodes,
      allEdges: edges,
      focusedNodeId: null,
      ...visible,
    });
  },

  addNode: async (parentId, type, title) => {
    const { projectId, allNodes, allEdges, focusedNodeId } = get();
    if (!projectId) return;

    const res = await fetch(`/api/projects/${projectId}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId, type, title }),
    });

    if (!res.ok) return;
    const created = await res.json();

    const newNode: Node<TreeNodeData> = {
      id: created.id,
      type: "treeNode",
      position: { x: 0, y: 0 },
      data: {
        label: created.title,
        nodeType: created.type as NodeType,
        status: created.status,
        description: created.description ?? undefined,
        hasEvidence: false,
        collapsed: false,
      },
    };

    const newEdge: Edge | null = parentId
      ? {
          id: `${parentId}-${created.id}`,
          source: parentId,
          target: created.id,
        }
      : null;

    const updatedAllNodes = [...allNodes, newNode];
    const updatedAllEdges = newEdge ? [...allEdges, newEdge] : allEdges;
    const visible = computeVisible(
      updatedAllNodes,
      updatedAllEdges,
      focusedNodeId
    );

    set({
      allNodes: updatedAllNodes,
      allEdges: updatedAllEdges,
      selectedNodeId: created.id,
      ...visible,
    });
  },

  updateNode: async (id, updates) => {
    const res = await fetch(`/api/nodes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) return;
    const updated = await res.json();

    const { allNodes, allEdges, focusedNodeId } = get();
    const updatedAllNodes = allNodes.map((n) =>
      n.id === id
        ? {
            ...n,
            data: {
              ...n.data,
              label: updated.title,
              status: updated.status,
              description: updated.description ?? undefined,
            } as TreeNodeData,
          }
        : n
    );

    // Update visible nodes in-place (no re-layout needed for data changes)
    set({
      allNodes: updatedAllNodes,
      nodes: get().nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                label: updated.title,
                status: updated.status,
                description: updated.description ?? undefined,
              } as TreeNodeData,
            }
          : n
      ),
    });
  },

  deleteNode: async (id) => {
    const res = await fetch(`/api/nodes/${id}`, { method: "DELETE" });
    if (!res.ok) return;

    const { allNodes, allEdges, focusedNodeId } = get();
    const updatedAllNodes = allNodes.filter((n) => n.id !== id);
    const updatedAllEdges = allEdges.filter(
      (e) => e.source !== id && e.target !== id
    );
    const visible = computeVisible(
      updatedAllNodes,
      updatedAllEdges,
      focusedNodeId === id ? null : focusedNodeId
    );

    set({
      allNodes: updatedAllNodes,
      allEdges: updatedAllEdges,
      selectedNodeId: null,
      focusedNodeId: focusedNodeId === id ? null : focusedNodeId,
      ...visible,
    });
  },

  toggleCollapse: (id) => {
    const { allNodes, allEdges, focusedNodeId } = get();

    const updatedAllNodes = allNodes.map((n) =>
      n.id === id
        ? {
            ...n,
            data: {
              ...n.data,
              collapsed: !n.data.collapsed,
            } as TreeNodeData,
          }
        : n
    );

    const visible = computeVisible(updatedAllNodes, allEdges, focusedNodeId);
    set({ allNodes: updatedAllNodes, ...visible });
  },

  focusNode: (id) => {
    const { allNodes, allEdges } = get();
    const visible = computeVisible(allNodes, allEdges, id);
    set({ focusedNodeId: id, selectedNodeId: id, ...visible });
  },

  clearFocus: () => {
    const { allNodes, allEdges } = get();
    // Clear all collapsed state too
    const cleared = allNodes.map((n) => ({
      ...n,
      data: { ...n.data, collapsed: false } as TreeNodeData,
    }));
    const visible = computeVisible(cleared, allEdges, null);
    set({ allNodes: cleared, focusedNodeId: null, ...visible });
  },
}));
