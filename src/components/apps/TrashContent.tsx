import { useMemo, useState } from "react"
import type { WinId, WindowProps } from "../../types"
import ExplorerFrame from "./ExplorerFrame"
import type { SidebarItem } from "./ExplorerFrame"

const TRASH_ITEMS = [
  {
    name: "trabajo_final_v2_FINAL.pdf",
    icon: "fa-solid fa-file-pdf",
    cls: "text-rose-500",
    date: "12/08/2026",
    size: "2.4 MB",
  },
  {
    name: "logo_antiguo.png",
    icon: "fa-solid fa-file-image",
    cls: "text-sky-500",
    date: "03/07/2026",
    size: "1.1 MB",
  },
  {
    name: "mockups_v1.sketch",
    icon: "fa-brands fa-sketch",
    cls: "text-amber-500",
    date: "22/06/2026",
    size: "8.7 MB",
  },
  {
    name: "propuesta_cliente.pdf",
    icon: "fa-solid fa-file-pdf",
    cls: "text-rose-500",
    date: "18/05/2026",
    size: "940 KB",
  },
  {
    name: "foto_perfil_vieja.png",
    icon: "fa-solid fa-file-image",
    cls: "text-sky-500",
    date: "09/04/2026",
    size: "3.2 MB",
  },
]

interface Props extends WindowProps {}

export default function TrashContent({ onOpen }: Props) {
  const [items, setItems] = useState(TRASH_ITEMS)
  const [restore, setRestore] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => it.name.toLowerCase().includes(q))
  }, [items, query])

  const empty = () => {
    setItems([])
    setRestore(true)
  }
  const restoreAll = () => {
    setItems(TRASH_ITEMS)
    setRestore(false)
  }

  const handleSidebar = (item: SidebarItem) => {
    if (item.id === "trash") return
    onOpen?.(item.id as WinId)
  }

  const toolbarAction = restore ? (
    <button
      onClick={restoreAll}
      className="px-2 py-1 rounded-md text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1"
    >
      <i className="fa-solid fa-rotate-left text-[10px]" />
      Restore
    </button>
  ) : (
    <button
      onClick={empty}
      disabled={items.length === 0}
      className="px-2 py-1 rounded-md text-[11px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
    >
      <i className="fa-solid fa-trash-can text-[10px]" />
      Empty Trash
    </button>
  )

  return (
    <ExplorerFrame
      currentLabel="Trash"
      activeId="trash"
      onSidebarItem={handleSidebar}
      search={query}
      onSearch={setQuery}
      toolbarAction={toolbarAction}
      statusLeft={`${items.length} ${
        items.length === 1 ? "item" : "items"
      } in trash`}
      statusRight="Trash"
    >
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
          <i className="fa-solid fa-trash text-5xl opacity-40" />
          <p className="text-xs">The trash is empty</p>
        </div>
      ) : query && filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
          <i className="fa-solid fa-magnifying-glass text-4xl opacity-40" />
          <p className="text-xs">No results for "{query}"</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {filtered.map((it) => (
            <li
              key={it.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-slate-200/70 hover:border-blue-300 hover:shadow-sm transition-all cursor-default"
            >
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                <i className={`${it.icon} ${it.cls} text-sm`} />
              </div>
              <span className="flex-1 text-xs font-medium text-slate-800 truncate min-w-0">
                {it.name}
              </span>
              <span className="text-[10px] font-mono-code text-slate-400 hidden sm:inline">
                {it.date}
              </span>
              <span className="text-[10px] font-mono-code text-slate-400">
                {it.size}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ExplorerFrame>
  )
}
