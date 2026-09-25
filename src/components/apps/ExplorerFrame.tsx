import type { ReactNode } from "react"

export type FolderId = "projects" | "university" | "ux" | "personal"

export interface SidebarItem {
  id: string
  label: string
  icon: string
  iconClass: string
  action: "nav" | "open" | "noop"
}

export const FOLDERS: {
  id: FolderId
  label: string
  icon: string
  iconClass: string
}[] = [
  {
    id: "projects",
    label: "All Projects",
    icon: "fa-solid fa-folder",
    iconClass: "text-sky-500",
  },
  {
    id: "university",
    label: "University Projects",
    icon: "fa-solid fa-graduation-cap",
    iconClass: "text-sky-500",
  },
  {
    id: "ux",
    label: "UX/UI Projects",
    icon: "fa-solid fa-pen-ruler",
    iconClass: "text-pink-500",
  },
  {
    id: "personal",
    label: "Personal Projects",
    icon: "fa-solid fa-user",
    iconClass: "text-purple-500",
  },
]

export const SIDEBAR: { group: string; items: SidebarItem[] }[] = [
  {
    group: "Favorites",
    items: FOLDERS.map((f) => ({
      id: f.id,
      label: f.label,
      icon: f.icon,
      iconClass: f.iconClass,
      action: "nav",
    })),
  },
  {
    group: "Apps",
    items: [
      {
        id: "chat",
        label: "Ask Questions",
        icon: "fa-brands fa-discord",
        iconClass: "text-indigo-500",
        action: "open",
      },
      {
        id: "about",
        label: "About Me",
        icon: "fa-brands fa-linkedin",
        iconClass: "text-blue-600",
        action: "open",
      },
      {
        id: "music",
        label: "Music",
        icon: "fa-brands fa-spotify",
        iconClass: "text-green-500",
        action: "open",
      },
      {
        id: "trash",
        label: "Trash",
        icon: "fa-solid fa-trash",
        iconClass: "text-slate-500",
        action: "open",
      },
    ],
  },
  {
    group: "Locations",
    items: [
      {
        id: "descargas",
        label: "Downloads",
        icon: "fa-solid fa-download",
        iconClass: "text-slate-500",
        action: "noop",
      },
      {
        id: "documentos",
        label: "Documents",
        icon: "fa-solid fa-folder",
        iconClass: "text-amber-500",
        action: "noop",
      },
      {
        id: "escritorio",
        label: "Desktop",
        icon: "fa-solid fa-desktop",
        iconClass: "text-slate-500",
        action: "noop",
      },
      {
        id: "musica",
        label: "Music",
        icon: "fa-solid fa-music",
        iconClass: "text-pink-500",
        action: "noop",
      },
    ],
  },
]

interface ExplorerFrameProps {
  currentLabel: string
  activeId: string
  onSidebarItem: (item: SidebarItem) => void
  onBack?: () => void
  onForward?: () => void
  canBack?: boolean
  canForward?: boolean
  search?: string
  onSearch?: (value: string) => void
  showViewToggle?: boolean
  view?: "grid" | "list"
  onView?: (view: "grid" | "list") => void
  toolbarAction?: ReactNode
  statusLeft: string
  statusRight?: string
  children: ReactNode
}

export default function ExplorerFrame({
  currentLabel,
  activeId,
  onSidebarItem,
  onBack,
  onForward,
  canBack = false,
  canForward = false,
  search,
  onSearch,
  showViewToggle = false,
  view = "grid",
  onView,
  toolbarAction,
  statusLeft,
  statusRight,
  children,
}: ExplorerFrameProps) {
  const iconBtn =
    "p-1.5 rounded-md text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"

  return (
    <div className="flex flex-col h-full bg-slate-50/70">
      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border-b border-slate-200 bg-white/85 flex-shrink-0">
        <button
          onClick={onBack}
          disabled={!canBack}
          className={iconBtn}
          title="Back"
        >
          <i className="fa-solid fa-arrow-left text-xs" />
        </button>
        <button
          onClick={onForward}
          disabled={!canForward}
          className={iconBtn}
          title="Forward"
        >
          <i className="fa-solid fa-arrow-right text-xs" />
        </button>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 truncate ml-1 min-w-0">
          <i className="fa-solid fa-desktop text-slate-400" />
          <span className="opacity-60">/</span>
          <span>Portfolio</span>
          <span className="opacity-60">/</span>
          <span className="font-semibold text-slate-800 truncate">
            {currentLabel}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {toolbarAction}
          {onSearch && (
            <div className="flex items-center gap-1.5 bg-slate-100/80 rounded-md px-2 py-1">
              <i className="fa-solid fa-magnifying-glass text-[10px] text-slate-400" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search…"
                className="w-20 sm:w-28 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          )}
          {showViewToggle && (
            <>
              <button
                onClick={() => onView?.("grid")}
                className={`${iconBtn} ${
                  view === "grid" ? "!bg-blue-100 !text-blue-600" : ""
                }`}
                title="Grid view"
              >
                <i className="fa-solid fa-table-cells text-xs" />
              </button>
              <button
                onClick={() => onView?.("list")}
                className={`${iconBtn} ${
                  view === "list" ? "!bg-blue-100 !text-blue-600" : ""
                }`}
                title="List view"
              >
                <i className="fa-solid fa-list text-xs" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="sm:hidden flex gap-1.5 overflow-x-auto no-scrollbar touch-scroll px-2.5 py-1.5 border-b border-slate-200 bg-white/80 flex-shrink-0">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() =>
              onSidebarItem({
                id: f.id,
                label: f.label,
                icon: f.icon,
                iconClass: f.iconClass,
                action: "nav",
              })
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] whitespace-nowrap active:scale-95 transition-all flex-shrink-0 ${
              f.id === activeId
                ? "bg-blue-100 text-blue-700 font-semibold shadow-xs"
                : "text-slate-700 hover:bg-slate-200/70"
            }`}
          >
            <i className={`${f.icon} ${f.iconClass} text-xs`} />
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0">
        <aside className="w-40 md:w-44 flex-shrink-0 border-r border-slate-200 bg-slate-100/70 p-2 overflow-y-auto hidden sm:block">
          {SIDEBAR.map((sec) => (
            <div key={sec.group} className="mb-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                {sec.group}
              </p>
              <div className="space-y-0.5">
                {sec.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSidebarItem(item)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-colors ${
                      item.id === activeId
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-200/70"
                    }`}
                    title={item.label}
                  >
                    <i
                      className={`${item.icon} ${item.iconClass} w-4 text-center flex-shrink-0`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">{children}</div>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-200 bg-white/80 text-[10px] font-mono-code text-slate-500 flex-shrink-0">
        <span>{statusLeft}</span>
        {statusRight && <span className="hidden sm:inline">{statusRight}</span>}
      </div>
    </div>
  )
}
