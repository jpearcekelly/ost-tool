import { NextResponse } from "next/server";
import { db } from "@/db";
import { nodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateNodeSchema, statusSchemaForType } from "@/lib/validators";
import type { NodeType } from "@/db/schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const parsed = updateNodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Fetch existing node to get its type (needed for status validation)
  const existing = await db.query.nodes.findFirst({
    where: (n, { eq }) => eq(n.id, id),
  });

  if (!existing) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  // Validate status if provided
  if (parsed.data.status != null) {
    const statusSchema = statusSchemaForType(existing.type as NodeType);
    const statusResult = statusSchema.safeParse(parsed.data.status);
    if (!statusResult.success) {
      return NextResponse.json(
        {
          error: `Invalid status "${parsed.data.status}" for type "${existing.type}"`,
          validStatuses: statusSchema.options,
        },
        { status: 400 }
      );
    }
  }

  // Build update object with only provided fields
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.sortOrder !== undefined)
    updates.sortOrder = parsed.data.sortOrder;
  if (parsed.data.parentId !== undefined)
    updates.parentId = parsed.data.parentId;

  await db.update(nodes).set(updates).where(eq(nodes.id, id));

  const updated = await db.query.nodes.findFirst({
    where: (n, { eq }) => eq(n.id, id),
    with: {
      metricDetail: true,
      opportunityDetail: true,
      solutionDetail: true,
      assumptionDetail: true,
      experimentDetail: true,
      treeLayout: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await db
    .delete(nodes)
    .where(eq(nodes.id, id))
    .returning({ id: nodes.id });

  if (result.length === 0) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
