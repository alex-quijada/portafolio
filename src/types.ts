export type Theme = "macos" | "windows"
export type WinId = "projects" | "about" | "chat" | "music" | "personal" | "university" | "ux" | "trash" | "profile" | "mail" | "calendar" | "game" | "admin" | "weather" | "settings"
export type ProjectCategorySlug = "personal" | "university" | "ux"

export interface WinState {
  id: WinId
  x: number
  y: number
  w: number
  h: number
  open: boolean
  minimized: boolean
  z: number
}

export interface ChatMsg {
  text: string
  sender: "user" | "bot"
  time: string
  suggestions?: string[]
  showMail?: boolean
}

export interface WindowProps {
  onOpen?: (id: WinId) => void
}

export interface Project {
  id: number
  title: string
  description: string
  repoUrl: string | null
  liveUrl: string | null
  createdAt: string
  image: string | null
  featured: boolean
  categorySlug: ProjectCategorySlug
  technologies: ProjectTech[]
}

export interface ProjectTech {
  id: number
  name: string
  slug: string
  logo: string | null
}

export interface ProjectCategory {
  id: number
  slug: ProjectCategorySlug
  label: string
}
