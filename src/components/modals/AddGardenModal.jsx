import { useState } from "react";
import { genId, nowISO } from "@/utils/date";

export function AddGardenModal({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [w, setW] = useState(10);
  const [h, setH] = useState(6);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-drag"/>
        <div className="modal-title">New Garden</div>
        <div className="hint-box">Your overall outdoor space. You'll divide it into raised beds, containers, and paths next.</div>
        <div className="field">
          <label className="lbl">Name</label>
          <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Backyard, Front Yard, Balcony…" autoFocus/>
        </div>
        <div className="row2">
          <div className="field">
            <label className="lbl">Width (ft)</label>
            <input type="number" className="inp" min={1} max={50} value={w} onChange={e=>setW(e.target.value)}/>
          </div>
          <div className="field">
            <label className="lbl">Depth (ft)</label>
            <input type="number" className="inp" min={1} max={50} value={h} onChange={e=>setH(e.target.value)}/>
          </div>
        </div>
        <div className="prev-box">{(parseInt(w)||0)*(parseInt(h)||0)} sq ft total</div>
        <div className="m-acts">
          <button className="btn-p" disabled={!name.trim()} onClick={()=>onAdd({ id:genId(), name:name.trim(), w:parseInt(w)||10, h:parseInt(h)||6, zones:[], createdAt:nowISO() })}>
            Create Garden
          </button>
          <button className="btn-s" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
