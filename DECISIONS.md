# Architecture Decision Records

This document tracks key architectural decisions for the OST Tool. Each entry follows a lightweight ADR format: context, decision, consequences.

---

## ADR-001: Local-First SQLite

**Date:** 2026-04-13

**Context:** This is a solo-developer hobby project in early stages. We need a database that's fast to set up, requires zero infrastructure, and doesn't add operational complexity. At the same time, we don't want to paint ourselves into a corner if the tool later needs multi-user support.

**Decision:** Use SQLite via `better-sqlite3` with Drizzle ORM as the query layer.

**Consequences:**
- Zero infrastructure cost — the database is a file on disk
- Instant setup — no Docker, no database server, no connection strings
- Drizzle ORM provides a migration system and type-safe queries that work identically with Postgres, so upgrading later means changing only the driver configuration
- Single-user only for now — concurrent writes aren't a concern
- Portable — the entire project state is a single `.db` file that can be copied or backed up trivially

---

## ADR-002: React Flow for Tree Visualization

**Date:** 2026-04-13

**Context:** The tree is the central UI of this product. It's a directed acyclic graph (DAG) with multiple node types that can grow to 100+ nodes across business metrics, opportunities, solutions, assumptions, and experiments. Users need to zoom, pan, drag, collapse branches, and click nodes to edit them.

**Decision:** Use React Flow (`reactflow`) for the tree visualization, with semantic zoom behavior.

**Alternatives considered:**
- **D3.js** — maximum flexibility but requires building all interaction from scratch. 10x more code for the same result.
- **vis.js** — good for network graphs but weaker support for custom node rendering with React components.
- **Custom canvas/SVG** — interesting but premature optimization; React Flow can be replaced later if needed.

**Consequences:**
- Zoom, pan, drag, minimap, and controls come out of the box
- Each node type is a standard React component — full access to hooks, state, and the component library
- Semantic zoom (showing more/less detail based on zoom level) needs custom implementation on top of React Flow, but the primitives are there
- Large community and ecosystem (used by Stripe, among others)
- Bundle size is non-trivial (~150KB gzipped) but acceptable for a desktop-oriented tool

---

## ADR-003: AI Is Explicit + Proactively Curious

**Date:** 2026-04-13  
**Updated:** 2026-04-13

**Context:** The tool needs AI that adds value without adding latency or cost to every interaction. But purely on-demand AI misses a key opportunity: the tool can notice things that humans forget to check — stale statuses, missing evidence, unrecorded experiment results.

**Decision:** AI operates in two modes:

1. **On-demand analysis** (triggered by user action):
   - Score an opportunity (evaluate 4 CDH factors against evidence)
   - Gap analysis (identify thin spots in the tree)
   - Suggest assumptions (generate categorized assumptions for a solution)
   - Recommend what to work on (ranked list with confidence scores)

2. **Proactive check-ins** (triggered by time/staleness, delivered as suggestions):
   - Flag stale nodes: "This has been 'under construction' for 3 months — what's the status?"
   - Flag missing results: "You ran an experiment but never recorded results — what happened?"
   - Flag outdated metrics: "This metric hasn't been refreshed in 6 weeks."
   - Suggest research direction: "3 of your opportunities have no linked evidence."

Proactive check-ins are generated when the user opens the project (or on a configurable schedule), presented as a non-intrusive list of questions. They don't run in the background or incur costs when the tool isn't in use.

**Consequences:**
- No surprise API costs — AI runs when you open the project or click a button
- The tool maintains its own integrity over time — things don't silently go stale
- The "question" framing is important: the AI asks, it doesn't assert. "What's the status?" not "This is outdated, I'm archiving it."
- The tool still works without an API key — proactive features just don't appear

---

## ADR-004: RICE Scoring for Both Opportunities and Solutions

**Date:** 2026-04-13  
**Updated:** 2026-04-13 — changed from CDH 4-factor to RICE

**Context:** We need a prioritization framework that works at both the opportunity level ("which problem to pursue?") and the solution level ("which approach to try?"). Teresa Torres' 4-factor model (size/market/company/customer) is good for strategic thinking but doesn't produce a directly actionable ranking. RICE (Reach, Impact, Confidence, Effort) is more standard in product teams, more intuitive, and produces a single comparable score.

**Decision:** Use RICE scoring as deterministic code: `score = (Reach * Impact * Confidence%) / Effort`. Applied to both opportunities and solutions.

- **Reach**: estimated users affected (count or %) — finger-in-the-air is fine
- **Impact**: 1-5 scale, how much this moves the needle per user
- **Confidence**: 10-100%, how sure are we about reach and impact. For solutions, this evolves as assumptions are tested.
- **Effort**: person-weeks or T-shirt sizes (S=1, M=2, L=4, XL=8)

AI assists in evaluating each factor (e.g., "Based on 12 interview mentions, reach might be higher than you estimated") but does not set scores directly. Incomplete scores are permitted — the tool shows what's missing.

**Consequences:**
- One framework for both levels of the tree — simple mental model
- Scores are explicitly approximate ("finger in the air") — the value is relative ranking, not absolute numbers
- Solution confidence naturally evolves: starts low for a proposal, rises as assumptions are validated, drops if assumptions are invalidated
- The ranking in list view directly reflects RICE scores — you can see exactly why something is prioritized
- AI can spot when scores feel inconsistent with evidence ("you scored this as low reach but 8 of 12 interviewees mentioned it")

---

## ADR-005: Unified Tree with Typed Nodes

**Date:** 2026-04-13  
**Supersedes:** Original ADR-005 ("Single Tree Per Project")

**Context:** Real product discovery trees span from business metrics (Total ARR) through sub-metrics (Fin attach rate) through opportunities through solutions through experiments. In Miro, this has to be split across multiple boards because one canvas can't handle the scale. The whole point of this tool is that it doesn't force that split.

**Decision:** One project = one unified tree. The tree is modeled as a single self-referencing `Node` table with a `type` discriminator. Type-specific data lives in detail tables joined to each node.

The tree has three functional zones (see ADR-006), but they're not separate data structures — they're regions of one tree where the node types happen to change.

**Consequences:**
- No artificial boundary between metrics and discovery — it's all one tree
- The tree can be as deep or shallow as needed — a small project might skip the metrics layer entirely
- Querying "all descendants of Fin attach rate" is a simple recursive query
- Navigation is a zoom/drill problem, not a board-switching problem
- The data model is flexible enough that users can structure their tree however makes sense, not how the schema forces them to

---

## ADR-006: Three Functional Zones

**Date:** 2026-04-13

**Context:** While the tree is one unified data structure (ADR-005), different parts of it serve very different functions and pull data from different sources. The user experience in each zone is distinct.

**Decision:** The UI recognizes three zones based on node type, each with different interaction patterns and data integrations:

**1. Metrics Zone** (node type: `metric`)
- Mostly read-only scaffolding, set up quarterly
- Auto-refreshes values from connected data sources (Snowflake, dashboards)
- Shows current vs target values, trend direction
- Interaction: browse, drill down, occasionally restructure

**2. Discovery Zone** (node types: `opportunity`)
- The daily workspace — high-churn, manually maintained
- Pulls in evidence from interviews, surveys, support data, analytics
- Opportunities are scored, prioritized, and linked to evidence
- Interaction: add opportunities, link data points, score, prioritize, direct research

**3. Solution Zone** (node types: `solution`, `assumption`, `experiment`)
- Focused on ideation, building, and validation
- Links out to external artifacts: Figma designs, prototypes, builds, experiment dashboards
- Pulls in experiment results where possible (A/B test dashboards, analytics)
- Tracks the assumption lifecycle: identify → test → validate/invalidate
- Interaction: ideate solutions, map assumptions, design experiments, record results

**Consequences:**
- The sidebar/detail panel adapts to the zone — metrics show data connections, opportunities show evidence, solutions show design links and experiment results
- Each zone can have its own "add" actions (add metric vs add opportunity vs add solution)
- Theming/color-coding by zone helps orientation (similar to the purple/green/blue in the user's Miro boards)
- A user working on discovery can focus on the middle zone while still having context from metrics above and solutions below
- Maps naturally to the Double Diamond: you live in different zones depending on whether you're diverging (discovery) or converging (solutions)

---

## ADR-010: Journey Stage Lives on Metrics, Inherited Downward

**Date:** 2026-04-13  
**Updated:** 2026-04-13

**Context:** Sibling nodes need a meaningful horizontal order. The existing practice is left-to-right by user lifecycle position: early-journey (go to market, onboarding, conversion) on the left, late-journey (activation, retention, referral) on the right. But this ordering is naturally encoded in the *metrics* — activation metrics come before conversion metrics, which come before retention metrics. Opportunities and solutions inherit their journey position from whichever metric branch they descend from.

**Decision:** `journey_stage` is a field on `MetricDetail` only, with values: `go_to_market`, `onboarding`, `conversion`, `activation`, `retention`, `referral`. All descendants (opportunities, solutions, assumptions, experiments) inherit the journey stage from their nearest metric ancestor. The auto-layout algorithm uses this for horizontal sibling ordering at every level.

**Consequences:**
- You never manually tag an opportunity with a journey stage — it's inferred from its position in the tree
- The metrics layer is where the user journey is defined; the discovery and solution layers just follow
- The tree visually communicates lifecycle position at every depth — early-journey branches cluster left, late-journey branches cluster right
- AI can use inherited journey stage when estimating reach ("this descends from an onboarding metric, so reach is effectively all new users")
- If a metric doesn't have a journey stage set, descendants fall back to `sort_order` for horizontal positioning

---

## ADR-008: Auto-Layout, No Manual Positioning

**Date:** 2026-04-13

**Context:** In Miro, 80% of the time goes to layout management — dragging nodes, drawing connectors, making space for new branches. The tree should be a visualization of your data structure, not a manually arranged canvas. Users should spend 100% of their time thinking, not positioning.

**Decision:** The tree uses automatic layout via a DAG layout algorithm (dagre or elkjs). When nodes are added, removed, or branches collapse/expand, the layout recomputes. Users never drag nodes to position them.

React Flow handles rendering, zoom, pan, collapse, and selection — but the layout engine decides where everything goes.

**Consequences:**
- Zero time spent on layout management — the tree "grows organically" as data is added
- Consistent, readable tree structure at all times — no messy manual arrangements
- Adding a node is a data operation, not a spatial one — add it to the tree, it appears in the right place
- We lose the ability to manually arrange nodes for aesthetic reasons — acceptable tradeoff since the layout algorithm should produce good results
- Animations on layout changes will be important to maintain orientation (nodes shouldn't jump, they should slide)

---

## ADR-009: Dual View — Tree + Prioritized List

**Date:** 2026-04-13

**Context:** The tree shows relationships and structure. But when making decisions ("what should I work on?"), you need a ranked, actionable view. These are two lenses on the same data — you need both, at different moments.

**Decision:** The main view toggles between Tree View and List View. They're interlinked:

- **Tree View**: auto-layout tree, zoom/pan/collapse. Shows structure and relationships. Click a node to select it.
- **List View**: ranked opportunities by composite score, with drill-down into solutions per opportunity. Shows priority and action. Click an item to highlight it in the tree.

Selecting something in one view highlights it in the other. The working outcome (e.g., "Fin Attach Rate") can be selected via a dropdown — this filters the list and focuses the tree.

**Consequences:**
- Two very different interaction patterns (spatial navigation vs. sequential scanning) for different tasks
- The list view surfaces AI recommendations naturally — it's already a ranked list
- List view makes the scoring system tangible — you see exactly why things are ordered the way they are
- Need to keep both views in sync — selecting in one reflects in the other
- The list view drill-down (opportunities → solutions → assumptions) mirrors the tree depth but in a scannable format

---

## ADR-013: Right Panel — AI Agent or Node Detail, Never Both

**Date:** 2026-04-13

**Context:** Users need to see detailed information about a selected node (data points, RICE breakdown, assumptions, external links, thumbnails) without cluttering the tree. They also need the AI sidebar for chat, intake triage, and recommendations. Both can't occupy the screen simultaneously without making the tree too narrow.

**Decision:** The right side of the screen is a single panel with three states:

1. **AI Agent** — chat, inbox triage results, staleness alerts, recommendations
2. **Node Detail** — full information for the selected node (description, RICE breakdown, data points, assumptions, external links, thumbnail)
3. **Collapsed** — panel hidden, tree gets full width

Clicking a node switches to Node Detail. A tab/shortcut switches to AI Agent. Escape collapses. Small tabs at the panel top allow switching without closing.

**Consequences:**
- Clean layout — never more than two columns (tree + panel)
- Node Detail can be as rich as needed without polluting the tree view
- The tree cards stay compact: title, RICE score, data point count, status badge, optional thumbnail
- AI agent and detail are contextually exclusive — you're either investigating a node or talking to the AI
- The panel is the "deep dive" surface; the tree is the "spatial awareness" surface

---

## ADR-014: Visual Confidence — Evidence Level on Tree Cards

**Date:** 2026-04-13

**Context:** Not all opportunities are equal in confidence. Some are backed by 8 interview quotes, others are hypotheses from a brainstorm with zero evidence. The tree should visually communicate this distinction without requiring users to read scores or open a detail panel.

**Decision:** Tree cards use visual weight to communicate evidence level:

- **Solid border, full opacity** — node has linked data points (evidenced)
- **Dashed border, reduced opacity** — node has zero data points (hypothesized)
- **Data point count badge** always visible on opportunity and solution cards (e.g., `7📋`)
- RICE score shown if scored, `—` if not yet scored

The dashed/faded treatment is a visual nudge: "this needs investigation." It doesn't block anything — you can still score and prioritize hypothesized opportunities — but it's always visible that the evidence is thin.

**Consequences:**
- At a glance in free roam, you can see which branches are well-evidenced and which are speculative
- Avoids over-reliance on color coding (colors run out, and have accessibility issues)
- The "evidence count" badge is the simplest possible indicator that scales from 0 to many
- Encourages the CDH practice of grounding decisions in evidence — the tool gently pressures you to validate hypotheses
- AI gap analysis can reference this: "You have 4 hypothesized opportunities with no evidence — consider investigating these in your next round of interviews"

---

## ADR-012: Two Navigation Modes — Free Roam and Drill Down

**Date:** 2026-04-13

**Context:** The tree can grow to 100+ nodes across multiple levels. Users need two fundamentally different ways to interact with it: seeing the whole picture ("walk the shop floor") and focusing on a specific branch ("work on this"). These serve different cognitive needs — peripheral awareness vs. focused work.

**Decision:** The tree view has two modes:

**Free Roam** — the full tree, auto-laid-out, no node selected. Compact nodes (title + status + health badges). Semantic zoom: as you zoom in physically, nodes expand to show more detail. Purpose: notice patterns, spot gaps, get a feel for the whole opportunity space.

**Drill Down** — select any node, it becomes the root. Everything beneath it is fully visible. Above it: a **breadcrumb ancestry trail** showing direct ancestors with their key values (e.g., "Total ARR ($X) › Fin ARR ($Y) › Fin attach rate (22.42%, target 30%)"). Purpose: focused work on a specific branch with full context for *why* it matters.

Navigation: click any node in free roam to drill down. Click "full tree" or a keyboard shortcut to return. Click any breadcrumb ancestor to re-scope. Focus bookmarks provide quick jumps to your team's working areas.

The list view is always scoped to the current context: in drill-down, it shows ranked items under the focused node; in free roam, it shows everything.

**Consequences:**
- Free roam gives "shop floor" awareness that no list-based tool provides
- Drill-down + breadcrumb answers "what am I working on and why does it matter?" in one screen
- The breadcrumb is a "why chain" from daily work to company-level metrics — useful for stakeholder alignment too
- Need smooth transitions between modes (animations, not jarring view switches)
- Semantic zoom in free roam requires careful design — what shows at each zoom level?

---

## ADR-011: Tree with Cross-Links, Not a Graph

**Date:** 2026-04-13

**Context:** Real metrics influence each other in ways a pure tree can't capture. "Fin attach rate" and "Fin Resolution rate" are siblings in the tree but causally linked — better resolution quality drives higher attach rate. Solutions in one branch often impact metrics in another. We need to represent this without breaking the tree structure.

**Decision:** The hierarchy is a strict tree (one primary parent per node) for layout and navigation. Non-hierarchical relationships are captured as **cross-links** (`NodeCrossLink`) — typed edges that say "this node also influences/depends on/relates to that node." Cross-links are annotations, not structural.

**Consequences:**
- Tree layout stays clean and navigable — no tangled graph
- Cross-links surface relevant context: "This solution may also impact: Fin Resolution rate"
- AI can use cross-links for smarter recommendations: "Improving resolution quality would benefit both your primary and secondary focus metrics"
- Cross-links are optional — you can ignore them entirely and the tree still works
- Does not attempt to model full causal graphs — that's a different (and much harder) problem

---

## ADR-007: External Links as First-Class Concept

**Date:** 2026-04-13

**Context:** Product discovery artifacts don't all live in one tool. Designs live in Figma, prototypes on staging URLs, experiment dashboards in internal tools, builds in GitHub. The tree needs to reference these without trying to replace them.

**Decision:** Any node can have typed external links: `figma`, `prototype`, `build`, `dashboard`, `document`, `other`. These are displayed as quick-access chips on the node, not hidden in a detail panel.

**Consequences:**
- The tool becomes a hub that connects to where work actually lives, not a walled garden
- Figma links can potentially show thumbnail previews (Figma API)
- Dashboard links for experiments could potentially pull live data (future: read metrics from linked dashboards)
- Low implementation cost — it's just a URL + type + label per link
