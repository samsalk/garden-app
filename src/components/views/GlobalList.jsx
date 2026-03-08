import { ZONE_TYPES, ZONE_COLORS } from "@/constants/zones";
import { STATUSES } from "@/constants/ui";
import { fmtDateFull } from "@/utils/date";

export function GlobalList({ gardens, allPlants, onEditCell }) {
  const sections = [];
  gardens.forEach(g => g.zones.forEach(zone => {
    if (!ZONE_TYPES.find(t => t.id === zone.type)?.plantable) return;
    const rows = [];
    for (let r = 0; r < zone.h; r++) for (let c = 0; c < zone.w; c++) {
      const key = `${r},${c}`, cell = (zone.cells || {})[key];
      if (cell?.plantId) rows.push({ key, r, c, cell, plant: allPlants.find(p => p.id === cell.plantId) });
    }
    if (rows.length) sections.push({ g, zone, rows });
  }));
  if (!sections.length) return <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--mut)" }}>No plants anywhere yet.</div>;
  return (
    <div>
      {sections.map(({ g, zone, rows }) => {
        const zc = ZONE_COLORS[zone.type] || ZONE_COLORS.raised, bt = ZONE_TYPES.find(t => t.id === zone.type);
        return (
          <div key={zone.id} className="gl-sec">
            <div className="gl-sec-head" style={{ borderLeft: `3px solid ${zc.border}`, paddingLeft: ".65rem" }}>
              {bt?.icon} {zone.name} <span style={{ fontWeight: 400, opacity: .7 }}>· {g.name} · {rows.length} plant{rows.length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="list-table">
                <thead><tr><th>Plant</th><th>Loc</th><th>Size</th><th>Status</th><th>Planted</th><th>Harvest</th><th /></tr></thead>
                <tbody>
                  {rows.map(({ key, r, c, cell, plant }) => {
                    const s = STATUSES.find(x => x.id === cell.status);
                    const sw = cell.spanW || 1, sh = cell.spanH || 1;
                    return <tr key={key}>
                      <td><div className="lpc"><span style={{ fontSize: "1.1rem" }}>{plant?.emoji}</span><span style={{ fontWeight: 500 }}>{plant?.name}</span></div></td>
                      <td><span style={{ fontSize: ".72rem", color: "var(--mut)" }}>R{r + 1}C{c + 1}</span></td>
                      <td><span style={{ fontSize: ".72rem", color: sw > 1 || sh > 1 ? "var(--T)" : "var(--mut)", fontWeight: sw > 1 || sh > 1 ? 600 : 400 }}>{sw}×{sh}</span></td>
                      <td>{s && <span className="sp" style={{ background: s.color }}>{s.label}</span>}</td>
                      <td style={{ fontSize: ".78rem", color: "var(--mut)" }}>{fmtDateFull(cell.plantedDate) || "—"}</td>
                      <td style={{ fontSize: ".78rem", color: "var(--mut)" }}>{fmtDateFull(cell.harvestDate) || "—"}</td>
                      <td><button className="l-btn" onClick={() => onEditCell(g.id, zone.id, key)}>Edit</button></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
