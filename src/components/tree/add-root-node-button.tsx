"use client";

import { useState } from "react";
import { useTreeStore } from "@/store/tree-store";
import type { NodeType } from "@/db/schema";

const NODE_TYPE_OPTIONS: { value: NodeType; label: string }[] = [
  { value: "metric", label: "Metric" },
  { value: "opportunity", label: "Opportunity" },
  { value: "solution", label: "Solution" },
  { value: "assumption", label: "Assumption" },
  { value: "experiment", label: "Experiment" },
];

export function AddRootNodeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const addNode = useTreeStore((s) => s.addNode);

  const handleAdd = async (type: NodeType) => {
    setIsOpen(false);
    await addNode(null, type, `New ${type}`);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          fontSize: "var(--font-size-sm)",
          fontWeight: 500,
          fontFamily: "inherit",
          color: "var(--color-text-link)",
          backgroundColor: "transparent",
          cursor: "pointer",
          padding: "var(--space-1) var(--space-3)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-bg-border)",
        }}
      >
        + Add node
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "var(--space-1)",
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-bg-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-1) 0",
            minWidth: 160,
            zIndex: 50,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {NODE_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAdd(opt.value)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "var(--space-2) var(--space-3)",
                fontSize: "var(--font-size-sm)",
                fontFamily: "inherit",
                color: "var(--color-text-primary)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
