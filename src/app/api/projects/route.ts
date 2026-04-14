import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { createProjectSchema } from "@/lib/validators";
import { v4 as uuid } from "uuid";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const id = uuid();
  const now = new Date();

  await db.insert(projects).values({
    id,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    createdAt: now,
    updatedAt: now,
  });

  const project = await db.query.projects.findFirst({
    where: (p, { eq }) => eq(p.id, id),
  });

  return NextResponse.json(project, { status: 201 });
}

export async function GET() {
  const allProjects = await db.query.projects.findMany({
    orderBy: (p, { desc }) => [desc(p.updatedAt)],
  });

  return NextResponse.json(allProjects);
}
