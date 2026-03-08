import { useRef } from "react";

export function Sidebar({ gardens, activeId, onSelect, onAdd, onDelete, onExport, onImport }) {
  const fi = useRef();
  return (
    <div className="sidebar">
      <div className="sb-head">
        <div className="sb-logo">🌱 Garden Planner</div>
        <div className="sb-sub">Your Garden, Your Way</div>
      </div>
      <div className="sb-sec">My Gardens</div>
      <div style={{ flex:1 }}>
        {gardens.length===0 && (
          <div style={{ padding:"1rem", fontSize:".78rem", color:"rgba(255,255,255,.3)", lineHeight:1.65 }}>
            No gardens yet.
          </div>
        )}
        {gardens.map(g => (
          <div key={g.id} className={`sb-row ${g.id===activeId?"active":""}`} onClick={()=>onSelect(g.id)}>
            <span style={{ fontSize:".9rem" }}>🌿</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="sb-name">{g.name}</div>
              <div className="sb-meta">{g.w}×{g.h} ft · {g.zones.length} zone{g.zones.length!==1?"s":""}</div>
            </div>
            <button className="sb-del" onClick={e=>{ e.stopPropagation(); if(confirm(`Delete "${g.name}"?`)) onDelete(g.id); }}>✕</button>
          </div>
        ))}
      </div>
      <button className="sb-add" onClick={onAdd}>+ New Garden</button>
      <div className="sb-foot">
        <button className="sb-ftn" onClick={onExport}>⬇ Export</button>
        <button className="sb-ftn" onClick={()=>fi.current.click()}>⬆ Import</button>
        <input ref={fi} type="file" accept=".json" style={{ display:"none" }} onChange={onImport} />
      </div>
    </div>
  );
}
