import { useState, useCallback } from "react";
import { ZONE_TYPES, ZONE_COLORS } from "@/constants/zones";
import { PaletteBar } from "./PaletteBar";
import { ZonePlantGrid } from "./ZonePlantGrid";
import { ZoneListView } from "./ZoneListView";
import { EmptyState } from "@/components/common/EmptyState";

/**
 * GardenPlantView — default garden tab view.
 * Shows all plantable zones inline (no navigation required).
 * Layout management is accessed via the ⊞ Layout button.
 */
export function GardenPlantView({
  garden,
  allPlants,
  onCellClick,         // (gardenId, zoneId, key) → DetailModal or MiniPicker
  onPaintCell,         // (gardenId, zoneId, key, plantId) → paint
  onEnterLayout,
  onUpdateWateringFreq, // (zoneId, days)
}) {
  const [activePlant, setActivePlant] = useState(null);
  const [bedView, setBedView] = useState("grid");

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
      {/* Header */}
      <div className="gpv-header">
        <div>
          <div className="garden-title">{garden.name}</div>
          <div className="garden-sub">
            {totalPlanted} planted · {garden.zones.length} zone{garden.zones.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <div className="view-toggle">
            <button className={`vt-btn ${bedView === "grid" ? "on" : ""}`}
              onClick={() => setBedView("grid")}>⊞ Grid</button>
            <button className={`vt-btn ${bedView === "list" ? "on" : ""}`}
              onClick={() => { setBedView("list"); setActivePlant(null); }}>☰ List</button>
          </div>
          <button className="gpv-layout-btn" onClick={onEnterLayout}>⊞ Layout</button>
        </div>
      </div>

      {/* Palette — grid mode only */}
      {bedView === "grid" && (
        <>
          <PaletteBar allPlants={allPlants} activePlant={activePlant} onSelect={setActivePlant} />
          {activePlant && (
            <div style={{ fontSize: ".73rem", color: "var(--mut)", marginBottom: ".75rem", display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(196,98,45,.12)", padding: ".18rem .6rem", borderRadius: 20, fontWeight: 600, color: "var(--T)" }}>
                🎨 {activePlant.emoji} {activePlant.name}
              </span>
              <span>Click or drag to paint · switch to Edit mode to set size</span>
            </div>
          )}
        </>
      )}

      {/* No plantable zones */}
      {plantableZones.length === 0 && (
        <EmptyState
          icon="🗺️"
          title="No plantable zones yet"
          text="Tap ⊞ Layout to draw raised beds, containers, and in-ground areas."
        />
      )}

      {/* Zone sections */}
      {plantableZones.map(zone => {
        const zType = ZONE_TYPES.find(t => t.id === zone.type);
        const zc    = ZONE_COLORS[zone.type] || ZONE_COLORS.raised;
        const planted = Object.values(zone.cells || {}).filter(c => c.plantId).length;

        return (
          <div key={zone.id} className="zone-section">
            <div className="zone-section-head" style={{ borderLeft: `3px solid ${zc.border}` }}>
              <span className="zone-section-name" style={{ color: zc.text }}>
                {zType?.icon} {zone.name}
              </span>
              <span className="zone-section-meta">
                {zone.w}×{zone.h} ft · {planted} planted
              </span>
            </div>

            <div className="water-freq-bar">
              💧 Water every
              <input
                type="number" min={1} max={30}
                className="water-freq-inp"
                value={zone.wateringFreqDays ?? 2}
                onChange={e => {
                  const d = parseInt(e.target.value);
                  if (d > 0) onUpdateWateringFreq(zone.id, d);
                }}
              />
              days
              <span style={{ color: "var(--mut)", fontSize: ".72rem" }}>
                · last watered: {zone.wateringLog?.slice(-1)[0]?.date || "never"}
              </span>
            </div>

            {bedView === "grid" ? (
              <ZonePlantGrid
                zone={zone}
                allPlants={allPlants}
                activePlant={activePlant}
                onCellClick={key => handleCellClick(zone.id, key)}
                onCellPaint={key => handleCellPaint(zone.id, key)}
              />
            ) : (
              <ZoneListView
                zone={zone}
                allPlants={allPlants}
                onEditCell={key => onCellClick(garden.id, zone.id, key)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
