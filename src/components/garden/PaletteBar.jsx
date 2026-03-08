export function PaletteBar({ allPlants, activePlant, onSelect }) {
  return (
    <div className="palette-bar">
      <span className="pal-label">Paint:</span>
      <div className="pal-scroll">
        <div className={`pal-chip none ${!activePlant?"ap":""}`} onClick={()=>onSelect(null)}>✏️ Edit</div>
        {allPlants.slice(0,32).map(p=>(
          <div key={p.id} className={`pal-chip ${activePlant?.id===p.id?"ap":""}`}
            style={activePlant?.id===p.id?{background:p.color+"22",borderColor:p.color}:{}}
            onClick={()=>onSelect(activePlant?.id===p.id?null:p)}>
            {p.emoji} {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
