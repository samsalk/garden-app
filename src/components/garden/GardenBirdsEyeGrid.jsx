import { useRef, useEffect } from "react";
import { ZONE_TYPES, ZONE_COLORS } from "@/constants/zones";
import { STATUSES } from "@/constants/ui";
import { resolvePrimary } from "@/utils/grid";

const GC  = 54;  // cell px
const GAP = 3;   // gap px
const LABEL_COL = 22; // row-number column width
const LABEL_ROW = 18; // col-number row height

/**
 * GardenBirdsEyeGrid — unified single-canvas grid for a whole garden.
 * Zones are positioned at their x,y offsets; plants render inside each zone.
 * Supports paint-mode drag on both mouse and touch.
 *
 * Touch painting:
 *  - onTouchStart fires on the initial cell (equivalent to mousedown)
 *  - A non-passive touchmove listener on the scroll wrap uses
 *    elementFromPoint() to find the cell under the finger and paint it.
 *    It also calls preventDefault() to suppress scroll while painting.
 *  - touch-action: none on the scroll wrap when activePlant is set lets
 *    our JS fully own the gesture without browser interference.
 */
export function GardenBirdsEyeGrid({
  garden,
  allPlants,
  activePlant,         // plant object or null (paint mode when set)
  onCellClick,         // (zoneId, localKey) — open MiniPicker or DetailModal
  onCellPaint,         // (zoneId, localKey) — paint mode
}) {
  const dragging       = useRef(false);
  const painted        = useRef(new Set());
  const scrollWrapRef  = useRef(null);

  // Keep refs current so the non-reactive touchmove listener always sees
  // the latest values without being re-attached on every render.
  const activePlantRef = useRef(activePlant);
  activePlantRef.current = activePlant;
  const onCellPaintRef = useRef(onCellPaint);
  onCellPaintRef.current = onCellPaint;

  // ── Global drag-end listeners ──────────────────────────────────────────
  useEffect(() => {
    const end = () => { dragging.current = false; };
    window.addEventListener("mouseup",     end);
    window.addEventListener("touchend",    end);
    window.addEventListener("touchcancel", end);
    return () => {
      window.removeEventListener("mouseup",     end);
      window.removeEventListener("touchend",    end);
      window.removeEventListener("touchcancel", end);
    };
  }, []);

  // ── Non-passive touchmove — must be imperative to call preventDefault ──
  useEffect(() => {
    const el = scrollWrapRef.current;
    if (!el) return;

    const handleTouchMove = (e) => {
      // Only intercept when actively painting
      if (!dragging.current || !activePlantRef.current) return;

      // Suppress page scroll while the finger is painting
      e.preventDefault();

      const touch  = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      // Walk up to find a cell (handles children like emoji spans)
      const cell   = target?.closest("[data-pk]");
      if (!cell) return;

      const pk     = cell.dataset.pk;
      const zoneId = cell.dataset.zoneId;
      if (!pk || !zoneId) return;

      const paintKey = `${zoneId}:${pk}`;
      if (painted.current.has(paintKey)) return;

      onCellPaintRef.current(zoneId, pk);
      painted.current.add(paintKey);
    };

    // { passive: false } is required to be able to call preventDefault()
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, []); // attach once; refs carry latest values

  // ── Grid layout ────────────────────────────────────────────────────────
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `${LABEL_COL}px repeat(${garden.w}, ${GC}px)`,
    gridTemplateRows:    `${LABEL_ROW}px repeat(${garden.h}, ${GC}px)`,
    gap: `${GAP}px`,
    userSelect: "none",
    minWidth: LABEL_COL + garden.w * GC + garden.w * GAP,
  };

  // Fast lookup: "gardenR,gardenC" → zone
  const zoneAtPos = {};
  for (const z of garden.zones) {
    for (let dr = 0; dr < z.h; dr++) {
      for (let dc = 0; dc < z.w; dc++) {
        zoneAtPos[`${z.y + dr},${z.x + dc}`] = z;
      }
    }
  }

  const items = [];

  // Corner
  items.push(<div key="corner" style={{ gridColumn: 1, gridRow: 1 }} />);

  // Column labels
  for (let c = 0; c < garden.w; c++) {
    items.push(
      <div key={`cl-${c}`} style={{
        gridColumn: c + 2, gridRow: 1,
        fontSize: ".6rem", color: "var(--mut)", fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {c + 1}
      </div>
    );
  }

  // Row labels
  for (let r = 0; r < garden.h; r++) {
    items.push(
      <div key={`rl-${r}`} style={{
        gridColumn: 1, gridRow: r + 2,
        fontSize: ".6rem", color: "var(--mut)", fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {r + 1}
      </div>
    );
  }

  // Track positions claimed by spanning primaries so we can skip them
  const claimed = new Set();
  for (const zone of garden.zones) {
    for (const [key, cell] of Object.entries(zone.cells || {})) {
      if (cell.occupiedBy) continue;
      const [lr, lc] = key.split(",").map(Number);
      const spanW = cell.spanW || 1, spanH = cell.spanH || 1;
      if (spanW > 1 || spanH > 1) {
        for (let dr = 0; dr < spanH; dr++) {
          for (let dc = 0; dc < spanW; dc++) {
            if (dr === 0 && dc === 0) continue;
            claimed.add(`${zone.y + lr + dr},${zone.x + lc + dc}`);
          }
        }
      }
    }
  }

  // Cells
  for (let r = 0; r < garden.h; r++) {
    for (let c = 0; c < garden.w; c++) {
      const posKey = `${r},${c}`;
      if (claimed.has(posKey)) continue;

      const zone      = zoneAtPos[posKey];
      const zType     = zone ? ZONE_TYPES.find(t => t.id === zone.type) : null;
      const plantable = zType?.plantable ?? false;
      const zc        = zone ? (ZONE_COLORS[zone.type] || ZONE_COLORS.raised) : null;
      const isCorner  = zone && zone.x === c && zone.y === r;

      const localKey    = zone ? `${r - zone.y},${c - zone.x}` : null;
      const cells       = zone?.cells || {};
      const rawCell     = localKey ? cells[localKey] : null;
      const primaryKey  = rawCell?.occupiedBy ?? localKey;
      const primaryCell = primaryKey ? cells[primaryKey] : null;

      const plant       = primaryCell?.plantId ? allPlants.find(p => p.id === primaryCell.plantId) : null;
      const spanW       = primaryCell?.spanW || 1;
      const spanH       = primaryCell?.spanH || 1;
      const sdot        = primaryCell?.status ? STATUSES.find(s => s.id === primaryCell.status) : null;
      const nextUpPlant = (primaryCell?.status === "harvested" && primaryCell?.nextUp?.plantId)
        ? allPlants.find(p => p.id === primaryCell.nextUp.plantId) : null;

      // Non-zone cell
      if (!zone) {
        items.push(
          <div key={`nz-${posKey}`} style={{
            gridColumn: c + 2, gridRow: r + 2,
            background: "rgba(0,0,0,.02)", borderRadius: 4,
          }} />
        );
        continue;
      }

      // Cell styling
      let bg, border, cursor;
      if (!plantable) {
        bg = zc.bg; border = `2px solid ${zc.border}`; cursor = "default";
      } else if (plant) {
        bg = plant.color + "2a"; border = `2px solid ${plant.color}`; cursor = "pointer";
      } else {
        bg = "rgba(0,0,0,.025)"; border = "2px solid var(--bdr)";
        cursor = activePlant ? "crosshair" : "pointer";
      }
      const textColor = plant ? undefined : (plantable ? "var(--bdr)" : zc.text);

      // ── Paint helpers (shared by mouse and touch) ──
      const doPaint = () => {
        if (!activePlant || !plantable) return false;
        const paintKey = `${zone.id}:${localKey}`;
        if (painted.current.has(paintKey)) return false;
        onCellPaint(zone.id, localKey);
        painted.current.add(paintKey);
        return true;
      };

      // Mouse handlers
      const handleMouseDown = () => {
        dragging.current = true;
        painted.current  = new Set();
        doPaint();
      };
      const handleMouseEnter = () => {
        if (!dragging.current) return;
        doPaint();
      };

      // Touch start (the touchmove handler lives on the scroll wrap)
      const handleTouchStart = (e) => {
        if (!activePlant || !plantable) return;
        // Prevent the tap from also triggering a click/scroll
        e.stopPropagation();
        dragging.current = true;
        painted.current  = new Set();
        doPaint();
      };

      const handleClick = () => {
        if (!plantable || activePlant) return; // paint handled by down/touch
        onCellClick(zone.id, resolvePrimary(cells, localKey));
      };

      items.push(
        <div key={`${zone.id}-${localKey}`}
          data-pk={localKey}
          data-zone-id={zone.id}
          className={[
            "beye-cell",
            plant ? "has-plant" : (plantable ? "empty-cell" : "nonplant-cell"),
            activePlant && plantable ? "paint-ready" : "",
          ].join(" ")}
          style={{
            gridColumn: `${c + 2} / span ${spanW}`,
            gridRow:    `${r + 2} / span ${spanH}`,
            background: bg,
            border,
            cursor,
            fontSize:   plant ? "1.4rem" : ".65rem",
            color:      textColor,
            // When painting, disable browser touch handling on individual cells
            // so our non-passive listener has full control.
            touchAction: activePlant && plantable ? "none" : "manipulation",
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onTouchStart={handleTouchStart}
          onClick={handleClick}
          title={
            plant
              ? `${plant.emoji} ${primaryCell.variety || plant.name}${spanW > 1 || spanH > 1 ? ` · ${spanW}×${spanH} sqft` : ""}`
              : (plantable ? (activePlant ? "Tap or drag to paint" : "Tap to assign") : (zone?.name || ""))
          }
        >
          {isCorner && (
            <div className="beye-zone-label" style={{ color: plantable ? "var(--mut)" : zc.text }}>
              {zType?.icon} {zone.name}
            </div>
          )}

          {plant ? (
            <>
              <span className="pcell-emoji">{plant.emoji}</span>
              {(spanW > 1 || spanH > 1)
                ? <span className="pcell-span-label">
                    {primaryCell.variety
                      ? primaryCell.variety.slice(0, 7) + (primaryCell.variety.length > 7 ? "…" : "")
                      : `${spanW}×${spanH} sqft`}
                  </span>
                : (primaryCell.variety &&
                    <span className="pcell-variety">
                      {primaryCell.variety.slice(0, 9)}{primaryCell.variety.length > 9 ? "…" : ""}
                    </span>)
              }
              {sdot       && <div className="pcell-dot"   style={{ background: sdot.color }} />}
              {nextUpPlant && <span className="pcell-nextup" title={`Next up: ${nextUpPlant.name}`}>{nextUpPlant.emoji}</span>}
            </>
          ) : (
            plantable && "+"
          )}
        </div>
      );
    }
  }

  return (
    <div
      ref={scrollWrapRef}
      className="beye-scroll-wrap"
      // Disable browser scroll/pan on the whole wrap when in paint mode,
      // so the non-passive touchmove listener can call preventDefault().
      style={{ touchAction: activePlant ? "none" : "auto" }}
    >
      <div style={gridStyle}>
        {items}
      </div>
    </div>
  );
}
