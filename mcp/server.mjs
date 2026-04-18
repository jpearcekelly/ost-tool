import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Configuration from environment
const BASE_URL = process.env.OST_BASE_URL || "https://ost-tool-production.up.railway.app";
const API_KEY = process.env.OST_API_KEY || "";

// ─── HTTP client ───

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json();
}

// ─── MCP Server ───

const server = new McpServer({
  name: "ost-tool",
  version: "1.0.0",
  description:
    "OST Tool — AI-powered Opportunity-Solution Tree for product discovery. " +
    "Implements the Continuous Discovery Habits (CDH) framework by Teresa Torres. " +
    "The tree hierarchy flows: Metric → Opportunity → Solution → Assumption → Experiment. " +
    "Same-type nesting is allowed (e.g., Metric → Metric for drill-downs).",
});

// ─── Tools ───

server.tool(
  "list_projects",
  "List all projects in the OST Tool",
  {},
  async () => {
    const projects = await api("/api/projects");
    return {
      content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
    };
  }
);

server.tool(
  "get_tree",
  "Get the full tree structure for a project as a nested hierarchy. " +
    "Returns nodes with their children recursively nested. " +
    "Each node includes its type, status, title, description, and type-specific details " +
    "(metric values, RICE scores, assumption categories, etc).",
  {
    projectId: z.string().describe("The project ID"),
  },
  async ({ projectId }) => {
    const tree = await api(`/api/projects/${projectId}/nodes?format=tree`);
    return {
      content: [{ type: "text", text: JSON.stringify(tree, null, 2) }],
    };
  }
);

server.tool(
  "list_nodes",
  "List nodes in a project with optional filtering. " +
    "Use type filter to get all opportunities, solutions, etc. " +
    "Use parentId filter to get children of a specific node. " +
    "Use parentId='null' to get root nodes only.",
  {
    projectId: z.string().describe("The project ID"),
    type: z
      .enum(["metric", "opportunity", "solution", "assumption", "experiment"])
      .optional()
      .describe("Filter by node type"),
    parentId: z
      .string()
      .optional()
      .describe("Filter by parent node ID. Use 'null' for root nodes."),
  },
  async ({ projectId, type, parentId }) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (parentId) params.set("parentId", parentId);
    const query = params.toString();
    const nodes = await api(
      `/api/projects/${projectId}/nodes${query ? `?${query}` : ""}`
    );
    return {
      content: [{ type: "text", text: JSON.stringify(nodes, null, 2) }],
    };
  }
);

server.tool(
  "get_node",
  "Get full details of a single node including its type-specific fields " +
    "(metric values, RICE scores, assumption category, experiment details, etc).",
  {
    nodeId: z.string().describe("The node ID"),
  },
  async ({ nodeId }) => {
    // Use the PATCH endpoint's GET equivalent — actually we need to use the project endpoint
    // For now, use the update endpoint to fetch by reading before updating
    // TODO: Add a dedicated GET /api/nodes/[id] endpoint
    // Workaround: list all nodes and filter
    const node = await api(`/api/nodes/${nodeId}`);
    return {
      content: [{ type: "text", text: JSON.stringify(node, null, 2) }],
    };
  }
);

server.tool(
  "create_node",
  "Create a new node in the tree. " +
    "The CDH hierarchy is: Metric → Opportunity → Solution → Assumption → Experiment. " +
    "Same-type nesting is allowed (e.g., Metric under Metric for metric drill-downs). " +
    "Only Metrics can be root nodes (parentId = null). " +
    "For all other types, provide a parentId to place it in the tree, " +
    "or omit parentId to put it in the holding pen (unplaced).",
  {
    projectId: z.string().describe("The project ID"),
    type: z
      .enum(["metric", "opportunity", "solution", "assumption", "experiment"])
      .describe("The node type"),
    title: z.string().describe("The node title"),
    description: z
      .string()
      .optional()
      .describe("Optional description or context for the node"),
    parentId: z
      .string()
      .optional()
      .describe(
        "Parent node ID. Required for non-metric types to place in tree. " +
          "Omit for root metrics or to place in holding pen."
      ),
    status: z
      .string()
      .optional()
      .describe(
        "Node status. Defaults vary by type: " +
          "metric=active, opportunity=identified, solution=proposed, " +
          "assumption=untested, experiment=planned"
      ),
  },
  async ({ projectId, type, title, description, parentId, status }) => {
    const body = {
      type,
      title,
      ...(description && { description }),
      ...(parentId && { parentId }),
      ...(status && { status }),
    };
    const node = await api(`/api/projects/${projectId}/nodes`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return {
      content: [
        {
          type: "text",
          text: `Created ${type} "${title}":\n${JSON.stringify(node, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "update_node",
  "Update an existing node's fields. Can update title, description, status, " +
    "or move it to a different parent (reparenting).",
  {
    nodeId: z.string().describe("The node ID to update"),
    title: z.string().optional().describe("New title"),
    description: z.string().optional().describe("New description"),
    status: z
      .string()
      .optional()
      .describe(
        "New status. Valid values depend on type: " +
          "metric: active/deprecated, " +
          "opportunity: identified/exploring/pursuing/parked, " +
          "solution: proposed/exploring/building/shipped/abandoned, " +
          "assumption: untested/testing/validated/invalidated, " +
          "experiment: planned/running/completed/abandoned"
      ),
    parentId: z
      .string()
      .optional()
      .describe("New parent node ID (reparenting)"),
  },
  async ({ nodeId, title, description, status, parentId }) => {
    const body = {};
    if (title !== undefined) body.title = title;
    if (description !== undefined) body.description = description;
    if (status !== undefined) body.status = status;
    if (parentId !== undefined) body.parentId = parentId;

    const node = await api(`/api/nodes/${nodeId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return {
      content: [
        {
          type: "text",
          text: `Updated node:\n${JSON.stringify(node, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "delete_node",
  "Delete a node and all its descendants from the tree. This is irreversible.",
  {
    nodeId: z.string().describe("The node ID to delete"),
  },
  async ({ nodeId }) => {
    await api(`/api/nodes/${nodeId}`, { method: "DELETE" });
    return {
      content: [{ type: "text", text: `Deleted node ${nodeId}` }],
    };
  }
);

server.tool(
  "create_project",
  "Create a new project to hold an Opportunity-Solution Tree.",
  {
    name: z.string().describe("Project name"),
    description: z.string().optional().describe("Project description"),
  },
  async ({ name, description }) => {
    const project = await api("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, ...(description && { description }) }),
    });
    return {
      content: [
        {
          type: "text",
          text: `Created project "${name}":\n${JSON.stringify(project, null, 2)}`,
        },
      ],
    };
  }
);

// ─── Start ───

const transport = new StdioServerTransport();
await server.connect(transport);
