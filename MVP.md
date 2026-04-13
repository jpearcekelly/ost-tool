# MVP Scope

What to build first, and in what order. The goal: a tool that's immediately more useful than Miro for maintaining an Opportunity-Solution Tree.

## MVP Principle

The tree should be **easy to maintain and grow organically**. No dragging, no manual layout, no connector management. Add data, the tree grows. Score opportunities, the list reorders. The tool does the spatial thinking so you can do the product thinking.

## Phase 1: The Tree That Maintains Itself

The core — a navigable, auto-laying-out tree with typed nodes.

1. **Project setup** — create a project, name it, set a working outcome
2. **Add nodes** — add metrics, opportunities, solutions, assumptions, experiments as children of any node
3. **Auto-layout** — tree computes its own layout via dagre/elkjs. Adding or removing nodes triggers a smooth re-layout.
4. **Zoom, pan, collapse** — React Flow handles navigation. Collapse branches to manage complexity. Semantic zoom shows less detail when zoomed out.
5. **Node detail panel** — click any node to see and edit its type-specific fields in a bottom bar or side panel
6. **Status lifecycle** — each node type has its own status progression (e.g., solution: proposed → exploring → building → shipped → abandoned)

**You'll know Phase 1 works when:** you can recreate your Miro "Fin Resolutions" tree in the tool, and it's easier to add/reorganize nodes than in Miro.

## Phase 2: Scoring + List View

Make the tree actionable — prioritize opportunities, see ranked lists.

7. **RICE scoring** — rate each opportunity on Reach, Impact, Confidence, Effort. RICE score computed automatically. Same framework applies to solutions.
8. **List view** — toggle from tree to a ranked list of opportunities sorted by RICE score. Drill into an opportunity to see its solutions ranked by their own RICE scores.
9. **Tree ↔ List linking** — click an opportunity in the list, it highlights in the tree. Click in the tree, see it in the list context.
10. **Working outcome selector** — dropdown to pick which metric you're focused on. Filters list view and focuses tree view.

10. **Journey stage ordering** — tag opportunities with their position in the user lifecycle (onboarding → conversion → activation → retention → referral). Siblings auto-sort left-to-right by journey stage.

**You'll know Phase 2 works when:** you can open the tool, ask "what's the highest-priority opportunity?" and immediately see a ranked answer, then click through to the tree to see context. Opportunities are ordered left-to-right by journey stage.

## Phase 3: Evidence + Data Points

Make decisions evidence-based, not gut-feel.

11. **Add data points** — manually enter interview quotes, analytics findings, research notes. Categorize by type (interview, survey, analytics, feedback).
12. **Link data points to nodes** — attach evidence to any opportunity, solution, or assumption. Show evidence count on nodes.
13. **CSV import** — bulk-import interview notes or data points from a spreadsheet.
14. **Assumption tracking** — flag "leap of faith" assumptions. Track evidence strength (none/weak/moderate/strong).

**You'll know Phase 3 works when:** you can point to any opportunity and see exactly what evidence supports it, and identify which assumptions have no evidence at all.

## Phase 4: AI Sidebar

The agent that helps you work with the tree.

15. **AI gap analysis** — "Find Gaps" button analyzes the tree and surfaces: opportunities with no evidence, solutions with no assumptions, assumptions with no experiments, experiments with no results.
16. **AI RICE scoring assist** — "Help me score this" evaluates Reach, Impact, Confidence, and Effort based on linked evidence and suggests values with reasoning. Flags inconsistencies ("you scored low reach but 8 of 12 interviewees mentioned this").
17. **AI recommendations** — "What should I work on?" produces a ranked list with confidence scores and identified risks.
18. **AI staleness detection** — on project open, surfaces nodes that need attention (stale statuses, missing results, outdated metrics).
19. **Chat input** — free-form questions about the tree ("Summarize the evidence for Opportunity X", "What assumptions are untested?", "Compare these two opportunities").

**You'll know Phase 4 works when:** you open the tool after a week away and the AI tells you exactly what needs your attention.

## Phase 5: AI Intake

The interview transcript pipeline.

20. **Upload transcripts** — paste or upload raw interview transcripts (Google Doc, text, PDF).
21. **AI generates interview snapshot** — structured output: user profile, key insights, extracted opportunities (pain points, desires, needs).
22. **Suggested placement** — AI proposes where each extracted opportunity fits in the tree, with reasoning.
23. **Approve/edit/hold workflow** — review each suggestion. Approve adds to tree. Hold sends to holding pen. Edit lets you modify before adding.
24. **Holding pen** — view all un-placed items. AI periodically suggests matches as the tree evolves.

**You'll know Phase 5 works when:** you can do an interview, upload the transcript, and have the tree grow with three clicks (upload, review, approve).

## Phase 6: External Connections

Connect the tree to where work actually lives.

25. **External links** — add typed links to nodes (Figma, prototype, build, dashboard, document). Displayed as chips.
26. **Metric auto-refresh** — connect metric nodes to Snowflake/Tableau. Values refresh daily or weekly.
27. **Node ownership** — assign team members to nodes/branches.

**You'll know Phase 6 works when:** a PM can open the tool, navigate to their area, see current metric values, and click through to the Figma file for a solution in progress.

---

## Explicitly Not in MVP

- Real-time collaboration (Figma-style multiplayer)
- Full user authentication / permissions system
- Experience mapping view
- Interview scheduling / cadence tracking
- Slack integration (reading threads directly)
- Gong integration
- Mobile view
- Export / presentation mode for stakeholders

These are all good ideas. They're not Phase 1-6.
