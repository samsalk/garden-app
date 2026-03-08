/**
 * PlantName — renders a plant name, optionally showing the variety name
 * prominently and the base plant name as a muted suffix.
 *
 * Usage:
 *   <PlantName plant={plant} variety={cell.variety} />
 *
 * With variety:  "Cherry Tomato · Tomato"  (suffix muted + smaller)
 * Without:       "Tomato"
 */
export function PlantName({ plant, variety }) {
  return (
    <>
      {variety || plant.name}
      {variety && (
        <span style={{ fontWeight: 400, color: "var(--mut)", fontSize: ".78rem", marginLeft: ".25rem" }}>
          · {plant.name}
        </span>
      )}
    </>
  );
}
