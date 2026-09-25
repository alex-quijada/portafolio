import { APPS, EXTRA_APPS, START_MENU_ITEMS } from "../../data"
import { useClock } from "../../hooks/useClock"
import { useProfile } from "../../hooks/useProfile"
import type { WinId } from "../../types"

interface Props {
  onOpen: (id: WinId) => void
  startOpen: boolean
  dark: boolean
  openWins: Set<WinId>
  minimizedWins: Set<WinId>
  onToggleStart: () => void
  onToggleTheme: () => void
}

export default function Win11Taskbar({
  onOpen,
  startOpen,
  dark,
  openWins,
  minimizedWins,
  onToggleStart,
  onToggleTheme,
}: Props) {
  const t = useClock()
  const profile = useProfile()
  const hover = dark ? "hover:bg-slate-800" : "hover:bg-slate-100"

  const runInd = (id: WinId): string => {
    if (minimizedWins.has(id)) return "w-1.5 h-[3px] rounded-full bg-blue-500/60"
    if (openWins.has(id)) return "w-3 h-[3px] rounded-full bg-blue-600"
    return "w-3 h-[3px] rounded-full bg-transparent"
  }

  return (
    <>
      <footer
        className={`fixed bottom-0 left-0 right-0 h-12 border-t backdrop-blur-xl px-2 md:px-4 flex items-center justify-between z-[9998] shadow-[0_-8px_32px_rgba(15,23,42,0.14)] safe-bottom ${
          dark
            ? "bg-slate-900/90 border-slate-700"
            : "bg-white/90 border-slate-200"
        }`}
      >
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar touch-scroll max-w-[calc(100vw-4.5rem)] sm:max-w-none mx-auto">
          <button
            onClick={onToggleStart}
            className={`btn-press p-1.5 sm:p-2 rounded-lg text-blue-600 text-lg sm:text-xl flex-shrink-0 ${hover} ${
              startOpen ? (dark ? "bg-slate-800" : "bg-slate-100") : ""
            }`}
            title="Start Menu"
            aria-label="Start Menu"
          >
            <i className="fa-brands fa-windows" />
          </button>
          {APPS.map((item) => (
            <button
              key={item.title}
              className={`btn-press relative p-1 rounded-lg ${hover} flex-shrink-0`}
              onClick={() => onOpen(item.id)}
              title={item.title}
              aria-label={item.title}
            >
              <div className={`app-tile ${item.tileClass}`}>
                <i className={item.icon} />
              </div>
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${runInd(
                  item.id,
                )}`}
              />
            </button>
          ))}
          {EXTRA_APPS.map((item) => (
            <button
              key={item.title}
              className={`btn-press relative hidden sm:inline-flex p-1 rounded-lg ${hover} flex-shrink-0`}
              title={item.title}
              aria-label={item.title}
              onClick={() => {
                const href =
                  item.href || (item.social ? profile[item.social] : "")
                if (href) window.open(href, "_blank", "noopener,noreferrer")
                else if (item.id) onOpen(item.id)
              }}
            >
              <div className={`app-tile ${item.tileClass}`}>
                <i className={item.icon} />
              </div>
              {item.id && (
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${runInd(
                    item.id,
                  )}`}
                />
              )}
            </button>
          ))}
          <button
            onClick={() => onOpen("trash")}
            title="Trash"
            aria-label="Trash"
            className={`btn-press relative p-1 rounded-lg ${hover} flex-shrink-0`}
          >
            <div className="app-tile bg-gradient-to-br from-slate-400 to-slate-600">
              <i className="fa-solid fa-trash" />
            </div>
            <span
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${runInd(
                "trash",
              )}`}
            />
          </button>
          <div
            className={`w-px h-5 mx-0.5 sm:mx-1 flex-shrink-0 ${
              dark ? "bg-slate-700" : "bg-slate-200"
            }`}
          />
          <button
            onClick={onToggleTheme}
            title="Switch OS Mode"
            aria-label="Switch OS Mode"
            className={`btn-press flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg text-[11px] font-semibold flex-shrink-0 ${hover} ${
              dark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            <i className="fa-brands fa-windows text-blue-600" />
            <i className="fa-solid fa-arrow-right-arrow-left text-[9px] text-slate-400" />
            <i className="fa-brands fa-apple text-slate-800" />
          </button>
        </div>

        <div
          className={`flex items-center gap-1.5 sm:gap-2 text-xs flex-shrink-0 ${
            dark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          <i className="fa-solid fa-wifi hidden sm:inline" title="Wi-Fi" />
          <i
            className="fa-solid fa-volume-low hidden sm:inline"
            title="Sound"
          />
          <span className="font-mono-code text-[11px] sm:text-xs font-medium whitespace-nowrap">
            {t.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
      </footer>

      {startOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={onToggleStart}
            aria-hidden="true"
          />
          <div
            className={`fixed bottom-14 left-1/2 -translate-x-1/2 w-[calc(100vw-1.5rem)] max-w-xs p-4 sm:p-5 rounded-2xl border backdrop-blur-2xl z-[9999] shadow-2xl space-y-4 ${
              dark
                ? "bg-slate-900/95 border-slate-700 text-slate-100"
                : "bg-white/95 border-slate-200 text-slate-900"
            }`}
          >
            <div
              className={`flex items-center gap-3 pb-3 border-b ${
                dark ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {profile.name
                  ? profile.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() ?? "")
                      .join("")
                  : "OS"}
              </div>
              <div>
                <p className="text-xs font-bold">{profile.name}</p>
                <p
                  className={`text-[10px] ${
                    dark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {profile.role}
                </p>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              {START_MENU_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${
                    dark
                      ? "hover:bg-slate-800 text-slate-200"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                  onClick={() => {
                    onOpen(item.id)
                    onToggleStart()
                  }}
                >
                  <i className={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}