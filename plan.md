# Garden Planner — Product & Technical Specification
**Square Foot Method · v1.0 Draft**

| | |
|---|---|
| **Status** | Planning / V4 prototype complete |
| **Owner** | Sam |
| **Current build** | `garden-planner.jsx` (React, localStorage `gp-v4`) |
| **Target platform** | Mobile-first web app, desktop secondary |
| **Storage (V1)** | localStorage + JSON export/import |
| **Storage (V2+)** | Supabase (when cross-device sync needed) |

---

## 1. Overview

Garden Planner is a personal square-foot-method gardening app for planning, managing, and tracking garden beds across a growing season. The core design philosophy is that the app should be genuinely useful on a daily basis — not just a record-keeper you visit once at planting time, but something worth opening every morning in the garden.

The app is organized around a two-level spatial model: a **Garden** (overall outdoor space) divided into **Zones** (raised beds, containers, paths). Plants are placed on a square-foot grid within plantable zones. A daily management layer tracks care schedules, logs activity, and surfaces what needs attention today — informed by live weather data.

### Design Principles

- **Mobile-first.** Most daily use happens phone-in-hand in the garden.
- **Low friction for daily logging.** One tap to mark a task done.
- **Inform, don't automate.** Weather and schedules adjust urgency but never act without you.
- **Progressive complexity.** Simple to start, more powerful as you add data.
- **Offline-capable.** Core functionality works without a network connection.

---

## 2. Feature Inventory

### 2A · Built (V4 Prototype)

#### Spatial Garden Model
- Create multiple named gardens with configurable dimensions (ft × ft)
- Draw zones onto garden grid by drag (desktop) or form entry (mobile)
- Zone types: Raised Bed, In-Ground, Container/Pot, Planter Box, Path/Walkway
- Zones are color-coded and spatially positioned — no overlaps allowed
- Click any plantable zone to open its planting grid

#### Planting Grid
- CSS Grid-based, supports multi-cell plant spanning (e.g. 2×2 for zucchini)
- **Paint mode:** select plant from palette, click/drag to paint 1×1 cells
- **Edit mode:** click empty cell → mini picker (search, type filter, span selector)
- Click planted cell → detail modal (status, dates, notes, resize)
- Span presets: 1×1, 1×2, 2×1, 2×2, 1×3, 3×1, 2×4, 4×4 + custom
- Greyed-out presets that don't fit at the current starting cell

#### Plant Library
- 35 built-in plants: 19 vegetables, 8 herbs, 8 flowers
- Each plant: emoji, color, days-to-harvest, spacing, growing notes, default span
- Custom plant creation (name + emoji) from within the detail modal

#### Cell Data
- Per-primary-cell: `plantId`, `status`, `plantedDate`, `harvestDate`, `notes`, `spanW`, `spanH`
- Statuses: Planned → Planted → Growing → Harvested / Failed
- Harvest date auto-calculated from planted date + days-to-harvest

#### Views
- Garden overview: spatial grid with zone chips, draw/add zone tools
- Zone grid view: planting grid with palette bar
- Zone list view: tabular
- All Plants tab: global list grouped by zone across all gardens
- Calendar tab: harvest forecast grouped by month with relative dates

#### Data Persistence
- localStorage key: `gp-v4` (note: each major version uses a new key)
- JSON export (download) and import for cross-device transfer
- Mobile sidebar fixed — renders outside `.app` div to escape `overflow: hidden`

---

### 2B · Planned Features

### 2.1 Daily Management — Care Schedule Engine

**Goal:** Answer "what should I do today, given what I last did and what each plant needs?" The Today tab surfaces overdue, due, and upcoming tasks sorted by urgency.

#### Care Action Types

| Action | Description | Default Frequency |
|---|---|---|
| 💧 Watering | Zone-level. Log when the whole bed was watered. | Per-zone setting |
| 🌿 Fertilizing | Plant-level. Track per-plant fertilizing cadence. | Every 14 days (growing) |
| 🔍 Pest check | Plant-level. Flag any plants for regular inspection. | Weekly during season |
| ✂️ Pruning | Plant-level. Deadheading, side-shooting, etc. | Manual / as needed |
| 🌾 Harvest check | Auto-triggered when plant enters growing window. | Daily when ripe |

#### Granularity Decisions
- **Watering:** Zone-level. You water the whole raised bed, not individual plants.
- **All other care types:** Plant-level (primary cell). One log entry per plant per action.
- **Frequencies:** Smart defaults from plant library, overridable per-plant in the detail modal.

#### Today Tab — Urgency Model

Tasks sorted into three bands:

| Band | Condition | Visual |
|---|---|---|
| 🔴 Critical | 2+ days overdue (watering) or 3+ days (other) | Red badge, top of list |
| 🟠 Due | Due today or 1 day overdue | Orange badge |
| 🟡 Soon | Due in 1–2 days | Yellow badge, below fold |

One-tap ✓ to mark done and reset the clock. Optional: tap and hold for "done on a different date" to backfill.

---

### 2.2 Weather Integration

#### Data Source
- **API:** Open-Meteo (`open-meteo.com`) — free, no API key required
- **Endpoints:** Historical actuals (past 7 days precip + temp) + 7-day forecast
- **Location:** User-entered zip/coordinates in Settings. Geocode zip → lat/lng via Open-Meteo geocoding endpoint.
- **Refresh:** On app open if last fetch > 3 hours ago. Cached in localStorage.

#### Weather Bar
Displayed at top of Today tab:
- Current conditions: temp, conditions, humidity
- Precipitation summary: rain in last 48hrs (actual) + next 48hrs (forecast)
- 7-day strip: daily high/low + precip bar
- Frost alert banner (prominent, dismissible per-event) when any forecast day < 35°F

#### Influence on Tasks — Semi-Auto Model

> **Design decision:** Weather adjusts the urgency color and adds context text to tasks, but never automatically marks tasks done or skips them. You always log manually. Trust is built before automation.

| Trigger | Effect on Task | Display |
|---|---|---|
| ≥0.5" rain yesterday | Watering urgency reduced one band | 💧 "Rain yesterday — may not need watering" |
| ≥0.3" forecast today | Watering task shows deferral suggestion | 🌧 "Rain forecast today — consider holding off" |
| 3+ days no rain + hot | Watering urgency increases one band | ☀️ "Dry stretch — check soil moisture" |
| Warm + humid stretch | Pest/disease check urgency increases | ⚠️ "High blight risk conditions" |
| Fertilizing + rain forecast | Warning not to fertilize | 🌧 "Rain forecast — fertilizer may wash off" |
| Frost < 35°F in forecast | Frost alert banner on Today tab | 🥶 "Frost risk — protect frost-tender plants" |

---

### 2.3 Companion Planting — Conflict Detection

**Goal:** Surface bad-neighbor conflicts between plants in raised beds and in-ground zones at placement time and after the fact. Containers excluded.

#### Scope Decisions
- **Zone types:** Raised bed and in-ground only (not containers, planters, or paths)
- **Adjacency:** 8-neighbor (orthogonal + diagonal) within the same zone
- **Signals:** Bad neighbor conflicts only — no watering or sunlight mismatch signals in V1
- **Conflict dismissal:** Per-conflict, session-only. Reappears on next load.

#### Conflict Pairs

| Plant | Bad Neighbors | Reason |
|---|---|---|
| Onion, Garlic | Bean, Pea | Inhibits legume growth |
| Broccoli, Kale | Tomato, Pepper, Eggplant | Brassicas inhibit nightshades |
| Tomato | Broccoli, Kale, Corn | Competition / nightshade inhibition |
| Corn | Tomato | Allelopathic competition |
| Dill (mature) | Tomato, Pepper | Mature dill inhibits nightshades |
| Eggplant | Broccoli, Kale | Nightshade / brassica conflict |
| Mint | Everything | Aggressive spreader — containers only |

#### Placement Hints (Mini-Picker)
- When opening picker on empty cell in raised/inground zone, scan 8 neighbors
- Any plant in the picker that conflicts with an existing neighbor gets a ⚠️ badge
- Tapping a warned plant shows a one-line explanation before the span selector
- User can proceed anyway — advisory only

#### Warnings Panel
- Renders below the planting grid in raised/inground zones only
- Each row: `⚠️ [Plant A] (R×C×) and [Plant B] (R×C×) — [reason]`
- Dismiss button per row (session-only)
- Panel hidden if no active conflicts

---

## 3. Data Model

### 3.1 localStorage Keys

| Key | Contents |
|---|---|
| `gp-v4` | Current prototype (gardens + customPlants) |
| `gp-v5` | Next version — adds careSchedules, careLogs, settings |
| `gp-weather` | Cached weather response + timestamp |

### 3.2 Core Schema (gp-v5)

```ts
// Top level
{
  gardens: Garden[]
  customPlants: Plant[]
  settings: Settings
  // dismissedConflicts is session-only, not persisted
}

// Garden
{
  id: string
  name: string
  w: number          // feet
  h: number          // feet
  zones: Zone[]
}

// Zone
{
  id: string
  name: string
  type: "raised" | "inground" | "container" | "planter" | "path"
  x: number          // position in garden grid
  y: number
  w: number          // size in garden grid
  h: number
  cells: Record<"row,col", Cell>
  wateringLog: { date: string; note?: string }[]
  wateringFreqDays: number   // default varies by zone type
}

// Cell — primary
{
  plantId: string
  status: "planned" | "planted" | "growing" | "harvested" | "failed"
  plantedDate: string        // ISO date
  harvestDate: string        // ISO date
  notes: string
  spanW: number              // default 1
  spanH: number              // default 1
  careSchedule: Record<CareType, { freqDays: number }>
  careLogs: Record<CareType, { date: string; note?: string }[]>
}

// Cell — occupied (covered by a spanning primary cell)
{
  occupiedBy: string         // "row,col" key of primary cell
}

// Settings
{
  location: {
    lat: number
    lng: number
    zip: string              // display only
  }
  frostThresholdF: number    // default 35
  weatherCacheHours: number  // default 3
}

type CareType = "watering" | "fertilizing" | "pest_check" | "pruning" | "harvest_check"
```

---

## 4. Technical Stack

| | |
|---|---|
| **Framework** | React 18 (Vite) |
| **Styling** | Inline CSS-in-JS (single file, no build step for styles) |
| **State** | useState / useCallback / useEffect — no Redux |
| **Storage V1** | localStorage + JSON export/import |
| **Storage V2** | Supabase (Postgres + Auth + Realtime) |
| **Weather API** | Open-Meteo (free, no API key, CORS-safe) |
| **Geocoding** | Open-Meteo geocoding endpoint (zip → lat/lng) |
| **Hosting V1** | GitHub Pages or Netlify (zero-config, free) |
| **Hosting V2** | Vercel or Render (if backend added) |
| **Build tool** | Vite |
| **Testing** | None in V1 — add Vitest + React Testing Library in V2 |

### Architecture Notes

- Single `.jsx` file through prototyping phase. Split into components when the file exceeds ~1000 lines sustainably.
- Open-Meteo forecast URL:
  ```
  https://api.open-meteo.com/v1/forecast
    ?latitude={lat}&longitude={lng}
    &daily=temperature_2m_max,temperature_2m_min,precipitation_sum
    &temperature_unit=fahrenheit
    &precipitation_unit=inch
    &past_days=7
    &forecast_days=7
  ```
- Weather data cached in localStorage with timestamp. Refetch if stale > 3 hours or on manual refresh.
- Companion conflict lookup is a flat array of sorted pairs: `[["tomato","broccoli"], ...]`. O(n) lookup is fine at this scale.
- Multi-cell spanning uses CSS Grid's native `column-span` / `row-span`. Occupied cells are skipped during render.

---

## 5. Implementation Plan

> **Current state:** V4 prototype is complete as a single `garden-planner.jsx` file. Covers the full spatial model, spanning, paint mode, and all three tabs. Next step is Vite scaffolding before adding V5 features.

### Phase 0 — Project Scaffolding
_Goal: Turn the prototype .jsx into a deployable Vite + React project._

1. `npm create vite@latest garden-planner -- --template react`
2. Drop `garden-planner.jsx` into `src/App.jsx`
3. Add `"homepage"` to `package.json` for GitHub Pages
4. Add deploy script: `npm run build && gh-pages -d dist`
5. Verify localStorage `gp-v4` data survives the move
6. Deploy to GitHub Pages as baseline

### Phase 1 — Care Schedule Engine (gp-v5)
_Goal: Today tab with urgency-sorted task list and one-tap logging._
_Estimated scope: medium — 2–3 focused sessions_

- Migrate data model from `gp-v4` → `gp-v5` (add `careSchedule`, `careLogs`, `wateringLog`)
- Write migration function: load `gp-v4`, reshape, save as `gp-v5`
- Build Today tab component — urgency bands, task cards, ✓ button
- Watering log on zone object (zone-level)
- Care logs on primary cell objects (plant-level)
- Settings screen: care frequency overrides per plant
- Add `waterFreqDays`, `fertFreqDays` defaults to `PLANTS` library

### Phase 2 — Weather Integration
_Goal: Weather bar on Today tab, weather-adjusted task urgency._
_Estimated scope: medium — 1–2 focused sessions_

- Settings screen: zip code input + geocoding → store lat/lng
- Open-Meteo fetch utility with localStorage cache
- Weather bar component: current conditions, 7-day strip, frost alert banner
- Task urgency modifier: apply weather context to each task's band
- Inline weather notes on task cards
- Frost alert: scan 7-day forecast for any day < `frostThresholdF`

### Phase 3 — Companion Planting Conflicts
_Goal: Placement-time warnings and post-placement conflict panel._
_Estimated scope: small-medium — 1 focused session_

- Build `CONFLICTS` lookup: flat array of sorted `[plantId, plantId]` pairs
- `getNeighborConflicts(cells, row, col, zoneType)` utility function
- Mini-picker: scan neighbors on open, badge conflicting plants
- Conflict explanation inline before span confirmation
- Warnings panel component below grid in raised/inground zones
- Session-only dismissal (no persistence needed)

### Phase 4 — Polish & V2 Prep
_Goal: Production-quality UX and optional cloud sync foundation._
_Estimated scope: large — multiple sessions, some items optional_

- Observation log: quick timestamped notes per plant
- Harvest log: mark harvests with quantity/weight
- Watering history chart per zone (recharts)
- Supabase auth + sync (optional — localStorage-only remains supported)
- PWA manifest + service worker for offline-first and "Add to Home Screen"
- Vitest + React Testing Library: unit tests for care schedule logic, conflict detection

---

## 6. Open Questions

| # | Question | Status |
|---|---|---|
| 1 | Conflict dismissal — session-only or permanent stored flag? | **Decided: session-only** |
| 2 | Weather auto-skip — should watering ever auto-log if rain ≥ threshold? | **Decided: no — semi-auto only** |
| 3 | Care frequency defaults — should they vary by season? | **Open** |
| 4 | Succession planting — multiple plantings of same crop in one cell over a season? | Deferred to V2 |
| 5 | Photo log — base64 localStorage has size limits. | Deferred to V2 (needs Supabase) |
| 6 | Push notifications for frost alerts — requires PWA + notification permission. | Deferred to Phase 4 |
| 7 | Companion planting — add beneficial pairs as a positive signal in a later version? | Deferred — conflicts only in V1 |

---

## 7. Out of Scope (V1)

- Multi-user / sharing / family access
- Seed inventory tracking
- Soil amendment / fertilizer product tracking
- Automated layout suggestion ("suggest arrangement for these plants")
- Integration with seed catalogs or plant databases
- Frost date lookup by zip
- Paid features or subscription model

---

## 8. Appendix — Plant Library

35 built-in plants. All have: emoji, color hex, days-to-harvest, spacing, default span, optional notes.

### Vegetables (19)
Tomato, Pepper, Zucchini *(2×2)*, Cucumber, Lettuce, Spinach, Kale, Carrot, Radish, Green Bean, Pea, Broccoli, Onion, Garlic, Eggplant, Corn, Butternut Squash *(2×2)*, Beet, Swiss Chard

### Herbs (8)
Basil, Parsley, Cilantro, Mint, Rosemary, Thyme, Dill, Chives

### Flowers (8)
Sunflower, Marigold, Nasturtium, Zinnia, Lavender, Cosmos, Dahlia, Borage

> Zucchini and Butternut Squash have `defaultSpan: [2,2]`. All others default to `[1,1]`. Custom plants created by the user default to `[1,1]` and are stored in `customPlants[]`.