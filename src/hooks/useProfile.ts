import { useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "../lib/supabase"

export interface ProfileInfo {
  name: string
  role: string
  instagram: string
  linkedin: string
}

const EMPTY: ProfileInfo = {
  name: "",
  role: "",
  instagram: "",
  linkedin: "",
}

export function useProfile(): ProfileInfo {
  const [profile, setProfile] = useState<ProfileInfo>(EMPTY)

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase!
        .from("content_settings")
        .select("key, value")
      if (cancelled) return
      const map: Record<string, string> = {}
      for (const r of data ?? []) map[r.key] = r.value ?? ""
      setProfile({
        name: map["about.name"] ?? "",
        role: map["about.role"] ?? "",
        instagram: map["about.instagram"] ?? "",
        linkedin: map["about.linkedin"] ?? "",
      })
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return profile
}