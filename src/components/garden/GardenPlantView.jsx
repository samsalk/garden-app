import { useState, useCallback } from "react";
import { ZONE_TYPES, ZONE_COLORS } from "@/constants/zones";
import { PaletteBar } from "./PaletteBar";
import { GardenBirdsEyeGrid } from "./GardenBirdsEyeGrid";
import { ZoneListView } from "./ZoneListView";
import { EmptyState } from "@/components/common/EmptyState";

/**
 * GardenPlantView — default garden tab view.
 *
 * Grid mode:  unified bird's-eye canvas for the whole garden (all zones at
 *             their spatial positions), horizontally + vertically scrollable.
 * List mode:  per-zone table view (no spatial layout).
 *
 * Layout management is in GardenOverview (⊞ Layout button).
 */
export function GardenPlantView({
  garden,
  allPlants,
  onCellClick,           // (gardenId, zoneId, key)
  onPaintCell,           // (gardenId, zoneId, key, plantId)
  onEnterLayout,
  onUpdateWateringFreq,  // (zoneId, days)
}) {
  const [activePlant, setActivePlant] = useState(null);
  const [bedView,     setBedView]     = useState("grid");

  const plantableZones = garden.zones.filter(z =>
    ZONE_TYPES.find(t => t.id === z.type)?.plantable
  );
  const totalPlanted = garden.zones.reduce(
    (s, z) => s + Object.values(z.cells || {}).filter(c => c.plantId).length, 0
  );

  const handleCellClick = useCallback((zoneId, key) => {
    if (activePlant) return;
    onCellClick(garden.id, zoneId, key);
  }, [activePlant, garden.id, onCellClick]);

  const handleCellPaint = useCallback((zoneId, key) => {
    if (!activePlant) return;
    onPaintCell(garden.id, zoneId, key, activePlant.id);
  }, [activePlant, garden.id, onPaintCell]);

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="gpv-header">
        <div>
          <div className="garden-title">{garden.name}</div>
          <div className="garden-sub">
            {totalPlanted} planted · {garden.zones.length} zone{garden.zones.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <div className="view-toggle">
            <button
              className={`vt-btn ${bedView === "grid" ? "on" : ""}`}
              onClick={() => setBedView("grid")}>⊞ Grid</button>
            <button
              className={`vt-btn ${bedView === "list" ? "on" : ""}`}
              onClick={() => { setBedView("list"); setActivePlant(null); }}>☰ List</button>
          </div>
          <button className="gpv-layout-btn" onClick={onEnterLayout}>✏️ Edit Layout</button>
        </div>
      </div>

      {/* ── No zones at all ─────────────────────────────────────────────── */}
      {garden.zones.length === 0 && (
        <EmptyState
          icon="🗺️"
          title="No zones yet"
          text="Draw your raised beds, containers, and paths using Edit Layout."
          actionLabel="✏️ Edit Layout"
          onAction={onEnterLayout}
        />
      )}

      {/* ── GRID MODE ───────────────────────────────────────────────────── */}
      {bedView === "grid" && garden.zones.length > 0 && (
        <>
          {/* Palette */}
          <PaletteBar
            allPlants={allPlants}
            activePlant={activePlant}
            onSelect={setActivePlant}
          />
          {activePlant && (
            <div style={{
              fontSize: ".73rem", color: "var(--mut)", marginBottom: ".75rem",
              display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap",
            }}>
              <span style={{ background: "rgba(196,98,45,.12)", padding: ".18rem .6rem", borderRadius: 20, fontWeight: 600, color: "var(--T)" }}>
                🎨 {activePlant.emoji} {activePlant.name}
              </span>
              <span>Click or drag to paint · switch to Edit mode to set size</span>
            </div>
          )}

          {/* Unified birds-eye grid */}
          <GardenBirdsEyeGrid
            garden={garden}
            allPlants={allPlants}
            activePlant={activePlant}
            onCellClick={handleCellClick}
            onCellPaint={handleCellPaint}
          />

          {/* Zone watering controls */}
          {plantableZones.length > 0 && (
            <div className="gpv-zone-list">
              {plantableZones.map(zone => {
                const zc = ZONE_COLORS[zone.type] || ZONE_COLORS.raised;
                return (
                  <div key={zone.id} className="water-freq-bar" style={{ borderLeft: `3px solid ${zc.border}` }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)", marginRight: ".15rem" }}>{zone.name}</span>
                    <span>· 💧 water every</span>
                    <input
                      type="number" min={1} max={30}
                      className="water-freq-inp"
                      value={zone.wateringFreqDays ?? 2}
                      onChange={e => {
                        const d = parseInt(e.target.value);
                        if (d > 0) onUpdateWateringFreq(zone.id, d);
                      }}
                    />
                    <span>days</span>
                    <span style={{ color: "var(--mut)", fontSize: ".72rem" }}>
                      · last watered: {zone.wateringLog?.slice(-1)[0]?.date || "never"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── LIST MODE ───────────────────────────────────────────────────── */}
      {bedView === "list" && garden.zones.length > 0 && (
        plantableZones.length === 0
          ? <EmptyState
              icon="🌱"
              title="No plantable zones"
              text="Add raised beds or containers in Layout mode."
            />
          : plantableZones.map(zone => (
              <div key={zone.id} className="zone-section">
                <div className="zone-section-head" style={{ borderLeft: `3px solid ${(ZONE_COLORS[zone.type] || ZONE_COLORS.raised).border}` }}>
                  <span className="zone-section-name" style={{ color: (ZONE_COLORS[zone.type] || ZONE_COLORS.raised).text }}>
                    {ZONE_TYPES.find(t => t.id === zone.type)?.icon} {zone.name}
                  </span>
                  <span className="zone-section-meta">
                    {zone.w}×{zone.h} ft · {Object.values(zone.cells || {}).filter(c => c.plantId).length} planted
                  </span>
                </div>
                <ZoneListView
                  zone={zone}
                  allPlants={allPlants}
                  onEditCell={key => onCellClick(garden.id, zone.id, key)}
                />
              </div>
            ))
      )}
    </div>
  );
}
