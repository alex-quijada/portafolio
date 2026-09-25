import { useEffect, useState, type FormEvent } from "react"
import { supabase } from "../../../lib/supabase"
import { inputCls, labelCls, btnPrimary, dbErrorMsg } from "./ui"

const KEYS = ["stack", "freelance", "contact", "default"] as const

const LABELS: Record<string, string> = {
  stack: "Respuesta: stack",
  freelance: "Respuesta: freelance",
  contact: "Respuesta: contacto",
  default: "Respuesta por defecto",
}

export default function ContentTab() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase!
        .from("content_settings")
        .select("key, value")
      const map: Record<string, string> = {}
      for (const row of data ?? []) map[row.key] = row.value ?? ""
      setValues(map)
    })()
  }, [])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const rows = KEYS.map((key) => ({ key, value: values[key] ?? "" }))
    const { error } = await supabase!
      .from("content_settings")
      .upsert(rows, { onConflict: "key" })
    setMsg({
      type: error ? "err" : "ok",
      text: error ? dbErrorMsg(error) : "Contenido guardado ✓",
    })
    setSaving(false)
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
        Estos textos alimentan al asistente (Ask Questions) del portafolio. Se
        guardan en la tabla <strong>content_settings</strong>. La respuesta
        "Sobre mí" se edita en la pestaña <strong>Sobre mí</strong>.
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

      <form onSubmit={save} className="space-y-3">
        {KEYS.map((key) => (
          <label key={key} className="block">
            <span className={labelCls}>{LABELS[key]}</span>
            <textarea
              value={values[key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [key]: e.target.value }))
              }
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={saving}
          className={`${btnPrimary} w-full disabled:opacity-50`}
        >
          {saving ? "Guardando…" : "Guardar contenido"}
        </button>
      </form>
    </div>
  )
}
