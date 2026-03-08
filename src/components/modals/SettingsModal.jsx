import { useState } from "react";
import { geocodeZip } from "@/hooks/useWeather";
import { BottomSheet } from "@/components/modals/BottomSheet";

export function SettingsModal({ settings, onSave, onClose, onExport, onImport }) {
  const loc = settings.location || {};
  const [zip,    setZip]    = useState(loc.zip   || "");
  const [city,   setCity]   = useState(loc.city  || "");
  const [state,  setState]  = useState(loc.state || "");
  const [lat,    setLat]    = useState(loc.lat   || "");
  const [lng,    setLng]    = useState(loc.lng   || "");
  const [frost,  setFrost]  = useState(settings.frostThresholdF ?? 35);
  const [busy,   setBusy]   = useState(false);
  const [err,    setErr]    = useState(null);

  async function handleLookup() {
    if (!zip.trim()) return;
    setBusy(true); setErr(null);
    try {
      const loc = await geocodeZip(zip);
      setLat(loc.lat); setLng(loc.lng);
      setCity(loc.city); setState(loc.state);
      setZip(loc.zip);
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  }

  function handleSave() {
    onSave({
      location: { lat: lat || null, lng: lng || null, zip, city, state },
      frostThresholdF:   parseInt(frost) || 35,
      weatherCacheHours: settings.weatherCacheHours ?? 3,
      weatherCache: null,
    });
  }

  return (
    <BottomSheet onClose={onClose}>
      <div className="modal-title">⚙️ Settings</div>

      <div className="field">
        <label className="lbl">Location (for weather)</label>
        <div style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
          <input
            className="inp" style={{ flex: 1, marginBottom: 0 }}
            value={zip}
            onChange={e => setZip(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLookup()}
            placeholder="ZIP code (e.g. 94102)"
            maxLength={5}
          />
          <button className="btn-s" style={{ whiteSpace: "nowrap", marginBottom: 0 }} onClick={handleLookup} disabled={busy || !zip.trim()}>
            {busy ? "…" : "Look up"}
          </button>
        </div>
        {err && <div style={{ fontSize: ".72rem", color: "#b00", marginTop: ".3rem" }}>⚠️ {err}</div>}
        {city && (
          <div style={{ fontSize: ".72rem", color: "var(--color-planted)", marginTop: ".35rem" }}>
            📍 {city}, {state} · {typeof lat === "number" ? lat.toFixed(4) : lat}°N, {typeof lng === "number" ? Math.abs(lng).toFixed(4) : Math.abs(lng)}°W
          </div>
        )}
      </div>

      <div className="field">
        <label className="lbl">Frost alert threshold (°F)</label>
        <input
          type="number" className="inp"
          min={20} max={50} value={frost}
          onChange={e => setFrost(e.target.value)}
        />
        <div style={{ fontSize: ".72rem", color: "var(--mut)", marginTop: ".25rem" }}>
          Alert shows when any day's low is below this temperature.
        </div>
      </div>

      <div className="field">
        <label className="lbl">Data</label>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="btn-s" style={{ flex: 1 }} onClick={() => { onExport?.(); onClose(); }}>
            ⬇ Export JSON
          </button>
          <button className="btn-s" style={{ flex: 1 }} onClick={() => { onImport?.(); onClose(); }}>
            ⬆ Import JSON
          </button>
        </div>
        <div style={{ fontSize: ".72rem", color: "var(--mut)", marginTop: ".25rem" }}>
          Export backs up all gardens, plants, and settings.
        </div>
      </div>

      <div className="m-acts">
        <button className="btn-p" onClick={handleSave}>Save</button>
        <button className="btn-s" onClick={onClose}>Cancel</button>
      </div>
    </BottomSheet>
  );
}
