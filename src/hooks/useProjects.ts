import { useEffect, useState } from "react"
import type {
  Project,
  ProjectCategory,
  ProjectCategorySlug,
  ProjectTech,
} from "../types"
import { supabase, isSupabaseConfigured } from "../lib/supabase"
import { tr } from "../lib/translate"

const CONFIG_ERROR =
  "Supabase is not configured. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."

export function useProjects() {
  const [data, setData] = useState<Project[]>([])
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError(CONFIG_ERROR)
      setLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const [projRes, catRes, linkRes, techRes, ptRes] = await Promise.all([
          supabase!
            .from("projects")
            .select("*")
            .order("id", { ascending: true }),
          supabase!
            .from("categories")
            .select("*")
            .order("id", { ascending: true }),
          supabase!
            .from("project_categories")
            .select("project_id, category_id"),
          supabase!
            .from("technologies")
            .select("*")
            .order("id", { ascending: true }),
          supabase!
            .from("project_technologies")
            .select("project_id, technology_id"),
        ])

        if (projRes.error) throw projRes.error
        if (catRes.error) throw catRes.error
        if (linkRes.error) throw linkRes.error
        if (techRes.error) throw techRes.error
        if (ptRes.error) throw ptRes.error

        const slugByCategory = new Map<number, ProjectCategorySlug>()
        for (const c of catRes.data as ProjectCategory[]) {
          slugByCategory.set(c.id, c.slug)
        }

        const slugByProject = new Map<number, ProjectCategorySlug>()
        for (const link of linkRes.data as {
          project_id: number
          category_id: number
        }[]) {
          const slug = slugByCategory.get(link.category_id)
          if (slug) slugByProject.set(link.project_id, slug)
        }

        const techById = new Map<number, ProjectTech>()
        for (const t of techRes.data as ProjectTech[]) techById.set(t.id, t)
        const techIdsByProject = new Map<number, number[]>()
        for (const r of ptRes.data as {
          project_id: number
          technology_id: number
        }[]) {
          const arr = techIdsByProject.get(r.project_id) ?? []
          arr.push(r.technology_id)
          techIdsByProject.set(r.project_id, arr)
        }

        if (cancelled) return
        setData(
          (projRes.data as Project[]).map((p) => ({
            ...p,
            title: tr(p.title),
            description: tr(p.description),
            categorySlug: slugByProject.get(p.id) ?? "personal",
            technologies: (techIdsByProject.get(p.id) ?? [])
              .map((id) => techById.get(id))
              .filter((t): t is ProjectTech => Boolean(t)),
          })),
        )
        setCategories(catRes.data as ProjectCategory[])
      } catch (e) {
        if (cancelled) return
        setError(
          e instanceof Error
            ? e.message
            : "Couldn't load the projects.",
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, categories, loading, error }
}
