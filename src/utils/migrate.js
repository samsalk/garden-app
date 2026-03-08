import { DEFAULT_FREQ } from "@/constants/care";
import { nowISO } from "@/utils/date";

function defaultSettings() {
  return {
    location: { lat: null, lng: null, zip: "", city: "", state: "" },
    frostThresholdF: 35,
    weatherCacheHours: 3,
  };
}

/**
 * Reads gp-v4 or gp-v5 from localStorage.
 * Returns a fully valid gp-v5 data object.
 * Idempotent: if gp-v5 already exists, returns it directly.
 */
export function loadAndMigrate() {
  const EMPTY_V5 = { gardens: [], customPlants: [], settings: defaultSettings() };

  // Already on v5 — return as-is
  try {
    const v5raw = localStorage.getItem("gp-v5");
    if (v5raw) return JSON.parse(v5raw);
  } catch { /* fall through */ }

  // Attempt migration from v4
  try {
    const v4raw = localStorage.getItem("gp-v4");
    if (!v4raw) return EMPTY_V5;
    const v4 = JSON.parse(v4raw);
    const v5 = migrateV4toV5(v4);
    localStorage.setItem("gp-v5", JSON.stringify(v5));
    localStorage.removeItem("gp-v4");
    return v5;
  } catch {
    return EMPTY_V5;
  }
}

export function migrateV4toV5(v4) {
  return {
    gardens: (v4.gardens || []).map(migrateGarden),
    customPlants: v4.customPlants || [],
    settings: defaultSettings(),
  };
}

function migrateGarden(garden) {
  return {
    ...garden,
    createdAt: garden.createdAt || nowISO(),
    zones: (garden.zones || []).map(migrateZone),
  };
}

function migrateZone(zone) {
  return {
    ...zone,
    createdAt: zone.createdAt || nowISO(),
    wateringFreqDays: zone.wateringFreqDays ?? DEFAULT_FREQ.watering,
    wateringLog: zone.wateringLog || [],
    cells: migrateCells(zone.cells || {}),
  };
}

function migrateCells(cells) {
  const next = {};
  for (const [key, cell] of Object.entries(cells)) {
    if (cell.occupiedBy) {
      next[key] = cell;
      continue;
    }
    next[key] = migrateCell(cell);
  }
  return next;
}

/**
 * Adds careSchedule + careLogs + nextUp + createdAt to primary cells.
 * careSchedule: per-type override (null = use plant/zone default)
 * careLogs: per-type array of { date, note? }
 * nextUp: optional succession queue entry
 * NOTE: watering is zone-level — NOT in cell.careSchedule or cell.careLogs
 */
function migrateCell(cell) {
  if (!cell.plantId) return cell;

  return {
    ...cell,
    createdAt: cell.createdAt || nowISO(),
    careSchedule: cell.careSchedule || {
      fertilizing:   null,
      pest_check:    null,
      pruning:       null,
      harvest_check: null,
    },
    careLogs: cell.careLogs || {
      fertilizing:   [],
      pest_check:    [],
      pruning:       [],
      harvest_check: [],
    },
    nextUp: cell.nextUp || null,
  };
}
