import { MONTHS } from "@/constants/ui";
import { TaskCard } from "./TaskCard";
import { WeatherBar } from "./WeatherBar";
import { EmptyState } from "@/components/common/EmptyState";

export function TodayTab({ careData, onLog, onLogWatering, weather, weatherLoading, weatherError, frostThresholdF, city }) {
  const { critical, due, soon } = careData;
  const total = critical.length + due.length + soon.length;

  const now = new Date();
  const dateStr = `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()]} ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  function renderTask(task, i) {
    const key = task.taskType === "watering"
      ? `w-${task.zone.id}-${i}`
      : `c-${task.zone.id}-${task.cellKey}-${task.careType}`;
    const handleLog = task.taskType === "watering"
      ? () => onLogWatering(task.garden.id, task.zone.id)
      : () => onLog(task.garden.id, task.zone.id, task.cellKey, task.careType);
    return <TaskCard key={key} task={task} onLog={handleLog} />;
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
        <EmptyState icon="✅" title="All caught up!" text="No care tasks due today or overdue." />
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
