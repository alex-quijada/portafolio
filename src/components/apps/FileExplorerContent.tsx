import { useEffect, useMemo, useState } from "react"
import { CATEGORIES } from "../../data"
import { useProjects } from "../../hooks/useProjects"
import type { Project, WinId, WindowProps } from "../../types"
import ExplorerFrame, { FOLDERS } from "./ExplorerFrame"
import type { FolderId, SidebarItem } from "./ExplorerFrame"

function TechChips({
  techs,
  small = false,
}: {
  techs: Project["technologies"]
  small?: boolean
}) {
  if (!techs || techs.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {techs.map((t) => (
        <span
          key={t.id}
          className={`inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 ${
            small ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
          }`}
        >
          {t.logo && (
            <img
              src={t.logo}
              alt=""
              className={small ? "w-2.5 h-2.5 object-contain" : "w-3 h-3 object-contain"}
            />
          )}
          {t.name}
        </span>
      ))}
    </div>
  )
}

function RepoLink({
  p,
  className,
  label,
}: {
  p: Project
  className: string
  label?: string
}) {
  if (!p.repoUrl) return null
  const isUx = p.categorySlug === "ux"
  return (
    <a
      href={p.repoUrl}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      <i
        className={`${
          isUx ? "fa-brands fa-figma text-fuchsia-600" : "fa-brands fa-github"
        } text-[11px]`}
      />
      {label}
    </a>
  )
}

function ProjectCard({
  p,
  onSelect,
}: {
  p: Project
  onSelect: (p: Project) => void
}) {
  return (
    <div
      onClick={() => onSelect(p)}
      className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col cursor-pointer"
    >
      {p.image ? (
        <div className="w-full aspect-[16/9] rounded-lg mb-3 border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center">
          <img
            src={p.image}
            alt={p.title}
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-full h-28 sm:h-32 rounded-lg mb-3 border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <i className="fa-solid fa-file-lines text-4xl text-slate-400" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
          {p.title}
        </h3>
        {p.featured && (
          <span className="text-[9px] font-mono-code px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
            ★ Featured
          </span>
        )}
      </div>
      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap line-clamp-3">
        {p.description}
      </p>
      {p.technologies.length > 0 && (
        <div className="mb-3">
          <TechChips techs={p.technologies} />
        </div>
      )}
      <div className="mt-auto flex items-center gap-3 text-xs font-medium">
        {p.liveUrl && (
          <a
            href={p.liveUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            Live Demo
          </a>
        )}
        <RepoLink
          p={p}
          className="text-slate-600 hover:underline flex items-center gap-1"
          label="Repo"
        />
      </div>
    </div>
  )
}

function EmptyFolder({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
      <i className="fa-solid fa-folder-open text-5xl opacity-40" />
      <p className="text-xs">
        {query ? `No results for "${query}"` : "This folder is empty"}
      </p>
    </div>
  )
}

function ProjectList({
  items,
  view,
  onSelect,
}: {
  items: Project[]
  view: "grid" | "list"
  onSelect: (p: Project) => void
}) {
  if (view === "list") {
    return (
      <div className="space-y-1">
        {items.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-slate-200/70 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-file-lines text-slate-400 text-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {p.title}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {p.description}
              </p>
              {p.technologies.length > 0 && (
                <div className="mt-1">
                  <TechChips techs={p.technologies} small />
                </div>
              )}
            </div>
            {p.featured && (
              <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
                ★
              </span>
            )}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-blue-600"
                  title="Live Demo"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                </a>
              )}
              <RepoLink p={p} className="hover:text-slate-900" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {items.map((p) => (
        <ProjectCard key={p.id} p={p} onSelect={onSelect} />
      ))}
    </div>
  )
}

function ProjectDetail({
  p,
  onBack,
}: {
  p: Project
  onBack: () => void
}) {
  const isUx = p.categorySlug === "ux"
  const category = CATEGORIES.find((c) => c.slug === p.categorySlug)?.label
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
        >
          <i className="fa-solid fa-arrow-left text-[10px]" />
          Back
        </button>
        {category && (
          <span className="text-[10px] font-medium text-slate-400">
            {category}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center min-h-48 p-2">
        {p.image ? (
          <img
            src={p.image}
            alt={p.title}
            className="max-w-full max-h-64 md:max-h-96 object-contain rounded-lg"
          />
        ) : (
          <i className="fa-solid fa-file-lines text-5xl text-slate-400" />
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900 leading-tight">
          {p.title}
        </h2>
        {p.featured && (
          <span className="text-[9px] font-mono-code px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
            ★ Featured
          </span>
        )}
      </div>

      <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
        {p.description}
      </p>

      {p.technologies.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Technologies used
          </h4>
          <TechChips techs={p.technologies} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {p.liveUrl && (
          <a
            href={p.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            Live Demo
          </a>
        )}
        {p.repoUrl && (
          <a
            href={p.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <i
              className={`${
                isUx ? "fa-brands fa-figma text-fuchsia-600" : "fa-brands fa-github"
              } text-sm`}
            />
            {isUx ? "Figma Design" : "Repository"}
          </a>
        )}
      </div>
    </div>
  )
}

interface Props extends WindowProps {
  initialFolder?: FolderId
}

export default function FileExplorerContent({
  initialFolder = "projects",
  onOpen,
}: Props) {
  const { data, categories, loading, error } = useProjects()
  const [folder, setFolder] = useState<FolderId>(initialFolder)
  const [history, setHistory] = useState<FolderId[]>([initialFolder])
  const [histIndex, setHistIndex] = useState(0)
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selected, setSelected] = useState<Project | null>(null)

  const current = FOLDERS.find((f) => f.id === folder) ?? FOLDERS[0]

  useEffect(() => {
    setSelected(null)
  }, [folder, query])

  const goTo = (f: FolderId) => {
    setFolder(f)
    setHistory((h) => [...h.slice(0, histIndex + 1), f])
    setHistIndex((i) => i + 1)
  }
  const back = () => {
    if (histIndex > 0) {
      setHistIndex(histIndex - 1)
      setFolder(history[histIndex - 1])
    }
  }
  const forward = () => {
    if (histIndex < history.length - 1) {
      setHistIndex(histIndex + 1)
      setFolder(history[histIndex + 1])
    }
  }
  const handleSidebar = (item: SidebarItem) => {
    if (item.action === "nav") goTo(item.id as FolderId)
    else if (item.action === "open") onOpen?.(item.id as WinId)
  }

  const items = useMemo(() => {
    let list = data
    if (folder !== "projects")
      list = data.filter((p) => p.categorySlug === folder)
    const q = query.trim().toLowerCase()
    if (q)
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
    return list
  }, [data, folder, query])

  const groups = categories
    .map((c) => ({
      ...c,
      projects: data.filter((p) => p.categorySlug === c.slug),
    }))
    .filter((g) => g.projects.length > 0)

  return (
    <ExplorerFrame
      currentLabel={current.label}
      activeId={folder}
      onSidebarItem={handleSidebar}
      onBack={back}
      onForward={forward}
      canBack={histIndex > 0}
      canForward={histIndex < history.length - 1}
      search={query}
      onSearch={setQuery}
      showViewToggle
      view={view}
      onView={setView}
      statusLeft={`${items.length} ${
        items.length === 1 ? "project" : "projects"
      }`}
      statusRight={
        folder === "projects" ? "All projects" : current.label
      }
    >
      {selected ? (
        <ProjectDetail p={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          {loading && (
            <div className="flex flex-col gap-3 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 animate-pulse h-32"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
              <p className="font-bold mb-1">
                ⚠ Couldn't load the projects
              </p>
              <p className="font-mono-code opacity-80">{error}</p>
            </div>
          )}

          {!loading && !error && folder === "projects" && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                {FOLDERS.filter((f) => f.id !== "projects").map((f) => (
                  <button
                    key={f.id}
                    onClick={() => goTo(f.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                  >
                    <i
                      className={`${f.icon} ${f.iconClass} text-2xl sm:text-3xl`}
                    />
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 text-center leading-tight">
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
              {query ? (
                items.length === 0 ? (
                  <EmptyFolder query={query} />
                ) : (
                  <ProjectList items={items} view={view} onSelect={setSelected} />
                )
              ) : (
                <div className="space-y-6">
                  {groups.length === 0 && (
                    <p className="text-xs text-slate-400 py-8 text-center">
                      No projects yet.
                    </p>
                  )}
                  {groups.map((g) => (
                    <section key={g.slug}>
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <i className="fa-solid fa-folder text-slate-400" />
                        {g.label}
                      </h3>
                      <ProjectList
                        items={g.projects}
                        view={view}
                        onSelect={setSelected}
                      />
                    </section>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading &&
            !error &&
            folder !== "projects" &&
            (items.length === 0 ? (
              <EmptyFolder query={query} />
            ) : (
              <ProjectList items={items} view={view} onSelect={setSelected} />
            ))}
        </>
      )}
    </ExplorerFrame>
  )
}