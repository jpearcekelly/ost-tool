"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useTreeStore, type TreeNodeData } from "@/store/tree-store";
import type { NodeType } from "@/db/schema";

const NODE_COLORS: Record<NodeType, string> = {
  metric: "var(--color-metric)",
  opportunity: "var(--color-opportunity)",
  solution: "var(--color-solution)",
  assumption: "var(--color-assumption)",
  experiment: "var(--color-experiment)",
};

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  metric: "Metric",
  opportunity: "Opportunity",
  solution: "Solution",
  assumption: "Assumption",
  experiment: "Experiment",
};

/** Count all descendants of a node (recursive). */
function countDescendants(nodeId: string, edges: { source: string; target: string }[]): number {
  let count = 0;
  for (const edge of edges) {
    if (edge.source === nodeId) {
      count += 1 + countDescendants(edge.target, edges);
    }
  }
  return count;
}

const tabStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  height: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
  fontSize: 9,
  fontFamily: "inherit",
  color: "var(--color-text-muted)",
  backgroundColor: "var(--color-bg-card)",
  border: "1px solid var(--color-bg-border)",
  cursor: "pointer",
  padding: "0 6px",
  lineHeight: 1,
  zIndex: 2,
};

export function TreeNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as TreeNodeData;
  const color = NODE_COLORS[nodeData.nodeType];
  const hasEvidence = nodeData.hasEvidence ?? false;
  const isCollapsed = nodeData.collapsed ?? false;
  const { allEdges, toggleCollapse, focusNode } = useTreeStore();

  const hasChildren = allEdges.some((e) => e.source === id);
  const descendantCount = hasChildren ? countDescendants(id, allEdges) : 0;

  return (
    <div style={{ position: "relative" }}>
      {/* Card */}
      <div
        style={{
          width: 240,
          minHeight: 80,
          padding: "var(--node-padding)",
          backgroundColor: "var(--color-bg-card)",
          borderRadius: "var(--radius-md)",
          border: `${selected ? "var(--border-width-node-selected)" : "var(--border-width-node)"} ${hasEvidence ? "solid" : "dashed"} ${color}`,
          opacity: hasEvidence ? 1 : 0.7,
          boxShadow: selected
            ? `0 0 0 2px var(--color-bg-canvas), 0 0 0 4px ${color}`
            : "var(--shadow-card)",
          cursor: "pointer",
          transition: `box-shadow var(--duration-fast) var(--easing-default),
                       border var(--duration-fast) var(--easing-default),
                       opacity var(--duration-fast) var(--easing-default)`,
          display: "flex",
          flexDirection: "column" as const,
          gap: "var(--space-1)",
        }}
      >
        {/* Type badge */}
        <span
          style={{
            alignSelf: "flex-start",
            fontSize: "var(--font-size-xs)",
            fontWeight: 500,
            color: color,
            backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            lineHeight: 1.4,
          }}
        >
          {NODE_TYPE_LABELS[nodeData.nodeType]}
        </span>

        {/* Title */}
        <div
          style={{
            fontSize: "var(--font-size-base)",
            fontWeight: 500,
            color: "var(--color-text-primary)",
            lineHeight: 1.25,
          }}
        >
          {nodeData.label}
        </div>

        {/* Status */}
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
            textTransform: "capitalize" as const,
          }}
        >
          {nodeData.status}
        </div>
      </div>

      {/* Collapse/expand tab — below the card, with descendant count */}
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse(id);
          }}
          style={{
            ...tabStyle,
            bottom: -16,
            borderRadius: "0 0 var(--radius-sm) var(--radius-sm)",
            borderTop: "none",
          }}
        >
          <span>{isCollapsed ? "▶" : "▼"}</span>
          {isCollapsed && <span style={{ fontWeight: 600 }}>{descendantCount}</span>}
        </button>
      )}

      {/* Handles for edges */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          background: color,
          border: "2px solid var(--color-bg-canvas)",
          borderRadius: "var(--radius-full)",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: color,
          border: "2px solid var(--color-bg-canvas)",
          borderRadius: "var(--radius-full)",
        }}
      />
    </div>
  );
}
