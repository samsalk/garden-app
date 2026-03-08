# 🌱 Garden Planner

A mobile-friendly garden planning app — map your beds, track care schedules, plan successions, and get a local weather forecast. All data lives in your browser; no account or server required.

**Live:** https://samsalk.github.io/garden-app/

---

## User Guide

### Getting started

1. **Create a garden** — click **+ New Garden** in the sidebar and give it a name and dimensions (in feet).
2. **Draw zones** — on the Garden overview, click **Draw Zone** and drag a rectangle to define a raised bed, container, path, or lawn area.
3. **Plant cells** — open a zone, pick a plant from the palette bar, then click or drag cells to paint it in. Switch to **Edit** to click a cell and set size, status, dates, and notes.

### Today tab

The Today tab is your daily dashboard. It shows three urgency bands:

| Band | Meaning |
|---|---|
| 🔴 OVERDUE | Task is several days past due |
| 🟠 DUE TODAY | Due today or tomorrow |
| 🟡 COMING UP | Due within the next 2 days |

Each care card shows the plant, task type (fertilize, pest check, prune, harvest check), and which bed it's in. Hit **Done** to log it and reset the timer. Watering is tracked per zone — tap **Done** on the watering card to record today's date.

Adjust how often a zone gets watered with the **💧 Water every N days** bar at the top of any plantable zone.

### Planting a cell (DetailModal)

Click any planted cell to edit it:

- **Plant** — reassign to any plant or variety in the library
- **Plant size** — preset spans (1×1 through 4×4) or custom; greyed-out sizes won't fit in the remaining space
- **+ Add custom plant / variety** — create a named variety based on any built-in plant (inherits days-to-harvest, spacing, care defaults) with optional overrides
- **Status** — Planned → Planted → Growing → Harvested → Failed
- **Care schedule** — override any care interval per cell (leave blank to use the plant's default, enter `0` to skip that task entirely)
- **Next Up** — once a crop is Growing or Harvested, queue the next plant for that cell and set a target replant date. On Harvested cells a green **→ Plant Now** button resets the cell instantly.

### Plant library

55 built-in plants across five categories: Vegetables, Fruits, Herbs, Flowers, and Custom. The MiniPicker and palette bar both have a filter row to narrow by category.

Notable care defaults by plant type:
- **Fast harvesters** (lettuce, arugula, radish) — check harvest every 2 days
- **Perennials** (raspberry, blueberry, echinacea) — longer fertilize cycles, null harvest-check
- **Mint** — weekly pruning; marked as a conflict plant (keep in containers)

### Calendar tab

Shows expected harvest dates grouped by month. Cards include planted date, status badge, and a relative label ("In ~2wk", "Today!", etc.). Cells with a **Next Up** queue and a target date appear as dashed green **queued** cards so you can see the full season at a glance.

### Weather bar

Open **⚙️ Settings** (top-right of the header) and enter your ZIP code. The app geocodes it via [Zippopotam.us](https://www.zippopotam.us/) and fetches a 7-day forecast from [Open-Meteo](https://open-meteo.com/) — both free, no API key needed.

The bar shows:
- A frost risk banner if any day's low drops below your threshold (default 35 °F)
- A 7-day strip with weather icon, high, low, and precipitation
- A recent-rain note if measurable rain fell in the last 2 days

Weather is cached for 3 hours in local storage so it doesn't re-fetch on every load.

### Import / Export

Use the **Export** and **Import** buttons in the sidebar to back up or restore your entire garden as a JSON file. Useful for moving between browsers or devices.

---

## Tech Overview

### Stack

| Layer | Choice |
|---|---|
| UI | React 18 (no router, single-page) |
| Build | Vite 6 |
| Styling | Vanilla CSS (single file, CSS custom properties) |
| Data | `localStorage` — key `gp-v5` |
| Geocoding | [Zippopotam.us](https://api.zippopotam.us) — free, no key, CORS-safe |
| Weather | [Open-Meteo](https://api.open-meteo.com) — free, no key, CORS-safe |
| Deploy | GitHub Actions → GitHub Pages |

Zero runtime dependencies beyond React.

### Project structure

```
src/
├── App.jsx                   # Root — wires all state, routing between tabs
├── main.jsx
├── styles/main.css           # All styles (CSS custom properties, ~320 lines)
│
├── constants/
│   ├── plants.js             # 55 built-in plants with careDefaults
│   ├── care.js               # PLANT_CARE_TYPES, DEFAULT_FREQ, URGENCY_THRESHOLDS
│   ├── zones.js              # ZONE_TYPES (raised/container/path/lawn) + colors
│   └── ui.js                 # SPAN_PRESETS, STATUSES, MONTHS
│
├── hooks/
│   ├── useGardenData.js      # All data mutations + localStorage persistence
│   ├── useCareEngine.js      # Derives urgency-banded task lists from data
│   └── useWeather.js         # Open-Meteo fetch + 3h cache; geocodeZip()
│
├── utils/
│   ├── date.js               # today(), addDays(), genId(), fmtDate(), nowISO()
│   ├── grid.js               # buildSpanCells(), resolvePrimary(), spanFits()
│   └── migrate.js            # loadAndMigrate() — reads gp-v4 or gp-v5, backfills schema
│
├── components/
│   ├── layout/
│   │   └── Sidebar.jsx       # Garden list, export/import
│   ├── garden/
│   │   ├── GardenOverview.jsx    # Drag-to-draw zone layout canvas
│   │   ├── ZonePlantGrid.jsx     # CSS grid planting cells, paint-drag support
│   │   ├── ZoneListView.jsx      # List view of planted cells in a zone
│   │   └── PaletteBar.jsx        # Plant picker strip above the grid
│   ├── today/
│   │   ├── TodayTab.jsx          # Urgency bands + weather bar
│   │   ├── CareTaskCard.jsx      # Single plant care task card
│   │   ├── WateringSection.jsx   # Zone-level watering card
│   │   └── WeatherBar.jsx        # 7-day strip, frost alert, recent rain
│   ├── views/
│   │   ├── GlobalList.jsx        # All-plants table across all gardens
│   │   └── CalendarView.jsx      # Harvest forecast + queued succession entries
│   └── modals/
│       ├── AddGardenModal.jsx
│       ├── AddZoneModal.jsx
│       ├── MiniPicker.jsx        # Quick plant + size picker popover
│       ├── DetailModal.jsx       # Full cell editor (care schedule, next up, variety)
│       └── SettingsModal.jsx     # ZIP lookup, frost threshold
```

### Data model (`gp-v5`)

```jsonc
{
  "gardens": [{
    "id": "abc123",
    "name": "Back Yard",
    "w": 12, "h": 8,           // feet
    "createdAt": "ISO string",
    "zones": [{
      "id": "xyz",
      "name": "Raised Bed 1",
      "type": "raised",        // raised | container | path | lawn
      "x": 0, "y": 0, "w": 4, "h": 2,
      "wateringFreqDays": 2,
      "wateringLog": [{ "date": "YYYY-MM-DD" }],
      "cells": {
        "0,0": {               // "row,col" key (0-based)
          "plantId": "tomato",
          "status": "growing", // planned|planted|growing|harvested|failed
          "spanW": 1, "spanH": 1,
          "plantedDate": "YYYY-MM-DD",
          "harvestDate": "YYYY-MM-DD",
          "notes": "",
          "careSchedule": { "fertilizing": 14, "pruning": null },
          // null = skip, number = override days, omitted = use plant default
          "careLogs": { "fertilizing": [{ "date": "YYYY-MM-DD" }] },
          "nextUp": { "plantId": "lettuce", "targetDate": "YYYY-MM-DD" },
          "createdAt": "ISO string"
        },
        "0,1": { "occupiedBy": "0,0", "spanW": 1, "spanH": 1 }
        // span cells point back to their primary
      }
    }]
  }],
  "customPlants": [{
    "id": "custom-xxxx",
    "name": "Cherry Tomato",
    "type": "custom",
    "baseId": "tomato",        // inherits careDefaults, spacing, dth if not overridden
    "dth": 60,
    "careDefaults": { "fertilizing": 10, "harvest_check": 2 }
  }],
  "settings": {
    "location": { "lat": 40.7484, "lng": -73.9967, "zip": "10001", "city": "New York City", "state": "NY" },
    "frostThresholdF": 35,
    "weatherCacheHours": 3,
    "weatherCache": { "fetchedAt": "ISO string", "lat": 40.7484, "lng": -73.9967, "daily": { ... } }
  }
}
```

### Care engine

`useCareEngine(data, allPlants)` is a pure `useMemo` that walks every plantable zone cell and computes days-overdue for each care type:

```
freq  = cell.careSchedule[type] ?? plant.careDefaults[type] ?? DEFAULT_FREQ[type]
nextDue = lastLogDate + freq   (or today if never logged)
daysOverdue = today - nextDue
```

`null` freq = skip entirely. Results are sorted into `{ critical, due, soon }` arrays. Watering tasks are `unshift`ed to appear first within each band.

### Local dev

```bash
nvm use 24        # or any Node 18+
npm install
npm run dev       # http://localhost:5173/garden-app/
```

### Deploy

Pushes to `main` automatically build and deploy via `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages). The `base: "/garden-app/"` in `vite.config.js` ensures asset paths resolve correctly under the subdirectory.
