import { useEffect, useState, type FormEvent } from "react"
import { supabase } from "../../../lib/supabase"
import {
  inputCls,
  labelCls,
  btnPrimary,
  btnDanger,
  btnGhost,
  dbErrorMsg,
} from "./ui"

interface ProjectRow {
  id: number
  title: string
  description: string
  repoUrl: string | null
  liveUrl: string | null
  image: string | null
  featured: boolean
}
interface CategoryRow {
  id: number
  slug: string
  label: string
}
interface TechRow {
  id: number
  name: string
  slug: string
  logo: string | null
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [techs, setTechs] = useState<TechRow[]>([])
  const [catByProject, setCatByProject] = useState<Record<number, number>>({})
  const [techByProject, setTechByProject] = useState<Record<number, number[]>>(
    {},
  )
  const [editingId, setEditingId] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  )
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    title: "",
    description: "",
    repoUrl: "",
    liveUrl: "",
    featured: false,
  })
  const [categoryId, setCategoryId] = useState<number | "">("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedTechs, setSelectedTechs] = useState<Set<number>>(new Set())

  const load = async () => {
    setLoading(true)
    try {
      const [p, c, t, pc, pt] = await Promise.all([
        supabase!.from("projects").select("*").order("id"),
        supabase!.from("categories").select("*").order("id"),
        supabase!.from("technologies").select("*").order("id"),
        supabase!.from("project_categories").select("project_id, category_id"),
        supabase!
          .from("project_technologies")
          .select("project_id, technology_id"),
      ])
      if (p.error) throw p.error
      if (c.error) throw c.error
      if (t.error) throw t.error
      setProjects(p.data as ProjectRow[])
      setCategories(c.data as CategoryRow[])
      setTechs(t.data as TechRow[])
      setCatByProject(
        Object.fromEntries(
          (pc.data ?? []).map((r) => [r.project_id, r.category_id]),
        ),
      )
      const map: Record<number, number[]> = {}
      for (const r of pt.data ?? [])
        (map[r.project_id] ??= []).push(r.technology_id)
      setTechByProject(map)
    } catch (e) {
      setMsg({ type: "err", text: dbErrorMsg(e) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setForm({
      title: "",
      description: "",
      repoUrl: "",
      liveUrl: "",
      featured: false,
    })
    setCategoryId("")
    setImageFile(null)
    setSelectedTechs(new Set())
  }

  const startEdit = (p: ProjectRow) => {
    setEditingId(p.id)
    setForm({
      title: p.title,
      description: p.description,
      repoUrl: p.repoUrl ?? "",
      liveUrl: p.liveUrl ?? "",
      featured: p.featured,
    })
    setCategoryId(catByProject[p.id] ?? "")
    setSelectedTechs(new Set(techByProject[p.id] ?? []))
    setImageFile(null)
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      setMsg({ type: "err", text: "Selecciona una categoría" })
      return
    }
    setMsg(null)
    try {
      let imageUrl: string | null = null
      if (imageFile) {
        const path = `proyectos/${Date.now()}-${imageFile.name}`
        const up = await supabase!.storage
          .from("project-images")
          .upload(path, imageFile)
        if (up.error) {
          setMsg({
            type: "err",
            text: "No se pudo subir imagen: " + up.error.message,
          })
          return
        }
        imageUrl = supabase!.storage.from("project-images").getPublicUrl(path)
          .data.publicUrl
      }

      const payload = {
        title: form.title,
        description: form.description,
        repoUrl: form.repoUrl || null,
        liveUrl: form.liveUrl || null,
        featured: form.featured,
        ...(imageUrl ? { image: imageUrl } : {}),
      }

      let projectId: number
      if (editingId) {
        const upd = await supabase!
          .from("projects")
          .update(payload)
          .eq("id", editingId)
          .select("id")
          .single()
        if (upd.error) throw upd.error
        projectId = editingId
      } else {
        const ins = await supabase!
          .from("projects")
          .insert(payload)
          .select("id")
          .single()
        if (ins.error) throw ins.error
        projectId = ins.data.id
      }

      await supabase!
        .from("project_categories")
        .delete()
        .eq("project_id", projectId)
      await supabase!
        .from("project_categories")
        .insert({ project_id: projectId, category_id: categoryId })
      await supabase!
        .from("project_technologies")
        .delete()
        .eq("project_id", projectId)
      if (selectedTechs.size) {
        await supabase!
          .from("project_technologies")
          .insert(
            [...selectedTechs].map((technology_id) => ({
              project_id: projectId,
              technology_id,
            })),
          )
      }

      setMsg({
        type: "ok",
        text: editingId ? "Proyecto actualizado ✓" : "Proyecto creado ✓",
      })
      resetForm()
      load()
    } catch (err) {
      setMsg({ type: "err", text: dbErrorMsg(err) })
    }
  }

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar este proyecto?")) return
    try {
      await supabase!.from("project_categories").delete().eq("project_id", id)
      await supabase!.from("project_technologies").delete().eq("project_id", id)
      const { error } = await supabase!.from("projects").delete().eq("id", id)
      if (error) throw error
      setMsg({ type: "ok", text: "Proyecto eliminado ✓" })
      if (editingId === id) resetForm()
      load()
    } catch (err) {
      setMsg({ type: "err", text: dbErrorMsg(err) })
    }
  }

  const toggleTech = (id: number) =>
    setSelectedTechs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {msg && (
        <div
          className={`p-3 rounded-xl text-xs font-medium ${
            msg.type === "ok"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 min-w-0">
          <h4 className={labelCls}>Proyectos ({projects.length})</h4>
          {loading ? (
            <p className="text-xs text-slate-400 py-4">Cargando…</p>
          ) : projects.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">Sin proyectos aún.</p>
          ) : (
            <div className="space-y-1.5">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                      {p.featured && (
                        <i className="fa-solid fa-star text-amber-400 text-[9px]" />
                      )}
                      {p.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {catByProject[p.id]
                        ? categories.find((c) => c.id === catByProject[p.id])
                            ?.label
                        : "Sin categoría"}
                    </p>
                  </div>
                  <button
                    onClick={() => startEdit(p)}
                    className={btnGhost}
                    title="Editar"
                  >
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className={btnDanger}
                    title="Eliminar"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={save} className="space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={labelCls}>
              {editingId ? "Editar proyecto" : "Nuevo proyecto"}
            </h4>
            {editingId && (
              <button type="button" onClick={resetForm} className={btnGhost}>
                Cancelar
              </button>
            )}
          </div>

          <label className="block">
            <span className={labelCls}>Título</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className={labelCls}>Descripción</span>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className={labelCls}>Repo URL</span>
              <input
                value={form.repoUrl}
                onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                className={inputCls}
                placeholder="https://…"
              />
            </label>
            <label className="block">
              <span className={labelCls}>Live URL</span>
              <input
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                className={inputCls}
                placeholder="https://…"
              />
            </label>
          </div>

          <label className="block">
            <span className={labelCls}>Categoría</span>
            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : "")
              }
              className={inputCls}
            >
              <option value="">— Selecciona —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelCls}>Imagen (opcional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className={inputCls}
            />
          </label>

          <div className="flex items-center gap-2">
            <input
              id="feat"
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="accent-blue-600"
            />
            <label htmlFor="feat" className="text-xs text-slate-600">
              Destacado ★
            </label>
          </div>

          <div>
            <span className={labelCls}>Tecnologías</span>
            {techs.length === 0 ? (
              <p className="text-[10px] text-slate-400">
                Aún no hay tecnologías registradas.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {techs.map((t) => {
                  const on = selectedTechs.has(t.id)
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => toggleTech(t.id)}
                      className={`px-2 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                        on
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      {t.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button type="submit" className={`${btnPrimary} w-full`}>
            {editingId ? "Guardar cambios" : "Crear proyecto"}
          </button>
        </form>
      </div>
    </div>
  )
}
