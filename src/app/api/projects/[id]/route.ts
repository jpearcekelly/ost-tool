import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: (p, { eq }) => eq(p.id, id),
    with: {
      nodes: {
        with: {
          metricDetail: true,
          opportunityDetail: true,
          solutionDetail: true,
          assumptionDetail: true,
          experimentDetail: true,
          treeLayout: true,
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });

  if (result.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
