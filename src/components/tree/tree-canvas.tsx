"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type NodeTypes,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTreeStore, type TreeNodeData } from "@/store/tree-store";
import { TreeNode } from "./nodes/tree-node";

const nodeTypes: NodeTypes = {
  treeNode: TreeNode,
};

type TreeCanvasProps = {
  projectId: string;
  initialNodes: Node<TreeNodeData>[];
  initialEdges: Edge[];
};

export function TreeCanvas({ projectId, initialNodes, initialEdges }: TreeCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setTree,
    setSelectedNode,
    focusedNodeId,
    focusNode,
    clearFocus,
  } = useTreeStore();

  const isFocused = focusedNodeId != null;
  const focusedNode = isFocused
    ? nodes.find((n) => n.id === focusedNodeId)
    : null;

  useEffect(() => {
    setTree(projectId, initialNodes, initialEdges);
  }, [projectId, initialNodes, initialEdges, setTree]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      focusNode(node.id);
    },
    [focusNode]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      style: {
        stroke: "var(--color-edge-default)",
        strokeWidth: 1.5,
      },
      type: "bezier" as const,
      animated: false,
    }),
    []
  );

  return (
    <div style={{ width: "100%", height: "100vh", paddingTop: 49, position: "relative" }}>
      {/* Focus mode indicator bar */}
      {isFocused && (
        <div
          style={{
            position: "absolute",
            top: 49,
            left: 0,
            right: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-3)",
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "color-mix(in srgb, var(--color-bg-canvas) 90%, transparent)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid var(--color-bg-border)",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            Focused on:{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {(focusedNode?.data as TreeNodeData | undefined)?.label ?? "node"}
            </strong>
          </span>
          <button
            onClick={clearFocus}
            style={{
              padding: "2px 10px",
              fontSize: "var(--font-size-xs)",
              fontWeight: 500,
              fontFamily: "inherit",
              color: "var(--color-text-link)",
              backgroundColor: "transparent",
              border: "1px solid var(--color-bg-border)",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
            }}
          >
            Show all
          </button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-edge-default)"
          style={{ opacity: 0.3 }}
        />
        <Controls
          showInteractive={false}
          style={{
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--color-bg-border)",
          }}
        />
      </ReactFlow>
    </div>
  );
}
