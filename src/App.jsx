import { useState, useCallback, useMemo, useRef } from "react";
import { PLANTS } from "@/constants/plants";
import { ZONE_TYPES } from "@/constants/zones";
import { useGardenData } from "@/hooks/useGardenData";
import { useCareEngine } from "@/hooks/useCareEngine";
import { useWeather } from "@/hooks/useWeather";
import { resolvePrimary } from "@/utils/grid";
import { Sidebar } from "@/components/layout/Sidebar";
import { GardenOverview } from "@/components/garden/GardenOverview";
import { ZonePlantGrid } from "@/components/garden/ZonePlantGrid";
import { ZoneListView } from "@/components/garden/ZoneListView";
import { PaletteBar } from "@/components/garden/PaletteBar";
import { TodayTab } from "@/components/today/TodayTab";
import { GlobalList } from "@/components/views/GlobalList";
import { CalendarView } from "@/components/views/CalendarView";
import { AddGardenModal } from "@/components/modals/AddGardenModal";
import { MiniPicker } from "@/components/modals/MiniPicker";
import { DetailModal } from "@/components/modals/DetailModal";
import { SettingsModal } from "@/components/modals/SettingsModal";

export default function App() {
  const {
    data,
    addGarden, deleteGarden,
    addZone, deleteZone,
    updateCell, clearCellByKey,
    addCustomPlant, paintCell,
    logCellCare, logZoneWatering,
    updateZoneWateringFreq,
    updateSettings, updateWeatherCache,
  } = useGardenData();

  const [activeGardenId, setActiveGardenId] = useState(() => data.gardens?.[0]?.id || null);
  const [activeZoneId,   setActiveZoneId]   = useState(null);
  const [tab,            setTab]            = useState("today");
  const [bedView,        setBedView]        = useState("grid");
  const [showAddGarden,  setShowAddGarden]  = useState(false);
  const [detailCell,     setDetailCell]     = useState(null);
  const [miniPicker,     setMiniPicker]     = useState(null);
  const [activePlant,    setActivePlant]    = useState(null);
  const [showSettings,   setShowSettings]   = useState(false);
  const importRef = useRef();

  // Weather
  const settings = data.settings || {};
  const loc      = settings.location || {};
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(
    loc.lat, loc.lng, settings.weatherCache, settings.weatherCacheHours ?? 3, updateWeatherCache
  );

  const allPlants = useMemo(() => [...PLANTS, ...(data.customPlants || [])], [data.customPlants]);
  const careData  = useCareEngine(data, allPlants);

  const activeGarden = data.gardens.find(g => g.id === activeGardenId);
  const activeZone   = activeGarden?.zones.find(z => z.id === activeZoneId);
  const zMeta = t => ZONE_TYPES.find(x => x.id === t);

  // --- Actions ---
  function handleAddGarden(g) {
    addGarden(g);
    setActiveGardenId(g.id);
    setActiveZoneId(null);
    setShowAddGarden(false);
    setTab("garden");
  }

  function handleDeleteGarden(id) {
    deleteGarden(id);
    if (activeGardenId === id) {
      setActiveGardenId(data.gardens.find(g => g.id !== id)?.id || null);
      setActiveZoneId(null);
    }
  }

  function handleCellClick(gId, zId, key) {
    if (activePlant) return;
    const g = data.gardens.find(x => x.id === gId);
    const z = g?.zones.find(x => x.id === zId);
    const cells = z?.cells || {};
    const primaryKey = resolvePrimary(cells, key);
    const primaryCell = cells[primaryKey];
    if (primaryCell?.plantId) {
      setDetailCell({ gardenId: gId, zoneId: zId, key: primaryKey });
    } else {
      const el = document.querySelector(`[data-pk="${key}"]`);
      const pos = el
        ? { x: el.getBoundingClientRect().right + 6, y: el.getBoundingClientRect().top }
        : { x: window.innerWidth / 2 - 140, y: window.innerHeight / 2 - 240 };
      setMiniPicker({ gardenId: gId, zoneId: zId, key, pos });
    }
  }

  const handleCellPaint = useCallback((gId, zId, key) => {
    if (!activePlant) return;
    paintCell(gId, zId, key, activePlant.id);
  }, [activePlant, paintCell]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "garden-plan.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        localStorage.setItem("gp-v5", JSON.stringify(d));
        window.location.reload();
      } catch { alert("Invalid file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // --- Render ---
  return (
    <>
      <div className="app">
        {/* Desktop sidebar */}
        <Sidebar
          gardens={data.gardens}
          activeId={activeGardenId}
          onSelect={id => { setActiveGardenId(id); setActiveZoneId(null); setTab("garden"); }}
          onAdd={() => setShowAddGarden(true)}
          onDelete={handleDeleteGarden}
          onExport={exportData}
          onImport={importData}
        />

        <div className="main">
          {/* Header */}
          <div className="hdr">
            <span className="hdr-title">🌱 Garden Planner</span>
            <div className="nav-tabs">
              <button className={`nav-tab ${tab === "today"     ? "on" : ""}`} onClick={() => setTab("today")}>🌤 Today</button>
              <button className={`nav-tab ${tab === "garden"    ? "on" : ""}`} onClick={() => setTab("garden")}>🗺 Garden</button>
              <button className={`nav-tab ${tab === "allplants" ? "on" : ""}`} onClick={() => setTab("allplants")}>🌿 Plants</button>
              <button className={`nav-tab ${tab === "calendar"  ? "on" : ""}`} onClick={() => setTab("calendar")}>📅 Calendar</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
              <button className="gear-btn" title="Settings" onClick={() => setShowSettings(true)}>⚙️</button>
              {tab === "garden" && activeZone && (
                <div className="view-toggle">
                  <button className={`vt-btn ${bedView === "grid" ? "on" : ""}`} onClick={() => setBedView("grid")}>⊞ Grid</button>
                  <button className={`vt-btn ${bedView === "list" ? "on" : ""}`} onClick={() => setBedView("list")}>☰ List</button>
                </div>
              )}
            </div>
          </div>

          <div className="content">
            {/* TODAY TAB */}
            {tab === "today" && (
              <TodayTab
                careData={careData}
                onLog={(gId, zId, key, careType) => logCellCare(gId, zId, key, careType)}
                onLogWatering={(gId, zId) => logZoneWatering(gId, zId)}
                weather={weather}
                weatherLoading={weatherLoading}
                weatherError={weatherError}
                frostThresholdF={settings.frostThresholdF ?? 35}
                city={loc.city}
              />
            )}

            {/* GARDEN TAB */}
            {tab === "garden" && (
              <>
                {/* Mobile garden switcher — hidden on desktop */}
                {data.gardens.length > 0 && (
                  <div className="mob-garden-bar">
                    {data.gardens.map(g => (
                      <button key={g.id}
                        className={`mgb-item ${g.id === activeGardenId ? "on" : ""}`}
                        onClick={() => { setActiveGardenId(g.id); setActiveZoneId(null); }}>
                        🌿 {g.name}
                      </button>
                    ))}
                    <button className="mgb-add" onClick={() => setShowAddGarden(true)}>+ New</button>
                  </div>
                )}

                {!activeGarden
                  ? <div className="empty-state">
                      <div className="es-icon">🌿</div>
                      <div className="es-title">No gardens yet</div>
                      <div className="es-text">Create your overall garden space first, then divide it into raised beds, containers, and paths.</div>
                      <button className="btn-p" onClick={() => setShowAddGarden(true)}>Create Your First Garden</button>
                    </div>
                  : activeZone
                    ? <>
                        <div className="breadcrumb">
                          <span className="bc-link" onClick={() => setActiveZoneId(null)}>{activeGarden.name}</span>
                          <span style={{ color: "var(--bdr)" }}>›</span>
                          <span>{zMeta(activeZone.type)?.icon} {activeZone.name}</span>
                        </div>
                        <div className="bed-hdr">
                          <div>
                            <div className="bed-title">{zMeta(activeZone.type)?.icon} {activeZone.name}</div>
                            <div className="bed-meta">
                              <span className="type-badge">{zMeta(activeZone.type)?.label}</span>
                              <span style={{ fontSize: ".75rem", color: "var(--mut)" }}>{activeZone.w}×{activeZone.h} ft</span>
                            </div>
                          </div>
                          {(() => {
                            const cells = activeZone.cells || {};
                            const planted   = Object.values(cells).filter(c => c.plantId).length;
                            const total     = activeZone.w * activeZone.h;
                            const varieties = new Set(Object.values(cells).filter(c => c.plantId).map(c => c.plantId)).size;
                            return (
                              <div className="stat-chips">
                                <div className="sch"><span style={{ color: "var(--T)", fontWeight: 700 }}>{planted}</span> planted</div>
                                <div className="sch"><span style={{ color: "#4a7a3a", fontWeight: 700 }}>{total - planted}</span> open</div>
                                <div className="sch"><span style={{ fontWeight: 700 }}>{varieties}</span> varieties</div>
                              </div>
                            );
                          })()}
                        </div>
                        {zMeta(activeZone.type)?.plantable && (
                          <div className="water-freq-bar">
                            💧 Water every
                            <input
                              type="number" min={1} max={30}
                              className="water-freq-inp"
                              value={activeZone.wateringFreqDays ?? 2}
                              onChange={e => {
                                const d = parseInt(e.target.value);
                                if (d > 0) updateZoneWateringFreq(activeGardenId, activeZoneId, d);
                              }}
                            />
                            days
                            <span style={{ color: "var(--mut)", fontSize: ".72rem" }}>
                              · last watered: {activeZone.wateringLog?.slice(-1)[0]?.date || "never"}
                            </span>
                          </div>
                        )}
                        {bedView === "grid" && (
                          <>
                            <PaletteBar allPlants={allPlants} activePlant={activePlant} onSelect={setActivePlant} />
                            {activePlant && (
                              <div style={{ fontSize: ".73rem", color: "var(--mut)", marginBottom: ".75rem", display: "flex", alignItems: "center", gap: ".4rem", flexWrap: "wrap" }}>
                                <span style={{ background: "rgba(196,98,45,.12)", padding: ".18rem .6rem", borderRadius: 20, fontWeight: 600, color: "var(--T)" }}>🎨 {activePlant.emoji} {activePlant.name}</span>
                                <span>Click or drag to paint (1×1) · switch to Edit mode to set size</span>
                              </div>
                            )}
                            <ZonePlantGrid
                              zone={activeZone}
                              allPlants={allPlants}
                              activePlant={activePlant}
                              onCellClick={key => handleCellClick(activeGardenId, activeZoneId, key)}
                              onCellPaint={key => handleCellPaint(activeGardenId, activeZoneId, key)}
                            />
                          </>
                        )}
                        {bedView === "list" && (
                          <ZoneListView
                            zone={activeZone}
                            allPlants={allPlants}
                            onEditCell={key => setDetailCell({ gardenId: activeGardenId, zoneId: activeZoneId, key })}
                          />
                        )}
                      </>
                    : <GardenOverview
                        garden={activeGarden}
                        allPlants={allPlants}
                        onSelectZone={id => { setActiveZoneId(id); setBedView("grid"); }}
                        onAddZone={z => addZone(activeGardenId, z)}
                        onDeleteZone={id => { deleteZone(activeGardenId, id); if (activeZoneId === id) setActiveZoneId(null); }}
                      />
                }
              </>
            )}

            {/* ALL PLANTS TAB */}
            {tab === "allplants" && (
              <div>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontFamily: "'Lora',serif", fontSize: "1.25rem", fontWeight: 700 }}>All Plants</div>
                  <div style={{ fontSize: ".8rem", color: "var(--mut)", marginTop: ".15rem" }}>Across {data.gardens.length} garden{data.gardens.length !== 1 ? "s" : ""}</div>
                </div>
                <GlobalList gardens={data.gardens} allPlants={allPlants} onEditCell={(gId, zId, key) => setDetailCell({ gardenId: gId, zoneId: zId, key })} />
              </div>
            )}

            {/* CALENDAR TAB */}
            {tab === "calendar" && <CalendarView gardens={data.gardens} allPlants={allPlants} />}
          </div>
        </div>

        {/* Modals */}
        {showSettings && (
          <SettingsModal
            settings={settings}
            onSave={s => { updateSettings(s); setShowSettings(false); }}
            onClose={() => setShowSettings(false)}
            onExport={exportData}
            onImport={() => importRef.current?.click()}
          />
        )}

        {showAddGarden && <AddGardenModal onAdd={handleAddGarden} onClose={() => setShowAddGarden(false)} />}

        {miniPicker && (() => {
          const g = data.gardens.find(x => x.id === miniPicker.gardenId);
          const z = g?.zones.find(x => x.id === miniPicker.zoneId);
          return z ? (
            <MiniPicker
              pos={miniPicker.pos}
              allPlants={allPlants}
              zone={z}
              startKey={miniPicker.key}
              onConfirm={(plantId, sw, sh) => {
                updateCell(miniPicker.gardenId, miniPicker.zoneId, miniPicker.key, { plantId, status: "planned" }, sw, sh);
                setMiniPicker(null);
              }}
              onClose={() => setMiniPicker(null)}
            />
          ) : null;
        })()}

        {detailCell && (() => {
          const g = data.gardens.find(x => x.id === detailCell.gardenId);
          const z = g?.zones.find(x => x.id === detailCell.zoneId);
          const cell = (z?.cells || {})[detailCell.key] || {};
          return z ? (
            <DetailModal
              cell={cell}
              cellKey={detailCell.key}
              zoneName={z.name}
              zone={z}
              allPlants={allPlants}
              onCustomPlant={addCustomPlant}
              onSave={cd => { updateCell(detailCell.gardenId, detailCell.zoneId, detailCell.key, cd, cd.spanW || 1, cd.spanH || 1); setDetailCell(null); }}
              onClear={() => { clearCellByKey(detailCell.gardenId, detailCell.zoneId, detailCell.key); setDetailCell(null); }}
              onClose={() => setDetailCell(null)}
            />
          ) : null;
        })()}

        <input ref={importRef} type="file" accept=".json" style={{ display: "none" }} onChange={importData} />
      </div>

      {/* Mobile bottom tab bar */}
      <div className="bottom-tab-bar">
        <button className={`btb-tab ${tab === "today"     ? "on" : ""}`} onClick={() => setTab("today")}>
          <span className="btb-icon">🌤</span>Today
        </button>
        <button className={`btb-tab ${tab === "garden"    ? "on" : ""}`} onClick={() => setTab("garden")}>
          <span className="btb-icon">🗺</span>Garden
        </button>
        <button className={`btb-tab ${tab === "allplants" ? "on" : ""}`} onClick={() => setTab("allplants")}>
          <span className="btb-icon">🌿</span>Plants
        </button>
        <button className={`btb-tab ${tab === "calendar"  ? "on" : ""}`} onClick={() => setTab("calendar")}>
          <span className="btb-icon">📅</span>Calendar
        </button>
      </div>
    </>
  );
}
