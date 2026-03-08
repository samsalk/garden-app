import { useState } from "react";
import { genId, nowISO } from "@/utils/date";
import { ZONE_TYPES } from "@/constants/zones";
import { rectsOverlap } from "@/utils/grid";
import { DEFAULT_FREQ } from "@/constants/care";
import { BottomSheet } from "@/components/modals/BottomSheet";

/**
 * AddZoneModal — create or edit a zone.
 *
 * Create mode:  pass `rect` (pre-filled from draw gesture) or `null` (manual).
 * Edit mode:    pass `editingZone` — pre-fills all fields, excludes self from
 *               overlap check, calls `onUpdate(updatedZone)` on save.
 */
export function AddZoneModal({
  rect,
  gardenW, gardenH,
  existingZones = [],
  editingZone   = null,  // zone object when editing
  gapCount      = 0,     // unselected interior cells in draw selection
  onAdd,
  onUpdate,
  onClose,
}) {
  const editing = !!editingZone;

  const [name, setName] = useState(editing ? editingZone.name : "");
  const [type, setType] = useState(editing ? editingZone.type : "raised");
  const [x, setX] = useState(editing ? editingZone.x : (rect ? rect.x : 0));
  const [y, setY] = useState(editing ? editingZone.y : (rect ? rect.y : 0));
  const [w, setW] = useState(editing ? editingZone.w : (rect ? rect.w : 2));
  const [h, setH] = useState(editing ? editingZone.h : (rect ? rect.h : 4));

  const p = {
    x: parseInt(x) || 0,
    y: parseInt(y) || 0,
    w: parseInt(w) || 1,
    h: parseInt(h) || 1,
  };

  const outOfBounds = p.x + p.w > gardenW || p.y + p.h > gardenH || p.x < 0 || p.y < 0;

  // When editing, exclude self from overlap check
  const otherZones = editing
    ? existingZones.filter(z => z.id !== editingZone.id)
    : existingZones;
  const overlaps = otherZones.some(z => rectsOverlap(p, z));

  const err = outOfBounds || overlaps;

  // Warn if shrinking will destroy plants
  const willLosePlants = editing && (p.w < editingZone.w || p.h < editingZone.h)
    && Object.keys(editingZone.cells || {}).some(key => {
      const [r, c] = key.split(",").map(Number);
      const cell = editingZone.cells[key];
      return cell.plantId && (r >= p.h || c >= p.w);
    });

  function handleSave() {
    if (editing) {
      onUpdate({ ...editingZone, name: name.trim(), type, ...p });
    } else {
      onAdd({
        id: genId(),
        name: name.trim(),
        type,
        ...p,
        cells: {},
        wateringLog: [],
        wateringFreqDays: DEFAULT_FREQ.watering,
        createdAt: nowISO(),
      });
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      <div className="modal-title">
        {editing ? `Edit Zone` : (rect ? `New Zone · ${rect.w}×${rect.h} ft` : "Add Zone")}
      </div>

      <div className="field">
        <label className="lbl">Name</label>
        <input
          className="inp"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Main Raised Bed, Herb Pot…"
          autoFocus
        />
      </div>

      <div className="field">
        <label className="lbl">Type</label>
        <select className="sel-i" value={type} onChange={e => setType(e.target.value)}>
          {ZONE_TYPES.map(t => (
            <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ fontWeight: 600, fontSize: ".72rem", color: "var(--mut)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: ".4rem" }}>
        Position &amp; Size
      </div>
      <div className="row4" style={{ marginBottom: ".85rem" }}>
        <div>
          <label className="lbl">Col</label>
          <input type="number" className="inp" min={1} max={gardenW}
            value={parseInt(x) + 1}
            onChange={e => setX(parseInt(e.target.value) - 1 || 0)} />
        </div>
        <div>
          <label className="lbl">Row</label>
          <input type="number" className="inp" min={1} max={gardenH}
            value={parseInt(y) + 1}
            onChange={e => setY(parseInt(e.target.value) - 1 || 0)} />
        </div>
        <div>
          <label className="lbl">Width</label>
          <input type="number" className="inp" min={1} max={gardenW}
            value={w} onChange={e => setW(e.target.value)} />
        </div>
        <div>
          <label className="lbl">Length</label>
          <input type="number" className="inp" min={1} max={gardenH}
            value={h} onChange={e => setH(e.target.value)} />
        </div>
      </div>

      {!err && (
        <div className="prev-box">
          {p.w}×{p.h} ft · {p.w * p.h} sq ft · col {p.x + 1}–{p.x + p.w}, row {p.y + 1}–{p.y + p.h}
        </div>
      )}
      {outOfBounds && <div className="hint-box">⚠️ Zone extends outside garden.</div>}
      {overlaps && !outOfBounds && <div className="hint-box">⚠️ Overlaps another zone.</div>}
      {willLosePlants && !err && (
        <div className="hint-box">⚠️ Shrinking will remove plants outside the new boundary.</div>
      )}
      {gapCount > 0 && (
        <div className="hint-box">
          💡 Your selection has {gapCount} unselected cell{gapCount > 1 ? "s" : ""} inside the bounds —
          they'll be empty plantable space in this zone. To model a path through here, add a Path zone separately.
        </div>
      )}

      <div className="m-acts">
        <button
          className="btn-p"
          disabled={!name.trim() || err}
          onClick={handleSave}
        >
          {editing ? "Save Changes" : "Create Zone"}
        </button>
        <button className="btn-s" onClick={onClose}>Cancel</button>
      </div>
    </BottomSheet>
  );
}
