// Plant-level care types (used on Cell.careSchedule / Cell.careLogs)
export const PLANT_CARE_TYPES = ["fertilizing", "pest_check", "pruning", "harvest_check"];

// Superset including zone-level watering (used for DEFAULT_FREQ / URGENCY_THRESHOLDS)
export const CARE_TYPES = ["watering", ...PLANT_CARE_TYPES];

export const CARE_ICONS = {
  watering:      "💧",
  fertilizing:   "🌿",
  pest_check:    "🐛",
  pruning:       "✂️",
  harvest_check: "🧺",
};

export const CARE_LABELS = {
  watering:      "Watering",
  fertilizing:   "Fertilize",
  pest_check:    "Pest Check",
  pruning:       "Prune",
  harvest_check: "Check Harvest",
};

// Default frequency in days between care events
export const DEFAULT_FREQ = {
  watering:      2,
  fertilizing:   14,
  pest_check:    7,
  pruning:       14,
  harvest_check: 3,
};

// Days overdue at which a task becomes "critical"
export const URGENCY_THRESHOLDS = {
  critical: {
    watering:      2,
    fertilizing:   3,
    pest_check:    3,
    pruning:       3,
    harvest_check: 3,
  },
};
// due   = daysOverdue in [-1, critical threshold)
// soon  = daysOverdue in [-2, -1)
// null  = daysOverdue < -2  (not shown)
