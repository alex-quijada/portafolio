import { useState, useCallback, useEffect } from "react"
import { useDrag } from "../../hooks/useDrag"

const STORAGE_KEY = "sticky-note-pos"

export default function StickyNote() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  )
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  )

  useEffect(() => {
    const checkMobile = () => {
      const mob = window.innerWidth < 640
      setIsMobile(mob)
    }
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      /* ignore */
    }
    return { x: 16, y: 16 }
  })

  const move = useCallback((dx: number, dy: number) => {
    if (window.innerWidth < 640) return
    setPos((p) => {
      const next = {
        x: Math.max(8, Math.min(window.innerWidth - 220, p.x + dx)),
        y: Math.max(8, Math.min(window.innerHeight - 150, p.y + dy)),
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const drag = useDrag(move)

  if (isMobile && collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="sticky-note absolute top-3 right-3 sm:hidden z-10 flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-100/95 text-slate-900 rounded-full shadow-md border border-yellow-300 text-[11px] font-semibold active:scale-95 transition-transform"
        aria-label="Abrir nota adhesiva"
      >
        <i className="fa-solid fa-note-sticky text-yellow-600 text-xs" />
        <span>Sticky Note</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
      </button>
    )
  }

  return (
    <div
      className={`sticky-note absolute ${
        isMobile
          ? "top-3 right-3 left-3 sm:left-auto w-auto sm:w-64 max-w-[calc(100vw-1.5rem)]"
          : "w-56 sm:w-64"
      } p-3.5 sm:p-5 bg-yellow-100/95 text-slate-900 rounded-xl shadow-lg border border-yellow-200 cursor-move z-10`}
      style={isMobile ? undefined : { left: pos.x, top: pos.y }}
      onMouseDown={isMobile ? undefined : drag}
    >
      <div className="flex items-center justify-between pb-1.5 sm:pb-2 mb-2 border-b border-yellow-300/60 text-xs font-bold text-yellow-900">
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-note-sticky text-yellow-600" />
          <span>Hello! 👋</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono-code opacity-60">
            sticky_note.txt
          </span>
          {isMobile && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 text-slate-600 hover:text-slate-900 active:scale-90"
              aria-label="Minimizar nota"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          )}
        </div>
      </div>
      <p className="text-[11px] sm:text-xs leading-relaxed text-slate-800 font-medium">
        Welcome to my interactive desktop space. Double-click the folders, open
        the chat to ask questions, or switch OS theme in the bottom bar.
      </p>
      <div className="mt-2.5 sm:mt-4 pt-2 border-t border-yellow-300/40 flex justify-between items-center text-[10px] font-mono-code text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Available for work
        </span>
        <span>2026</span>
      </div>
    </div>
  )
}
