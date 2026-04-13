# OST Tool — Project Conventions

## What This Is

An AI-powered product discovery tool implementing the Continuous Discovery Habits (CDH) framework by Teresa Torres. Visualizes Opportunity-Solution Trees with AI-assisted analysis.

## Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript in strict mode
- **Package Manager:** pnpm (not npm or yarn)
- **Database:** SQLite via `better-sqlite3` + Drizzle ORM
- **Tree Visualization:** React Flow (`reactflow`)
- **UI Components:** shadcn/ui + Tailwind CSS
- **AI:** Anthropic Claude API via `@anthropic-ai/sdk` with prompt caching
- **State Management:** Zustand
- **Validation:** Zod for all API inputs and AI structured outputs

## Key Directories

```
src/
  app/              # Next.js App Router pages and API routes
  components/
    tree/           # React Flow canvas and custom node components
      nodes/        # One component per node type: Outcome, Opportunity, Solution, Assumption, Experiment
      edges/        # Custom edge renderers
      panels/       # Side panels (node detail, AI insights)
    data/           # Data point management components
    ui/             # shadcn/ui components (added via `npx shadcn-ui@latest add`)
  db/
    schema.ts       # Drizzle schema — single source of truth for the data model
    index.ts        # Database connection setup
    migrations/     # Drizzle-generated migration files
  lib/
    ai/
      client.ts     # Anthropic SDK setup with prompt caching
      prompts/      # Prompt templates for each AI feature
      schemas/      # Zod schemas for structured AI output
    cdh/            # CDH framework logic (scoring algorithm, metric categorization)
    integrations/   # External data source adapters (CSV, future: Mixpanel, Tableau)
  store/            # Zustand stores for client-side state
```

## Conventions

- Prefer server components by default; use `"use client"` only for interactive components (tree canvas, forms, components using hooks)
- All API routes follow REST conventions in `src/app/api/`
- AI calls always go through `src/lib/ai/client.ts` — never call the Anthropic SDK directly from components or routes
- Zod schemas validate all API request bodies and all AI structured outputs
- Database schema in `src/db/schema.ts` is the source of truth — keep DATA_MODEL.md in sync but schema.ts wins on conflicts
- Run migrations with `pnpm drizzle-kit push` during development, `pnpm drizzle-kit migrate` for production

## AI Design Principle

AI features are **explicit, not ambient** (see ADR-003). Every AI call is triggered by a user action (button click). The tool works fully without an API key. AI-powered features:
1. Score an opportunity (evaluate 4 CDH factors against evidence)
2. Gap analysis (identify thin spots in the tree)
3. Suggest assumptions (generate categorized assumptions for a solution)
4. Recommend focus (suggest highest-impact opportunity to pursue)

## Domain Model

See DATA_MODEL.md for full entity design. The tree hierarchy is:

```
Project → Outcome → Opportunity (hierarchical) → Solution → Assumption → Experiment
                                                              ↑
                                            DataPoint ←→ DataPointLink (evidence)
```
