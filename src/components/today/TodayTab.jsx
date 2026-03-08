import { MONTHS } from "@/constants/ui";
import { CareTaskCard } from "./CareTaskCard";
import { WateringCard } from "./WateringSection";
import { WeatherBar } from "./WeatherBar";

export function TodayTab({ careData, onLog, onLogWatering, weather, weatherLoading, weatherError, frostThresholdF, city }) {
  const { critical, due, soon } = careData;
  const total = critical.length + due.length + soon.length;

  const now = new Date();
  const dateStr = `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()]} ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  function renderTask(task, i) {
    if (task.taskType === "watering") {
      return <WateringCard key={`w-${task.zone.id}-${i}`} task={task} onLog={() => onLogWatering(task.garden.id, task.zone.id)} />;
    }
    return <CareTaskCard key={`c-${task.zone.id}-${task.cellKey}-${task.careType}`} task={task} onLog={() => onLog(task.garden.id, task.zone.id, task.cellKey, task.careType)} />;
  }

  function renderBand(tasks, label, urgencyColor, bgColor) {
    if (!tasks.length) return null;
    return (
      <div className="care-band">
        <div className="care-band-head" style={{ color: urgencyColor, background: bgColor }}>
          {label} · {tasks.length}
        </div>
        {tasks.map((task, i) => renderTask(task, i))}
      </div>
    );
  }

  return (
    <div className="today-tab">
      <div className="today-header">
        <div className="today-date">Today · {dateStr}</div>
      </div>

      <WeatherBar
        weather={weather}
        loading={weatherLoading}
        error={weatherError}
        frostThresholdF={frostThresholdF}
        city={city}
      />

      {total === 0 ? (
        <div className="today-empty">
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>✅</div>
          <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: ".35rem" }}>All caught up!</div>
          <div style={{ fontSize: ".85rem", color: "var(--mut)" }}>No care tasks due today or overdue.</div>
        </div>
      ) : (
        <>
          {renderBand(critical, "🔴 OVERDUE", "var(--color-critical)", "rgba(192,0,0,.07)")}
          {renderBand(due, "🟠 DUE TODAY", "var(--color-due)", "rgba(160,120,0,.07)")}
          {renderBand(soon, "🟡 COMING UP", "var(--color-soon)", "rgba(58,122,42,.07)")}
        </>
      )}
    </div>
  );
}
