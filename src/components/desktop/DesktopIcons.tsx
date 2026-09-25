import { useEffect, useRef, useState } from "react"
import { DESKTOP_ICONS } from "../../data"
import type { DesktopIcon } from "../../data"
import type { WinId } from "../../types"

const STORAGE_KEY = "desktop-icon-positions"

interface Pos {
  x: number
  y: number
}

const clampX = (x: number) =>
  Math.max(0, Math.min(Math.max(0, window.innerWidth - 92), x))
const clampY = (y: number) =>
  Math.max(0, Math.min(Math.max(0, window.innerHeight - 96), y))

function mobileDefaults(): Record<WinId, Pos> {
  const positions = {} as Record<WinId, Pos>
  const margin = 10
  const iconW = 84
  const iconH = 86
  const dockPad = 76
  const cols = Math.max(
    2,
    Math.min(
      Math.floor((window.innerWidth - margin * 2) / iconW),
      4,
    ),
  )
  const rows = Math.ceil(DESKTOP_ICONS.length / cols)
  const stepX = (window.innerWidth - margin * 2) / cols
  const gridH = rows * iconH
  const startY = Math.max(margin, window.innerHeight - dockPad - gridH)
  DESKTOP_ICONS.forEach((icon, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    positions[icon.id] = {
      x: Math.round(margin + col * stepX + (stepX - iconW) / 2),
      y: Math.round(startY + row * iconH),
    }
  })
  return positions
}

function defaultPositions(): Record<WinId, Pos> {
  const iconW = 128
  const iconH = 100
  const positions = {} as Record<WinId, Pos>
  DESKTOP_ICONS.forEach((icon, i) => {
    const x = window.innerWidth - 150
    const y = 24 + i * 104
    positions[icon.id] = {
      x: Math.max(8, Math.min(x, window.innerWidth - iconW - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - iconH - 8)),
    }
  })
  return positions
}

function loadPositions(): Record<WinId, Pos> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (window.innerWidth < 768) return mobileDefaults()
    const defaults = defaultPositions()
    if (!raw) return defaults
    return { ...defaults, ...(JSON.parse(raw) as Record<string, Pos>) }
  } catch {
    return window.innerWidth < 768 ? mobileDefaults() : defaultPositions()
  }
}

interface Props {
  onOpen: (id: WinId) => void
  dark?: boolean
}

export default function DesktopIcons({ onOpen, dark }: Props) {
  const [pos, setPos] = useState<Record<WinId, Pos>>(loadPositions)
  const [activeId, setActiveId] = useState<WinId | null>(null)
  const posRef = useRef(pos)
  const dragRef = useRef<{
    id: WinId
    startX: number
    startY: number
    originX: number
    originY: number
    moved: boolean
  } | null>(null)

  useEffect(() => {
    posRef.current = pos
  }, [pos])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) {
        setPos(mobileDefaults())
        return
      }
      const defaults = defaultPositions()
      const iconW = 128
      const iconH = 100
      setPos((prev) => {
        const next = {} as Record<WinId, Pos>
        for (const icon of DESKTOP_ICONS) {
          const cur = prev[icon.id]
          if (
            cur &&
            cur.x >= 0 &&
            cur.x + iconW <= window.innerWidth &&
            cur.y >= 0 &&
            cur.y + iconH <= window.innerHeight
          ) {
            next[icon.id] = cur
          } else {
            next[icon.id] = defaults[icon.id]
          }
        }
        return next
      })
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const save = (next: Record<WinId, Pos>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const onPointerDown = (e: React.PointerEvent, icon: DesktopIcon) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const p = posRef.current[icon.id]
    dragRef.current = {
      id: icon.id,
      startX: e.clientX,
      startY: e.clientY,
      originX: p.x,
      originY: p.y,
      moved: false,
    }
  }

  const onPointerMove = (e: React.PointerEvent, icon: DesktopIcon) => {
    const d = dragRef.current
    if (!d || d.id !== icon.id) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      d.moved = true
      setActiveId(icon.id)
    }
    if (!d.moved) return
    setPos({
      ...posRef.current,
      [icon.id]: { x: clampX(d.originX + dx), y: clampY(d.originY + dy) },
    })
  }

  const onPointerUp = (e: React.PointerEvent, icon: DesktopIcon) => {
    const d = dragRef.current
    if (!d || d.id !== icon.id) return
    dragRef.current = null
    if (d.moved) {
      const next = {
        ...posRef.current,
        [icon.id]: {
          x: clampX(d.originX + (e.clientX - d.startX)),
          y: clampY(d.originY + (e.clientY - d.startY)),
        },
      }
      setPos(next)
      save(next)
    } else {
      onOpen(icon.id)
    }
    setActiveId(null)
  }

  const onPointerCancel = () => {
    dragRef.current = null
    setActiveId(null)
  }

  return (
    <>
      {DESKTOP_ICONS.map((icon) => {
        const p = pos[icon.id]
        const active = activeId === icon.id
        return (
          <div
            key={icon.id}
            className={`group absolute z-10 flex w-20 sm:w-28 md:w-32 flex-col items-center rounded-xl border p-1 sm:p-1.5 md:p-2 transition-transform select-none cursor-pointer active:scale-95 ${
              dark
                ? "border-transparent hover:border-slate-700 hover:bg-slate-900/50"
                : "border-transparent hover:border-slate-200 hover:bg-white/80 hover:shadow-sm"
            }`}
            style={{
              left: p.x,
              top: p.y,
              zIndex: active ? 30 : undefined,
              touchAction: "none",
              ["--folder-a" as string]: icon.folderFrom,
              ["--folder-b" as string]: icon.folderTo,
            }}
            onPointerDown={(e) => onPointerDown(e, icon)}
            onPointerMove={(e) => onPointerMove(e, icon)}
            onPointerUp={(e) => onPointerUp(e, icon)}
            onPointerCancel={onPointerCancel}
          >
            <div className="flex h-10 w-10 items-center justify-center transition-transform group-hover:scale-105 sm:h-12 sm:w-12 md:h-14 md:w-14">
              {icon.kind === "folder" ? (
                <div className="folder-ico" />
              ) : (
                <i
                  className={`${icon.icon} ${icon.iconClass} text-2xl sm:text-3xl md:text-4xl`}
                />
              )}
            </div>
            <span
              className={`mt-1 w-full text-center text-[10px] sm:text-[11px] leading-tight font-medium wrap-break-word line-clamp-2 group-hover:text-blue-600 md:text-xs ${
                dark ? "text-slate-100" : "text-slate-700"
              }`}
            >
              {icon.label}
            </span>
          </div>
        )
      })}
    </>
  )
}
