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

export function useCareEngine(data, allPlants) {
  return useMemo(() => {
    const todayStr = today();
    const critical = [], due = [], soon = [];

    (data.gardens || []).forEach(garden => {
      (garden.zones || []).forEach(zone => {
        const zoneType = ZONE_TYPES.find(t => t.id === zone.type);
        if (!zoneType?.plantable) return;

        // Zone watering
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
          const task = { taskType: "watering", zone, garden, daysOverdue: waterDaysOverdue, urgency: waterUrgency };
          if (waterUrgency === "critical") critical.unshift(task);
          else if (waterUrgency === "due") due.unshift(task);
          else soon.unshift(task);
        }

        // Plant care per cell
        Object.entries(zone.cells || {}).forEach(([cellKey, cell]) => {
          if (!cell.plantId || cell.occupiedBy) return;
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

            const task = { taskType: "plant", plant, zone, garden, cellKey, careType, daysOverdue, urgency };
            if (urgency === "critical") critical.push(task);
            else if (urgency === "due") due.push(task);
            else soon.push(task);
          });
        });
      });
    });

    return { critical, due, soon };
  }, [data, allPlants]);
}
