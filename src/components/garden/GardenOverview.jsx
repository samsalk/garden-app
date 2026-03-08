import { useState } from "react";
import { ZONE_TYPES, ZONE_COLORS } from "@/constants/zones";
import { rectsOverlap } from "@/utils/grid";
import { AddZoneModal } from "@/components/modals/AddZoneModal";

export function GardenOverview({ garden, allPlants, onSelectZone, onAddZone, onDeleteZone }) {
  const GC = 48, GAP = 2;
  const [drawMode,      setDrawMode]      = useState(false);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [pendingRect,   setPendingRect]   = useState(null);
  const [showForm,      setShowForm]      = useState(false);

  function getZoneAt(r, c) { return garden.zones.find(z => c >= z.x && c < z.x + z.w && r >= z.y && r < z.y + z.h); }

  // Tap a cell to toggle it in/out of selection (only if not already in a zone)
  function toggleCell(r, c) {
    if (getZoneAt(r, c)) return;
    const key = `${r},${c}`;
    setSelectedCells(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // Bounding rect of all selected cells
  function getSelectionRect() {
    if (selectedCells.size === 0) return null;
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    for (const k of selectedCells) {
      const [r, c] = k.split(",").map(Number);
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    }
    return { x: minC, y: minR, w: maxC - minC + 1, h: maxR - minR + 1 };
  }

  function handleConfirmSelection() {
    const rect = getSelectionRect();
    if (!rect) return;
    if (garden.zones.some(z => rectsOverlap(rect, z))) {
      alert("Selection overlaps an existing zone — deselect the overlapping cells.");
      return;
    }
    setPendingRect(rect);
    setSelectedCells(new Set());
  }

  function exitDrawMode() {
    setDrawMode(false);
    setSelectedCells(new Set());
  }

  const selRect      = getSelectionRect();
  const totalPlanted = garden.zones.reduce((s, z) => s + Object.values(z.cells || {}).filter(c => c.plantId).length, 0);

  return (
    <div>
      <div className="garden-toolbar">
        <div style={{ flex: 1 }}>
          <div className="garden-title">{garden.name}</div>
          <div className="garden-sub">{garden.w}×{garden.h} ft · {garden.zones.length} zone{garden.zones.length !== 1 ? "s" : ""} · {totalPlanted} planted</div>
        </div>
        {drawMode ? (
          <>
            {selectedCells.size > 0 && (
              <button className="btn-p" style={{ fontSize: ".8rem", padding: ".38rem .75rem" }} onClick={handleConfirmSelection}>
                ✓ Confirm {selRect ? `${selRect.w}×${selRect.h}` : ""}
              </button>
            )}
            <button className="btn-s" onClick={exitDrawMode}>✕ Cancel</button>
          </>
        ) : (
          <>
            <button className="btn-s" onClick={() => setDrawMode(true)}>✏️ Draw Zone</button>
            <button className="btn-s" onClick={() => setShowForm(true)}>＋ Add Zone</button>
          </>
        )}
      </div>

      {drawMode && (
        <div className="draw-hint">
          {selectedCells.size === 0
            ? "Tap cells to select your zone area"
            : `${selectedCells.size} cell${selectedCells.size > 1 ? "s" : ""} selected · tap again to deselect · hit ✓ Confirm when done`}
        </div>
      )}

      <div className="garden-grid-wrap">
        <div style={{ display: "flex", marginBottom: 2 }}>
          <div style={{ width: 24 }} />
          {Array.from({ length: garden.w }, (_, c) => (
            <div key={c} style={{ width: GC, marginRight: c < garden.w - 1 ? GAP : 0, fontSize: ".6rem", color: "var(--mut)", textAlign: "center", fontWeight: 600 }}>{c + 1}</div>
          ))}
        </div>
        {Array.from({ length: garden.h }, (_, r) => (
          <div key={r} style={{ display: "flex", marginBottom: r < garden.h - 1 ? GAP : 0 }}>
            <div style={{ width: 24, fontSize: ".6rem", color: "var(--mut)", fontWeight: 600, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>{r + 1}</div>
            {Array.from({ length: garden.w }, (_, c) => {
              const zone     = getZoneAt(r, c);
              const zc       = zone ? ZONE_COLORS[zone.type] || ZONE_COLORS.raised : null;
              const inSel    = selectedCells.has(`${r},${c}`);
              const isCorner = zone && zone.x === c && zone.y === r;
              const localKey = zone ? `${r - zone.y},${c - zone.x}` : null;
              const cell     = zone && localKey ? (zone.cells || {})[localKey] : null;
              const occupiedBy  = cell?.occupiedBy;
              const primaryCell = occupiedBy && zone ? (zone.cells || {})[occupiedBy] : null;
              const plant = primaryCell?.plantId
                ? allPlants.find(p => p.id === primaryCell.plantId)
                : (cell?.plantId ? allPlants.find(p => p.id === cell.plantId) : null);

              return (
                <div key={c}
                  className={`gcell ${zone ? "planted" : "empty"} ${drawMode && !zone ? "draw-mode" : ""} ${inSel ? "in-sel" : ""}`}
                  style={{
                    width: GC, height: GC,
                    marginRight: c < garden.w - 1 ? GAP : 0,
                    borderColor: inSel ? "var(--T)" : zone ? zc.border : "var(--bdr)",
                    background:  inSel ? "rgba(196,98,45,.2)" : zone ? zc.bg : undefined,
                  }}
                  onClick={() => {
                    if (drawMode) { toggleCell(r, c); return; }
                    if (zone && ZONE_TYPES.find(t => t.id === zone.type)?.plantable) onSelectZone(zone.id);
                  }}
                  data-gr={`${r},${c}`}
                  title={zone ? zone.name : drawMode ? "Tap to select" : ""}
                >
                  {isCorner && !plant && <div className="gcell-label" style={{ color: zc.text }}>{ZONE_TYPES.find(t => t.id === zone.type)?.icon} {zone.name}</div>}
                  {plant && !occupiedBy && <span style={{ fontSize: "1rem" }}>{plant.emoji}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {garden.zones.length > 0 && (
        <div>
          <div style={{ fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--mut)", margin: "1.25rem 0 .5rem" }}>Zones — click to open</div>
          <div className="zone-legend">
            {garden.zones.map(zone => {
              const zc = ZONE_COLORS[zone.type] || ZONE_COLORS.raised, bt = ZONE_TYPES.find(t => t.id === zone.type);
              const planted = Object.values(zone.cells || {}).filter(c => c.plantId).length;
              return (
                <div key={zone.id} className="zone-chip" style={{ borderColor: zc.border, background: zc.bg, cursor: bt?.plantable ? "pointer" : "default" }} onClick={() => bt?.plantable && onSelectZone(zone.id)}>
                  <span>{bt?.icon}</span>
                  <div>
                    <div className="zone-chip-name" style={{ color: zc.text }}>{zone.name}</div>
                    <div className="zone-chip-meta">{zone.w}×{zone.h} ft{bt?.plantable ? ` · ${planted} planted` : ""}</div>
                  </div>
                  <button className="zone-chip-del" onClick={e => { e.stopPropagation(); if (confirm(`Remove "${zone.name}"?`)) onDeleteZone(zone.id); }}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {garden.zones.length === 0 && !drawMode && (
        <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--mut)", fontSize: ".88rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>🗺️</div>
          <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: ".35rem" }}>Garden is empty</div>
          <div>Use <strong>Draw Zone</strong> to tap out a raised bed, container, or path on the grid.</div>
        </div>
      )}

      {pendingRect && (
        <AddZoneModal
          rect={pendingRect}
          gardenW={garden.w} gardenH={garden.h}
          onAdd={z => { onAddZone(z); setPendingRect(null); setDrawMode(false); }}
          onClose={() => setPendingRect(null)}
        />
      )}
      {showForm && (
        <AddZoneModal
          rect={null}
          gardenW={garden.w} gardenH={garden.h}
          existingZones={garden.zones}
          onAdd={z => { onAddZone(z); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
