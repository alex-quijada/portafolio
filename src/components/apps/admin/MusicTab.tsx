import { useEffect, useState, type FormEvent } from "react"
import { supabase } from "../../../lib/supabase"
import { youtubeId } from "../../../data"
import { inputCls, labelCls, btnPrimary, btnDanger, dbErrorMsg } from "./ui"

interface TrackRow {
  id: number
  title: string
  url: string
}

function testEmbeddable(
  videoId: string,
  timeoutMs = 9000,
): Promise<number | null> {
  return new Promise((resolve) => {
    let finished = false
    let player: any = null
    let holder: HTMLDivElement | null = null
    let timer = 0

    const finish = (code: number | null) => {
      if (finished) return
      finished = true
      window.clearTimeout(timer)
      try {
        player?.destroy?.()
      } catch {
        /* ignore */
      }
      holder?.remove()
      resolve(code)
    }

    timer = window.setTimeout(() => finish(null), timeoutMs)

    const ensureApi = () =>
      new Promise<boolean>((res) => {
        if ((window as any).YT?.Player) return res(true)
        const existing = document.querySelector(
          'script[src*="youtube.com/iframe_api"]',
        )
        if (!existing) {
          const tag = document.createElement("script")
          tag.src = "https://www.youtube.com/iframe_api"
          document.head.appendChild(tag)
        }
        const prev = (window as any).onYouTubeIframeAPIReady
        ;(window as any).onYouTubeIframeAPIReady = () => {
          prev?.()
          res(true)
        }
        window.setTimeout(() => res(Boolean((window as any).YT?.Player)), 6000)
      })

    ensureApi().then((ok) => {
      if (!ok || finished) return finish(null)
      holder = document.createElement("div")
      holder.style.cssText =
        "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;"
      document.body.appendChild(holder)
      player = new (window as any).YT.Player(holder, {
        width: "1",
        height: "1",
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            try {
              player.cueVideoById(videoId)
            } catch {
              finish(null)
            }
          },
          onError: (e: any) => finish(e?.data ?? null),
          onStateChange: (e: any) => {
            if (e?.data === 5 || e?.data === 1 || e?.data === 2) finish(null)
          },
        },
      })
    })
  })
}

export default function MusicTab() {
  const [tracks, setTracks] = useState<TrackRow[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  )
  const [busy, setBusy] = useState(false)
  const [testing, setTesting] = useState(false)

  const load = async () => {
    const { data, error } = await supabase!
      .from("tracks")
      .select("*")
      .order("id")
    if (!error) setTracks(data as TrackRow[])
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const id = youtubeId(url.trim())
    if (!id) {
      setMsg({
        type: "err",
        text: "URL de YouTube inválida. Usa watch?v=, youtu.be/, shorts/ o embed/",
      })
      return
    }
    setBusy(true)
    setTesting(true)
    setMsg(null)
    const code = await testEmbeddable(id)
    setTesting(false)
    if (code === 101 || code === 150) {
      setMsg({
        type: "err",
        text: "Este video no permite reproducción embebida y no sonará en la app. Prueba con otro enlace.",
      })
      setBusy(false)
      return
    }
    if (code === 100) {
      setMsg({
        type: "err",
        text: "El video no está disponible (fue retirado o es privado).",
      })
      setBusy(false)
      return
    }
    if (code === 2) {
      setMsg({ type: "err", text: "ID de video de YouTube inválido." })
      setBusy(false)
      return
    }
    const { error } = await supabase!
      .from("tracks")
      .insert({ title: title || "Canción de YouTube", url: url.trim() })
    if (error) {
      setMsg({ type: "err", text: dbErrorMsg(error) })
    } else {
      setMsg({ type: "ok", text: "Canción agregada ✓" })
      setTitle("")
      setUrl("")
      load()
    }
    setBusy(false)
  }

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar esta canción?")) return
    const { error } = await supabase!.from("tracks").delete().eq("id", id)
    setMsg({
      type: error ? "err" : "ok",
      text: error ? dbErrorMsg(error) : "Canción eliminada ✓",
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
        Agrega canciones compartiendo solo la <strong>URL de YouTube</strong>{" "}
        del video. La app de música reproducirá solo el audio. Al guardar se
        verifica que el video permita reproducción embebida.
      </div>

      <div className="space-y-2">
        <h4 className={labelCls}>Agregar canción</h4>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la canción"
            className={inputCls}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className={inputCls}
          />
          {url.trim() && !youtubeId(url.trim()) && (
            <p className="text-[10px] text-rose-500">URL de YouTube inválida</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className={`${btnPrimary} w-full disabled:opacity-50`}
          >
            {busy
              ? testing
                ? "Verificando video…"
                : "Guardando…"
              : "Agregar canción"}
          </button>
        </form>
      </div>

      <div className="space-y-2">
        <h4 className={labelCls}>Canciones ({tracks.length})</h4>
        {tracks.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">
            Aún no hay canciones. Agrega la primera.
          </p>
        ) : (
          <div className="space-y-1.5">
            {tracks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200"
              >
                <i className="fa-brands fa-youtube text-red-500 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {t.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{t.url}</p>
                </div>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 text-xs"
                  title="Abrir"
                >
                  <i className="fa-solid fa-external-link" />
                </a>
                <button
                  onClick={() => remove(t.id)}
                  className={btnDanger}
                  title="Eliminar"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
