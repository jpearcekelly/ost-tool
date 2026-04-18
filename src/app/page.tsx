import Link from "next/link";
import { db } from "@/db";
import { CreateProjectForm } from "@/components/create-project-form";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await db.query.projects.findMany({
    orderBy: (p, { desc }) => [desc(p.updatedAt)],
  });

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "var(--space-10) var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-8)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h1
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          OST Tool
        </h1>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
          Opportunity-Solution Trees for product discovery
        </p>
      </div>

      {/* Create project */}
      <CreateProjectForm />

      {/* Project list */}
      {projects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <h2
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Your projects
          </h2>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-1)",
                padding: "var(--space-4)",
                backgroundColor: "var(--color-bg-card)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-bg-border)",
                textDecoration: "none",
                transition: "background var(--duration-fast) var(--easing-default)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                }}
              >
                {project.name}
              </span>
              {project.description && (
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                  {project.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
