import { useState, useEffect, useRef } from "react";

function cacheStillFresh(cache, lat, lng, maxHours) {
  if (!cache?.fetchedAt) return false;
  if (cache.lat !== lat || cache.lng !== lng) return false;
  const ageMs = Date.now() - new Date(cache.fetchedAt).getTime();
  return ageMs < maxHours * 60 * 60 * 1000;
}

/**
 * Fetches daily weather from Open-Meteo (7-day forecast + 2 past days).
 * Caches result in gp-v5 settings via onCacheUpdate callback.
 * Returns { weather, loading, error }
 */
export function useWeather(lat, lng, weatherCache, weatherCacheHours = 3, onCacheUpdate) {
  const [weather, setWeather] = useState(() =>
    cacheStillFresh(weatherCache, lat, lng, weatherCacheHours) ? weatherCache : null
  );
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const onCacheUpdateRef = useRef(onCacheUpdate);
  onCacheUpdateRef.current = onCacheUpdate;

  useEffect(() => {
    if (!lat || !lng) { setWeather(null); return; }
    if (cacheStillFresh(weatherCache, lat, lng, weatherCacheHours)) {
      setWeather(weatherCache);
      return;
    }
    setLoading(true);
    setError(null);
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode` +
      `&past_days=2&forecast_days=7&timezone=auto` +
      `&temperature_unit=fahrenheit&precipitation_unit=inch`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(json => {
        const newCache = { fetchedAt: new Date().toISOString(), lat, lng, daily: json.daily };
        setWeather(newCache);
        onCacheUpdateRef.current(newCache);
      })
      .catch(() => setError("Weather unavailable"))
      .finally(() => setLoading(false));
  // Only re-fetch when lat/lng change (cache freshness is evaluated inside)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return { weather, loading, error };
}

/**
 * Geocodes a US zip code via Zippopotam.us (free, no API key, CORS-safe).
 * Returns { lat, lng, zip, city, state }
 */
export async function geocodeZip(zip) {
  const res = await fetch(`https://api.zippopotam.us/us/${zip.trim()}`);
  if (!res.ok) throw new Error("ZIP not found");
  const data = await res.json();
  const place = data.places?.[0];
  if (!place) throw new Error("No location found");
  return {
    lat:   parseFloat(place.latitude),
    lng:   parseFloat(place.longitude),
    zip:   data["post code"],
    city:  place["place name"],
    state: place["state abbreviation"],
  };
}
