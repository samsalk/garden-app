// Build the set of cells to write when planting a span
export function buildSpanCells(startRow, startCol, spanW, spanH, plantData) {
  const primary = `${startRow},${startCol}`;
  const result  = {};
  result[primary] = { ...plantData, spanW, spanH };
  for (let dr = 0; dr < spanH; dr++) {
    for (let dc = 0; dc < spanW; dc++) {
      if (dr === 0 && dc === 0) continue;
      result[`${startRow+dr},${startCol+dc}`] = { occupiedBy: primary };
    }
  }
  return result;
}

// Check if a span placement is valid (in-bounds & no overlap with existing plants)
export function spanFits(cells, zoneW, zoneH, startRow, startCol, spanW, spanH, ignoreKey = null) {
  if (startCol + spanW > zoneW || startRow + spanH > zoneH) return false;
  for (let dr = 0; dr < spanH; dr++) {
    for (let dc = 0; dc < spanW; dc++) {
      const k = `${startRow+dr},${startCol+dc}`;
      if (k === ignoreKey) continue;
      const c = cells[k];
      if (c && (c.plantId || c.occupiedBy)) return false;
    }
  }
  return true;
}

// Remove a span given the primary key
export function clearSpanCells(cells, primaryKey) {
  const primary = cells[primaryKey];
  if (!primary) return cells;
  const spanW = primary.spanW || 1, spanH = primary.spanH || 1;
  const [r, c] = primaryKey.split(",").map(Number);
  const next = { ...cells };
  for (let dr = 0; dr < spanH; dr++) {
    for (let dc = 0; dc < spanW; dc++) {
      delete next[`${r+dr},${c+dc}`];
    }
  }
  return next;
}

// Resolve a clicked key to its primary key (if it's an occupied cell)
export function resolvePrimary(cells, key) {
  const cell = cells[key];
  if (!cell) return key;
  if (cell.occupiedBy) return cell.occupiedBy;
  return key;
}

export function rectsOverlap(a, b) {
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

export function getRect(a, b) {
  if (!a || !b) return null;
  return {
    x: Math.min(a.c, b.c),
    y: Math.min(a.r, b.r),
    w: Math.abs(a.c - b.c) + 1,
    h: Math.abs(a.r - b.r) + 1,
  };
}
