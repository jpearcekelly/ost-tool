# Data Model

This document describes the core entities and their relationships. This is the source of truth for the data design until the Drizzle schema (`src/db/schema.ts`) is created, at which point that becomes authoritative.

## Design Philosophy: Unified Tree with Typed Nodes

The tree is one continuous structure — from "Total ARR" down to individual experiments. There is no artificial boundary between metrics and discovery. Every item in the tree is a **node** with a type, a parent, and type-specific data.

This is modeled as a single `Node` table with a `type` discriminator, plus type-specific detail tables. This avoids the rigidity of separate entity hierarchies and allows the tree to be as deep or shallow as reality demands.

## Entity Relationship Diagram

```
Project
  │
  ├── Node (self-referencing tree, typed)
  │     type: metric | opportunity | solution | assumption | experiment
  │     │
  │     ├── MetricDetail (1:1, when type = metric)
  │     ├── OpportunityDetail (1:1, when type = opportunity)
  │     ├── SolutionDetail (1:1, when type = solution)
  │     ├── AssumptionDetail (1:1, when type = assumption)
  │     └── ExperimentDetail (1:1, when type = experiment)
  │
  ├── ExternalLink (1:many → any Node)
  │
  ├── DataPoint (1:many)
  │     │
  │     └── DataPointLink (many:many → any Node)
  │
  ├── NodeOwner (many:many → Node × User)
  │
  └── TreeLayout (1:many, stores visual positions)
```

---

## Core Entities

### Project

The top-level container. One project = one complete tree from metrics to experiments.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| name | string | e.g., "Fin Resolutions Q2 2026" |
| description | text | Optional context about the initiative |
| created_at | timestamp | |
| updated_at | timestamp | |

### Node

The universal tree node. Every item in the tree — whether it's "Total ARR" or "Prototype test with 5 users" — is a Node.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → Project |
| parent_id | uuid | Nullable FK → Node (null = root node) |
| type | enum | `metric`, `opportunity`, `solution`, `assumption`, `experiment` |
| title | string | Display name |
| description | text | Optional longer context |
| status | enum | See status values per type below |
| sort_order | integer | Position among siblings (used when journey_stage inheritance produces ties) |
| created_at | timestamp | |
| updated_at | timestamp | |

**Status values by type:**

| Node type | Statuses |
|-----------|----------|
| metric | `active`, `deprecated` |
| opportunity | `identified`, `exploring`, `pursuing`, `parked` |
| solution | `proposed`, `exploring`, `building`, `shipped`, `abandoned` |
| assumption | `untested`, `testing`, `validated`, `invalidated` |
| experiment | `planned`, `running`, `completed`, `abandoned` |

### MetricDetail

Type-specific fields for metric nodes. Metrics form the top of the tree — the scaffolding that's mostly read-only and auto-refreshed from data sources.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| node_id | uuid | FK → Node (where type = metric) |
| metric_type | enum | `business`, `product`, `traction` (per CDH classification) |
| current_value | decimal | Nullable — last known value |
| target_value | decimal | Nullable — what we're trying to hit |
| unit | string | e.g., "%", "$", "count", "rate" |
| source_type | enum | `manual`, `snowflake`, `api` |
| source_config | json | Connection details for auto-refresh (query, dashboard URL, etc.) |
| last_refreshed_at | timestamp | Nullable — when the value was last pulled |
| refresh_frequency | enum | `manual`, `daily`, `weekly` |
| journey_stage | enum | Nullable. `go_to_market`, `onboarding`, `conversion`, `activation`, `retention`, `referral`. Determines horizontal position among sibling metrics. All descendant nodes (opportunities, solutions, etc.) inherit this for their own horizontal ordering. |

### OpportunityDetail

Type-specific fields for opportunity nodes. Scored using the RICE framework.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| node_id | uuid | FK → Node (where type = opportunity) |
| source | enum | `interview`, `survey`, `analytics`, `feedback`, `assumption` |
| reach | integer | Nullable. Estimated number of users affected per quarter (or % of user base) |
| impact | integer | 1-5: how much this moves the target metric per user (1=minimal, 5=massive) |
| confidence | integer | 10-100%: how sure are we about reach and impact estimates? |
| effort | decimal | Nullable. Estimated person-weeks, or use T-shirt sizes mapped to numbers (S=1, M=2, L=4, XL=8) |
| rice_score | decimal | Computed: `(reach * impact * confidence%) / effort`. Nullable if inputs are incomplete. |

**RICE scoring:** This is explicitly finger-in-the-air estimation. The value isn't in the absolute number — it's in the relative ranking. An opportunity scoring 150 vs. 80 tells you where to look first, not that one is exactly 1.875x better.

Incomplete scores are fine — if you only have impact and confidence but not reach, the tool shows what's missing and the AI can help estimate based on linked evidence.

### SolutionDetail

Type-specific fields for solution nodes. CDH recommends at least 3 solutions per opportunity. Also scored with RICE — same framework at a different level of the tree.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| node_id | uuid | FK → Node (where type = solution) |
| reach | integer | Nullable. Often inherited from the parent opportunity's reach. |
| impact | integer | 1-5: how much of the opportunity's potential does this solution capture? |
| confidence | integer | 10-100%: how sure are we this solution works? Increases as assumptions are validated. |
| effort | decimal | Nullable. Person-weeks or T-shirt size. |
| rice_score | decimal | Computed: `(reach * impact * confidence%) / effort`. |

**Solution confidence evolves:** A newly proposed solution might have 20% confidence. As you test assumptions and validate them, confidence rises. If a leap-of-faith assumption is invalidated, confidence drops. This is how experiment results feed back into prioritization — the RICE score changes as you learn.

### AssumptionDetail

Type-specific fields for assumption nodes. The assumption lifecycle (identify → test → validate/invalidate) is a core workflow.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| node_id | uuid | FK → Node (where type = assumption) |
| category | enum | `desirability`, `usability`, `feasibility`, `viability` |
| is_leap_of_faith | boolean | True if high importance + weak evidence — test these first |
| evidence_strength | enum | `none`, `weak`, `moderate`, `strong` |

### ExperimentDetail

Type-specific fields for experiment nodes. Experiments validate or invalidate assumptions. Results feed back into the tree.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| node_id | uuid | FK → Node (where type = experiment) |
| experiment_type | enum | `prototype_test`, `concierge`, `wizard_of_oz`, `survey`, `data_analysis`, `one_question`, `other` |
| hypothesis | text | "We believe [assumption]. We'll know we're right if [criteria]." |
| method | text | How the experiment will be conducted |
| success_criteria | text | Measurable threshold for validation |
| result | text | Nullable — what actually happened |
| outcome | enum | `pending`, `validated`, `invalidated`, `inconclusive` |
| started_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |

---

## Supporting Entities

### DataPoint

A piece of evidence from research. Can be linked to any node in the tree.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → Project |
| type | enum | `interview`, `survey`, `analytics`, `feedback` |
| content | text | The evidence — a quote, a stat, a research note |
| source | string | e.g., "Interview with User #23", "Snowflake query" |
| participant_id | string | Nullable — anonymized identifier |
| collected_at | date | When the data was collected |
| created_at | timestamp | |

### DataPointLink

Links data points as evidence to any node. A single data point can support multiple nodes (e.g., one interview quote might be relevant to two opportunities).

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| data_point_id | uuid | FK → DataPoint |
| node_id | uuid | FK → Node |
| relevance_note | text | Optional — why this evidence matters for this node |

### NodeOwner

Tracks who owns or is assigned to a branch of the tree (the "J" avatar on nodes).

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| node_id | uuid | FK → Node |
| user_id | uuid | FK → User (future) |
| display_name | string | e.g., "J" or "James" — used before full user system exists |
| role | enum | `owner`, `contributor`, `reviewer` |

### TreeLayout

Stores the visual position of each node in the React Flow canvas. Decoupled from domain data so layout is independent.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| node_id | uuid | FK → Node |
| position_x | float | React Flow x coordinate |
| position_y | float | React Flow y coordinate |
| collapsed | boolean | Whether child nodes are hidden in the canvas |

---

### NodeCrossLink

Captures non-hierarchical relationships between nodes — when a node influences or is related to another node outside its direct ancestry. The tree structure uses `parent_id` for the primary hierarchy; cross-links capture the rest.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| source_node_id | uuid | FK → Node — the node that has the influence |
| target_node_id | uuid | FK → Node — the node being influenced |
| relationship | enum | `influences`, `depends_on`, `related_to`, `duplicates` |
| description | text | Nullable — e.g., "Better resolution quality drives higher attach rate" |
| created_at | timestamp | |

**Usage examples:**
- A solution under "Fin attach rate" `influences` "Fin Resolution rate" (improving one metric helps another)
- An opportunity under "Monthly active logos" `related_to` an opportunity under "Fin attach rate" (overlapping user need)
- An assumption `depends_on` another assumption in a different branch

Cross-links are displayed as subtle annotations on nodes ("Also impacts: Fin Resolution rate ↗") and as a list in the detail panel. They don't affect tree layout — the primary parent determines position.

### FocusBookmark

Marks specific nodes as team focus areas — the "red border" nodes in the Miro board. These are quick-access entry points into the tree.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → Project |
| node_id | uuid | FK → Node |
| label | string | e.g., "Team Self Serve Primary Focus", "North Star Metric" |
| is_default_view | boolean | If true, the tree opens focused on this node |
| created_at | timestamp | |

### ExternalLink

Typed links to external artifacts — Figma designs, prototypes, dashboards, builds, documents. Any node can have multiple links. Displayed as quick-access chips on the node.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| node_id | uuid | FK → Node |
| link_type | enum | `figma`, `prototype`, `build`, `dashboard`, `document`, `github`, `other` |
| url | string | The external URL |
| label | string | Display name, e.g., "Main Figma file", "A/B test dashboard" |
| created_at | timestamp | |

### NodeThumbnail

Visual thumbnail for a node — rendered on the node card in both free roam and drill-down views. Can be sourced from Figma API (auto-generated from a linked Figma file) or manually uploaded.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| node_id | uuid | FK → Node |
| source_type | enum | `figma_api`, `upload`, `url_screenshot` |
| source_link_id | uuid | Nullable FK → ExternalLink (if generated from a Figma link) |
| image_url | string | URL to the thumbnail image (cached Figma render, or uploaded file path) |
| figma_file_key | string | Nullable — extracted from Figma URL, used for API refresh |
| figma_node_id | string | Nullable — extracted from Figma URL, specifies which frame to render |
| last_refreshed_at | timestamp | When the thumbnail was last fetched/updated |
| created_at | timestamp | |

**Figma thumbnail flow:** When a user adds a Figma external link to a node, the tool parses the file key and node ID from the URL, calls the Figma Images API to render a PNG, caches it, and displays it on the node card. Thumbnails can be refreshed on demand or periodically (Figma designs change frequently).

**Manual upload flow:** User drags an image onto a node or uploads via the detail panel. Useful for live product screenshots, whiteboard photos, or anything without a Figma link.

---

---

## Inbox & Holding Pen

### InboxItem

Raw material uploaded or pasted into the tool, before AI triage processes it into tree nodes.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → Project |
| source_type | enum | `upload`, `paste`, `slack_thread`, `interview_transcript`, `research_pdf` |
| raw_content | text | The original text content |
| file_path | string | Nullable — path to uploaded file if applicable |
| status | enum | `pending`, `triaged`, `dismissed` |
| created_at | timestamp | |

### InboxSuggestion

AI-generated suggestions from processing an inbox item. Each suggestion proposes creating a node or linking to an existing one.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| inbox_item_id | uuid | FK → InboxItem |
| suggestion_type | enum | `create_opportunity`, `create_solution`, `create_data_point`, `link_to_existing` |
| suggested_title | string | Proposed title for the new node |
| suggested_parent_id | uuid | Nullable FK → Node — where AI thinks this should go |
| suggested_node_type | enum | `opportunity`, `solution`, `assumption` |
| reasoning | text | AI's explanation for the placement |
| status | enum | `pending`, `approved`, `edited`, `rejected` |
| created_node_id | uuid | Nullable FK → Node — populated after approval |

### HoldingPenItem

Items that have been triaged but don't have a clear home in the tree yet. The AI periodically scans these against new tree activity to find matches.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → Project |
| node_id | uuid | FK → Node — the un-placed node (exists in DB but has no parent) |
| reason | text | Why it's in the holding pen, e.g., "No matching opportunity found" |
| last_match_scan | timestamp | When the AI last tried to find a match |
| created_at | timestamp | |

---

## AI-Related Concepts (Not Stored, Generated on Demand)

These are computed by AI when requested, not persisted:

- **Gap Analysis** — scans the tree for: opportunities with no evidence, solutions with no assumptions, assumptions with no experiments, experiments with no results
- **Staleness Report** — identifies nodes where `status` suggests active work but `updated_at` is old (e.g., "building" for 3+ months)
- **Opportunity Ranking** — ranked list of opportunities by composite score, with confidence levels and identified risks/assumptions that need testing
- **Research Agenda** — based on gaps, suggests what to investigate in the next round of interviews
- **Holding Pen Matching** — scans un-placed items against tree structure and new activity to suggest connections

---

## Future Entities (Not in MVP)

- **User** — full user model for authentication and permissions (MVP uses display_name only)
- **InterviewCadence** — tracks weekly interviewing habit
- **IntegrationConnection** — stores credentials for Snowflake, Tableau, etc.
- **ActivityLog** — tracks who changed what and when (audit trail for collaboration)
- **StakeholderSnapshot** — generated "show your work" summary for a point in time
