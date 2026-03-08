import { ZONE_TYPES, ZONE_COLORS } from "@/constants/zones";
import { STATUSES, MONTHS } from "@/constants/ui";
import { addDays, fmtDate } from "@/utils/date";

export function CalendarView({ gardens, allPlants }) {
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
  const items = [];
  gardens.forEach(g => g.zones.forEach(zone => {
    if (!ZONE_TYPES.find(t => t.id === zone.type)?.plantable) return;
    Object.entries(zone.cells || {}).forEach(([key, cell]) => {
      if (!cell.plantId || cell.occupiedBy) return;
      const plant = allPlants.find(p => p.id === cell.plantId); if (!plant) return;
      const hd = cell.harvestDate || (cell.plantedDate && plant.dth ? addDays(cell.plantedDate, plant.dth) : null);
      const [r, c] = key.split(",").map(Number);
      items.push({ plant, cell, zone, garden: g, harvestDate: hd, r, c, queued: false });
      // nextUp succession entry
      if (cell.nextUp?.plantId && cell.nextUp?.targetDate) {
        const qp = allPlants.find(p => p.id === cell.nextUp.plantId);
        if (qp) items.push({ plant: qp, cell: { ...cell, status: "planned" }, zone, garden: g, harvestDate: cell.nextUp.targetDate, r, c, queued: true, queuedAfter: plant.name });
      }
    });
  }));

  if (!items.length) return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontFamily: "'Lora',serif", fontSize: "1.25rem", fontWeight: 700 }}>Planting Calendar</div>
        <div style={{ fontSize: ".8rem", color: "var(--mut)", marginTop: ".15rem" }}>Expected harvests across all beds</div>
      </div>
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--mut)" }}>
        <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>📅</div>
        <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: ".35rem" }}>No harvest dates yet</div>
        <div style={{ fontSize: ".85rem" }}>Add plants with planting dates to see forecasts here.</div>
      </div>
    </div>
  );

  const withDates = items.filter(i => i.harvestDate).sort((a, b) => a.harvestDate.localeCompare(b.harvestDate));
  const groups = {};
  withDates.forEach(item => {
    const d = new Date(item.harvestDate + "T00:00:00"), k = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    if (!groups[k]) groups[k] = { label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, items: [] };
    groups[k].items.push(item);
  });

  function rel(ds) {
    const d = new Date(ds + "T00:00:00"), diff = Math.round((d - todayDate) / 86400000);
    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, over: true };
    if (diff === 0) return { label: "Today!", over: false };
    if (diff <= 7) return { label: `In ${diff}d`, over: false };
    if (diff <= 30) return { label: `In ~${Math.round(diff / 7)}wk`, over: false };
    return { label: `In ~${Math.round(diff / 30)}mo`, over: false };
  }

  return (
    <div>
      <div style={{ marginBottom: "1.1rem" }}>
        <div style={{ fontFamily: "'Lora',serif", fontSize: "1.25rem", fontWeight: 700 }}>Planting Calendar</div>
        <div style={{ fontSize: ".8rem", color: "var(--mut)", marginTop: ".15rem" }}>{withDates.length} plants with harvest dates</div>
      </div>
      {Object.entries(groups).map(([gk, g]) => (
        <div key={gk} className="mo-grp">
          <div className="mo-head">{g.label}</div>
          {g.items.map((item, i) => {
            const r = rel(item.harvestDate), sd = STATUSES.find(s => s.id === item.cell.status), zc = ZONE_COLORS[item.zone.type] || ZONE_COLORS.raised;
            const sw = item.cell.spanW || 1, sh = item.cell.spanH || 1;
            return (
              <div key={i} className={`h-card${item.queued ? " h-card-queued" : ""}`}>
                <div style={{ fontSize: "1.7rem", flexShrink: 0, opacity: item.queued ? .55 : 1 }}>{item.plant.emoji}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".9rem", opacity: item.queued ? .7 : 1 }}>
                    {item.cell.variety || item.plant.name}
                    {item.cell.variety && <span style={{ fontWeight: 400, color: "var(--mut)", fontSize: ".78rem", marginLeft: ".25rem" }}>· {item.plant.name}</span>}
                    {item.queued && <span style={{ fontSize: ".68rem", background: "rgba(74,106,58,.15)", color: "var(--color-planted)", borderRadius: 4, padding: ".08rem .35rem", marginLeft: ".4rem", fontWeight: 500 }}>queued</span>}
                    {(sw > 1 || sh > 1) && !item.queued && <span style={{ fontSize: ".72rem", color: "var(--T)", fontWeight: 600, marginLeft: ".4rem" }}>{sw}×{sh}sqft</span>}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "var(--mut)", marginTop: 1 }}>
                    <span style={{ color: zc.text }}>{item.zone.name}</span> · {item.garden.name}
                    {item.queued
                      ? <span style={{ marginLeft: ".35rem" }}>· after {item.queuedAfter}</span>
                      : <>
                          {sd && <span style={{ marginLeft: ".35rem", color: sd.color }}>· {sd.label}</span>}
                          {item.cell.plantedDate && <span style={{ marginLeft: ".35rem" }}>· planted {fmtDate(item.cell.plantedDate)}</span>}
                        </>
                    }
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: ".85rem", fontWeight: 600, color: item.queued ? "var(--color-planted)" : r.over ? "#b00" : "var(--T)" }}>
                    {item.queued ? "🗓 " : ""}{fmtDate(item.harvestDate)}
                  </div>
                  <div style={{ fontSize: ".68rem", color: item.queued ? "var(--color-planted)" : r.over ? "#b00" : "var(--mut)", marginTop: 1 }}>
                    {item.queued ? "target date" : r.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
