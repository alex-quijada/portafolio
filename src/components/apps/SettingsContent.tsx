import { useState } from "react"
import { ACCENT_THEMES, WALLPAPERS } from "../../data"

interface Props {
  wallpaper: string
  grid: boolean
  dark: boolean
  accent: string
  onWallpaper: (key: string) => void
  onGrid: (value: boolean) => void
  onDark: (value: boolean) => void
  onAccent: (key: string) => void
}

function Toggle({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  icon: string
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
    >
      <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
        <i className={`${icon} text-slate-500`} />
        {label}
      </span>
      <span
        className={`w-9 h-5 rounded-full relative transition-colors ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`toggle-knob absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-4.5" : "left-0.5"
          }`}
          style={{ left: checked ? 18 : 2 }}
        />
      </span>
    </button>
  )
}

function WallpaperThumb({
  css,
  label,
  active,
  onClick,
}: {
  css: string
  label: string
  active: boolean
  onClick: () => void
}) {
  const isPhoto = css.startsWith("url(")
  const [failed, setFailed] = useState(false)
  const src = css.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "")

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
        active
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {isPhoto ? (
        failed ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400">
            <i className="fa-solid fa-image" />
          </div>
        ) : (
          <img
            src={src}
            alt={label}
            className="w-full h-full object-cover"
            onError={() => setFailed(true)}
          />
        )
      ) : (
        <div
          className="w-full h-full"
          style={
            css
              ? {
                  backgroundImage: css,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  backgroundColor: "#f1f5f9",
                  backgroundImage:
                    "linear-gradient(to right, rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.4) 1px, transparent 1px)",
                  backgroundSize: "12px 12px",
                }
          }
        />
      )}
      {active && (
        <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px]">
          <i className="fa-solid fa-check" />
        </span>
      )}
    </button>
  )
}

export default function SettingsContent({
  wallpaper,
  grid,
  dark,
  accent,
  onWallpaper,
  onGrid,
  onDark,
  onAccent,
}: Props) {
  const gradients = WALLPAPERS.filter((w) => !w.key.startsWith("photo-"))
  const photos = WALLPAPERS.filter((w) => w.key.startsWith("photo-"))
  const currentWallpaper = WALLPAPERS.find((w) => w.key === wallpaper)

  return (
    <div className="p-4 overflow-y-auto h-full space-y-5">
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
          Appearance
        </h3>
        <div className="space-y-2">
          <Toggle
            checked={grid}
            onChange={onGrid}
            label="Show grid"
            icon="fa-solid fa-border-all"
          />
          <Toggle
            checked={dark}
            onChange={onDark}
            label="Dark mode"
            icon="fa-solid fa-moon"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
          Color theme
        </h3>
        <div className="flex flex-wrap gap-2">
          {ACCENT_THEMES.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => onAccent(a.key)}
              title={a.label}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-transform ${
                accent === a.key
                  ? "ring-2 ring-slate-400 scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: a.color }}
            >
              {accent === a.key && (
                <i className="fa-solid fa-check text-white text-[10px]" />
              )}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400">
          {ACCENT_THEMES.find((a) => a.key === accent)?.label} · applies to
          the whole app
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
          Wallpaper
        </h3>

        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Gradients
        </p>
        <div className="grid grid-cols-3 gap-2">
          {gradients.map((w) => (
            <WallpaperThumb
              key={w.key}
              css={w.css}
              label={w.label}
              active={wallpaper === w.key}
              onClick={() => onWallpaper(w.key)}
            />
          ))}
        </div>

        {photos.length > 0 && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 pt-1">
              Photos
            </p>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((w) => (
                <WallpaperThumb
                  key={w.key}
                  css={w.css}
                  label={w.label}
                  active={wallpaper === w.key}
                  onClick={() => onWallpaper(w.key)}
                />
              ))}
            </div>
          </>
        )}

        <p className="text-[10px] text-slate-400">
          Current: {currentWallpaper?.label}
        </p>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-400 leading-relaxed">
        <i className="fa-solid fa-circle-info mr-1" />
        Changes apply instantly and are saved in your browser. Dark mode and the
        color theme extend to the whole app: windows, apps and menus.
      </div>
    </div>
  )
}