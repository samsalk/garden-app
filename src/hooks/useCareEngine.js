import { useMemo } from "react";
import { PLANT_CARE_TYPES, DEFAULT_FREQ, URGENCY_THRESHOLDS } from "@/constants/care";
import { ZONE_TYPES } from "@/constants/zones";
import { today, addDays } from "@/utils/date";

function daysBetween(targetDateStr, todayStr) {
  const t = new Date(todayStr + "T00:00:00");
  const d = new Date(targetDateStr + "T00:00:00");
  return Math.round((t - d) / 86400000);
}

function classify(careType, daysOverdue) {
  const threshold = URGENCY_THRESHOLDS.critical[careType] ?? 3;
  if (daysOverdue >= threshold) return "critical";
  if (daysOverdue >= -1) return "due";
  if (daysOverdue >= -2) return "soon";
  return null;
}

// Band order for urgency adjustments: null → soon → due → critical
const BAND_ORDER = [null, "soon", "due", "critical"];

function shiftBand(urgency, delta) {
  const idx = BAND_ORDER.indexOf(urgency);
  return BAND_ORDER[Math.max(0, Math.min(3, idx + delta))];
}

/**
 * Apply weather signals to a task, potentially adjusting urgency and adding a contextual note.
 * Never removes a "critical" watering task entirely — it can shift down to "due" but not below.
 */
function applyWeather(task, signals) {
  if (!signals) return task;

  if (task.taskType === "watering") {
    let urgency = task.urgency;
    let weatherNote = null;

    if (signals.rainYesterdayIn >= 0.5) {
      // Significant rain yesterday → reduce urgency one band
      urgency = shiftBand(urgency, -1);
      weatherNote = `💧 ${signals.rainYesterdayIn.toFixed(2)}" rain yesterday — may not need watering`;
    } else if (signals.hotDryStretch) {
      // Hot and dry → increase urgency one band
      urgency = shiftBand(urgency, +1);
      weatherNote = `☀️ ${signals.dryDays} dry days — check soil moisture`;
    }

    // Rain forecast today: add context note regardless of urgency (don't shift)
    if (signals.rainTodayForecastIn >= 0.3 && !weatherNote) {
      weatherNote = `🌧 ${signals.rainTodayForecastIn.toFixed(2)}" forecast today — consider holding off`;
    }

    return { ...task, urgency, weatherNote };
  }

  if (task.taskType === "plant") {
    // Fertilizing + rain incoming → warn about runoff
    if (task.careType === "fertilizing" && signals.rainNext48hIn >= 0.3) {
      return { ...task, weatherNote: `🌧 Rain forecast — fertilizer may wash off` };
    }

    // Pest check + warm wet conditions → elevated disease risk
    if (task.careType === "pest_check" && signals.warmWetConditions) {
      const urgency = shiftBand(task.urgency, +1);
      return { ...task, urgency, weatherNote: `⚠️ Warm & wet — elevated pest/disease risk` };
    }
  }

  return task;
}

export function useCareEngine(data, allPlants, weatherSignals) {
  return useMemo(() => {
    const todayStr = today();
    const rawTasks = [];

    (data.gardens || []).forEach(garden => {
      (garden.zones || []).forEach(zone => {
        const zoneType = ZONE_TYPES.find(t => t.id === zone.type);
        if (!zoneType?.plantable) return;

        // Zone-level watering task
        const waterFreq = zone.wateringFreqDays ?? DEFAULT_FREQ.watering;
        const waterLog = zone.wateringLog || [];
        const lastWaterDate = waterLog.length > 0 ? waterLog[waterLog.length - 1].date : null;
        let waterDaysOverdue;
        if (lastWaterDate) {
          const nextDue = addDays(lastWaterDate, waterFreq);
          waterDaysOverdue = daysBetween(nextDue, todayStr);
        } else {
          waterDaysOverdue = 0;
        }
        const waterUrgency = classify("watering", waterDaysOverdue);
        if (waterUrgency) {
          rawTasks.push({
            taskType: "watering",
            zone, garden,
            daysOverdue: waterDaysOverdue,
            urgency: waterUrgency,
          });
        }

        // Plant-level care tasks — only for actively growing plants
        const ACTIVE_STATUSES = new Set(["planted", "growing"]);
        Object.entries(zone.cells || {}).forEach(([cellKey, cell]) => {
          if (!cell.plantId || cell.occupiedBy) return;
          if (!ACTIVE_STATUSES.has(cell.status)) return;
          const plant = allPlants.find(p => p.id === cell.plantId);
          if (!plant) return;

          PLANT_CARE_TYPES.forEach(careType => {
            const freq = cell.careSchedule?.[careType] ?? plant.careDefaults?.[careType] ?? DEFAULT_FREQ[careType];
            if (freq === null || freq === undefined) return;

            const logs = cell.careLogs?.[careType] ?? [];
            const lastLogDate = logs.length > 0 ? logs[logs.length - 1].date : null;
            let daysOverdue;
            if (lastLogDate) {
              const nextDue = addDays(lastLogDate, freq);
              daysOverdue = daysBetween(nextDue, todayStr);
            } else {
              daysOverdue = 0;
            }

            const urgency = classify(careType, daysOverdue);
            if (!urgency) return;

            rawTasks.push({
              taskType: "plant",
              plant,
              variety: cell.variety || "",
              zone, garden,
              cellKey,
              careType,
              daysOverdue,
              urgency,
            });
          });
        });
      });
    });

    // Apply weather modifiers to all tasks
    const modifiedTasks = weatherSignals
      ? rawTasks.map(t => applyWeather(t, weatherSignals))
      : rawTasks;

    // Sort into urgency bands (tasks that weather adjusted to null urgency are dropped)
    const critical = [], due = [], soon = [];
    modifiedTasks.forEach(task => {
      if (task.urgency === "critical") critical.push(task);
      else if (task.urgency === "due") due.push(task);
      else if (task.urgency === "soon") soon.push(task);
    });

    return { critical, due, soon };
  }, [data, allPlants, weatherSignals]);
}
