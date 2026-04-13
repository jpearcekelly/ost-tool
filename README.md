# OST Tool

**An AI-powered product discovery tool that connects business metrics to user opportunities to solutions — in one navigable tree.**

## The Problem

Product teams practicing continuous discovery end up maintaining their thinking in Miro boards, sticky notes, and spreadsheets. It breaks down in predictable ways:

- **The tree gets too big for one canvas.** You end up splitting your metrics tree from your opportunity-solution tree, connected by "See OST here" links. One continuous line of reasoning becomes fragmented across boards.
- **Evidence gets lost.** Interview quotes live in Miro comments, Figma annotations, Slack threads, and Google Docs. When someone asks "why are we working on this?" you have to reconstruct the reasoning from scattered artifacts.
- **Everything goes stale.** You mark a solution as "under construction" with an emoji, and three months later nobody's updated it. Metrics are pulled manually and go out of date. Nobody nudges you to close the loop on experiments.
- **Sharing is painful.** When you need to align with stakeholders, PMs, or other designers, you walk them through a Miro board that requires an oral tour guide. The artifact can't speak for itself.

## The Solution

OST Tool models your entire product discovery process as **one unified tree** — from top-level business metrics all the way down to individual experiments:

```
Total ARR                                    ← metrics zone (auto-refreshing)
  └── Fin ARR
       └── Fin logos
            └── Fin attach rate (22.42%)     ← your working outcome
                 ├── During cardless trial        ← opportunities zone (your daily workspace)
                 │    ├── Contextual discovery banner copy    ← solutions
                 │    │    ├── Users will notice the banner (desirability) ← assumptions
                 │    │    └── Prototype test with 5 users               ← experiments
                 │    ├── Trial contents dialog 🚧
                 │    └── Longer evaluation period tactics
                 └── Post-trial follow-up
                      └── ...
```

No artificial split between "the metrics part" and "the discovery part." The tree is as deep as reality demands, and the UI handles progressive disclosure — zoom out to see the big picture, zoom in to your working branch.

### Three zones, one tree

| Zone | You do | Data flows from | Tool helps by |
|------|--------|----------------|---------------|
| **Metrics** (top) | Browse, drill down. Set up quarterly. | Snowflake, Tableau, dashboards → auto-pull daily/weekly | Keeping values current, flagging when metrics move |
| **Discovery** (middle) | Add opportunities, link evidence, score, prioritize, direct research | Interviews, Slack, research PDFs, support data → uploaded/pasted in | AI-parsing uploads, suggesting tree placement, finding gaps |
| **Solutions** (bottom) | Ideate, link to Figma/prototypes, track assumptions, run experiments | Figma, builds, experiment dashboards → linked out, results pulled in | Tracking status lifecycle, closing the experiment loop |

### Feed it raw material, get structured discovery

Your daily workflow isn't "open the tree and carefully edit nodes." It's: you did an interview, you have notes, you dump them in. The tool does the rest:

1. **Upload** an interview snapshot, a research PDF, a Slack thread, a brainstorm output
2. **AI parses** the input and extracts potential opportunities, insights, or solution ideas
3. **AI suggests placement**: *"I found 2 opportunities in this interview — one fits under 'Fin attach rate', the other might be new. Here's a solution idea that could address an existing opportunity."*
4. **You approve, edit, or redirect** — the tree grows organically from your research

Things that don't fit anywhere go to a **holding pen** — un-placed solutions, orphan data points, interesting-but-unclear opportunities. The AI periodically scans it: *"You added 'automated onboarding email sequence' 2 weeks ago. A new opportunity just came in about users forgetting the product after signup — could this be a match?"*

### AI that asks questions, not just answers them

The AI doesn't just analyze when you ask — it notices when things need attention:

- *"Fin attach rate was 22.42% in June — do you have an updated number?"*
- *"'Trial contents dialog' has been under construction for 3 months — what's the status?"*
- *"You ran an experiment on the discovery banner but never recorded results — what happened?"*
- *"You have 5 opportunities but only 1 has linked evidence. Where should you direct your next interview?"*
- *"A solution in your holding pen might match a new opportunity — want to connect them?"*

This turns a passive canvas into an **active collaborator** that maintains the integrity of your discovery work.

## Who Is This For?

Product trios (PM + Designer + Engineer) who practice continuous discovery and want to move beyond Miro. The first user is a staff product designer who needs to:

- Understand the opportunity space and decide where to direct research and design effort
- Align with PMs, other designers, and leadership on what to work on and why
- Track the full lifecycle: opportunity → solution → assumption → experiment → result → back to prioritization
- Keep a living record of product reasoning that doesn't depend on one person's memory

## Key Features

| Feature | Description |
|---------|-------------|
| **Unified Tree** | One continuous tree from business metrics to experiments — no artificial splits |
| **Semantic Zoom** | Zoomed out: metrics with summary badges. Zoomed in: opportunities, solutions, assumptions. Detail adapts to focus. |
| **Typed Nodes** | Metric, Opportunity, Solution, Assumption, Experiment — each with type-specific fields, statuses, and behaviors |
| **AI Intake & Triage** | Upload interviews, research PDFs, Slack threads. AI extracts opportunities and suggests tree placement. You approve. |
| **Holding Pen** | Un-placed solutions, orphan data points, and unclear opportunities live here until the AI finds a match |
| **Node Ownership** | Assign team members to branches — see who's responsible for what |
| **Evidence Linking** | Attach interview quotes, analytics data, and research findings to any node |
| **External Links** | Connect nodes to Figma designs, prototypes, builds, dashboards — the tool is a hub, not a walled garden |
| **RICE Scoring** | Score opportunities AND solutions on Reach, Impact, Confidence, Effort — one framework for the whole tree |
| **Assumption Lifecycle** | Track assumptions from identification → testing → validated/invalidated, with "leap of faith" flagging |
| **Experiment Loop** | Connect experiment results back to assumptions and solutions — close the feedback loop |
| **AI Gap Analysis** | Identifies thin evidence, untested assumptions, and unscored opportunities |
| **AI Staleness Detection** | Proactively flags nodes that need attention — stale statuses, missing results, outdated metrics |
| **AI Recommendations** | Ranked list of what to work on next, with confidence scores and identified risks |
| **AI Matching** | Periodically scans the holding pen and suggests connections between orphan items and tree nodes |
| **Data Connections** | Auto-refresh metric values from Snowflake/dashboards (daily or weekly pull) |
| **Collaboration** | Multiple team members can contribute to the tree with appropriate permissions |

## How the Assumption Lifecycle Works

This is the core feedback loop that most tools miss:

```
1. IDENTIFY    → "Users will complete the onboarding tour" (desirability assumption)
2. FLAG        → Marked as "leap of faith" — high importance, weak evidence
3. EXPERIMENT  → Prototype test with 5 users, success criteria: 4/5 complete
4. RESULT      → 3/5 completed, 2 dropped off at step 3
5. DECISION    → Assumption partially invalidated → redesign step 3 or try different solution
6. RE-SCORE    → Opportunity score adjusts based on updated evidence
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Tree Visualization | React Flow |
| Database | SQLite via Drizzle ORM (upgrade path to Postgres) |
| AI | Claude (Anthropic SDK) with prompt caching |
| UI Components | shadcn/ui + Tailwind CSS |
| State Management | Zustand |
| Validation | Zod |

## Project Status

Early stage — defining the product and building the foundation. See:
- [MVP.md](MVP.md) — phased build plan with success criteria
- [DECISIONS.md](DECISIONS.md) — architectural choices and trade-offs
- [DATA_MODEL.md](DATA_MODEL.md) — entity design and relationships

## License

MIT
