import { useEffect, useState, type FormEvent } from "react"
import {
  ABOUT_DEFAULTS,
  DEFAULT_SKILLS,
  PROFILE_PHOTOS,
  photoUrl,
} from "../../../data"
import { supabase } from "../../../lib/supabase"
import {
  inputCls,
  labelCls,
  btnPrimary,
  btnDanger,
  btnGhost,
  dbErrorMsg,
} from "./ui"

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
interface AboutForm {
  name: string
  role: string
  location: string
  email: string
  linkedin: string
  github: string
  instagram: string
  photo: string
  bio: string
  perfilBio: string
  education: EduRow[]
  languages: LangRow[]
  courses: CourseRow[]
}

const cloneDefaults = (): AboutForm => ({
  ...ABOUT_DEFAULTS,
  education: ABOUT_DEFAULTS.education.map((e) => ({ ...e })),
  languages: ABOUT_DEFAULTS.languages.map((l) => ({ ...l })),
  courses: ABOUT_DEFAULTS.courses.map((c) => ({ ...c })),
})

export default function AboutTab() {
  const [form, setForm] = useState<AboutForm>(cloneDefaults)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  )
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase!
        .from("content_settings")
        .select("key, value")
      const map: Record<string, string> = {}
      for (const r of data ?? []) map[r.key] = r.value ?? ""
      const parse = <T,>(key: string, fallback: T[]): T[] => {
        try {
          const v = JSON.parse(map[key] ?? "")
          return Array.isArray(v) ? (v as T[]) : fallback
        } catch {
          return fallback
        }
      }
      setForm((f) => ({
        ...f,
        name: map["about.name"] || f.name,
        role: map["about.role"] || f.role,
        location: map["about.location"] || f.location,
        email: map["about.email"] || f.email,
        linkedin: map["about.linkedin"] || f.linkedin,
        github: map["about.github"] || f.github,
        instagram: map["about.instagram"] || f.instagram,
        photo: map["about.photo"] || f.photo,
        bio: map["bio"] || f.bio,
        perfilBio: map["about.perfilBio"] || f.perfilBio,
        education: parse<EduRow>("about.education", f.education),
        languages: parse<LangRow>("about.languages", f.languages),
        courses: parse<CourseRow>("about.courses", f.courses),
      }))
      setLoading(false)
    })()
  }, [])

  const set = (field: keyof AboutForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const updEdu = (i: number, field: keyof EduRow, value: string) =>
    setForm((f) => ({
      ...f,
      education: f.education.map((r, j) =>
        j === i ? { ...r, [field]: value } : r,
      ),
    }))
  const addEdu = () =>
    setForm((f) => ({
      ...f,
      education: [...f.education, { title: "", place: "", detail: "" }],
    }))
  const delEdu = (i: number) =>
    setForm((f) => ({
      ...f,
      education: f.education.filter((_, j) => j !== i),
    }))

  const updLang = (i: number, field: keyof LangRow, value: string) =>
    setForm((f) => ({
      ...f,
      languages: f.languages.map((r, j) =>
        j === i ? { ...r, [field]: value } : r,
      ),
    }))
  const addLang = () =>
    setForm((f) => ({
      ...f,
      languages: [...f.languages, { name: "", level: "" }],
    }))
  const delLang = (i: number) =>
    setForm((f) => ({
      ...f,
      languages: f.languages.filter((_, j) => j !== i),
    }))

  const updCourse = (i: number, field: keyof CourseRow, value: string) =>
    setForm((f) => ({
      ...f,
      courses: f.courses.map((r, j) =>
        j === i ? { ...r, [field]: value } : r,
      ),
    }))
  const addCourse = () =>
    setForm((f) => ({
      ...f,
      courses: [
        ...f.courses,
        { title: "", issuer: "", date: "", url: "" },
      ],
    }))
  const delCourse = (i: number) =>
    setForm((f) => ({
      ...f,
      courses: f.courses.filter((_, j) => j !== i),
    }))

  const buildRows = (f: AboutForm) => [
    { key: "about.name", value: f.name },
    { key: "about.role", value: f.role },
    { key: "about.location", value: f.location },
    { key: "about.email", value: f.email },
    { key: "about.linkedin", value: f.linkedin },
    { key: "about.github", value: f.github },
    { key: "about.instagram", value: f.instagram },
    { key: "about.photo", value: f.photo },
    { key: "bio", value: f.bio },
    { key: "about.perfilBio", value: f.perfilBio },
    { key: "about.education", value: JSON.stringify(f.education) },
    { key: "about.languages", value: JSON.stringify(f.languages) },
    { key: "about.courses", value: JSON.stringify(f.courses) },
  ]

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const { error } = await supabase!
      .from("content_settings")
      .upsert(buildRows(form), { onConflict: "key" })
    setMsg({
      type: error ? "err" : "ok",
      text: error ? dbErrorMsg(error) : "Sobre mí guardado ✓",
    })
    setSaving(false)
  }

  const clearContent = async () => {
    if (
      !confirm(
        "¿Vaciar el contenido de Sobre mí? Se borrarán los datos actuales (el stack por defecto solo se agrega si la tabla de tecnologías está vacía).",
      )
    )
      return
    setSaving(true)
    setMsg(null)
    const defaults = cloneDefaults()
    const ups = await supabase!
      .from("content_settings")
      .upsert(buildRows(defaults), { onConflict: "key" })
    if (ups.error) {
      setMsg({ type: "err", text: dbErrorMsg(ups.error) })
      setSaving(false)
      return
    }
    const { data: existing } = await supabase!
      .from("technologies")
      .select("id")
      .limit(1)
    if (!existing || existing.length === 0) {
      const { error } = await supabase!.from("technologies").insert(
        DEFAULT_SKILLS.map((s) => ({ name: s.name, slug: s.slug, logo: null })),
      )
      if (error) {
        setMsg({ type: "err", text: dbErrorMsg(error) })
        setSaving(false)
        return
      }
    }
    setForm(defaults)
    setMsg({ type: "ok", text: "Contenido de Sobre mí vaciado ✓" })
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <i className="fa-solid fa-spinner animate-spin text-xl" />
      </div>
    )
  }

  return (
    <form
      onSubmit={save}
      className="h-full overflow-y-auto p-4 space-y-4"
    >
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
        Contenido de la ventana <strong>About Me</strong>. La{" "}
        <strong>Biografía</strong> también alimenta la respuesta "Sobre mí" del
        asistente. Las <strong>habilidades</strong> (stack) se editan en la
        pestaña <strong>Tecnologías</strong>.
      </div>

      {msg && (
        <div
          className={`p-3 rounded-xl text-xs font-medium ${
            msg.type === "ok"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="space-y-2">
        <h4 className={labelCls}>Perfil</h4>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className={labelCls}>Nombre</span>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Rol</span>
            <input
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Ubicación</span>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Email</span>
            <input
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>LinkedIn</span>
            <input
              value={form.linkedin}
              onChange={(e) => set("linkedin", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>GitHub</span>
            <input
              value={form.github}
              onChange={(e) => set("github", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block col-span-2">
            <span className={labelCls}>Instagram</span>
            <input
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              className={inputCls}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className={labelCls}>Foto de perfil</h4>
        <div className="grid grid-cols-4 gap-2">
          {PROFILE_PHOTOS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("photo", p)}
              className={`relative rounded-lg overflow-hidden border-2 aspect-square transition-all ${
                form.photo === p
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={photoUrl(p)} alt={p} className="w-full h-full object-cover" />
              {form.photo === p && (
                <span className="absolute inset-0 bg-blue-500/25 flex items-center justify-center text-white">
                  <i className="fa-solid fa-check" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className={labelCls}>Biografía / Sobre mí (asistente)</h4>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          rows={6}
          className={`${inputCls} resize-none font-mono-code text-[11px]`}
        />
        <p className="text-[10px] text-slate-400">
          Soporta formato ligero: <code>## Título</code>, <code>- item</code> y{" "}
          <code>**negrita**</code>.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className={labelCls}>Bio de perfil (párrafo)</h4>
        <textarea
          value={form.perfilBio}
          onChange={(e) => set("perfilBio", e.target.value)}
          rows={4}
          className={`${inputCls} resize-none`}
        />
        <p className="text-[10px] text-slate-400">
          Párrafo corto que se muestra solo en la ventana <strong>Perfil</strong>,
          en estilo de texto continuo.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className={labelCls}>Educación</h4>
        <div className="space-y-2">
          {form.education.map((e, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={e.title}
                  onChange={(ev) => updEdu(i, "title", ev.target.value)}
                  placeholder="Título"
                  className={inputCls}
                />
                <input
                  value={e.place}
                  onChange={(ev) => updEdu(i, "place", ev.target.value)}
                  placeholder="Lugar"
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={e.detail}
                  onChange={(ev) => updEdu(i, "detail", ev.target.value)}
                  placeholder="Detalle (ej. En curso)"
                  className={inputCls}
                />
                <button type="button" onClick={() => delEdu(i)} className={btnDanger} title="Quitar">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addEdu} className={btnGhost}>
            <i className="fa-solid fa-plus mr-1" />
            Agregar educación
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className={labelCls}>Idiomas</h4>
        <div className="space-y-2">
          {form.languages.map((l, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200">
              <input
                value={l.name}
                onChange={(ev) => updLang(i, "name", ev.target.value)}
                placeholder="Idioma"
                className={inputCls}
              />
              <input
                value={l.level}
                onChange={(ev) => updLang(i, "level", ev.target.value)}
                placeholder="Nivel"
                className={inputCls}
              />
              <button type="button" onClick={() => delLang(i)} className={btnDanger} title="Quitar">
                <i className="fa-solid fa-trash" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addLang} className={btnGhost}>
            <i className="fa-solid fa-plus mr-1" />
            Agregar idioma
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className={labelCls}>Cursos y certificaciones</h4>
        <div className="space-y-2">
          {form.courses.map((c, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={c.title}
                  onChange={(ev) => updCourse(i, "title", ev.target.value)}
                  placeholder="Título del curso"
                  className={inputCls}
                />
                <input
                  value={c.issuer}
                  onChange={(ev) => updCourse(i, "issuer", ev.target.value)}
                  placeholder="Emisor"
                  className={inputCls}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={c.date}
                  onChange={(ev) => updCourse(i, "date", ev.target.value)}
                  placeholder="Fecha (ej. Sep 2023)"
                  className={inputCls}
                />
                <input
                  value={c.url}
                  onChange={(ev) => updCourse(i, "url", ev.target.value)}
                  placeholder="URL del certificado"
                  className={inputCls}
                />
                <button type="button" onClick={() => delCourse(i)} className={btnDanger} title="Quitar">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addCourse} className={btnGhost}>
            <i className="fa-solid fa-plus mr-1" />
            Agregar curso
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className={`${btnPrimary} w-full disabled:opacity-50`}
        >
          {saving ? "Guardando…" : "Guardar Sobre mí"}
        </button>
        <button
          type="button"
          onClick={clearContent}
          disabled={saving}
          className={`${btnGhost} w-full disabled:opacity-50`}
        >
          Vaciar contenido
        </button>
      </div>
    </form>
  )
}