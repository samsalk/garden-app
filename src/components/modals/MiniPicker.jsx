import { useState, useEffect, useRef } from "react";
import { SPAN_PRESETS } from "@/constants/ui";
import { spanFits } from "@/utils/grid";

export function MiniPicker({ pos, allPlants, zone, startKey, onConfirm, onClose }) {
  const [type,      setType]      = useState("all");
  const [search,    setSearch]    = useState("");
  const [selId,     setSelId]     = useState("");
  const [spanW,     setSpanW]     = useState(1);
  const [spanH,     setSpanH]     = useState(1);
  const [useCustom, setUseCustom] = useState(false);
  const ref = useRef();

  const [startRow, startCol] = startKey.split(",").map(Number);

  function handleSelectPlant(pid) {
    setSelId(pid);
    const p = allPlants.find(x=>x.id===pid);
    if (p?.defaultSpan) { setSpanW(p.defaultSpan[0]); setSpanH(p.defaultSpan[1]); }
  }

  const fits = zone ? spanFits(zone.cells||{}, zone.w, zone.h, startRow, startCol, spanW, spanH) : false;
  const outOfBounds = zone ? (startCol+spanW > zone.w || startRow+spanH > zone.h) : false;

  const plantTypes = ["all", "vegetable", "fruit", "herb", "flower", "custom"];
  const filtered = allPlants.filter(p=>{
    if (type!=="all" && p.type!==type) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(()=>{
    function onDown(e){ if(ref.current&&!ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return ()=>{ document.removeEventListener("mousedown", onDown); document.removeEventListener("touchstart", onDown); };
  }, [onClose]);

  const style = { top:pos.y, left:pos.x };
  if (typeof window !== "undefined") {
    if (pos.x+290>window.innerWidth) style.left = window.innerWidth-294;
    if (pos.y+480>window.innerHeight) style.top = Math.max(4, pos.y-480);
    if (style.left<4) style.left=4;
    if (style.top<4) style.top=4;
  }

  return (
    <div className="mini-picker" ref={ref} style={style}>
      <div className="mp-title">Assign Plant</div>
      <div className="mp-filters">
        {plantTypes.map(t=>(
          <button key={t} className={`mp-filt ${type===t?"on":""}`} onClick={()=>setType(t)}>
            {t==="all"?"All":t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      <input className="mp-search" placeholder="Search plants…" value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
      <div className="mp-plant-grid">
        {filtered.map(p=>(
          <div key={p.id} className={`mp-plant ${selId===p.id?"sel":""}`} onClick={()=>handleSelectPlant(p.id)}>
            <div style={{fontSize:"1.2rem"}}>{p.emoji}</div>
            <div style={{fontSize:".58rem",fontWeight:500,color:"var(--mut)",marginTop:1,lineHeight:1.2}}>{p.name}</div>
          </div>
        ))}
      </div>

      <div className="mp-divider"/>
      <div className="mp-span-label">Plant Size (sq ft)</div>
      <div className="mp-span-grid">
        {SPAN_PRESETS.map(p=>{
          const active = !useCustom && spanW===p.w && spanH===p.h;
          const wouldFit = zone ? spanFits(zone.cells||{}, zone.w, zone.h, startRow, startCol, p.w, p.h) : false;
          return (
            <button key={p.label} className={`mp-span-btn ${active?"sel":""}`}
              style={!wouldFit?{opacity:.35,cursor:"not-allowed"}:{}}
              title={!wouldFit?"Doesn't fit here":""}
              onClick={()=>{ if(!wouldFit)return; setSpanW(p.w); setSpanH(p.h); setUseCustom(false); }}>
              {p.label}
            </button>
          );
        })}
        <button className={`mp-span-btn ${useCustom?"sel":""}`} onClick={()=>setUseCustom(true)}>Custom…</button>
      </div>
      {useCustom && (
        <div className="mp-span-custom">
          <span>W:</span>
          <input className="mp-span-inp" type="number" min={1} max={zone?.w||10} value={spanW} onChange={e=>setSpanW(parseInt(e.target.value)||1)}/>
          <span>× H:</span>
          <input className="mp-span-inp" type="number" min={1} max={zone?.h||10} value={spanH} onChange={e=>setSpanH(parseInt(e.target.value)||1)}/>
          <span style={{fontSize:".7rem",color:"var(--mut)"}}>ft</span>
        </div>
      )}
      {selId && !fits && (
        <div className="mp-warning">
          ⚠️ {outOfBounds?"Extends outside zone":"Overlaps another plant"}. Choose a different size or cell.
        </div>
      )}

      <div className="mp-acts">
        <button className="btn-p" style={{flex:1,padding:".38rem .6rem",fontSize:".78rem"}}
          disabled={!selId||!fits}
          onClick={()=>selId&&fits&&onConfirm(selId,spanW,spanH)}>
          Plant {spanW>1||spanH>1?`(${spanW}×${spanH})`:""}
        </button>
        <button className="btn-s" style={{padding:".38rem .6rem",fontSize:".78rem"}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
