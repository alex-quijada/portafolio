import { useEffect, useState } from "react"
import type { Theme } from "./types"
import { WIN_CONFIG, wallpaperBackground } from "./data"
import { useWindowManager } from "./hooks/useWindowManager"

import DesktopHero from "./components/desktop/DesktopHero"
import StickyNote from "./components/desktop/StickyNote"
import DesktopIcons from "./components/desktop/DesktopIcons"
import WindowShell from "./components/shell/WindowShell"
import MacDock from "./components/macos/MacDock"
import Win11Taskbar from "./components/win11/Win11Taskbar"
import SettingsContent from "./components/apps/SettingsContent"

import { WIN_CONTENT } from "./components/apps"

const STORAGE_KEY = "portfolio-os-settings"

interface SavedSettings {
  theme?: Theme
  wallpaper?: string
  grid?: boolean
  dark?: boolean
  accent?: string
}

function loadSettings(): SavedSettings {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

export default function App() {
  const [saved] = useState(loadSettings)
  const [theme, setTheme] = useState<Theme>(saved.theme ?? "macos")
  const [startOpen, setStartOpen] = useState(false)
  const [wallpaper, setWallpaper] = useState(saved.wallpaper ?? "default")
  const [grid, setGrid] = useState(saved.grid ?? true)
  const [dark, setDark] = useState(saved.dark ?? false)
  const [accent, setAccent] = useState(saved.accent ?? "blue")

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ theme, wallpaper, grid, dark, accent }),
    )
  }, [theme, wallpaper, grid, dark, accent])
  const {
    wins,
    openWins,
    openWin,
    closeWin,
    minimizeWin,
    focusWin,
    moveWin,
    resizeWin,
    maximizeWin,
  } = useWindowManager()

  const minimizedWins = new Set(
    wins.filter((w) => w.open && w.minimized).map((w) => w.id),
  )

  const toggleTheme = () =>
    setTheme((t) => (t === "macos" ? "windows" : "macos"))

  const wpCss = wallpaperBackground(wallpaper)

  return (
    <div
      className={`w-full h-full h-[100dvh] relative overflow-hidden theme-transition select-none ${
        dark ? "theme-dark" : ""
      } ${accent !== "blue" ? `accent-${accent}` : ""}`}
    >
      <div
        className="absolute inset-0 transition-all duration-500"
        style={
          wpCss
            ? {
                backgroundImage: wpCss,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { backgroundColor: dark ? "#0f172a" : "#f8fafc" }
        }
      />

      {dark && <div className="absolute inset-0 bg-slate-950/35" />}

      {grid && (
        <div
          className={`absolute inset-0 ${
            dark ? "bg-grid-overlay-dark" : "bg-grid-overlay"
          }`}
        />
      )}

      <div className="absolute inset-0">
        <DesktopHero dark={dark} />
        <StickyNote />
        <DesktopIcons dark={dark} onOpen={openWin} />

        {wins.map((win) => {
          const cfg = WIN_CONFIG[win.id]
          const Content = WIN_CONTENT[win.id]
          return (
            <WindowShell
              key={win.id}
              win={win}
              theme={theme}
              title={cfg.title}
              titleIcon={cfg.icon}
              titleIconClass={cfg.iconClass}
              onClose={() => closeWin(win.id)}
              onMinimize={() => minimizeWin(win.id)}
              onMaximize={() => maximizeWin(win.id)}
              onFocus={() => focusWin(win.id)}
              onMove={(dx, dy) => moveWin(win.id, dx, dy)}
              onResize={(dx, dy) => resizeWin(win.id, dx, dy)}
            >
              {win.id === "settings" ? (
                <SettingsContent
                  wallpaper={wallpaper}
                  grid={grid}
                  dark={dark}
                  accent={accent}
                  onWallpaper={setWallpaper}
                  onGrid={setGrid}
                  onDark={setDark}
                  onAccent={setAccent}
                />
              ) : (
                <Content onOpen={openWin} />
              )}
            </WindowShell>
          )
        })}
      </div>

      {theme === "macos" ? (
        <MacDock
          dark={dark}
          theme={theme}
          openWins={openWins}
          minimizedWins={minimizedWins}
          onOpen={openWin}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <Win11Taskbar
          onOpen={openWin}
          startOpen={startOpen}
          dark={dark}
          openWins={openWins}
          minimizedWins={minimizedWins}
          onToggleStart={() => setStartOpen((s) => !s)}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  )
}
