import { useState } from "react";
import { genId, nowISO } from "@/utils/date";
import { ZONE_TYPES } from "@/constants/zones";
import { rectsOverlap } from "@/utils/grid";
import { DEFAULT_FREQ } from "@/constants/care";

export function AddZoneModal({ rect, gardenW, gardenH, existingZones=[], onAdd, onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("raised");
  const [x, setX] = useState(rect?rect.x:0);
  const [y, setY] = useState(rect?rect.y:0);
  const [w, setW] = useState(rect?rect.w:2);
  const [h, setH] = useState(rect?rect.h:4);

  const p = { x:parseInt(x)||0, y:parseInt(y)||0, w:parseInt(w)||1, h:parseInt(h)||1 };
  const outOfBounds = p.x+p.w>gardenW || p.y+p.h>gardenH || p.x<0 || p.y<0;
  const overlaps = existingZones.some(z=>rectsOverlap(p,z));
  const err = outOfBounds || overlaps;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-drag"/>
        <div className="modal-title">{rect?`New Zone · ${rect.w}×${rect.h} ft`:"Add Zone"}</div>
        <div className="field">
          <label className="lbl">Name</label>
          <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Main Raised Bed, Herb Pot…" autoFocus/>
        </div>
        <div className="field">
          <label className="lbl">Type</label>
          <select className="sel-i" value={type} onChange={e=>setType(e.target.value)}>
            {ZONE_TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <div style={{fontWeight:600,fontSize:".72rem",color:"var(--mut)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:".4rem"}}>Position & Size</div>
        <div className="row4" style={{marginBottom:".85rem"}}>
          <div><label className="lbl">Col</label><input type="number" className="inp" min={1} max={gardenW} value={parseInt(x)+1} onChange={e=>setX(parseInt(e.target.value)-1||0)}/></div>
          <div><label className="lbl">Row</label><input type="number" className="inp" min={1} max={gardenH} value={parseInt(y)+1} onChange={e=>setY(parseInt(e.target.value)-1||0)}/></div>
          <div><label className="lbl">Width</label><input type="number" className="inp" min={1} max={gardenW} value={w} onChange={e=>setW(e.target.value)}/></div>
          <div><label className="lbl">Length</label><input type="number" className="inp" min={1} max={gardenH} value={h} onChange={e=>setH(e.target.value)}/></div>
        </div>
        {!err && <div className="prev-box">{p.w}×{p.h} ft · {p.w*p.h} sq ft · col {p.x+1}–{p.x+p.w}, row {p.y+1}–{p.y+p.h}</div>}
        {outOfBounds && <div className="hint-box">⚠️ Zone extends outside garden.</div>}
        {overlaps && !outOfBounds && <div className="hint-box">⚠️ Overlaps existing zone.</div>}
        <div className="m-acts">
          <button className="btn-p" disabled={!name.trim()||err}
            onClick={()=>onAdd({ id:genId(), name:name.trim(), type, ...p, cells:{}, wateringLog:[], wateringFreqDays:DEFAULT_FREQ.watering, createdAt:nowISO() })}>
            Create Zone
          </button>
          <button className="btn-s" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
