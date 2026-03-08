import { useRef, useEffect } from "react";
import { STATUSES } from "@/constants/ui";
import { getZoneConflicts } from "@/utils/companions";

export function ZonePlantGrid({ zone, allPlants, activePlant, onCellClick, onCellPaint }) {
  const PC=54, GAP=3;
  const LABEL_COL=24, LABEL_ROW=20;

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `${LABEL_COL}px repeat(${zone.w}, ${PC}px)`,
    gridTemplateRows: `${LABEL_ROW}px repeat(${zone.h}, ${PC}px)`,
    gap: `${GAP}px`,
    overflow: "auto",
    WebkitOverflowScrolling: "touch",
    userSelect: "none",
  };

  const dragging = useRef(false);
  const painted  = useRef(new Set());

  useEffect(()=>{
    const up = () => { dragging.current = false; };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const cells = zone.cells || {};
  const items = [];

  // Corner
  items.push(<div key="corner" style={{gridColumn:1,gridRow:1}}/>);

  // Col labels
  for (let c=0; c<zone.w; c++) {
    items.push(
      <div key={`cl-${c}`} style={{gridColumn:c+2,gridRow:1,fontSize:".6rem",color:"var(--mut)",textAlign:"center",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}}>{c+1}</div>
    );
  }

  // Row labels
  for (let r=0; r<zone.h; r++) {
    items.push(
      <div key={`rl-${r}`} style={{gridColumn:1,gridRow:r+2,fontSize:".6rem",color:"var(--mut)",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}}>{r+1}</div>
    );
  }

  // Cells
  for (let r=0; r<zone.h; r++) {
    for (let c=0; c<zone.w; c++) {
      const key  = `${r},${c}`;
      const cell = cells[key];

      if (cell?.occupiedBy) continue;

      const plant = cell?.plantId ? allPlants.find(p=>p.id===cell.plantId) : null;
      const spanW = cell?.spanW || 1;
      const spanH = cell?.spanH || 1;
      const sdot  = cell?.status ? STATUSES.find(s=>s.id===cell.status) : null;
      const isSpan = spanW > 1 || spanH > 1;
      const nextUpPlant = (cell?.status === "harvested" && cell?.nextUp?.plantId)
        ? allPlants.find(p=>p.id===cell.nextUp.plantId) : null;

      items.push(
        <div key={key} data-pk={key}
          className={`pcell ${plant?"":"empty"} ${activePlant?"paint-ready":""}`}
          style={{
            gridColumn: `${c+2} / span ${spanW}`,
            gridRow:    `${r+2} / span ${spanH}`,
            background: plant ? plant.color+"2a" : undefined,
            borderColor: plant ? plant.color : undefined,
            fontSize: plant ? "1.4rem" : ".72rem",
            color: plant ? undefined : "var(--bdr)",
          }}
          onMouseDown={()=>{ dragging.current=true; painted.current=new Set(); if(activePlant){onCellPaint(key);painted.current.add(key);} }}
          onMouseEnter={()=>{ if(!dragging.current||!activePlant)return; if(!painted.current.has(key)){onCellPaint(key);painted.current.add(key);} }}
          onClick={()=>{ if(!activePlant)onCellClick(key); }}
          title={plant?`${plant.emoji} ${cell.variety || plant.name}${cell.variety ? ` (${plant.name})` : ""}${isSpan?` · ${spanW}×${spanH} sqft`:""}`:activePlant?"Click/drag to paint":"Click to assign"}
        >
          {plant ? (
            <>
              <span className="pcell-emoji">{plant.emoji}</span>
              {cell.variety && !isSpan && <span className="pcell-variety">{cell.variety.slice(0, 9)}{cell.variety.length > 9 ? "…" : ""}</span>}
              {isSpan && <span className="pcell-span-label">{cell.variety ? cell.variety.slice(0,7)+(cell.variety.length>7?"…":"") : `${spanW}×${spanH} sqft`}</span>}
              {sdot && <div className="pcell-dot" style={{background:sdot.color}}/>}
              {nextUpPlant && <span className="pcell-nextup" title={`Next up: ${nextUpPlant.name}`}>{nextUpPlant.emoji}</span>}
            </>
          ) : "+"}
        </div>
      );
    }
  }

  const uniq = [...new Set(Object.values(cells).filter(c=>c.plantId).map(c=>c.plantId))];

  // Companion conflicts — only for raised beds (not containers, paths, lawn)
  const conflicts = zone.type === "raised"
    ? getZoneConflicts(cells, zone.w, zone.h, allPlants)
    : [];

  return (
    <div>
      <div style={gridStyle}>{items}</div>
      {uniq.length > 0 && (
        <div className="plant-legend">
          {uniq.map(pid=>{
            const p = allPlants.find(x=>x.id===pid);
            return p ? <div key={pid} className="pl-item"><div className="pl-dot" style={{background:p.color}}/>{p.emoji} {p.name}</div> : null;
          })}
        </div>
      )}
      {conflicts.length > 0 && (
        <div className="conflict-panel">
          <div className="conflict-panel-head">⚠️ Companion conflicts</div>
          {conflicts.map(({plant1, plant2}) => {
            const isMint = plant1.conflictsWithAll || plant2.conflictsWithAll;
            const mintPlant = plant1.conflictsWithAll ? plant1 : plant2;
            const otherPlant = plant1.conflictsWithAll ? plant2 : plant1;
            return (
              <div key={`${plant1.id}|${plant2.id}`} className="conflict-row">
                {isMint
                  ? <>{mintPlant.emoji} <strong>{mintPlant.name}</strong> spreads aggressively — move to a container</>
                  : <>{plant1.emoji} <strong>{plant1.name}</strong> &amp; {plant2.emoji} <strong>{plant2.name}</strong> are poor neighbors</>
                }
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
