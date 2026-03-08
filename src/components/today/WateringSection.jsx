export function WateringCard({ task, onLog }) {
  const { zone, garden, daysOverdue, urgency } = task;
  const urgencyColor = urgency === "critical" ? "var(--color-critical)" : urgency === "due" ? "var(--color-due)" : "var(--color-soon)";
  const urgencyText = daysOverdue > 0 ? `${daysOverdue}d overdue` : daysOverdue === 0 ? "Due today" : `In ${Math.abs(daysOverdue)}d`;
  return (
    <div className="care-card">
      <div className="cc-left">
        <span className="cc-emoji">💧</span>
        <div className="cc-info">
          <div className="cc-name">{zone.name}</div>
          <div className="cc-meta">Watering · {garden.name}</div>
          <div className="cc-urgency" style={{ color: urgencyColor }}>{urgencyText}</div>
        </div>
      </div>
      <button className="btn-done" onClick={() => onLog(task)}>Done</button>
    </div>
  );
}
