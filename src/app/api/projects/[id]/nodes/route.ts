import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  nodes,
  metricDetails,
  opportunityDetails,
  solutionDetails,
  assumptionDetails,
  experimentDetails,
  treeLayouts,
} from "@/db/schema";
import {
  createNodeSchema,
  defaultStatusForType,
  statusSchemaForType,
  metricDetailSchema,
  opportunityDetailSchema,
  solutionDetailSchema,
  assumptionDetailSchema,
  experimentDetailSchema,
} from "@/lib/validators";
import { v4 as uuid } from "uuid";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    return await handleCreateNode(projectId, body);
  } catch (err) {
    console.error("Node creation error:", err);
    return NextResponse.json(
      { error: "Internal error", message: String(err) },
      { status: 500 }
    );
  }
}

async function handleCreateNode(projectId: string, body: Record<string, unknown>) {

  // Validate base node fields
  const parsed = createNodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Validate status against the node type
  const status =
    parsed.data.status ?? defaultStatusForType(parsed.data.type);
  const statusSchema = statusSchemaForType(parsed.data.type);
  const statusResult = statusSchema.safeParse(status);
  if (!statusResult.success) {
    return NextResponse.json(
      {
        error: `Invalid status "${status}" for type "${parsed.data.type}"`,
        validStatuses: statusSchema.options,
      },
      { status: 400 }
    );
  }

  const nodeId = uuid();
  const detailId = uuid();
  const layoutId = uuid();
  const now = new Date();

  // Insert node
  await db.insert(nodes).values({
    id: nodeId,
    projectId,
    parentId: parsed.data.parentId ?? null,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    status,
    sortOrder: parsed.data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  });

  // Insert type-specific detail
  switch (parsed.data.type) {
    case "metric": {
      const detail = metricDetailSchema.safeParse(body.detail ?? {});
      await db.insert(metricDetails).values({
        id: detailId,
        nodeId,
        metricType: detail.success ? detail.data.metricType : "product",
        currentValue: detail.success ? (detail.data.currentValue ?? null) : null,
        targetValue: detail.success ? (detail.data.targetValue ?? null) : null,
        unit: detail.success ? (detail.data.unit ?? null) : null,
        sourceType: detail.success ? (detail.data.sourceType ?? "manual") : "manual",
        refreshFrequency: detail.success ? (detail.data.refreshFrequency ?? "manual") : "manual",
        journeyStage: detail.success ? (detail.data.journeyStage ?? null) : null,
      });
      break;
    }
    case "opportunity": {
      const detail = opportunityDetailSchema.safeParse(body.detail ?? {});
      await db.insert(opportunityDetails).values({
        id: detailId,
        nodeId,
        source: detail.success ? (detail.data.source ?? null) : null,
        reach: detail.success ? (detail.data.reach ?? null) : null,
        impact: detail.success ? (detail.data.impact ?? null) : null,
        confidence: detail.success ? (detail.data.confidence ?? null) : null,
        effort: detail.success ? (detail.data.effort ?? null) : null,
        riceScore: null,
      });
      break;
    }
    case "solution": {
      const detail = solutionDetailSchema.safeParse(body.detail ?? {});
      await db.insert(solutionDetails).values({
        id: detailId,
        nodeId,
        reach: detail.success ? (detail.data.reach ?? null) : null,
        impact: detail.success ? (detail.data.impact ?? null) : null,
        confidence: detail.success ? (detail.data.confidence ?? null) : null,
        effort: detail.success ? (detail.data.effort ?? null) : null,
        riceScore: null,
      });
      break;
    }
    case "assumption": {
      const detail = assumptionDetailSchema.safeParse(body.detail ?? {});
      await db.insert(assumptionDetails).values({
        id: detailId,
        nodeId,
        category: detail.success ? (detail.data.category ?? null) : null,
        isLeapOfFaith: detail.success ? (detail.data.isLeapOfFaith ?? false) : false,
        evidenceStrength: detail.success ? (detail.data.evidenceStrength ?? "none") : "none",
      });
      break;
    }
    case "experiment": {
      const detail = experimentDetailSchema.safeParse(body.detail ?? {});
      await db.insert(experimentDetails).values({
        id: detailId,
        nodeId,
        experimentType: detail.success ? (detail.data.experimentType ?? null) : null,
        hypothesis: detail.success ? (detail.data.hypothesis ?? null) : null,
        method: detail.success ? (detail.data.method ?? null) : null,
        successCriteria: detail.success ? (detail.data.successCriteria ?? null) : null,
        result: null,
        outcome: detail.success ? (detail.data.outcome ?? "pending") : "pending",
      });
      break;
    }
  }

  // Insert tree layout (position computed client-side by dagre)
  await db.insert(treeLayouts).values({
    id: layoutId,
    nodeId,
    positionX: 0,
    positionY: 0,
    collapsed: false,
  });

  // Fetch and return the created node with its detail
  const created = await db.query.nodes.findFirst({
    where: (n, { eq }) => eq(n.id, nodeId),
    with: {
      metricDetail: true,
      opportunityDetail: true,
      solutionDetail: true,
      assumptionDetail: true,
      experimentDetail: true,
      treeLayout: true,
    },
  });

  return NextResponse.json(JSON.parse(JSON.stringify(created)), { status: 201 });
}
