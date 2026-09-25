import { useEffect, useState, type FormEvent } from "react"
import { supabase } from "../../../lib/supabase"
import { inputCls, labelCls, btnPrimary, btnDanger, dbErrorMsg } from "./ui"

interface TechRow {
  id: number
  name: string
  slug: string
  logo: string | null
}

export default function TechTab() {
  const [techs, setTechs] = useState<TechRow[]>([])
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [logo, setLogo] = useState("")
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  )

  const load = async () => {
    const { data, error } = await supabase!
      .from("technologies")
      .select("*")
      .order("id")
    if (!error) setTechs(data as TechRow[])
  }

  useEffect(() => {
    load()
  }, [])

  const add = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    const { error } = await supabase!.from("technologies").insert({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      logo: logo || null,
    })
    if (error) {
      setMsg({ type: "err", text: dbErrorMsg(error) })
    } else {
      setMsg({ type: "ok", text: "Tecnología agregada ✓" })
      setName("")
      setSlug("")
      setLogo("")
      load()
    }
  }

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar esta tecnología?")) return
    await supabase!
      .from("project_technologies")
      .delete()
      .eq("technology_id", id)
    const { error } = await supabase!.from("technologies").delete().eq("id", id)
    setMsg({
      type: error ? "err" : "ok",
      text: error ? dbErrorMsg(error) : "Tecnología eliminada ✓",
    })
    load()
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
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

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
        Estas etiquetas se asocian a los proyectos (pestaña Proyectos) y también
        se pueden mostrar como "tags de tecnologías". El campo{" "}
        <strong>logo</strong> acepta la URL pública de un icono en tu storage.
      </div>

      <form onSubmit={add} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className={labelCls}>Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
              placeholder="Ej. React"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputCls}
              placeholder="auto"
            />
          </label>
        </div>
        <label className="block">
          <span className={labelCls}>Logo URL (opcional)</span>
          <input
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className={inputCls}
            placeholder="https://…"
          />
        </label>
        <button type="submit" className={`${btnPrimary} w-full`}>
          Agregar tecnología
        </button>
      </form>

      <div className="space-y-2">
        <h4 className={labelCls}>Tecnologías ({techs.length})</h4>
        {techs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">Sin tecnologías aún.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {techs.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700"
              >
                {t.logo && (
                  <img
                    src={t.logo}
                    alt=""
                    className="w-3.5 h-3.5 object-contain"
                  />
                )}
                {t.name}
                <button
                  onClick={() => remove(t.id)}
                  className="text-rose-400 hover:text-rose-600 ml-0.5"
                  title="Eliminar"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
