import { BottomSheet } from "./BottomSheet";

const STEPS = [
  {
    icon: "🌿",
    title: "Create a Garden",
    text: "Start by naming your outdoor space and setting its size — your whole yard, a patio, or just a corner plot.",
  },
  {
    icon: "✏️",
    title: "Draw Your Zones",
    text: "Divide it into raised beds, containers, herb patches, paths, and more — each zone tracks its own plants and watering.",
  },
  {
    icon: "🍅",
    title: "Plant & Track",
    text: "Click any cell to assign a plant. The Today tab shows your daily care tasks — watering, fertilizing, pest checks — so nothing gets missed.",
  },
];

export function WelcomeModal({ onCreateGarden, onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      <div style={{ textAlign: "center", padding: ".25rem 0 .75rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: ".5rem" }}>🌱</div>
        <div className="modal-title" style={{ fontSize: "1.25rem" }}>Welcome to Garden Planner</div>
        <div style={{ fontSize: ".85rem", color: "var(--mut)", marginTop: ".25rem" }}>
          Plan, plant, and track everything in your garden.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: ".75rem", margin: "1rem 0 1.25rem" }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{
            display: "flex", gap: ".85rem", alignItems: "flex-start",
            background: "var(--C)", border: "1px solid var(--bdr)",
            borderRadius: 10, padding: ".7rem .9rem",
          }}>
            <div style={{
              fontSize: "1.4rem", width: 36, height: 36, borderRadius: "50%",
              background: "var(--color-bg-dim)", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {step.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: ".88rem", marginBottom: ".2rem" }}>
                <span style={{ color: "var(--mut)", marginRight: ".35rem" }}>{i + 1}.</span>
                {step.title}
              </div>
              <div style={{ fontSize: ".78rem", color: "var(--mut)", lineHeight: 1.45 }}>
                {step.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="m-acts">
        <button className="btn-p" style={{ flex: 1 }} onClick={onCreateGarden}>
          Create My First Garden
        </button>
        <button className="btn-s" onClick={onClose}>Explore First</button>
      </div>
    </BottomSheet>
  );
}
