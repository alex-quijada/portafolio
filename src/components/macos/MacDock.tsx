import { APPS, EXTRA_APPS } from "../../data"
import { useClock } from "../../hooks/useClock"
import { useProfile } from "../../hooks/useProfile"
import type { Theme, WinId } from "../../types"

interface Props {
  theme: Theme
  dark: boolean
  openWins: Set<WinId>
  minimizedWins: Set<WinId>
  onOpen: (id: WinId) => void
  onToggleTheme: () => void
}

export default function MacDock({
  dark,
  openWins,
  minimizedWins,
  onOpen,
  onToggleTheme,
}: Props) {
  const t = useClock()
  const profile = useProfile()
  const timeStr = t.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const dotCls = (id: WinId): string => {
    const c = dark
      ? "bg-slate-300 border-slate-300"
      : "bg-slate-700 border-slate-700"
    if (minimizedWins.has(id)) return `w-1.5 h-1.5 rounded-full border ${c}`
    if (openWins.has(id)) return `w-1 h-1 rounded-full ${c}`
    return `w-1 h-1 rounded-full ${c} opacity-0`
  }

  const openExternal = (item: (typeof EXTRA_APPS)[number]) => {
    const href = item.href || (item.social ? profile[item.social] : "")
    if (href) window.open(href, "_blank", "noopener,noreferrer")
    else if (item.id) onOpen(item.id)
  }

  return (
    <footer className="fixed bottom-1 sm:bottom-2 md:bottom-4 left-0 right-0 flex justify-center z-[9998] pointer-events-none px-2 safe-bottom">
      <div
        className={`${
          dark ? "dock-mac-dark" : "dock-mac"
        } pointer-events-auto flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-2xl max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar touch-scroll shadow-2xl`}
      >
        <i
          className={`hidden sm:inline-flex fa-brands fa-apple text-sm font-bold flex-shrink-0 ${
            dark ? "text-slate-100" : "text-slate-900"
          }`}
        />

        <div className="w-px h-6 sm:h-8 bg-slate-300/80 mx-0.5 flex-shrink-0" />

        {APPS.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center gap-0.5 sm:gap-1 flex-shrink-0"
            title={item.title}
          >
            <button
              className="dock-icon-btn flex-shrink-0 p-0.5 active:scale-95 transition-transform"
              onClick={() => onOpen(item.id)}
              aria-label={item.title}
            >
              <div className={`app-tile ${item.tileClass}`}>
                <i className={item.icon} />
              </div>
            </button>
            <span className={dotCls(item.id)} />
          </div>
        ))}

        {EXTRA_APPS.map((item) => (
          <div
            key={item.title}
            className="flex flex-col items-center gap-0.5 sm:gap-1 flex-shrink-0"
            title={item.title}
          >
            <button
              className="dock-icon-btn flex-shrink-0 p-0.5 active:scale-95 transition-transform"
              onClick={() => openExternal(item)}
              aria-label={item.title}
            >
              <div className={`app-tile ${item.tileClass}`}>
                <i className={item.icon} />
              </div>
            </button>
            {item.id ? (
              <span className={dotCls(item.id)} />
            ) : (
              <span className="w-1 h-1" />
            )}
          </div>
        ))}

        <div className="w-px h-6 sm:h-8 bg-slate-300/80 mx-0.5 flex-shrink-0" />

        <div
          className="flex flex-col items-center gap-0.5 sm:gap-1 flex-shrink-0"
          title="Trash"
        >
          <button
            className="dock-icon-btn flex-shrink-0 p-0.5 active:scale-95 transition-transform"
            onClick={() => onOpen("trash")}
            aria-label="Trash"
          >
            <div className="app-tile bg-gradient-to-br from-slate-400 to-slate-600">
              <i className="fa-solid fa-trash" />
            </div>
          </button>
          <span className={dotCls("trash")} />
        </div>

        <div
          className={`hidden sm:flex items-center gap-2.5 text-xs px-1 flex-shrink-0 ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          <i className="fa-solid fa-wifi" title="Wi-Fi" />
          <i className="fa-solid fa-volume-low" title="Sound" />
          <span
            className={`font-mono-code font-semibold whitespace-nowrap ${
              dark ? "text-slate-100" : "text-slate-800"
            }`}
          >
            {timeStr}
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          title="Switch OS Mode"
          className="dock-icon-btn flex items-center gap-1 px-2 py-1 rounded-xl bg-white/80 border border-slate-200/90 text-slate-800 text-[11px] font-semibold hover:bg-slate-100 active:scale-95 transition-all shadow-sm flex-shrink-0"
        >
          <i className="fa-brands fa-apple text-slate-800" />
          <i className="fa-solid fa-arrow-right-arrow-left text-[9px] text-slate-400 mx-0.5" />
          <i className="fa-brands fa-windows text-blue-600" />
        </button>
      </div>
    </footer>
  )
}