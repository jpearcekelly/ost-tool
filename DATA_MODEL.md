# Data Model

This document describes the core entities and their relationships. This is the source of truth for the data design until the Drizzle schema (`src/db/schema.ts`) is created, at which point that becomes authoritative.

## Entity Relationship Diagram

```
Project
  │
  ├── Outcome (1:1)
  │     │
  │     ├── Opportunity (1:many, self-referencing for sub-opportunities)
  │     │     │
  │     │     └── Solution (1:many, target 3 per opportunity)
  │     │           │
  │     │           └── Assumption (1:many, categorized)
  │     │                 │
  │     │                 └── Experiment (1:many)
  │     │
  │     └── [tree structure edges are implicit via parent references]
  │
  ├── DataPoint (1:many)
  │     │
  │     └── DataPointLink (many:many → any node)
  │
  └── TreeNode (1:many, stores visual layout)
```

---

## Entities

### Project

The top-level container. Everything belongs to a project.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| name | string | e.g., "Q2 Retention Initiative" |
| description | text | Optional context |
| created_at | timestamp | |
| updated_at | timestamp | |

### Outcome

The root of the tree — the business outcome the team is trying to drive. One per project (see ADR-005).

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → Project |
| title | string | e.g., "Increase 30-day retention from 45% to 60%" |
| description | text | Why this outcome matters |
| metric_name | string | e.g., "30-day retention rate" |
| metric_type | enum | `business`, `product`, `traction` (per CDH classification) |
| metric_target | decimal | e.g., 0.60 |
| metric_current | decimal | Nullable — populated from dashboards or manually |
| metric_source_url | string | Nullable — link to Tableau/dashboard for this metric |

### Opportunity

A user need, pain point, or desire discovered through research. Opportunities form a hierarchy (top-level → sub-opportunities).

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → Project |
| parent_opportunity_id | uuid | Nullable FK → Opportunity (self-referencing for sub-opportunities) |
| title | string | e.g., "Users don't discover key features in first session" |
| description | text | Detailed context |
| source | enum | `interview`, `survey`, `analytics`, `feedback`, `assumption` |
| size_score | integer | 1-5: how many users affected, how often |
| market_score | integer | 1-5: strategic differentiator vs table stakes |
| company_score | integer | 1-5: alignment with company mission and strategy |
| customer_score | integer | 1-5: satisfaction with current solution (inverted — low satisfaction = high score) |
| composite_score | decimal | Computed: weighted average of the four scores |
| status | enum | `identified`, `exploring`, `pursuing`, `parked` |
| created_at | timestamp | |
| updated_at | timestamp | |

**Scoring note:** Per CDH, composite_score = (size_score * w1 + market_score * w2 + company_score * w3 + customer_score * w4) / (w1 + w2 + w3 + w4). Default weights are equal (1,1,1,1) but configurable per project.

### Solution

A proposed approach to addressing an opportunity. CDH recommends generating at least 3 solutions per opportunity to avoid fixation on the first idea.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| opportunity_id | uuid | FK → Opportunity |
| title | string | e.g., "Guided onboarding tour" |
| description | text | How the solution works |
| effort_estimate | enum | `small`, `medium`, `large`, `unknown` |
| confidence | enum | `high`, `medium`, `low` — team's confidence this addresses the opportunity |
| status | enum | `proposed`, `exploring`, `building`, `shipped`, `abandoned` |
| created_at | timestamp | |

### Assumption

Something that must be true for a solution to work. Categorized by the CDH four-type model.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| solution_id | uuid | FK → Solution |
| statement | text | e.g., "Users will complete the onboarding tour" |
| category | enum | `desirability`, `usability`, `feasibility`, `viability` |
| is_leap_of_faith | boolean | True if high importance + weak evidence |
| evidence_strength | enum | `none`, `weak`, `moderate`, `strong` |
| status | enum | `untested`, `testing`, `validated`, `invalidated` |
| created_at | timestamp | |

**CDH note:** "Leap of faith" assumptions are those with high importance to the solution's success AND weak supporting evidence. These should be tested first.

### Experiment

A test designed to validate or invalidate an assumption. Not a full A/B test — often a prototype test, survey, or concierge experiment.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| assumption_id | uuid | FK → Assumption |
| type | enum | `prototype_test`, `concierge`, `wizard_of_oz`, `survey`, `data_analysis`, `one_question`, `other` |
| hypothesis | text | "We believe that [assumption]. We'll know we're right if [success criteria]." |
| method | text | How the experiment will be conducted |
| success_criteria | text | Measurable threshold for validation |
| result | text | Nullable — what actually happened |
| outcome | enum | `pending`, `validated`, `invalidated`, `inconclusive` |
| started_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |

### DataPoint

A piece of evidence collected from research. Can be linked to any node in the tree.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → Project |
| type | enum | `interview`, `survey`, `analytics`, `feedback` |
| content | text | The actual data — a quote, a stat, a note |
| source | string | e.g., "Interview with User #23", "Mixpanel funnel report" |
| participant_id | string | Nullable — anonymized identifier for the research participant |
| collected_at | date | When the data was collected |
| created_at | timestamp | |

### DataPointLink

Many-to-many relationship linking data points as evidence to any node in the tree (opportunity, solution, assumption, or experiment).

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| data_point_id | uuid | FK → DataPoint |
| node_type | enum | `opportunity`, `solution`, `assumption`, `experiment` |
| node_id | uuid | Polymorphic FK to the target entity |
| relevance_note | text | Optional — why this evidence is relevant to this node |

### TreeNode

Stores the visual position and state of each node in the React Flow canvas. Decoupled from the domain entities so that layout is independent of data.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → Project |
| node_type | enum | `outcome`, `opportunity`, `solution`, `assumption`, `experiment` |
| node_id | uuid | FK to the corresponding domain entity |
| position_x | float | React Flow x coordinate |
| position_y | float | React Flow y coordinate |
| collapsed | boolean | Whether child nodes are hidden |

---

## Future Entities (Not in MVP)

- **InterviewCadence** — tracks weekly interviewing habit (week_start, interviews_conducted, target)
- **ExperienceMap** — the pre-OST artifact used to map the customer journey
- **IntegrationConnection** — stores OAuth tokens/API keys for Tableau, Mixpanel, Amplitude
- **StakeholderUpdate** — generated "show your work" summaries for leadership
