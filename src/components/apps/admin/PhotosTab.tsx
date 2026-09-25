import { useState, type FormEvent } from "react"
import { supabase } from "../../../lib/supabase"
import { inputCls, labelCls, btnPrimary } from "./ui"

export default function PhotosTab() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  )
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) {
      setMsg({ type: "err", text: "Selecciona al menos una foto" })
      return
    }
    setBusy(true)
    setMsg(null)
    const done: string[] = []
    let failed = false
    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name}`
      const up = await supabase!.storage
        .from("YO")
        .upload(path, file, { contentType: file.type })
      if (up.error) {
        failed = true
        setMsg({
          type: "err",
          text: "No se pudo subir " + file.name + ": " + up.error.message,
        })
      } else {
        done.push(file.name)
      }
    }
    if (done.length)
      setMsg({
        type: "ok",
        text: `${done.length} foto(s) subidas al bucket YO ✓`,
      })
    if (failed)
      setMsg((m) => ({
        type: "err",
        text: m?.type === "err" ? m.text : "Algunas fotos no se subieron",
      }))
    setBusy(false)
    setFiles(null)
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 leading-relaxed">
        <i className="fa-solid fa-images mr-1" />
        Sube fotos tuyas al bucket <strong>YO</strong>. Se mostrarán en la app
        Perfil y podrás elegirlas como fondo de pantalla.
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

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className={labelCls}>Fotos (puedes elegir varias)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className={inputCls}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className={`${btnPrimary} w-full disabled:opacity-50`}
        >
          {busy ? "Subiendo…" : "Subir fotos"}
        </button>
      </form>
    </div>
  )
}
