# Design Tokens

Global styling tokens for the OST Tool. These define the visual language used across all components — tree nodes, panels, list views, and the AI sidebar. When we scaffold the project, these map to CSS custom properties in `globals.css` and Tailwind theme extensions in `tailwind.config.ts`.

## Principles

1. **Semantic naming** — tokens describe purpose, not appearance (`--color-opportunity`, not `--blue-500`)
2. **Zone-aware** — the three zones (metrics, discovery, solutions) each have a distinct visual identity
3. **Confidence is visual** — evidence level is communicated through border style and opacity, not just color
4. **Dark mode first** — the tree view works best on a dark background (less eye strain for large canvases, matches Vistaly's approach and common dev tool aesthetics). Light mode supported but secondary.
5. **Minimal palette** — each node type gets one color. Everything else is neutral.

---

## Color Tokens

### Node Type Colors

Each node type has a primary color used for its label badge, border accent, and tree edge.

| Token | Purpose | Dark mode value | Light mode value | Notes |
|-------|---------|----------------|-----------------|-------|
| `--color-metric` | Metric nodes | `#A78BFA` (violet-400) | `#7C3AED` (violet-600) | Purple — matches the existing Miro convention |
| `--color-opportunity` | Opportunity nodes | `#34D399` (emerald-400) | `#059669` (emerald-600) | Green — discovery, growth, exploration |
| `--color-solution` | Solution nodes | `#60A5FA` (blue-400) | `#2563EB` (blue-600) | Blue — building, design, craft |
| `--color-assumption` | Assumption nodes | `#FBBF24` (amber-400) | `#D97706` (amber-600) | Amber — caution, needs validation |
| `--color-experiment` | Experiment nodes | `#F472B6` (pink-400) | `#DB2777` (pink-600) | Pink — testing, active investigation |

### Status Colors

| Token | Purpose | Value |
|-------|---------|-------|
| `--color-status-active` | Currently being worked on | `#34D399` (emerald-400) |
| `--color-status-validated` | Assumption validated / experiment passed | `#34D399` (emerald-400) |
| `--color-status-invalidated` | Assumption invalidated / experiment failed | `#F87171` (red-400) |
| `--color-status-stale` | Needs attention (staleness detection) | `#FB923C` (orange-400) |
| `--color-status-paused` | Parked / on hold | `#94A3B8` (slate-400) |

### Surface Colors (Dark Mode Primary)

| Token | Purpose | Value |
|-------|---------|-------|
| `--color-bg-canvas` | Tree canvas background | `#0F172A` (slate-900) |
| `--color-bg-card` | Node card background | `#1E293B` (slate-800) |
| `--color-bg-card-hover` | Node card hover state | `#334155` (slate-700) |
| `--color-bg-card-selected` | Selected node card | `#1E293B` with highlighted border |
| `--color-bg-panel` | Right panel (detail/AI) background | `#1E293B` (slate-800) |
| `--color-bg-panel-header` | Panel section headers | `#0F172A` (slate-900) |
| `--color-bg-input` | Form inputs, search bars | `#0F172A` (slate-900) |
| `--color-bg-badge` | Type label badges, score badges | 10% opacity of the node type color |
| `--color-bg-breadcrumb` | Breadcrumb bar background | `#0F172A` (slate-900) |

### Text Colors

| Token | Purpose | Value |
|-------|---------|-------|
| `--color-text-primary` | Main text | `#F1F5F9` (slate-100) |
| `--color-text-secondary` | Descriptions, metadata | `#94A3B8` (slate-400) |
| `--color-text-muted` | Timestamps, hints | `#64748B` (slate-500) |
| `--color-text-on-color` | Text on colored backgrounds | `#FFFFFF` |
| `--color-text-link` | Clickable links | `#60A5FA` (blue-400) |

### Edge Colors (Tree Connections)

| Token | Purpose | Value |
|-------|---------|-------|
| `--color-edge-default` | Default tree edge | `#475569` (slate-600) |
| `--color-edge-highlighted` | Edge when parent or child is selected | `#94A3B8` (slate-400) |
| `--color-edge-cross-link` | Cross-link edges (dashed) | `#64748B` (slate-500) at 50% opacity |

---

## Typography Tokens

Using Inter as the primary font (clean, highly legible at small sizes, excellent for data-dense UIs).

| Token | Purpose | Value |
|-------|---------|-------|
| `--font-family` | All text | `'Inter', system-ui, sans-serif` |
| `--font-size-xs` | Badges, metadata on zoomed-out nodes | `11px` |
| `--font-size-sm` | Secondary text, descriptions | `13px` |
| `--font-size-base` | Body text, node titles in normal view | `14px` |
| `--font-size-lg` | Panel headers, selected node title | `16px` |
| `--font-size-xl` | Page titles, outcome node title | `20px` |
| `--font-size-2xl` | Project name | `24px` |
| `--font-weight-normal` | Body text | `400` |
| `--font-weight-medium` | Node titles, labels | `500` |
| `--font-weight-semibold` | Panel headers, emphasis | `600` |
| `--font-weight-bold` | RICE scores, key metrics | `700` |
| `--line-height-tight` | Node cards (compact) | `1.25` |
| `--line-height-normal` | Panel text, descriptions | `1.5` |

---

## Spacing Tokens

Base unit: `4px`. All spacing is a multiple of the base unit.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight gaps (between badge and text) |
| `--space-2` | `8px` | Inner padding of small elements (badges, chips) |
| `--space-3` | `12px` | Node card internal padding |
| `--space-4` | `16px` | Standard gap between sections |
| `--space-5` | `20px` | Panel section spacing |
| `--space-6` | `24px` | Panel padding, larger gaps |
| `--space-8` | `32px` | Between major sections |
| `--space-10` | `40px` | Page-level padding |

### Node-Specific Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--node-padding` | `12px` | Internal padding of tree node cards |
| `--node-gap` | `16px` | Horizontal gap between sibling nodes (auto-layout) |
| `--node-row-gap` | `48px` | Vertical gap between tree levels (auto-layout) |
| `--node-min-width` | `180px` | Minimum card width |
| `--node-max-width` | `260px` | Maximum card width (prevents overly wide cards) |
| `--node-thumbnail-height` | `120px` | Height of Figma/image thumbnail on solution cards |
| `--node-border-radius` | `8px` | Card corner rounding |
| `--node-border-width` | `2px` | Evidenced node border width |
| `--node-border-width-selected` | `3px` | Selected node border width |

---

## Border & Shape Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Badges, small chips |
| `--radius-md` | `8px` | Node cards, panel sections |
| `--radius-lg` | `12px` | Panels, modals |
| `--radius-full` | `9999px` | Avatars, circular indicators |
| `--border-width` | `1px` | Default borders |
| `--border-width-node` | `2px` | Node card borders |

### Confidence Visual Treatment

| State | Border | Opacity | Border Style |
|-------|--------|---------|-------------|
| Evidenced (1+ data points) | Node type color | `100%` | Solid |
| Hypothesized (0 data points) | Node type color at 40% | `70%` | Dashed (`4px dash, 4px gap`) |
| Selected | Node type color, brighter | `100%` | Solid, `3px` width |
| Stale (flagged by AI) | `--color-status-stale` | `100%` | Solid, with pulse animation |

---

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.3)` | Node cards at rest |
| `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.4)` | Node cards on hover |
| `--shadow-card-selected` | `0 0 0 2px var(--color-bg-canvas), 0 0 0 4px [type-color]` | Ring shadow on selected card |
| `--shadow-panel` | `-4px 0 16px rgba(0,0,0,0.3)` | Right panel shadow (left edge) |
| `--shadow-dropdown` | `0 8px 24px rgba(0,0,0,0.4)` | Dropdowns, popovers |

---

## Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | `100ms` | Hover states, focus rings |
| `--duration-normal` | `200ms` | Panel transitions, card state changes |
| `--duration-layout` | `300ms` | Tree re-layout animations (nodes sliding to new positions) |
| `--duration-slow` | `500ms` | View transitions (free roam ↔ drill down) |
| `--easing-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard ease-out |
| `--easing-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy feel for node layout changes |
| `--easing-layout` | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth tree re-layout |

### Specific Animations

| Animation | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Node layout shift | `300ms` | `--easing-layout` | When tree re-computes layout, nodes slide (not jump) to new positions |
| Panel slide in/out | `200ms` | `--easing-default` | Right panel appearing/disappearing |
| Collapse/expand branch | `300ms` | `--easing-default` | Child nodes fade + slide when collapsing |
| Free roam ↔ drill down | `500ms` | `--easing-default` | Smooth zoom transition between views |
| Stale node pulse | `2s` infinite | `ease-in-out` | Subtle border glow on stale nodes |
| Card hover lift | `100ms` | `--easing-default` | Slight shadow increase on hover |

---

## Z-Index Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--z-canvas` | `0` | Tree canvas (base) |
| `--z-node` | `1` | Normal node cards |
| `--z-node-selected` | `10` | Selected node (renders above siblings) |
| `--z-breadcrumb` | `20` | Breadcrumb bar (fixed top in drill-down) |
| `--z-panel` | `30` | Right panel (AI / detail) |
| `--z-dropdown` | `40` | Dropdowns, popovers, menus |
| `--z-modal` | `50` | Modals, dialogs |
| `--z-toast` | `60` | Toast notifications |

---

## Breakpoints

The tool is desktop-first. Mobile is explicitly out of scope for MVP.

| Token | Value | Usage |
|-------|-------|-------|
| `--bp-panel-collapse` | `1024px` | Below this, right panel overlays instead of pushing tree |
| `--bp-compact-nodes` | `1280px` | Below this, node cards use compact layout |
| `--bp-full` | `1440px` | Full layout with comfortable tree + panel side by side |

---

## Implementation Notes

### Tailwind Config

These tokens map to a Tailwind theme extension in `tailwind.config.ts`:

```typescript
// Example — actual implementation will reference CSS custom properties
theme: {
  extend: {
    colors: {
      metric: 'var(--color-metric)',
      opportunity: 'var(--color-opportunity)',
      solution: 'var(--color-solution)',
      assumption: 'var(--color-assumption)',
      experiment: 'var(--color-experiment)',
      canvas: 'var(--color-bg-canvas)',
      card: 'var(--color-bg-card)',
      // ... etc
    },
    spacing: {
      'node-padding': 'var(--node-padding)',
      'node-gap': 'var(--node-gap)',
      'node-row-gap': 'var(--node-row-gap)',
    },
    // ... etc
  }
}
```

### CSS Custom Properties

Defined in `src/app/globals.css` inside `:root` (light) and `.dark` (dark mode) blocks. shadcn/ui's existing HSL-based system is extended with our semantic tokens.

### Component Patterns

Every component should use tokens, never raw values:
- `bg-card` not `bg-slate-800`
- `text-opportunity` not `text-emerald-400`
- `border-[--node-border-width]` not `border-2`
- `rounded-[--radius-md]` not `rounded-lg`

This ensures global consistency and makes theming/rebranding a single-file change.
