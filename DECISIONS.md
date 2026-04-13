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

**Context:** The Opportunity-Solution Tree is the central UI of this product. It's a directed acyclic graph (DAG) with 5 distinct node types, and users need to zoom, pan, drag, collapse branches, and click nodes to edit them. We need a library that handles the canvas interaction complexity so we can focus on the domain-specific node rendering.

**Decision:** Use React Flow (`reactflow`) for the tree visualization.

**Alternatives considered:**
- **D3.js** — maximum flexibility but requires building all interaction from scratch (zoom, pan, drag, selection). 10x more code for the same result.
- **vis.js** — good for network graphs but weaker support for custom node rendering with React components.
- **Custom canvas/SVG** — interesting but premature optimization; React Flow can be replaced later if needed.

**Consequences:**
- Zoom, pan, drag, minimap, and controls come out of the box
- Each node type (Outcome, Opportunity, Solution, Assumption, Experiment) is a standard React component — full access to hooks, state, and the component library
- Large community and ecosystem (used by Stripe, among others)
- Bundle size is non-trivial (~150KB gzipped) but acceptable for a desktop-oriented tool
- We're coupled to React Flow's layout model, but their API is stable and well-documented

---

## ADR-003: AI Is Explicit, Not Ambient

**Date:** 2026-04-13

**Context:** The user wants the tool to be "efficient without tons of AI inputs" but also "powered by AI" when needed. We need to find the right balance — AI should add value without adding latency, cost, or unpredictability to every interaction.

**Decision:** AI features are triggered exclusively by user action (button clicks), never automatically. The tool works fully without an Anthropic API key configured.

**AI-powered features (all opt-in):**
1. **Score an opportunity** — user clicks "AI Score" on an opportunity node; Claude evaluates the 4 scoring factors based on linked evidence
2. **Gap analysis** — user clicks "Find Gaps" at the project level; Claude analyzes the tree structure and identifies thin spots
3. **Suggest assumptions** — user clicks "Generate Assumptions" on a solution; Claude produces categorized assumptions based on the solution description
4. **Recommend focus** — user clicks "What should I work on?"; Claude recommends the highest-impact opportunity given the business outcome

**Consequences:**
- No surprise API costs — users control when AI runs
- No latency on normal interactions (adding nodes, editing, navigating)
- The tool is useful even without an API key — a conscious choice to make the CDH framework valuable on its own
- Users must know to ask for AI help — we'll need clear UI affordances (buttons, not hidden features)
- AI responses can be cached per node state to avoid redundant calls

---

## ADR-004: CDH Scoring Model Is Deterministic Code

**Date:** 2026-04-13

**Context:** Teresa Torres defines a 4-factor opportunity scoring model: opportunity size, market factors, company impact, and customer factors. Each factor is a judgment call by the product team. We need to decide whether scoring is fully AI-driven or a structured human process.

**Decision:** The scoring rubric is implemented as deterministic code (weighted average of 4 factors, each rated 1-5 by the user). AI assists the user in *evaluating* each factor (e.g., "Based on your interview data, 12 of 15 participants mentioned this pain point, suggesting a size score of 4-5") but does not set the score directly.

**Consequences:**
- Scores are reproducible and explainable — the user can see exactly why an opportunity scored 4.2
- AI adds evidence-based reasoning without replacing human judgment
- The scoring formula can be customized per project (e.g., different factor weights) without retraining anything
- Users retain ownership of prioritization decisions, which is philosophically aligned with CDH ("the product trio decides")

---

## ADR-005: Single Tree Per Project

**Date:** 2026-04-13

**Context:** In the CDH framework, an Opportunity-Solution Tree is rooted in a single desired business outcome. A team might be working on multiple outcomes simultaneously. We need to decide whether one project can contain multiple trees.

**Decision:** One project = one business outcome = one tree. Users create separate projects for separate outcomes.

**Consequences:**
- Simpler data model — no need for a "tree" entity between project and outcome
- Clear mental model — "open a project" means "look at one outcome's discovery work"
- Users who work on multiple outcomes see a project list, not a tree-of-trees
- Cross-outcome analysis (e.g., "does this solution help with both retention AND activation?") would require a future cross-project view — acceptable tradeoff for MVP simplicity
