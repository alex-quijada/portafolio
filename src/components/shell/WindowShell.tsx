import { useEffect, useState } from "react"
import { useDrag } from "../../hooks/useDrag"
import type { Theme, WinState } from "../../types"

interface Props {
  win: WinState
  theme: Theme
  title: string
  titleIcon: string
  titleIconClass: string
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  onMove: (dx: number, dy: number) => void
  onResize: (dx: number, dy: number) => void
  children: React.ReactNode
}

export default function WindowShell({
  win,
  theme,
  title,
  titleIcon,
  titleIconClass,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
  children,
}: Props) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  )

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const drag = useDrag(onMove, onFocus)
  const resizeDrag = useDrag(onResize, onFocus)

  if (!win.open) return null

  const glassClass =
    theme === "macos" ? "window-glass-macos" : "window-glass-windows"

  return (
    <div
      className={`${glassClass} win-appear absolute flex flex-col overflow-hidden ${
        isMobile
          ? "rounded-t-2xl rounded-b-none border-x-0 border-t-0 shadow-2xl"
          : "max-w-[calc(100vw-1rem)] max-h-[calc(100vh-5rem)] rounded-xl"
      } ${win.minimized ? "invisible pointer-events-none" : ""}`}
      style={
        isMobile
          ? {
              left: 0,
              top: 0,
              width: "100vw",
              height: "calc(100dvh - 3.75rem)",
              zIndex: win.z,
            }
          : {
              left: win.x,
              top: win.y,
              width: win.w,
              height: win.h,
              zIndex: win.z,
            }
      }
      onMouseDown={onFocus}
      onTouchStart={onFocus}
    >
      <div
        className="h-11 sm:h-10 px-3 md:px-4 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 flex-shrink-0 cursor-default select-none"
        onMouseDown={isMobile ? undefined : drag}
      >
        {theme === "macos" ? (
          <div
            className="flex items-center gap-2 sm:gap-1.5 py-1"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Cerrar"
              className="traffic-red w-4 h-4 sm:w-3 sm:h-3 rounded-full hover:opacity-80 transition-opacity active:scale-90"
              onClick={onClose}
            />
            <button
              aria-label="Minimizar"
              className="traffic-yellow w-4 h-4 sm:w-3 sm:h-3 rounded-full hover:opacity-80 transition-opacity active:scale-90"
              onClick={onMinimize}
            />
            <button
              aria-label="Maximizar"
              className="traffic-green w-4 h-4 sm:w-3 sm:h-3 rounded-full hover:opacity-80 transition-opacity active:scale-90 hidden sm:inline-block"
              onClick={onMaximize}
            />
          </div>
        ) : (
          <div className="w-8 sm:w-10 md:w-14" />
        )}

        <span className="text-xs sm:text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate px-2">
          <i
            className={`${titleIcon} ${titleIconClass} flex-shrink-0 text-sm`}
          />
          <span className="truncate">{title}</span>
        </span>

        {theme === "windows" ? (
          <div
            className="flex items-center gap-1 sm:gap-2.5 md:gap-3 text-xs text-slate-500"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Minimizar"
              className="p-2 sm:p-1 hover:text-slate-900 transition-colors active:scale-90"
              onClick={onMinimize}
            >
              <i className="fa-solid fa-minus" />
            </button>
            <button
              aria-label="Maximizar"
              className="p-1 hover:text-slate-900 transition-colors hidden sm:inline-block"
              onClick={onMaximize}
            >
              <i className="fa-regular fa-square" />
            </button>
            <button
              aria-label="Cerrar"
              className="p-2 sm:p-1 hover:text-red-500 transition-colors active:scale-90"
              onClick={onClose}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        ) : (
          <div className="w-8 sm:w-10 md:w-14 flex justify-end">
            <button
              className="sm:hidden text-slate-400 hover:text-slate-700 p-1.5 active:scale-90"
              onClick={onClose}
              title="Cerrar ventana"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden bg-white/60 relative touch-scroll">
        {children}
      </div>

      {!isMobile && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-20 hidden sm:block"
          style={{ touchAction: "none" }}
          onMouseDown={resizeDrag}
          title="Redimensionar"
        >
          <div
            className="absolute bottom-1 right-1 w-4 h-4 opacity-40 hover:opacity-80 transition-opacity"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(100,116,139,0.85) 0 1.5px, transparent 1.5px 4px)",
            }}
          />
        </div>
      )}
    </div>
  )
}
