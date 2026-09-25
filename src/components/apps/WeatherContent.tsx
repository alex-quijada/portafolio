import { useEffect, useState } from "react"

const DEFAULT_COORDS = { lat: 10.4806, lon: -66.9036 }

interface WeatherData {
  city: string
  temp: number
  feels: number
  humidity: number
  wind: number
  code: number
  max: number
  min: number
  isDay: boolean
}

const LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
}

type Kind = "sun" | "cloud" | "rain" | "storm"

const kindOf = (code: number): Kind => {
  if (code === 0 || code === 1) return "sun"
  if (code >= 2 && code <= 3) return "cloud"
  if (code >= 45 && code <= 48) return "cloud"
  if (code >= 51 && code <= 82) return "rain"
  return "storm"
}

const STARS = [
  { left: "12%", top: "18%", delay: "0s", size: 3 },
  { left: "28%", top: "34%", delay: "0.6s", size: 2 },
  { left: "42%", top: "12%", delay: "1.1s", size: 3 },
  { left: "58%", top: "40%", delay: "0.3s", size: 2 },
  { left: "72%", top: "16%", delay: "1.6s", size: 3 },
  { left: "88%", top: "30%", delay: "0.9s", size: 2 },
  { left: "18%", top: "52%", delay: "2s", size: 2 },
  { left: "82%", top: "52%", delay: "1.3s", size: 2 },
]

export default function WeatherContent() {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async (lat: number, lon: number) => {
    setError(null)
    try {
      const w = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day` +
          `&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
      ).then((r) => r.json())

      let city = "Current location"
      try {
        const g = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`,
        ).then((r) => r.json())
        city = g.city || g.locality || g.countryName || city
      } catch {
        /* sin ciudad */
      }

      const hour = new Date().getHours()
      const isDay = (w.current.is_day ?? (hour >= 6 && hour < 19 ? 1 : 0)) === 1

      setData({
        city,
        temp: Math.round(w.current.temperature_2m),
        feels: Math.round(w.current.apparent_temperature),
        humidity: w.current.relative_humidity_2m,
        wind: Math.round(w.current.wind_speed_10m),
        code: w.current.weather_code,
        max: Math.round(w.daily.temperature_2m_max[0]),
        min: Math.round(w.daily.temperature_2m_min[0]),
        isDay,
      })
    } catch {
      setError("Couldn't fetch the weather.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => load(pos.coords.latitude, pos.coords.longitude),
      () => load(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon),
      { timeout: 8000 },
    )
  }, [])

  const kind = data ? kindOf(data.code) : "sun"
  const isDay = data?.isDay ?? true
  const isFog = data ? data.code === 45 || data.code === 48 : false

  return (
    <div className="p-3 overflow-y-auto h-full space-y-3">
      <div
        className={`relative h-32 rounded-2xl overflow-hidden border border-slate-200/60 ${
          isDay
            ? "bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100"
            : "bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-800"
        }`}
      >
        {isDay && kind === "sun" && (
          <>
            <div className="weather-rays absolute right-6 top-3" />
            <div className="weather-sun absolute right-8 top-5" />
          </>
        )}

        {!isDay && (
          <>
            <div className="weather-moon absolute right-8 top-5" />
            {STARS.map((s, i) => (
              <span
                key={i}
                className="weather-star"
                style={{
                  left: s.left,
                  top: s.top,
                  width: s.size,
                  height: s.size,
                  animationDelay: s.delay,
                }}
              />
            ))}
          </>
        )}

        {kind === "cloud" && (
          <>
            <i
              className={`fa-solid fa-cloud absolute left-6 top-5 text-4xl weather-cloud ${
                isDay ? "text-white/95" : "text-slate-300/90"
              }`}
            />
            <i
              className={`fa-solid fa-cloud absolute left-24 top-9 text-3xl weather-cloud ${
                isDay ? "text-white/80" : "text-slate-400/70"
              }`}
              style={{ animationDelay: "1.4s" }}
            />
            <i
              className={`fa-solid fa-cloud absolute right-14 top-4 text-3xl weather-cloud ${
                isDay ? "text-white/70" : "text-slate-500/70"
              }`}
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}

        {(kind === "rain" || kind === "storm") && (
          <>
            <i className="fa-solid fa-cloud absolute left-8 top-5 text-5xl text-slate-500/90 weather-cloud" />
            <i
              className="fa-solid fa-cloud absolute right-16 top-4 text-4xl text-slate-400/80 weather-cloud"
              style={{ animationDelay: "1s" }}
            />
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="weather-drop"
                style={{
                  left: `${6 + i * 8}%`,
                  animationDelay: `${i * 0.09}s`,
                }}
              />
            ))}
          </>
        )}

        {kind === "storm" && (
          <i className="fa-solid fa-bolt absolute left-24 top-11 text-4xl text-yellow-300 weather-storm-icon" />
        )}

        {isFog && <div className="weather-fog" />}
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
          <i className="fa-solid fa-location-dot text-2xl animate-bounce" />
          <p className="text-xs">Finding your location and the weather…</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <i className="fa-solid fa-triangle-exclamation" /> Couldn't load
            the weather
          </p>
          <p>{error} Check the browser location permission.</p>
          <button
            onClick={() => load(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 transition-colors"
          >
            Try default location
          </button>
        </div>
      )}

      {data && !loading && (
        <>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <i className="fa-solid fa-location-dot text-red-400" />{" "}
                {data.city}
              </p>
              <p className="text-4xl font-bold text-slate-900 leading-none mt-1">
                {data.temp}°
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                {isDay ? (
                  <i className="fa-regular fa-sun text-amber-400" />
                ) : (
                  <i className="fa-regular fa-moon text-indigo-400" />
                )}
                {LABELS[data.code] ?? "Estado variable"}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-mono-code text-right">
              Today · Max {data.max}°
              <br />
              Min {data.min}°
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center">
              <i className="fa-solid fa-droplet text-sky-400 text-xs" />
              <p className="text-xs font-bold text-slate-800 mt-1">
                {data.humidity}%
              </p>
              <p className="text-[8px] text-slate-400 uppercase tracking-wider">
                Humidity
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center">
              <i className="fa-solid fa-wind text-teal-400 text-xs" />
              <p className="text-xs font-bold text-slate-800 mt-1">
                {data.wind} km/h
              </p>
              <p className="text-[8px] text-slate-400 uppercase tracking-wider">
                Wind
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center">
              <i className="fa-solid fa-temperature-half text-orange-400 text-xs" />
              <p className="text-xs font-bold text-slate-800 mt-1">
                {data.feels}°
              </p>
              <p className="text-[8px] text-slate-400 uppercase tracking-wider">
                Feels like
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}