import { useEffect, useState } from "react"
import { photoUrl } from "../../data"
import { supabase, isSupabaseConfigured } from "../../lib/supabase"
import { tr } from "../../lib/translate"
import RichText from "./RichText"

interface EduRow {
  title: string
  place: string
  detail: string
}
interface LangRow {
  name: string
  level: string
}
interface CourseRow {
  title: string
  issuer: string
  date: string
  url: string
}
interface Tech {
  id: number
  name: string
  logo: string | null
}
interface AboutData {
  name: string
  role: string
  location: string
  email: string
  linkedin: string
  github: string
  instagram: string
  photo: string
  bio: string
  education: EduRow[]
  languages: LangRow[]
  courses: CourseRow[]
}

export default function AboutContent() {
  const [about, setAbout] = useState<AboutData | null>(null)
  const [skills, setSkills] = useState<Tech[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const [cfgRes, techRes] = await Promise.all([
        supabase!.from("content_settings").select("key, value"),
        supabase!.from("technologies").select("id, name, logo").order("id"),
      ])
      if (cancelled) return
      const map: Record<string, string> = {}
      for (const r of cfgRes.data ?? []) map[r.key] = r.value ?? ""
      const parse = <T,>(key: string): T[] => {
        try {
          const v = JSON.parse(map[key] ?? "")
          return Array.isArray(v) ? (v as T[]) : []
        } catch {
          return []
        }
      }
      setAbout({
        name: map["about.name"] ?? "",
        role: map["about.role"] ?? "",
        location: map["about.location"] ?? "",
        email: map["about.email"] ?? "",
        linkedin: map["about.linkedin"] ?? "",
        github: map["about.github"] ?? "",
        instagram: map["about.instagram"] ?? "",
        photo: map["about.photo"] ?? "",
        bio: tr(map["bio"] ?? ""),
        education: parse<EduRow>("about.education").map((e) => ({
          ...e,
          title: tr(e.title),
          place: tr(e.place),
          detail: tr(e.detail),
        })),
        languages: parse<LangRow>("about.languages").map((l) => ({
          ...l,
          name: tr(l.name),
          level: tr(l.level),
        })),
        courses: parse<CourseRow>("about.courses").map((c) => ({
          ...c,
          title: tr(c.title),
          issuer: tr(c.issuer),
        })),
      })
      setSkills((techRes.data as Tech[]) ?? [])
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <i className="fa-solid fa-spinner animate-spin text-xl" />
      </div>
    )
  }

  if (!about) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 gap-3">
        <i className="fa-solid fa-triangle-exclamation text-3xl text-amber-400" />
        <p>Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env</p>
      </div>
    )
  }

  const hasProfile = about.name || about.role || about.location || about.photo
  const links = [
    {
      label: "LinkedIn",
      icon: "fa-brands fa-linkedin",
      href: about.linkedin,
      tileClass: "bg-gradient-to-br from-blue-500 to-blue-700",
    },
    {
      label: "GitHub",
      icon: "fa-brands fa-github",
      href: about.github,
      tileClass: "bg-gradient-to-br from-slate-600 to-slate-900",
    },
    {
      label: "Email",
      icon: "fa-solid fa-envelope",
      href: about.email ? `mailto:${about.email}` : "",
      tileClass: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    },
  ].filter((l) => l.href)
  const bio = about.bio.replace(/^##[^\n]*\n/, "")

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      {hasProfile && (
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-slate-200 overflow-hidden shadow-sm flex-shrink-0 bg-slate-100">
            {about.photo ? (
              <img
                src={photoUrl(about.photo)}
                alt={about.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-slate-300 text-xl">
                <i className="fa-solid fa-user" />
              </span>
            )}
          </div>
          <div>
            {about.name && (
              <h2 className="text-base font-bold text-slate-900">{about.name}</h2>
            )}
            {about.role && (
              <p className="text-xs text-slate-500">{about.role}</p>
            )}
            {about.location && (
              <p className="text-[11px] font-mono-code text-slate-400 mt-0.5">
                📍 {about.location}
              </p>
            )}
          </div>
        </div>
      )}

      {about.bio.trim() && (
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Biography
          </h3>
          <div className="text-xs leading-relaxed text-slate-600">
            <RichText text={bio} />
          </div>
        </div>
      )}

      {about.education.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Education
          </h3>
          {about.education.map((e) => (
            <div key={`${e.title}-${e.place}`} className="flex items-start gap-2.5 text-xs">
              <i className="fa-solid fa-graduation-cap text-sky-500 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">{e.title}</p>
                <p className="text-slate-500">
                  {e.place} · {e.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Design & Tech Stack
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono-code text-xs bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors cursor-default"
              >
                {s.logo && (
                  <img src={s.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                )}
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {about.languages.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Languages
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {about.languages.map((l) => (
              <span
                key={l.name}
                className="px-2.5 py-1 rounded-full text-xs bg-slate-100 border border-slate-200 text-slate-700"
              >
                <strong className="font-semibold">{l.name}</strong> · {l.level}
              </span>
            ))}
          </div>
        </div>
      )}

      {about.courses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Courses & Certifications
          </h3>
          <div className="space-y-1">
            {about.courses.map((c) => (
              <a
                key={c.url || c.title}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-2.5 text-xs p-2 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-colors"
              >
                <i className="fa-solid fa-certificate text-amber-500 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 leading-snug">
                    {c.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {c.issuer} · {c.date}
                  </p>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-slate-300 group-hover:text-blue-500 mt-0.5 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Let's Connect
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                title={l.label}
                className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 transition-all"
              >
                <span
                  className={`w-9 h-9 rounded-lg ${l.tileClass} text-white flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform`}
                >
                  <i className={l.icon} />
                </span>
                <span className="text-[10px] font-medium text-slate-600">
                  {l.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {!about.name &&
        !about.bio.trim() &&
        about.education.length === 0 &&
        skills.length === 0 &&
        about.languages.length === 0 &&
        about.courses.length === 0 &&
        links.length === 0 && (
          <div className="text-xs text-slate-400 py-6 text-center leading-relaxed">
            No content configured for About Me yet. Edit it from the{" "}
            <strong>Admin → About Me</strong> panel.
          </div>
        )}
    </div>
  )
}