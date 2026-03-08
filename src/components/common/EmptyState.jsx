/**
 * EmptyState — consistent empty state presentation across views.
 *
 * Full variant (default): large icon, serif title, muted body text.
 *   <EmptyState icon="📅" title="No harvest dates yet" text="Add plants with planting dates to see forecasts here." />
 *
 * Compact variant: single muted line, minimal padding — for inline zone lists.
 *   <EmptyState compact text="No plants here yet." />
 */
export function EmptyState({ icon, title, text, compact = false }) {
  if (compact) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--mut)", fontSize: ".88rem" }}>
        {text}
      </div>
    );
  }
  return (
    <div className="empty-state">
      {icon  && <div className="es-icon">{icon}</div>}
      {title && <div className="es-title">{title}</div>}
      {text  && <div className="es-text">{text}</div>}
    </div>
  );
}
