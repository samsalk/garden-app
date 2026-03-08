/**
 * Shared urgency helpers — used by TaskCard and any other component
 * that needs to colour-code or describe a care task's overdue state.
 */

export function getUrgencyColor(urgency) {
  if (urgency === "critical") return "var(--color-critical)";
  if (urgency === "due")      return "var(--color-due)";
  return "var(--color-soon)";
}

export function getUrgencyText(daysOverdue) {
  if (daysOverdue > 0)  return `${daysOverdue}d overdue`;
  if (daysOverdue === 0) return "Due today";
  return `In ${Math.abs(daysOverdue)}d`;
}
