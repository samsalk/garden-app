/**
 * Derives gardening-relevant weather signals from Open-Meteo daily data.
 * Returns null if no weather data is available.
 *
 * Signals are used by useCareEngine to adjust task urgency and add inline notes.
 */
export function getWeatherSignals(weather) {
  if (!weather?.daily) return null;

  const { time, precipitation_sum, temperature_2m_max } = weather.daily;

  // Find today's index (first date >= today's ISO date)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayIdx = time.findIndex(t => t >= todayStr);
  if (todayIdx === -1) return null;

  // Yesterday's actual precip (past data, index before today)
  const yesterdayIdx = todayIdx - 1;
  const rainYesterdayIn = yesterdayIdx >= 0 ? (precipitation_sum[yesterdayIdx] || 0) : 0;

  // Today's forecast precip
  const rainTodayForecastIn = precipitation_sum[todayIdx] || 0;

  // Next 48h forecast total (today + tomorrow)
  const rainNext48hIn = (precipitation_sum[todayIdx] || 0) + (precipitation_sum[todayIdx + 1] || 0);

  // Dry days: count consecutive past days with < 0.1" rain
  let dryDays = 0;
  for (let i = todayIdx - 1; i >= 0; i--) {
    if ((precipitation_sum[i] || 0) < 0.1) dryDays++;
    else break;
  }

  // Average high temp over recent past days (to detect hot spells)
  const recentHighIdxs = [];
  for (let i = Math.max(0, todayIdx - 3); i < todayIdx; i++) recentHighIdxs.push(i);
  const avgRecentHigh = recentHighIdxs.length
    ? recentHighIdxs.reduce((s, i) => s + (temperature_2m_max[i] || 0), 0) / recentHighIdxs.length
    : 0;

  // Hot dry stretch: 2+ consecutive dry days AND avg recent high > 80°F
  const hotDryStretch = dryDays >= 2 && avgRecentHigh > 80;

  // Warm + wet conditions: yesterday had ≥ 0.2" rain AND today forecast high > 75°F
  // → elevated fungal/pest disease pressure
  const todayHighForecast = temperature_2m_max[todayIdx] || 0;
  const warmWetConditions = rainYesterdayIn >= 0.2 && todayHighForecast > 75;

  return {
    rainYesterdayIn,       // actual precip (inches) yesterday
    rainTodayForecastIn,   // forecast precip (inches) today
    rainNext48hIn,         // total forecast precip (inches) next 48h
    dryDays,               // consecutive dry days before today
    hotDryStretch,         // true if 2+ dry days AND recent highs > 80°F
    warmWetConditions,     // true if yesterday wet AND today warm → pest/disease risk
  };
}
