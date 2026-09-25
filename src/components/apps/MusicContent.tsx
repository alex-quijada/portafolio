import { useEffect, useRef, useState, type MouseEvent } from "react"
import { supabase, isSupabaseConfigured } from "../../lib/supabase"
import { youtubeId } from "../../data"

interface Track {
  id: number
  title: string
  url: string
}

const BARS = 28

const YT_ERRORS: Record<number, string> = {
  2: "Invalid video ID.",
  5: "HTML5 playback error.",
  100: "The video is unavailable (removed or private).",
  101: "This video doesn't allow embedded playback. Try another link.",
  150: "This video doesn't allow embedded playback. Try another link.",
}

export default function MusicContent() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)
  const [apiReady, setApiReady] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: BARS }, () => 8),
  )

  const playerRef = useRef<any>(null)
  const holderRef = useRef<HTMLDivElement>(null)
  const tracksRef = useRef<Track[]>([])
  const indexRef = useRef(0)
  const pollRef = useRef<number | null>(null)
  const vizRef = useRef<number | null>(null)
  const shuffleRef = useRef(false)
  const repeatRef = useRef(false)

  useEffect(() => {
    tracksRef.current = tracks
  }, [tracks])
  useEffect(() => {
    indexRef.current = index
  }, [index])
  useEffect(() => {
    shuffleRef.current = shuffle
  }, [shuffle])
  useEffect(() => {
    repeatRef.current = repeat
  }, [repeat])

  useEffect(() => {
    ;(async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase!
        .from("tracks")
        .select("*")
        .order("id")
      if (!error) setTracks(data as Track[])
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if ((window as any).YT?.Player) {
      setApiReady(true)
      return
    }
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    ;(window as any).onYouTubeIframeAPIReady = () => setApiReady(true)
    document.head.appendChild(tag)
    return () => {
      delete (window as any).onYouTubeIframeAPIReady
    }
  }, [])

  const stopPoll = () => {
    if (pollRef.current != null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }
  const startPoll = () => {
    stopPoll()
    pollRef.current = window.setInterval(() => {
      const p = playerRef.current
      if (!p) return
      const t = p.getCurrentTime?.() ?? 0
      const d = p.getDuration?.() ?? 0
      setTime(t)
      setDuration(d || 0)
    }, 500)
  }

  const startViz = () => {
    stopViz()
    vizRef.current = window.setInterval(() => {
      setBars(() =>
        Array.from({ length: BARS }, () => 12 + Math.round(Math.random() * 80)),
      )
    }, 130)
  }
  const stopViz = () => {
    if (vizRef.current != null) {
      clearInterval(vizRef.current)
      vizRef.current = null
    }
    setBars(() => Array.from({ length: BARS }, () => 8))
  }

  const handleError = (code: number) => {
    setPlaying(false)
    stopPoll()
    stopViz()
    setError(
      YT_ERRORS[code] ??
        "Couldn't play the video. Try another YouTube link.",
    )
  }

  const select = (i: number) => {
    const list = tracksRef.current
    if (!list.length) return
    const target = i
    setIndex(target)
    indexRef.current = target
    const id = youtubeId(list[target].url)
    if (!id) {
      setError("Invalid URL to play.")
      return
    }
    if (!playerRef.current || !playerReady) {
      setError("The player isn't ready yet. Try again.")
      return
    }
    setError(null)
    try {
      playerRef.current.loadVideoById(id)
    } catch {
      setError("No se pudo cargar el video.")
    }
  }

  const next = () => {
    const list = tracksRef.current
    if (!list.length) return
    let target: number
    if (shuffleRef.current && list.length > 1) {
      do {
        target = Math.floor(Math.random() * list.length)
      } while (target === indexRef.current)
    } else {
      target = (indexRef.current + 1) % list.length
    }
    select(target)
  }
  const prev = () => {
    const list = tracksRef.current
    if (list.length) select((indexRef.current - 1 + list.length) % list.length)
  }

  const seek = (e: MouseEvent<HTMLDivElement>) => {
    const p = playerRef.current
    if (!p || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    try {
      p.seekTo(frac * duration, true)
      setTime(frac * duration)
    } catch {
      /* ignore */
    }
  }

  const toggle = () => {
    const p = playerRef.current
    if (!p || !playerReady) {
      setError("The player isn't ready yet. Try again.")
      return
    }
    if (playing) {
      p.pauseVideo()
      return
    }
    if (currentId) {
      setError(null)
      try {
        p.loadVideoById(currentId)
      } catch {
        setError("No se pudo cargar el video.")
      }
    }
  }

  useEffect(() => {
    if (!apiReady || !holderRef.current || playerRef.current) return
    playerRef.current = new (window as any).YT.Player(holderRef.current, {
      width: "0",
      height: "0",
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
          setPlayerReady(true)
          setError(null)
        },
        onError: (e: any) => handleError(e.data),
        onStateChange: (e: any) => {
          if (e.data === 1) {
            setPlaying(true)
            setError(null)
            startPoll()
            startViz()
          } else if (e.data === 2 || e.data === 0) {
            setPlaying(false)
            stopPoll()
            stopViz()
          }
          if (e.data === 0) {
            if (repeatRef.current) select(indexRef.current)
            else next()
          }
        },
      },
    })
  }, [apiReady])

  useEffect(
    () => () => {
      stopPoll()
      try {
        playerRef.current?.pauseVideo()
      } catch {
        /* ignore */
      }
    },
    [],
  )

  const current = tracks[index]
  const currentId = current ? youtubeId(current.url) : null

  const fmt = (s: number) => {
    if (!Number.isFinite(s) || s <= 0) return "0:00"
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }
  const progress = duration > 0 ? time / duration : 0

  return (
    <div className="flex flex-col h-full">
      <div
        ref={holderRef}
        className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none"
      />

      <div className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center text-xl shadow-md flex-shrink-0">
            <i
              className={`fa-brands fa-youtube ${
                playing ? "fa-beat" : ""
              }`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {current?.title ?? "No song"}
            </h4>
            <p className="text-[10px] font-mono-code text-slate-400">
              {!current
                ? "Add songs in the Admin panel"
                : playing
                  ? "Playing…"
                  : "Paused"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-center gap-0.5 h-8">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-red-500 transition-[height] duration-150 ease-out"
              style={{ height: `${h}%`, opacity: current ? 1 : 0.35 }}
            />
          ))}
        </div>

        <div className="mt-2">
          <div
            role="button"
            tabIndex={0}
            onClick={seek}
            className="h-1.5 rounded-full bg-slate-200 overflow-hidden cursor-pointer group"
            title="Seek"
          >
            <div
              className="h-full bg-red-500 rounded-full group-hover:bg-red-600 transition-colors"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-mono-code mt-1">
            <span>{fmt(time)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 mt-2 text-slate-600">
          <button
            onClick={() => setShuffle((s) => !s)}
            className={`transition-colors text-sm ${
              shuffle ? "text-red-600" : "hover:text-slate-900"
            }`}
            title={shuffle ? "Shuffle on" : "Enable shuffle"}
          >
            <i className="fa-solid fa-shuffle" />
          </button>
          <button
            onClick={prev}
            className="hover:text-slate-900 transition-colors text-sm"
            disabled={!current}
          >
            <i className="fa-solid fa-backward-step" />
          </button>
          <button
            onClick={toggle}
            disabled={!current || !currentId}
            className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors shadow-md disabled:opacity-40"
          >
            <i
              className={`fa-solid ${playing ? "fa-pause" : "fa-play"} text-xs`}
            />
          </button>
          <button
            onClick={next}
            className="hover:text-slate-900 transition-colors text-sm"
            disabled={!current}
          >
            <i className="fa-solid fa-forward-step" />
          </button>
          <button
            onClick={() => setRepeat((r) => !r)}
            className={`transition-colors text-sm ${
              repeat ? "text-red-600" : "hover:text-slate-900"
            }`}
            title={repeat ? "Repeat on" : "Enable repeat"}
          >
            <i className="fa-solid fa-repeat" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-1.5 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-[10px] leading-relaxed text-rose-700">
            <i className="fa-solid fa-circle-exclamation mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Queue
        </p>
        {loading ? (
          <p className="text-xs text-slate-400 py-3">Loading songs…</p>
        ) : tracks.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 leading-relaxed">
            No songs yet. The <strong>Admin</strong> panel lets you
            add YouTube URLs.
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((t, i) => (
              <button
                key={t.id}
                onClick={() => select(i)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                  i === index
                    ? "bg-red-50 border border-red-200"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <i
                  className={`fa-brands fa-youtube ${
                    i === index && playing ? "fa-beat" : ""
                  } text-red-600 text-xs`}
                />
                <span className="flex-1 min-w-0 text-xs text-slate-700 truncate">
                  {t.title}
                </span>
                {i === index && playing && (
                  <span className="text-[9px] text-red-600 font-mono-code">
                    playing
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
