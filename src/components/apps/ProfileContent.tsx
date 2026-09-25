import { useEffect, useState, type CSSProperties } from "react"
import { PROFILE_PHOTOS, photoUrl } from "../../data"
import { supabase, isSupabaseConfigured } from "../../lib/supabase"
import { tr } from "../../lib/translate"

const PHOTO_STYLE: Record<string, CSSProperties> = {
  "5.jpeg": { objectPosition: "center top", transform: "scale(0.85)" },
  "2.jpeg": { objectPosition: "left center", transform: "scale(1.15)" },
}

const photoStyle = (name: string): CSSProperties | undefined =>
  PHOTO_STYLE[name]

export default function ProfileContent() {
  const [hero, setHero] = useState(PROFILE_PHOTOS[0])
  const [failed, setFailed] = useState<Set<string>>(new Set())
  const [profile, setProfile] = useState<{
    name: string
    role: string
    instagram: string
    perfilBio: string
  } | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase!
        .from("content_settings")
        .select("key, value")
      if (cancelled) return
      const map: Record<string, string> = {}
      for (const r of data ?? []) map[r.key] = r.value ?? ""
      setProfile({
        name: map["about.name"] ?? "",
        role: map["about.role"] ?? "",
        instagram: map["about.instagram"] ?? "",
        perfilBio: tr(map["about.perfilBio"] ?? ""),
      })
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-4 overflow-y-auto h-full space-y-4">
      <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
        {failed.has(hero) ? (
          <i className="fa-solid fa-user text-5xl text-slate-300" />
        ) : (
          <img
            src={photoUrl(hero)}
            alt="Yo"
            style={photoStyle(hero)}
            className="w-full h-full object-cover"
            onError={() => setFailed((s) => new Set(s).add(hero))}
          />
        )}
      </div>

      {profile ? (
        <div className="flex items-center justify-between gap-2">
          <div>
            {profile.name && (
              <h2 className="text-base font-bold text-slate-900">
                {profile.name}
              </h2>
            )}
            {profile.role && (
              <p className="text-xs text-slate-500">{profile.role}</p>
            )}
          </div>
          {profile.instagram && (
            <a
              href={profile.instagram}
              target="_blank"
              rel="noreferrer"
              title="Instagram"
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-500 text-white text-base shadow-sm hover:opacity-90 hover:scale-105 transition-all flex-shrink-0"
            >
              <i className="fa-brands fa-instagram" />
            </a>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-3 text-slate-400">
          <i className="fa-solid fa-spinner animate-spin text-xl" />
        </div>
      )}

      {profile?.perfilBio && (
        <div className="text-xs leading-relaxed text-slate-600">
          {profile.perfilBio}
        </div>
      )}

      <div className="space-y-1.5">
        <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
          Quick gallery
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {PROFILE_PHOTOS.map((name) => (
            <button
              key={name}
              onClick={() => setHero(name)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                hero === name
                  ? "border-amber-400"
                  : "border-transparent hover:border-slate-300"
              } bg-slate-100`}
              title={name}
            >
              <img
                src={photoUrl(name)}
                alt={name}
                loading="lazy"
                style={photoStyle(name)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden"
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}