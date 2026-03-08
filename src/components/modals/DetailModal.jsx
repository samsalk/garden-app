import { useState } from "react";
import { SPAN_PRESETS, STATUSES } from "@/constants/ui";
import { PLANT_CARE_TYPES, CARE_ICONS, CARE_LABELS, DEFAULT_FREQ } from "@/constants/care";
import { spanFits } from "@/utils/grid";
import { addDays, genId } from "@/utils/date";
import { BottomSheet } from "@/components/modals/BottomSheet";

// ── Sub-view: custom plant / variety creation ─────────────────────────────
function CustomPlantView({ allPlants, onAdd, onCancel }) {
  const [cName,    setCName]    = useState("");
  const [cEmoji,   setCEmoji]   = useState("🌱");
  const [cBaseId,  setCBaseId]  = useState("");
  const [cDth,     setCDth]     = useState("");
  const [cSpacing, setCSpacing] = useState("");
  const [cNotes,   setCNotes]   = useState("");

  const basePlants = allPlants.filter(p => p.type !== "custom");
  const base = cBaseId ? allPlants.find(p => p.id === cBaseId) : null;

  function handleAdd() {
    if (!cName.trim()) return;
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
    onAdd(p);
  }

  return (
    <BottomSheet onClose={onCancel}>
      <div className="modal-title">New Custom Plant</div>

      <div className="field">
        <label className="lbl">Based on <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — inherits defaults)</span></label>
        <select className="sel-i" value={cBaseId} onChange={e => setCBaseId(e.target.value)}>
          <option value="">— none / from scratch —</option>
          {basePlants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
        </select>
        {base && (
          <div style={{ fontSize: ".7rem", color: "var(--mut)", marginTop: ".25rem" }}>
            ↳ inherits: {base.dth} days to harvest, {base.spacing}{base.notes ? `, ${base.notes}` : ""}
          </div>
        )}
      </div>

      <div className="row2" style={{ marginBottom: ".65rem" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="lbl">Name <span style={{ color: "var(--color-critical)" }}>*</span></label>
          <input className="inp" value={cName} onChange={e => setCName(e.target.value)}
            placeholder={base ? `e.g. Cherry ${base.name}` : "e.g. Cherry Tomato"}
            autoFocus
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="lbl">Emoji</label>
          <input className="inp" value={cEmoji} onChange={e => setCEmoji(e.target.value)} maxLength={2}/>
        </div>
      </div>

      <div className="row2" style={{ marginBottom: ".65rem" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="lbl">Days to Harvest</label>
          <input type="number" className="inp" min={1} max={999} value={cDth}
            placeholder={base ? String(base.dth || "") : "e.g. 65"}
            onChange={e => setCDth(e.target.value)}/>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="lbl">Spacing</label>
          <input className="inp" value={cSpacing}
            placeholder={base ? (base.spacing || "") : "e.g. 4/sqft"}
            onChange={e => setCSpacing(e.target.value)}/>
        </div>
      </div>

      <div className="field">
        <label className="lbl">Notes</label>
        <input className="inp" value={cNotes}
          placeholder={base ? (base.notes || "Optional notes…") : "Optional notes…"}
          onChange={e => setCNotes(e.target.value)}/>
      </div>

      <div className="m-acts">
        <button className="btn-p" disabled={!cName.trim()} onClick={handleAdd}>Add Plant</button>
        <button className="btn-s" onClick={onCancel}>Cancel</button>
      </div>
    </BottomSheet>
  );
}

// ── Main Detail Modal ─────────────────────────────────────────────────────
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
  const [showAdvCare,  setShowAdvCare]  = useState(false);
  const [showCustom,   setShowCustom]   = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [nextUpPlant, setNextUpPlant] = useState(cell.nextUp?.plantId  || "");
  const [nextUpDate,  setNextUpDate]  = useState(cell.nextUp?.targetDate || "");

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

  // Show custom plant sub-view as its own overlay
  if (showCustom) {
    return (
      <CustomPlantView
        allPlants={allPlants}
        onAdd={p => { onCustomPlant(p); setPlantId(p.id); setShowCustom(false); }}
        onCancel={() => setShowCustom(false)}
      />
    );
  }

  return (
    <BottomSheet onClose={onClose}>
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
            {plant.plantingMethod && (
              <div style={{ marginTop: 4 }}>
                {plant.plantingMethod === "direct"
                  ? <span className="pm-badge pm-direct">🌱 Direct seed</span>
                  : plant.plantingMethod === "transplant"
                  ? <span className="pm-badge pm-transplant">🪴 Start indoors / buy transplants</span>
                  : <span className="pm-badge pm-either">🔄 Direct seed or transplant</span>
                }
              </div>
            )}
          </div>
        )}

        {/* Custom plant button — opens dedicated sub-view */}
        <button
          className="btn-s"
          style={{ marginBottom: ".85rem", fontSize: ".75rem", padding: ".3rem .7rem" }}
          onClick={() => setShowCustom(true)}
        >
          + Create custom plant / variety
        </button>

        {/* Space Needed */}
        <div className="field">
          <label className="lbl">Space Needed (sq ft) — current {cell.spanW||1}×{cell.spanH||1}</label>
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

        {/* Care schedule — collapsible, collapsed by default */}
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

        {/* Clear Cell confirmation banner */}
        {confirmClear && (
          <div style={{
            background: "#fff5f5", border: "1px solid #f5c6c6", borderRadius: 8,
            padding: ".65rem .85rem", marginTop: ".75rem",
            fontSize: ".82rem", color: "#800",
          }}>
            Remove {plant ? `${plant.emoji} ${variety || plant.name}` : "this plant"} from this cell? This can't be undone.
            <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem" }}>
              <button className="btn-d" style={{ flex: 1 }} onClick={onClear}>Yes, Remove</button>
              <button className="btn-s" onClick={() => setConfirmClear(false)}>Keep</button>
            </div>
          </div>
        )}

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
          {cell.plantId && !confirmClear && (
            <button className="btn-d" onClick={() => setConfirmClear(true)}>Clear Cell</button>
          )}
        </div>
    </BottomSheet>
  );
}
