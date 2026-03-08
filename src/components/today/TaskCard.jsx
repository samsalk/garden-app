/**
 * TaskCard — unified care task card for both plant-level care tasks
 * and zone-level watering tasks.
 *
 * Single source of truth for care task rendering (plant care + zone watering).
 * Differentiated by task.taskType === "watering".
 */
import { CARE_ICONS, CARE_LABELS } from "@/constants/care";
import { getUrgencyColor, getUrgencyText } from "@/utils/urgency";
import { PlantName } from "@/components/common/PlantName";

export function TaskCard({ task, onLog }) {
  const { taskType, plant, variety, zone, garden, careType, daysOverdue, urgency, weatherNote } = task;
  const isWatering = taskType === "watering";

  return (
    <div className="care-card">
      <div className="cc-left">
        <span className="cc-emoji">{isWatering ? "💧" : plant.emoji}</span>
        <div className="cc-info">
          <div className="cc-name">
            {isWatering
              ? zone.name
              : <PlantName plant={plant} variety={variety} />
            }
          </div>
          <div className="cc-meta">
            {isWatering
              ? `Watering · ${garden.name}`
              : `${CARE_ICONS[careType]} ${CARE_LABELS[careType]} · ${zone.name}`
            }
          </div>
          <div className="cc-urgency" style={{ color: getUrgencyColor(urgency) }}>
            {getUrgencyText(daysOverdue)}
          </div>
          {weatherNote && <div className="cc-weather-note">{weatherNote}</div>}
        </div>
      </div>
      <button className="btn-done" onClick={onLog}>Done</button>
    </div>
  );
}
