const WMO_ICON = {
  0: "☀️", 1: "🌤", 2: "⛅", 3: "☁️",
  45: "🌫", 48: "🌫",
  51: "🌦", 53: "🌦", 55: "🌦",
  61: "🌧", 63: "🌧", 65: "🌧",
  71: "🌨", 73: "🌨", 75: "🌨", 77: "🌨",
  80: "🌦", 81: "🌦", 82: "🌦",
  85: "🌨", 86: "🌨",
  95: "⛈", 96: "⛈", 99: "⛈",
};

const SHORT_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function WeatherBar({ weather, frostThresholdF = 35, loading, error, city }) {
  if (loading) return (
    <div className="weather-bar weather-bar-loading">🌤 Loading weather…</div>
  );
  if (error) return (
    <div className="weather-bar weather-bar-error">⚠️ {error}</div>
  );
  if (!weather?.daily) return null;

  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum, weathercode } = weather.daily;

  // Find today's index
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayIdx = time.findIndex(t => t >= todayStr);
  if (todayIdx === -1) return null;

  // 7 forecast days from today
  const forecastSlice = time.slice(todayIdx, todayIdx + 7);

  // Frost: any forecast day with min < threshold
  const frostCount = forecastSlice.filter((_, i) =>
    (temperature_2m_min[todayIdx + i] ?? 99) < frostThresholdF
  ).length;

  // Recent precip (past days before today index)
  const recentPrecip = time
    .slice(0, todayIdx)
    .reduce((sum, _, i) => sum + (precipitation_sum[i] || 0), 0);

  return (
    <div className="weather-bar">
      {frostCount > 0 && (
        <div className="frost-alert">
          ❄️ Frost risk — temps below {frostThresholdF}°F in the next {frostCount} day{frostCount > 1 ? "s" : ""}
        </div>
      )}
      <div className="weather-strip">
        {forecastSlice.map((dateStr, i) => {
          const idx = todayIdx + i;
          const d = new Date(dateStr + "T12:00:00");
          const dayLabel = i === 0 ? "Today" : SHORT_DAYS[d.getDay()];
          const hi      = Math.round(temperature_2m_max[idx] ?? 0);
          const lo      = Math.round(temperature_2m_min[idx] ?? 0);
          const precip  = precipitation_sum[idx] || 0;
          const icon    = WMO_ICON[weathercode?.[idx]] ?? "⛅";
          const isFrost = lo < frostThresholdF;
          return (
            <div key={dateStr} className={`weather-day${i === 0 ? " weather-day-today" : ""}${isFrost ? " weather-day-frost" : ""}`}>
              <div className="wd-label">{dayLabel}</div>
              <div className="wd-icon">{icon}</div>
              <div className="wd-hi">{hi}°</div>
              <div className="wd-lo" style={{ color: isFrost ? "var(--color-critical)" : undefined }}>{lo}°</div>
              {precip > 0.05 && <div className="wd-precip">{precip.toFixed(1)}"</div>}
            </div>
          );
        })}
      </div>
      <div className="weather-meta">
        {city && <span>📍 {city}</span>}
        {recentPrecip > 0.1 && <span>🌧 {recentPrecip.toFixed(2)}" recent rain</span>}
      </div>
    </div>
  );
}
