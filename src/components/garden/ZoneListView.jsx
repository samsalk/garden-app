import { STATUSES } from "@/constants/ui";
import { fmtDateFull } from "@/utils/date";

export function ZoneListView({ zone, allPlants, onEditCell }) {
  const rows = [];
  for (let r=0; r<zone.h; r++) {
    for (let c=0; c<zone.w; c++) {
      const key = `${r},${c}`, cell = (zone.cells||{})[key];
      if (cell?.plantId) rows.push({ key, r, c, cell, plant:allPlants.find(p=>p.id===cell.plantId) });
    }
  }
  if (!rows.length) return <div style={{textAlign:"center",padding:"2rem",color:"var(--mut)",fontSize:".88rem"}}>No plants here yet.</div>;
  return (
    <div style={{overflowX:"auto"}}>
      <table className="list-table">
        <thead>
          <tr><th>Plant</th><th>Location</th><th>Size</th><th>Status</th><th>Planted</th><th>Harvest</th><th/></tr>
        </thead>
        <tbody>
          {rows.map(({key,r,c,cell,plant})=>{
            const s  = STATUSES.find(x=>x.id===cell.status);
            const sw = cell.spanW||1, sh = cell.spanH||1;
            return (
              <tr key={key}>
                <td><div className="lpc"><span style={{fontSize:"1.1rem"}}>{plant?.emoji}</span><span style={{fontWeight:500}}>{plant?.name||cell.plantId}</span></div></td>
                <td><span style={{fontSize:".72rem",color:"var(--mut)"}}>Row {r+1}, Col {c+1}</span></td>
                <td><span style={{fontSize:".72rem",color:sw>1||sh>1?"var(--T)":"var(--mut)",fontWeight:sw>1||sh>1?600:400}}>{sw}×{sh} sqft</span></td>
                <td>{s && <span className="sp" style={{background:s.color}}>{s.label}</span>}</td>
                <td style={{fontSize:".78rem",color:"var(--mut)"}}>{fmtDateFull(cell.plantedDate)||"—"}</td>
                <td style={{fontSize:".78rem",color:"var(--mut)"}}>{fmtDateFull(cell.harvestDate)||"—"}</td>
                <td><button className="l-btn" onClick={()=>onEditCell(key)}>Edit</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
