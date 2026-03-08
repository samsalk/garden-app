import { useState } from "react";
import { SPAN_PRESETS, STATUSES } from "@/constants/ui";
import { PLANT_CARE_TYPES, CARE_ICONS, CARE_LABELS, DEFAULT_FREQ } from "@/constants/care";
import { spanFits } from "@/utils/grid";
import { addDays, genId } from "@/utils/date";
import { useDragToClose } from "@/hooks/useDragToClose";

export function DetailModal({ cell, cellKey, zoneName, zone, allPlants, onCustomPlant, onSave, onClear, onClose }) {
  const [r, c] = cellKey.split(",").map(Number);
  const [plantId,    setPlantId]    = useState(cell.plantId     || "");
  const [variety,    setVariety]    = useState(cell.variety     || "");
  const [status,     setStatus]     = useState(cell.status      || "planted");
  const [plantedDt,  setPlantedDt]  = useState(cell.plantedDate || "");
  const [harvestDt,  setHarvestDt]  = useState(cell.harvestDate || "");
  const [notes,      setNotes]      = useState(cell.notes       || "");
  const [spanW,      setSpanW]      = useState(cell.spanW       || 1);
  const [spanH,      setSpanH]      = useState(cell.spanH       || 1);
  const [customMode,    setCustomMode]    = useState(false);
  const [showAdvCare,   setShowAdvCare]   = useState(false);
  const { modalStyle, handleProps: dragHandleProps } = useDragToClose(onClose);
  const [nextUpPlant, setNextUpPlant] = useState(cell.nextUp?.plantId  || "");
  const [nextUpDate,  setNextUpDate]  = useState(cell.nextUp?.targetDate || "");
  const [cName,      setCName]      = useState("");
  const [cEmoji,     setCEmoji]     = useState("🌱");
  const [cBaseId,    setCBaseId]    = useState("");
  const [cDth,       setCDth]       = useState("");
  const [cSpacing,   setCSpacing]   = useState("");
  const [cNotes,     setCNotes]     = useState("");

  // Care schedule overrides: "" = use plant default, "0" = skip, "N" = every N days
  const [careOverrides, setCareOverrides] = useState(() => {
    const cs = cell.careSchedule || {};
    return Object.fromEntries(
      PLANT_CARE_TYPES.map(t => [t, cs[t] === null ? "0" : cs[t] != null ? String(cs[t]) : ""])
    );
  });

  const plant = allPlants.find(p => p.id === plantId);
  const resizeFits = zone ? spanFits(zone.cells || {}, zone.w, zone.h, r, c, spanW, spanH, cellKey) : false;
  const spanChanged = spanW !== (cell.spanW || 1) || spanH !== (cell.spanH || 1);

  function syncHarvest(pid, pd) {
    const p = allPlants.find(x => x.id === pid);
    if (p?.dth && pd) setHarvestDt(addDays(pd, p.dth));
  }

  function effectiveDefault(careType) {
    return plant?.careDefaults?.[careType] ?? DEFAULT_FREQ[careType];
  }

  function buildCareSchedule() {
    const cs = {};
    PLANT_CARE_TYPES.forEach(t => {
      const v = careOverrides[t];
      if (v === "" || v == null) return; // omit = use plant/global default
      const n = parseInt(v);
      cs[t] = isNaN(n) || n <= 0 ? null : n; // 0 → null (skip)
    });
    return cs;
  }

  const basePlants = allPlants.filter(p => p.type !== "custom");

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={modalStyle} onClick={e => e.stopPropagation()}>
        <div className="modal-drag" {...dragHandleProps}/>
        <div className="modal-title">
          {zoneName} · Row {r+1}, Col {c+1}
          {plant && <span style={{ fontWeight: 400, fontStyle: "italic", marginLeft: ".5rem", color: "var(--mut)", fontSize: ".9rem" }}>{plant.emoji} {variety || plant.name}</span>}
        </div>

        {/* Plant + Variety — side by side */}
        <div className="row2" style={{ marginBottom: ".85rem" }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="lbl">Plant</label>
            <select className="sel-i" value={plantId} onChange={e => { setPlantId(e.target.value); setVariety(""); syncHarvest(e.target.value, plantedDt); }}>
              <option value="">— select —</option>
              {["vegetable","fruit","herb","flower","custom"].map(type => {
                const grp = allPlants.filter(p => p.type === type);
                if (!grp.length) return null;
                return (
                  <optgroup key={type} label={type.charAt(0).toUpperCase()+type.slice(1)+"s"}>
                    {grp.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                  </optgroup>
                );
              })}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="lbl">Variety <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <input className="inp" value={variety} onChange={e => setVariety(e.target.value)}
              placeholder={plant ? `e.g. ${plant.id === "tomato" ? "Cherokee Purple" : plant.id === "pepper" ? "Shishito" : plant.id === "lettuce" ? "Buttercrunch" : "specific variety…"}` : "specific variety…"}
              disabled={!plantId}
            />
          </div>
        </div>

        {plant?.dth && (
          <div className="pib">
            <strong>{variety || plant.name}</strong>{variety ? <span style={{ color: "var(--mut)", fontWeight: 400 }}> ({plant.name})</span> : null} · {plant.type} · ~{plant.dth} days to harvest · {plant.spacing}
            {plant.notes && <div style={{ marginTop: 2, fontStyle: "italic" }}>💡 {plant.notes}</div>}
          </div>
        )}

        {/* Span */}
        <div className="field">
          <label className="lbl">Plant Size (sq ft) — current {cell.spanW||1}×{cell.spanH||1}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", marginBottom: ".4rem" }}>
            {SPAN_PRESETS.map(p => {
              const active = spanW === p.w && spanH === p.h;
              const wouldFit = zone ? spanFits(zone.cells || {}, zone.w, zone.h, r, c, p.w, p.h, cellKey) : false;
              return (
                <button key={p.label} className={`mp-span-btn ${active ? "sel" : ""}`}
                  style={!wouldFit ? { opacity: .35, cursor: "not-allowed" } : {}}
                  onClick={() => { if (!wouldFit) return; setSpanW(p.w); setSpanH(p.h); }}>
                  {p.label}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".78rem", color: "var(--mut)" }}>
            <span>Custom:</span>
            <input type="number" className="mp-span-inp" min={1} max={zone?.w||10} value={spanW} onChange={e => setSpanW(parseInt(e.target.value)||1)}/>
            <span>×</span>
            <input type="number" className="mp-span-inp" min={1} max={zone?.h||10} value={spanH} onChange={e => setSpanH(parseInt(e.target.value)||1)}/>
            <span>ft</span>
          </div>
          {spanChanged && !resizeFits && <div style={{ fontSize: ".72rem", color: "#b00", marginTop: ".35rem" }}>⚠️ New size doesn't fit.</div>}
        </div>

        {/* Custom plant — for species not in the built-in library */}
        {!customMode && (
          <button className="btn-s" style={{ marginBottom: ".85rem", fontSize: ".75rem", padding: ".3rem .7rem" }} onClick={() => setCustomMode(true)}>
            + Create custom plant
          </button>
        )}
        {customMode && (
          <div style={{ background: "var(--C)", border: "1px solid var(--bdr)", borderRadius: 8, padding: ".75rem", marginBottom: ".85rem" }}>
            <div style={{ fontWeight: 600, fontSize: ".75rem", color: "var(--mut)", marginBottom: ".5rem" }}>Custom Plant / Variety</div>
            <div className="field">
              <label className="lbl">Based on (optional)</label>
              <select className="sel-i" value={cBaseId} onChange={e => setCBaseId(e.target.value)}>
                <option value="">— none / from scratch —</option>
                {basePlants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
              </select>
              {cBaseId && (() => {
                const base = allPlants.find(p => p.id === cBaseId);
                return base ? <div style={{ fontSize: ".7rem", color: "var(--mut)", marginTop: ".25rem" }}>↳ inherits: {base.dth} days, {base.spacing}{base.notes ? `, ${base.notes}` : ""}</div> : null;
              })()}
            </div>
            <div className="row2" style={{ marginBottom: ".5rem" }}>
              <div><label className="lbl">Name</label><input className="inp" value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. Cherry Tomato"/></div>
              <div><label className="lbl">Emoji</label><input className="inp" value={cEmoji} onChange={e => setCEmoji(e.target.value)} maxLength={2}/></div>
            </div>
            <div className="row2" style={{ marginBottom: ".5rem" }}>
              <div>
                <label className="lbl">Days to Harvest</label>
                <input type="number" className="inp" min={1} max={999} value={cDth}
                  placeholder={cBaseId ? String(allPlants.find(p=>p.id===cBaseId)?.dth || "") : "e.g. 65"}
                  onChange={e => setCDth(e.target.value)}/>
              </div>
              <div>
                <label className="lbl">Spacing</label>
                <input className="inp" value={cSpacing}
                  placeholder={cBaseId ? (allPlants.find(p=>p.id===cBaseId)?.spacing || "") : "e.g. 4/sqft"}
                  onChange={e => setCSpacing(e.target.value)}/>
              </div>
            </div>
            <div style={{ marginBottom: ".5rem" }}>
              <label className="lbl">Notes</label>
              <input className="inp" value={cNotes}
                placeholder={cBaseId ? (allPlants.find(p=>p.id===cBaseId)?.notes || "Optional notes…") : "Optional notes…"}
                onChange={e => setCNotes(e.target.value)}/>
            </div>
            <div style={{ display: "flex", gap: ".4rem" }}>
              <button className="btn-p" style={{ fontSize: ".78rem", padding: ".35rem .75rem" }} onClick={() => {
                if (!cName.trim()) return;
                const base = cBaseId ? allPlants.find(p => p.id === cBaseId) : null;
                const parsedDth = parseInt(cDth);
                const p = {
                  id: "custom-" + genId(),
                  name: cName.trim(), type: "custom", emoji: cEmoji,
                  color: base?.color || "#5a7a50",
                  baseId: cBaseId || undefined,
                  dth:     !isNaN(parsedDth) && parsedDth > 0 ? parsedDth : base?.dth,
                  spacing: cSpacing.trim() || base?.spacing,
                  notes:   cNotes.trim()   || base?.notes,
                  defaultSpan:  base?.defaultSpan || [1,1],
                  careDefaults: base?.careDefaults,
                };
                onCustomPlant(p); setPlantId(p.id); setCustomMode(false);
                setCName(""); setCEmoji("🌱"); setCBaseId(""); setCDth(""); setCSpacing(""); setCNotes("");
              }}>Add</button>
              <button className="btn-s" style={{ fontSize: ".78rem", padding: ".35rem .75rem" }} onClick={() => setCustomMode(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="field">
          <label className="lbl">Status</label>
          <div className="st-row">
            {STATUSES.map(s => (
              <button key={s.id} className="st-btn" onClick={() => setStatus(s.id)}
                style={{ background: status === s.id ? s.color : "transparent", borderColor: status === s.id ? s.color : "var(--bdr)", color: status === s.id ? "#fff" : "var(--mut)" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="row2">
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="lbl">Date Planted</label>
            <input type="date" className="inp" value={plantedDt} onChange={e => { setPlantedDt(e.target.value); syncHarvest(plantId, e.target.value); }}/>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="lbl">Exp. Harvest</label>
            <input type="date" className="inp" value={harvestDt} onChange={e => setHarvestDt(e.target.value)}/>
          </div>
        </div>

        {/* Care schedule — collapsible */}
        {(() => {
          const activeOverrides = PLANT_CARE_TYPES.filter(t => careOverrides[t] !== "").length;
          return (
            <div className="field" style={{ marginTop: ".9rem" }}>
              <button
                className="adv-toggle"
                onClick={() => setShowAdvCare(v => !v)}
              >
                <span>⚙️ Care Schedule</span>
                <span style={{ display: "flex", alignItems: "center", gap: ".35rem" }}>
                  {activeOverrides > 0 && !showAdvCare && (
                    <span className="adv-badge">{activeOverrides} override{activeOverrides > 1 ? "s" : ""}</span>
                  )}
                  <span style={{ fontSize: ".7rem", color: "var(--mut)", fontWeight: 400 }}>{showAdvCare ? "▲ hide" : "▼ show"}</span>
                </span>
              </button>
              {showAdvCare && (
                <div style={{ marginTop: ".55rem" }}>
                  <div style={{ fontSize: ".68rem", color: "var(--mut)", marginBottom: ".45rem" }}>Blank = plant default · 0 = skip this task</div>
                  <div className="care-sched-grid">
                    {PLANT_CARE_TYPES.map(t => {
                      const def = effectiveDefault(t);
                      const plantSkips = plant?.careDefaults?.[t] === null;
                      return (
                        <div key={t} className="care-sched-row">
                          <span className="care-sched-icon">{CARE_ICONS[t]}</span>
                          <span className="care-sched-label">{CARE_LABELS[t]}</span>
                          <input
                            type="number" min={0} max={365}
                            className="mp-span-inp"
                            value={careOverrides[t]}
                            placeholder={plantSkips ? "—" : String(def)}
                            disabled={plantSkips}
                            onChange={e => setCareOverrides(prev => ({ ...prev, [t]: e.target.value }))}
                            style={{ width: 48 }}
                            title={plantSkips ? "Plant default: skip" : `Plant default: every ${def} days`}
                          />
                          <span className="care-sched-unit" style={{ color: careOverrides[t] === "0" ? "var(--color-critical)" : "var(--mut)" }}>
                            {careOverrides[t] === "0" ? "skip" : careOverrides[t] ? "days" : "d (default)"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Next Up */}
        {["growing", "harvested", "failed"].includes(status) && (
          <div className="field" style={{ marginTop: ".9rem" }}>
            <label className="lbl">Next Up <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--mut)" }}>after this crop</span></label>
            <select className="sel-i" value={nextUpPlant} onChange={e => setNextUpPlant(e.target.value)}>
              <option value="">— none —</option>
              {["vegetable","fruit","herb","flower","custom"].map(type => {
                const grp = allPlants.filter(p => p.type === type);
                if (!grp.length) return null;
                return (
                  <optgroup key={type} label={type.charAt(0).toUpperCase()+type.slice(1)+"s"}>
                    {grp.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                  </optgroup>
                );
              })}
            </select>
            {nextUpPlant && (
              <div style={{ display: "flex", gap: ".5rem", marginTop: ".45rem", alignItems: "center" }}>
                <label className="lbl" style={{ marginBottom: 0, whiteSpace: "nowrap" }}>Target date</label>
                <input type="date" className="inp" style={{ flex: 1, marginBottom: 0 }} value={nextUpDate} onChange={e => setNextUpDate(e.target.value)}/>
              </div>
            )}
            {status === "harvested" && nextUpPlant && (() => {
              const np = allPlants.find(p => p.id === nextUpPlant);
              return np ? (
                <button className="btn-plant-now" style={{ marginTop: ".6rem", width: "100%" }}
                  onClick={() => onSave({
                    plantId:     nextUpPlant,
                    status:      "planned",
                    plantedDate: nextUpDate || "",
                    harvestDate: nextUpDate && np.dth ? addDays(nextUpDate, np.dth) : "",
                    notes:       "",
                    spanW:       np.defaultSpan?.[0] || 1,
                    spanH:       np.defaultSpan?.[1] || 1,
                    careSchedule: {},
                    careLogs:    {},
                    nextUp:      null,
                    createdAt:   new Date().toISOString(),
                  })}>
                  → Plant {np.emoji} {np.name} Now
                </button>
              ) : null;
            })()}
          </div>
        )}

        {/* Notes */}
        <div className="field" style={{ marginTop: ".9rem" }}>
          <label className="lbl">Notes</label>
          <textarea className="ta" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Variety, amendments, observations…"/>
        </div>

        <div className="m-acts">
          <button className="btn-p" disabled={!plantId || (spanChanged && !resizeFits)}
            onClick={() => onSave({
              plantId, variety: variety.trim() || undefined, status,
              plantedDate: plantedDt,
              harvestDate: harvestDt,
              notes, spanW, spanH,
              careSchedule: buildCareSchedule(),
              careLogs:  cell.careLogs  || {},
              nextUp:    nextUpPlant ? { plantId: nextUpPlant, targetDate: nextUpDate || undefined } : null,
              createdAt: cell.createdAt || new Date().toISOString(),
            })}>
            Save
          </button>
          <button className="btn-s" onClick={onClose}>Cancel</button>
          {cell.plantId && <button className="btn-d" onClick={onClear}>Clear Cell</button>}
        </div>
      </div>
    </div>
  );
}
