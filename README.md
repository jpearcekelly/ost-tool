# OST Tool

**An AI-powered product discovery tool that turns interviews, data, and business goals into actionable Opportunity-Solution Trees.**

## The Problem

Product teams practicing continuous discovery today rely on Miro boards, sticky notes, and spreadsheets. Evidence from user interviews gets lost. Prioritization is gut-feel. Stakeholders can't see the reasoning behind product decisions. And when the PM goes on vacation, the discovery context goes with them.

## The Solution

OST Tool encodes the [Continuous Discovery Habits](https://www.producttalk.org/continuous-discovery-habits/) framework by Teresa Torres into a structured, AI-assisted workflow:

- **Ingest data points** from interviews, surveys, analytics, and feedback
- **Map the opportunity space** as a visual tree rooted in business outcomes
- **Score opportunities** against four factors: size, market positioning, company impact, and customer satisfaction gaps
- **Track assumptions** across desirability, usability, feasibility, and viability — with "leap of faith" flagging
- **AI-assisted gap analysis** that identifies where your knowledge is thin and recommends what to investigate next
- **Recommend what to work on** based on the business goal you're trying to drive

## Who Is This For?

Product trios (PM + Designer + Engineer) who practice continuous discovery and want to move beyond sticky notes. If you've read the book and want a tool that actually implements the framework — this is it.

## Key Features (MVP)

| Feature | Description |
|---------|-------------|
| **Interactive OST Visualization** | Zoom, pan, collapse, and drag nodes in a React Flow-powered tree |
| **Structured Node Types** | Outcomes, Opportunities, Solutions, Assumptions, and Experiments — each with type-specific fields |
| **4-Factor Opportunity Scoring** | Rate opportunities on size, market factors, company impact, and customer satisfaction |
| **Evidence Linking** | Attach data points (interview quotes, analytics) to any node as evidence |
| **AI Gap Analysis** | Claude identifies what's missing: unlinked opportunities, untested assumptions, thin evidence |
| **AI Opportunity Scoring** | Claude helps evaluate each scoring factor based on your linked evidence |
| **CSV Import** | Bulk-import interview notes and data points |
| **Assumption Tracking** | Categorize assumptions and flag "leap of faith" risks |

## How the Tree Works

```
Business Outcome (e.g., "Increase 30-day retention from 45% to 60%")
├── Opportunity A: "Users don't discover key features in first session"
│   ├── Solution A1: "Guided onboarding tour"
│   │   ├── Assumption: Users will complete the tour (desirability) ⚠️ leap of faith
│   │   ├── Assumption: Tour can cover top 3 features in < 2 min (feasibility)
│   │   └── Experiment: Prototype test with 5 users
│   ├── Solution A2: "Contextual tooltips"
│   │   └── ...
│   └── Solution A3: "First-session checklist"
│       └── ...
├── Opportunity B: "Users feel overwhelmed by the dashboard"
│   └── ...
└── Opportunity C: "Users don't see value before trial expires"
    └── ...
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Tree Visualization | React Flow |
| Database | SQLite via Drizzle ORM |
| AI | Claude (Anthropic SDK) |
| UI Components | shadcn/ui + Tailwind CSS |
| State Management | Zustand |
| Validation | Zod |

## Project Status

🏗️ **Early stage** — building the foundation. See [DECISIONS.md](DECISIONS.md) for architectural choices and [DATA_MODEL.md](DATA_MODEL.md) for the entity design.

## Development

```bash
# Coming soon — project scaffolding in progress
pnpm install
pnpm dev
```

## License

MIT
