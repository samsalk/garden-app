import { COMPANION_CONFLICTS } from "@/constants/plants";

/** True if planting id1 adjacent to id2 is a known bad pairing. */
export function plantsConflict(id1, id2, allPlants) {
  if (id1 === id2) return false;
  const p1 = allPlants.find(p => p.id === id1);
  const p2 = allPlants.find(p => p.id === id2);
  if (p1?.conflictsWithAll || p2?.conflictsWithAll) return true;
  return COMPANION_CONFLICTS.some(([a, b]) =>
    (a === id1 && b === id2) || (a === id2 && b === id1)
  );
}

/** All cell keys occupied by a primary cell (accounts for span). */
function occupiedKeys(cells, primaryKey) {
  const cell = cells[primaryKey];
  if (!cell?.plantId) return [primaryKey];
  const [r, c] = primaryKey.split(",").map(Number);
  const sw = cell.spanW || 1, sh = cell.spanH || 1;
  const keys = [];
  for (let dr = 0; dr < sh; dr++)
    for (let dc = 0; dc < sw; dc++)
      keys.push(`${r + dr},${c + dc}`);
  return keys;
}

/** Plant IDs adjacent to a set of cell keys (de-duped, excludes those keys). */
function neighborPlantIds(cells, zoneW, zoneH, ownKeys) {
  const ownSet = new Set(ownKeys);
  const seen   = new Set();
  for (const k of ownKeys) {
    const [r, c] = k.split(",").map(Number);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= zoneH || nc >= zoneW) continue;
        const nk = `${nr},${nc}`;
        if (ownSet.has(nk)) continue;
        const nc2 = cells[nk];
        const pk  = nc2?.occupiedBy || nk;
        const pc  = cells[pk];
        if (pc?.plantId) seen.add(pc.plantId);
      }
    }
  }
  return [...seen];
}

/**
 * Returns all active conflict pairs in a zone.
 * Each entry: { plant1, plant2 }  (plant objects from allPlants)
 * De-duped — each pair appears once regardless of how many adjacent cells share it.
 */
export function getZoneConflicts(cells, zoneW, zoneH, allPlants) {
  const primaryKeys = Object.keys(cells).filter(k => cells[k]?.plantId);
  const seen = new Set();
  const result = [];

  for (const pk of primaryKeys) {
    const cell = cells[pk];
    const nbIds = neighborPlantIds(cells, zoneW, zoneH, occupiedKeys(cells, pk));
    for (const nid of nbIds) {
      if (plantsConflict(cell.plantId, nid, allPlants)) {
        const pairKey = [cell.plantId, nid].sort().join("|");
        if (!seen.has(pairKey)) {
          seen.add(pairKey);
          const p1 = allPlants.find(p => p.id === cell.plantId);
          const p2 = allPlants.find(p => p.id === nid);
          if (p1 && p2) result.push({ plant1: p1, plant2: p2 });
        }
      }
    }
  }
  return result;
}

/**
 * For the MiniPicker: returns a Set of plant IDs that would conflict with
 * the existing neighbors of the proposed placement (row, col, spanW, spanH).
 */
export function getConflictingPickerIds(cells, zoneW, zoneH, row, col, spanW, spanH, allPlants) {
  const ownKeys = [];
  for (let dr = 0; dr < spanH; dr++)
    for (let dc = 0; dc < spanW; dc++)
      ownKeys.push(`${row + dr},${col + dc}`);

  const nbIds = neighborPlantIds(cells, zoneW, zoneH, ownKeys);
  const result = new Set();
  for (const plant of allPlants) {
    for (const nid of nbIds) {
      if (plantsConflict(plant.id, nid, allPlants)) {
        result.add(plant.id);
        break;
      }
    }
  }
  return result;
}
