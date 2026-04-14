import { notFound } from "next/navigation";
import { db } from "@/db";
import { dbNodesToFlowElements } from "@/lib/tree-data";
import { TreeCanvas } from "@/components/tree/tree-canvas";
import { NodeDetailPanel } from "@/components/tree/panels/node-detail-panel";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: (p, { eq }) => eq(p.id, id),
    with: {
      nodes: true,
    },
  });

  if (!project) {
    notFound();
  }

  const { nodes, edges } = dbNodesToFlowElements(project.nodes);

  return (
    <>
      <ProjectHeader name={project.name} projectId={project.id} />
      <TreeCanvas projectId={project.id} initialNodes={nodes} initialEdges={edges} />
      <NodeDetailPanel />
    </>
  );
}

function ProjectHeader({ name, projectId }: { name: string; projectId: string }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: "var(--z-breadcrumb)",
        padding: "var(--space-3) var(--space-6)",
        backgroundColor: "var(--color-bg-canvas)",
        borderBottom: "1px solid var(--color-bg-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <a
          href="/"
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
            textDecoration: "none",
          }}
        >
          ← Projects
        </a>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>/</span>
        <h1
          style={{
            fontSize: "var(--font-size-base)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          {name}
        </h1>
      </div>
      <AddNodeButton projectId={projectId} />
    </div>
  );
}

function AddNodeButton({ projectId }: { projectId: string }) {
  return (
    <a
      href={`/project/${projectId}/add`}
      style={{
        fontSize: "var(--font-size-sm)",
        fontWeight: 500,
        color: "var(--color-text-link)",
        textDecoration: "none",
        padding: "var(--space-1) var(--space-3)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-bg-border)",
      }}
    >
      + Add node
    </a>
  );
}
