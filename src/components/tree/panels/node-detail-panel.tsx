"use client";

import { useState } from "react";
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "var(--color-status-active)" },
  deprecated: { label: "Deprecated", color: "var(--color-status-paused)" },
  identified: { label: "Identified", color: "var(--color-text-secondary)" },
  exploring: { label: "Exploring", color: "var(--color-status-active)" },
  pursuing: { label: "Pursuing", color: "var(--color-status-active)" },
  parked: { label: "Parked", color: "var(--color-status-paused)" },
  proposed: { label: "Proposed", color: "var(--color-text-secondary)" },
  building: { label: "Building", color: "var(--color-status-active)" },
  shipped: { label: "Shipped", color: "var(--color-status-validated)" },
  abandoned: { label: "Abandoned", color: "var(--color-status-paused)" },
  untested: { label: "Untested", color: "var(--color-text-muted)" },
  testing: { label: "Testing", color: "var(--color-status-stale)" },
  validated: { label: "Validated", color: "var(--color-status-validated)" },
  invalidated: { label: "Invalidated", color: "var(--color-status-invalidated)" },
  planned: { label: "Planned", color: "var(--color-text-secondary)" },
  running: { label: "Running", color: "var(--color-status-stale)" },
  completed: { label: "Completed", color: "var(--color-status-validated)" },
  pending: { label: "Pending", color: "var(--color-text-muted)" },
};

function StatusDot({ status }: { status: string }) {
  const info = STATUS_LABELS[status] ?? {
    label: status,
    color: "var(--color-text-muted)",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "var(--radius-full)",
          backgroundColor: info.color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "var(--font-size-sm)",
          fontWeight: 500,
          color: info.color,
        }}
      >
        {info.label}
      </span>
    </div>
  );
}

function EditableText({
  value,
  placeholder,
  onSave,
  multiline = false,
  style: customStyle = {},
}: {
  value: string;
  placeholder?: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <div
        onClick={() => { setDraft(value); setEditing(true); }}
        style={{
          cursor: "pointer",
          borderRadius: "var(--radius-sm)",
          padding: "2px 4px",
          margin: "-2px -4px",
          transition: "background var(--duration-fast) var(--easing-default)",
          color: value ? undefined : "var(--color-text-muted)",
          fontStyle: value ? undefined : "italic",
          ...customStyle,
        }}
      >
        {value || placeholder || "—"}
      </div>
    );
  }

  const handleSave = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  const sharedStyle: React.CSSProperties = {
    width: "100%",
    padding: "2px 4px",
    margin: "-2px -4px",
    fontSize: "inherit",
    fontWeight: "inherit",
    fontFamily: "inherit",
    color: "var(--color-text-primary)",
    backgroundColor: "var(--color-bg-input)",
    border: "1px solid var(--color-bg-border)",
    borderRadius: "var(--radius-sm)",
    outline: "none",
    ...customStyle,
  };

  if (multiline) {
    return (
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => { if (e.key === "Escape") { setEditing(false); } }}
        autoFocus
        rows={3}
        placeholder={placeholder}
        style={{ ...sharedStyle, resize: "vertical" as const, lineHeight: 1.5 }}
      />
    );
  }

  return (
    <input
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") setEditing(false);
      }}
      autoFocus
      placeholder={placeholder}
      style={sharedStyle}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--font-size-xs)",
        fontWeight: 500,
        color: "var(--color-text-muted)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </div>
  );
}

function FieldRow({
  label,
  value,
  placeholder,
}: {
  label: string;
  value?: string | number | null;
  placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
      <SectionLabel>{label}</SectionLabel>
      <div
        style={{
          fontSize: "var(--font-size-base)",
          fontWeight: 400,
          color: value != null ? "var(--color-text-body)" : "var(--color-text-muted)",
          fontStyle: value != null ? "normal" : ("italic" as const),
        }}
      >
        {value ?? placeholder ?? "—"}
      </div>
    </div>
  );
}

function MetricFields() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: "var(--space-4)" }}>
      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <FieldRow label="Current Value" placeholder="Not set" />
        <FieldRow label="Target Value" placeholder="Not set" />
      </div>
      <FieldRow label="Unit" placeholder="%, $, count..." />
      <FieldRow label="Metric Type" placeholder="Business / Product / Traction" />
      <FieldRow label="Journey Stage" placeholder="Not assigned" />
      <FieldRow label="Refresh" value="Manual" />
    </div>
  );
}

function RiceFields({ type }: { type: "opportunity" | "solution" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: "var(--space-4)" }}>
      <SectionLabel>RICE Score</SectionLabel>
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
        }}
      >
        {["Reach", "Impact", "Confidence", "Effort"].map((field) => (
          <div
            key={field}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
              gap: 4,
              padding: "var(--space-3)",
              backgroundColor: "var(--color-bg-input)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                color: "var(--color-text-muted)",
              }}
            >
              —
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: 500,
                color: "var(--color-text-muted)",
              }}
            >
              {field}
            </div>
          </div>
        ))}
      </div>
      {type === "opportunity" && (
        <FieldRow label="Source" placeholder="Interview / Survey / Analytics..." />
      )}
    </div>
  );
}

function AssumptionFields() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: "var(--space-4)" }}>
      <FieldRow label="Category" placeholder="Desirability / Usability / Feasibility / Viability" />
      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <FieldRow label="Leap of Faith" value="No" />
        <FieldRow label="Evidence Strength" value="None" />
      </div>
    </div>
  );
}

function ExperimentFields() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: "var(--space-4)" }}>
      <FieldRow label="Type" placeholder="Prototype test / Survey / Data analysis..." />
      <FieldRow label="Hypothesis" placeholder="We believe... We'll know we're right if..." />
      <FieldRow label="Method" placeholder="How the experiment will be conducted" />
      <FieldRow label="Success Criteria" placeholder="Measurable threshold" />
      <FieldRow label="Result" placeholder="Pending..." />
      <FieldRow label="Outcome" value="Pending" />
    </div>
  );
}

function TypeFields({ nodeType }: { nodeType: NodeType }) {
  switch (nodeType) {
    case "metric":
      return <MetricFields />;
    case "opportunity":
      return <RiceFields type="opportunity" />;
    case "solution":
      return <RiceFields type="solution" />;
    case "assumption":
      return <AssumptionFields />;
    case "experiment":
      return <ExperimentFields />;
  }
}

/**
 * Valid child types per parent type, following the CDH tree hierarchy.
 */
const ALLOWED_CHILDREN: Record<NodeType, NodeType[]> = {
  metric: ["opportunity"],
  opportunity: ["opportunity", "solution"],
  solution: ["assumption"],
  assumption: ["experiment"],
  experiment: [],
};

function AddChildForm({ parentId, parentType }: { parentId: string; parentType: NodeType }) {
  const { addNode } = useTreeStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<NodeType | "">(
    ALLOWED_CHILDREN[parentType][0] ?? ""
  );
  const [loading, setLoading] = useState(false);

  const allowedTypes = ALLOWED_CHILDREN[parentType];
  if (allowedTypes.length === 0) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !type) return;

    setLoading(true);
    await addNode(parentId, type as NodeType, title.trim());
    setTitle("");
    setOpen(false);
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "var(--space-2) var(--space-3)",
          fontSize: "var(--font-size-sm)",
          fontWeight: 500,
          fontFamily: "inherit",
          color: "var(--color-text-link)",
          backgroundColor: "transparent",
          border: "1px dashed var(--color-bg-border)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          textAlign: "left" as const,
        }}
      >
        + Add child node
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column" as const,
        gap: "var(--space-3)",
        padding: "var(--space-3)",
        backgroundColor: "var(--color-bg-input)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-bg-border)",
      }}
    >
      <SectionLabel>Add child node</SectionLabel>

      {/* Type selector */}
      {allowedTypes.length > 1 ? (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {allowedTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              style={{
                padding: "4px 10px",
                fontSize: "var(--font-size-xs)",
                fontWeight: 500,
                fontFamily: "inherit",
                color: type === t ? NODE_COLORS[t] : "var(--color-text-muted)",
                backgroundColor:
                  type === t
                    ? `color-mix(in srgb, ${NODE_COLORS[t]} 10%, transparent)`
                    : "transparent",
                border: `1px solid ${type === t ? NODE_COLORS[t] : "var(--color-bg-border)"}`,
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                textTransform: "capitalize" as const,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      ) : (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: 500,
            color: NODE_COLORS[allowedTypes[0]],
            textTransform: "capitalize" as const,
          }}
        >
          {allowedTypes[0]}
        </span>
      )}

      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`${NODE_TYPE_LABELS[type as NodeType] ?? "Node"} title...`}
        autoFocus
        style={{
          padding: "var(--space-2)",
          fontSize: "var(--font-size-sm)",
          fontFamily: "inherit",
          color: "var(--color-text-primary)",
          backgroundColor: "var(--color-bg-card)",
          border: "1px solid var(--color-bg-border)",
          borderRadius: "var(--radius-sm)",
          outline: "none",
        }}
      />

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => { setOpen(false); setTitle(""); }}
          style={{
            padding: "var(--space-1) var(--space-3)",
            fontSize: "var(--font-size-xs)",
            fontFamily: "inherit",
            color: "var(--color-text-muted)",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || loading}
          style={{
            padding: "var(--space-1) var(--space-3)",
            fontSize: "var(--font-size-xs)",
            fontWeight: 500,
            fontFamily: "inherit",
            color: "var(--color-text-primary)",
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-bg-border)",
            borderRadius: "var(--radius-sm)",
            cursor: title.trim() && !loading ? "pointer" : "default",
            opacity: title.trim() && !loading ? 1 : 0.5,
          }}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}

const STATUS_OPTIONS: Record<string, string[]> = {
  metric: ["active", "deprecated"],
  opportunity: ["identified", "exploring", "pursuing", "parked"],
  solution: ["proposed", "exploring", "building", "shipped", "abandoned"],
  assumption: ["untested", "testing", "validated", "invalidated"],
  experiment: ["planned", "running", "completed", "abandoned"],
};

function StatusSelector({
  nodeType,
  currentStatus,
  onSave,
}: {
  nodeType: string;
  currentStatus: string;
  onSave: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = STATUS_OPTIONS[nodeType] ?? [];

  if (!open) {
    return (
      <div onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>
        <StatusDot status={currentStatus} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "var(--space-1)" }}>
      {options.map((s) => {
        const info = STATUS_LABELS[s] ?? { label: s, color: "var(--color-text-muted)" };
        const isActive = s === currentStatus;
        return (
          <button
            key={s}
            onClick={() => { onSave(s); setOpen(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              fontSize: "var(--font-size-xs)",
              fontWeight: 500,
              fontFamily: "inherit",
              color: info.color,
              backgroundColor: isActive
                ? `color-mix(in srgb, ${info.color} 10%, transparent)`
                : "transparent",
              border: `1px solid ${isActive ? info.color : "var(--color-bg-border)"}`,
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              textTransform: "capitalize" as const,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "var(--radius-full)",
                backgroundColor: info.color,
              }}
            />
            {info.label}
          </button>
        );
      })}
    </div>
  );
}

export function NodeDetailPanel() {
  const { selectedNodeId, nodes, setSelectedNode, updateNode, focusNode, clearFocus, focusedNodeId } = useTreeStore();
  const isFocused = focusedNodeId != null;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const isOpen = selectedNode != null;
  const data = selectedNode?.data as TreeNodeData | undefined;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 380,
        height: "100vh",
        backgroundColor: "var(--color-bg-panel)",
        borderLeft: "1px solid var(--color-bg-border)",
        boxShadow: isOpen ? "var(--shadow-panel)" : "none",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: `transform var(--duration-normal) var(--easing-default)`,
        zIndex: "var(--z-panel)",
        display: "flex",
        flexDirection: "column" as const,
        overflow: "hidden",
      }}
    >
      {data && (
        <>
          {/* Header */}
          <div
            style={{
              padding: "var(--space-5) var(--space-6)",
              borderBottom: "1px solid var(--color-bg-border)",
              backgroundColor: "var(--color-bg-canvas)",
              display: "flex",
              flexDirection: "column" as const,
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              {/* Type badge */}
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 500,
                  color: NODE_COLORS[data.nodeType],
                  backgroundColor: `color-mix(in srgb, ${NODE_COLORS[data.nodeType]} 10%, transparent)`,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {NODE_TYPE_LABELS[data.nodeType]}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                {/* Focus button */}
                <button
                  onClick={() =>
                    isFocused ? clearFocus() : focusNode(selectedNode!.id)
                  }
                  style={{
                    background: "none",
                    border: "1px solid var(--color-bg-border)",
                    cursor: "pointer",
                    color: isFocused ? "var(--color-text-link)" : "var(--color-text-muted)",
                    fontSize: "var(--font-size-xs)",
                    fontFamily: "inherit",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  {isFocused ? "Show all" : "Focus"}
                </button>
                {/* Close button */}
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-muted)",
                    fontSize: "var(--font-size-lg)",
                    lineHeight: 1,
                    padding: "var(--space-1)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Title — editable */}
            <EditableText
              value={data.label}
              placeholder="Node title..."
              onSave={(title) => updateNode(selectedNode!.id, { title })}
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                lineHeight: 1.3,
              }}
            />

            {/* Status — editable */}
            <StatusSelector
              nodeType={data.nodeType}
              currentStatus={data.status}
              onSave={(status) => updateNode(selectedNode!.id, { status })}
            />
          </div>

          {/* Body */}
          <div
            style={{
              padding: "var(--space-6)",
              overflowY: "auto" as const,
              flex: 1,
              display: "flex",
              flexDirection: "column" as const,
              gap: "var(--space-6)",
            }}
          >
            {/* Description — editable */}
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
              <SectionLabel>Description</SectionLabel>
              <EditableText
                value={data.description ?? ""}
                placeholder="Add a description..."
                onSave={(description) =>
                  updateNode(selectedNode!.id, {
                    description: description || null,
                  })
                }
                multiline
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: 400,
                  color: "var(--color-text-body)",
                }}
              />
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                backgroundColor: "var(--color-bg-border)",
              }}
            />

            {/* Type-specific fields */}
            <TypeFields nodeType={data.nodeType} />

            {/* Evidence indicator */}
            <div
              style={{
                height: 1,
                backgroundColor: "var(--color-bg-border)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "var(--radius-full)",
                  backgroundColor: data.hasEvidence
                    ? "var(--color-status-validated)"
                    : "var(--color-text-muted)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {data.hasEvidence ? "Has evidence" : "No evidence yet"}
              </span>
            </div>

            {/* Add child node */}
            <AddChildForm parentId={selectedNode!.id} parentType={data.nodeType} />
          </div>
        </>
      )}
    </div>
  );
}
