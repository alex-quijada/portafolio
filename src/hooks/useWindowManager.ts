import { useCallback, useEffect, useRef, useState } from "react"
import type { WinId, WinState } from "../types"
import { WIN_CONFIG } from "../data"

function initWins(): WinState[] {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640
  return (Object.keys(WIN_CONFIG) as WinId[]).map((id, i) => {
    const cfg = WIN_CONFIG[id]
    if (isMobile) {
      return {
        id,
        x: 0,
        y: 0,
        w: typeof window !== "undefined" ? window.innerWidth : 360,
        h: typeof window !== "undefined" ? window.innerHeight - 56 : 600,
        open: id === "chat",
        minimized: false,
        z: 20 + i,
      }
    }
    const w = Math.min(cfg.defW, window.innerWidth - 32)
    const h = Math.min(cfg.defH, window.innerHeight - 80)
    return {
      id,
      x: Math.min(cfg.defX, Math.max(8, window.innerWidth - w - 8)),
      y: Math.min(cfg.defY, Math.max(8, window.innerHeight - h - 56)),
      w,
      h,
      open: id === "chat",
      minimized: false,
      z: 20 + i,
    }
  })
}

export function useWindowManager() {
  const [wins, setWins] = useState<WinState[]>(initWins)
  const topZRef = useRef(30)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setWins((ws) =>
          ws.map((w) => ({
            ...w,
            x: 0,
            y: 0,
            w: window.innerWidth,
            h: window.innerHeight - 56,
          })),
        )
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const bumpTopZ = useCallback(() => {
    topZRef.current += 1
    return topZRef.current
  }, [])

  const openWins = new Set(wins.filter((w) => w.open).map((w) => w.id))

  const openWin = useCallback(
    (id: WinId) => {
      const z = bumpTopZ()
      setWins((ws) =>
        ws.map((w) => {
          if (w.id !== id) return w
          const cfg = WIN_CONFIG[id]
          const isMobile = window.innerWidth < 640
          return {
            ...w,
            open: true,
            minimized: false,
            z,
            w: isMobile ? window.innerWidth : w.w,
            h: isMobile ? window.innerHeight - 56 : w.h,
            x: isMobile ? 0 : w.x,
            y: isMobile ? 0 : w.y,
          }
        }),
      )
    },
    [bumpTopZ],
  )

  const closeWin = useCallback((id: WinId) => {
    setWins((ws) =>
      ws.map((w) =>
        w.id === id ? { ...w, open: false, minimized: false } : w,
      ),
    )
  }, [])

  const minimizeWin = useCallback((id: WinId) => {
    setWins((ws) =>
      ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    )
  }, [])

  const focusWin = useCallback(
    (id: WinId) => {
      const z = bumpTopZ()
      setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z } : w)))
    },
    [bumpTopZ],
  )

  const moveWin = useCallback((id: WinId, dx: number, dy: number) => {
    if (window.innerWidth < 640) return
    setWins((ws) =>
      ws.map((w) =>
        w.id === id
          ? {
              ...w,
              x: Math.max(0, Math.min(window.innerWidth - 60, w.x + dx)),
              y: Math.max(4, Math.min(window.innerHeight - 60, w.y + dy)),
            }
          : w,
      ),
    )
  }, [])

  const resizeWin = useCallback((id: WinId, dx: number, dy: number) => {
    if (window.innerWidth < 640) return
    setWins((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w
        const MIN_W = 400
        const MIN_H = 300
        const nw = Math.max(MIN_W, Math.min(window.innerWidth - w.x, w.w + dx))
        const nh = Math.max(
          MIN_H,
          Math.min(window.innerHeight - w.y - 8, w.h + dy),
        )
        return { ...w, w: nw, h: nh }
      }),
    )
  }, [])

  const maximizeWin = useCallback((id: WinId) => {
    setWins((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w
        const isMax = w.w > window.innerWidth * 0.9
        const cfg = WIN_CONFIG[id]
        return isMax
          ? { ...w, x: cfg.defX, y: cfg.defY, w: cfg.defW, h: cfg.defH }
          : {
              ...w,
              x: 8,
              y: 4,
              w: window.innerWidth - 16,
              h: window.innerHeight - 64,
            }
      }),
    )
  }, [])

  return {
    wins,
    openWins,
    openWin,
    closeWin,
    minimizeWin,
    focusWin,
    moveWin,
    resizeWin,
    maximizeWin,
  }
}
