import type { ProjectCategorySlug, WinId } from "../types"

export const DEFAULT_SKILLS: { name: string; slug: string }[] = [
  { name: "Figma", slug: "figma" },
  { name: "TypeScript", slug: "typescript" },
  { name: "React", slug: "react" },
  { name: "Tailwind CSS", slug: "tailwind-css" },
  { name: "Node.js", slug: "node-js" },
  { name: "Canvas API", slug: "canvas-api" },
  { name: "Framer Motion", slug: "framer-motion" },
  { name: "PostgreSQL", slug: "postgresql" },
]

export const ABOUT_DEFAULTS: {
  name: string
  role: string
  location: string
  email: string
  linkedin: string
  github: string
  instagram: string
  photo: string
  bio: string
  perfilBio: string
  education: { title: string; place: string; detail: string }[]
  languages: { name: string; level: string }[]
  courses: { title: string; issuer: string; date: string; url: string }[]
} = {
  name: "",
  role: "",
  location: "",
  email: "",
  linkedin: "",
  github: "",
  instagram: "",
  photo: "",
  bio: "",
  perfilBio: "",
  education: [],
  languages: [],
  courses: [],
}

export const QUICK_QUESTIONS: { label: string; q: string }[] = [
  { label: "About me", q: "Who is Alexandra?" },
  { label: "Education", q: "What did you study?" },
  { label: "Languages", q: "What languages do you speak?" },
  { label: "Courses", q: "What certifications do you have?" },
  { label: "Stack", q: "What is your design and tech stack?" },
  { label: "Freelance", q: "Are you available for freelance work?" },
  { label: "Contact", q: "How can I contact you?" },
]

export const CATEGORIES: { slug: ProjectCategorySlug; label: string }[] = [
  { slug: "personal", label: "Personal Projects" },
  { slug: "university", label: "University Projects" },
  { slug: "ux", label: "UX/UI Projects" },
]

export const APPS: {
  id: WinId
  icon: string
  iconClass: string
  title: string
  menuLabel?: string
  tileClass?: string
}[] = [
  {
    id: "projects",
    icon: "fa-brands fa-github",
    iconClass: "text-slate-900",
    title: "Projects",
    menuLabel: "Projects",
    tileClass: "bg-gradient-to-br from-slate-700 to-slate-900",
  },
  {
    id: "about",
    icon: "fa-brands fa-linkedin",
    iconClass: "text-blue-600",
    title: "About Me",
    menuLabel: "About Me",
    tileClass: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    id: "chat",
    icon: "fa-solid fa-comments",
    iconClass: "text-indigo-500",
    title: "Ask Questions",
    menuLabel: "Ask AI",
    tileClass: "bg-gradient-to-br from-indigo-400 to-indigo-600",
  },
  {
    id: "music",
    icon: "fa-solid fa-music",
    iconClass: "text-green-500",
    title: "Music",
    tileClass: "bg-gradient-to-br from-green-400 to-green-600",
  },
  {
    id: "profile",
    icon: "fa-solid fa-user",
    iconClass: "text-amber-500",
    title: "Profile",
    menuLabel: "Profile",
    tileClass: "bg-gradient-to-br from-amber-400 to-amber-600",
  },
]

export const CONTACT_EMAIL = "alexandraquijada0207@gmail.com"

export const CONTACT_ACCESS_KEY = "c709fccb-bd33-4ae9-8caa-9605f566208b"

export const ADMIN_EMAIL = "alexandraquijada@gmail.com"

export const EXTRA_APPS: {
  id?: WinId
  href?: string
  social?: "linkedin"
  icon: string
  tileClass: string
  title: string
}[] = [
  {
    id: "game",
    icon: "fa-solid fa-gamepad",
    tileClass: "bg-gradient-to-br from-purple-500 to-purple-700",
    title: "Game",
  },
  {
    social: "linkedin",
    icon: "fa-brands fa-chrome",
    tileClass: "bg-gradient-to-br from-red-400 via-yellow-300 to-green-400",
    title: "Chrome",
  },
  {
    id: "mail",
    icon: "fa-solid fa-envelope",
    tileClass: "bg-blue-500",
    title: "Mail",
  },
  {
    id: "calendar",
    icon: "fa-solid fa-calendar-days",
    tileClass: "bg-red-500",
    title: "Calendar",
  },
  {
    id: "admin",
    icon: "fa-solid fa-lock",
    tileClass: "bg-slate-900",
    title: "Admin",
  },
  {
    href: "https://www.figma.com/@alexquijada",
    icon: "fa-brands fa-figma",
    tileClass: "bg-purple-600",
    title: "Figma",
  },
  {
    id: "weather",
    icon: "fa-solid fa-cloud-sun",
    tileClass: "bg-gradient-to-br from-sky-400 to-cyan-600",
    title: "Weather",
  },
  {
    id: "settings",
    icon: "fa-solid fa-gear",
    tileClass: "bg-slate-600",
    title: "Settings",
  },
]

export const START_MENU_ITEMS: { id: WinId; icon: string; label: string }[] =
  APPS.filter((a) => a.menuLabel).map((a) => ({
    id: a.id,
    icon: `${a.icon} ${a.iconClass}`,
    label: a.title,
  }))

export interface DesktopIcon {
  id: WinId
  label: string
  kind: "folder" | "file" | "app" | "trash"
  icon?: string
  iconClass?: string
  folderFrom?: string
  folderTo?: string
}

export const DESKTOP_ICONS: DesktopIcon[] = [
  {
    id: "university",
    kind: "folder",
    label: "University Projects",
    folderFrom: "#38bdf8",
    folderTo: "#0284c7",
  },
  {
    id: "ux",
    kind: "folder",
    label: "UX/UI Projects",
    folderFrom: "#f472b6",
    folderTo: "#db2777",
  },
  {
    id: "personal",
    kind: "folder",
    label: "Personal Projects",
    folderFrom: "#a78bfa",
    folderTo: "#7c3aed",
  },
  {
    id: "about",
    kind: "file",
    icon: "fa-solid fa-file-pdf",
    iconClass: "text-rose-500",
    label: "About_Me.pdf",
  },
  {
    id: "chat",
    kind: "app",
    icon: "fa-solid fa-comment-dots",
    iconClass: "text-emerald-500",
    label: "Ask_Questions.app",
  },
  {
    id: "profile",
    kind: "app",
    icon: "fa-solid fa-user",
    iconClass: "text-amber-500",
    label: "Profile.app",
  },
  {
    id: "trash",
    kind: "trash",
    icon: "fa-solid fa-trash",
    iconClass: "text-slate-500",
    label: "Trash",
  },
]

export const WIN_CONFIG: Record<WinId, {
  title: string
  icon: string
  iconClass: string
  defW: number
  defH: number
  defX: number
  defY: number
}> = {
  projects: {
    title: "Projects Directory",
    icon: "fa-brands fa-github",
    iconClass: "text-slate-900",
    defW: 860,
    defH: 640,
    defX: 180,
    defY: 32,
  },
  about: {
    title: "About Me",
    icon: "fa-brands fa-linkedin",
    iconClass: "text-blue-600",
    defW: 640,
    defH: 560,
    defX: 220,
    defY: 70,
  },
  chat: {
    title: "Messages (Ask Alex)",
    icon: "fa-solid fa-comments",
    iconClass: "text-indigo-500",
    defW: 480,
    defH: 450,
    defX: 300,
    defY: 62,
  },
  music: {
    title: "Audio Player",
    icon: "fa-solid fa-music",
    iconClass: "text-green-500",
    defW: 340,
    defH: 480,
    defX: 40,
    defY: 200,
  },
  university: {
    title: "University Projects",
    icon: "fa-solid fa-graduation-cap",
    iconClass: "text-sky-500",
    defW: 820,
    defH: 600,
    defX: 180,
    defY: 40,
  },
  ux: {
    title: "UX/UI Projects",
    icon: "fa-solid fa-pen-ruler",
    iconClass: "text-pink-500",
    defW: 820,
    defH: 600,
    defX: 220,
    defY: 50,
  },
  personal: {
    title: "Personal Projects",
    icon: "fa-solid fa-folder-open",
    iconClass: "text-purple-500",
    defW: 820,
    defH: 600,
    defX: 260,
    defY: 40,
  },
  trash: {
    title: "Trash",
    icon: "fa-solid fa-trash",
    iconClass: "text-slate-500",
    defW: 560,
    defH: 380,
    defX: 180,
    defY: 60,
  },
  profile: {
    title: "Profile",
    icon: "fa-solid fa-user",
    iconClass: "text-amber-500",
    defW: 440,
    defH: 560,
    defX: 260,
    defY: 80,
  },
  mail: {
    title: "Mail",
    icon: "fa-solid fa-envelope",
    iconClass: "text-blue-600",
    defW: 560,
    defH: 520,
    defX: 240,
    defY: 70,
  },
  calendar: {
    title: "Calendar",
    icon: "fa-solid fa-calendar-days",
    iconClass: "text-red-500",
    defW: 480,
    defH: 420,
    defX: 240,
    defY: 60,
  },
  game: {
    title: "Mini Game",
    icon: "fa-solid fa-gamepad",
    iconClass: "text-purple-500",
    defW: 480,
    defH: 440,
    defX: 260,
    defY: 60,
  },
  admin: {
    title: "Admin",
    icon: "fa-solid fa-lock",
    iconClass: "text-slate-700",
    defW: 680,
    defH: 580,
    defX: 180,
    defY: 40,
  },
  weather: {
    title: "Weather",
    icon: "fa-solid fa-cloud-sun",
    iconClass: "text-sky-500",
    defW: 400,
    defH: 460,
    defX: 280,
    defY: 60,
  },
  settings: {
    title: "Settings",
    icon: "fa-solid fa-gear",
    iconClass: "text-slate-500",
    defW: 580,
    defH: 540,
    defX: 220,
    defY: 50,
  },
}

export const PROFILE_PHOTOS = Array.from(
  { length: 8 },
  (_, i) => `${i + 1}.jpeg`,
)

export const WALLPAPERS: { key: string; label: string; css: string }[] = [
  { key: "default", label: "Default", css: "" },
  {
    key: "gradient-sky",
    label: "Sky",
    css: "linear-gradient(135deg,#7dd3fc,#0ea5e9 60%,#0369a1)",
  },
  {
    key: "gradient-sunset",
    label: "Sunset",
    css: "linear-gradient(135deg,#fecaca,#fb7185 60%,#be123c)",
  },
  {
    key: "gradient-forest",
    label: "Forest",
    css: "linear-gradient(135deg,#a7f3d0,#10b981 60%,#047857)",
  },
  {
    key: "gradient-ocean",
    label: "Ocean",
    css: "linear-gradient(135deg,#cffafe,#06b6d4 60%,#155e75)",
  },
  {
    key: "gradient-dark",
    label: "Dark",
    css: "linear-gradient(135deg,#334155,#0f172a 70%,#020617)",
  },
  ...PROFILE_PHOTOS.map((p, i) => ({
    key: `photo-${i + 1}`,
    label: `Photo ${i + 1}`,
    css: `url(${photoUrl(p)})`,
  })),
]

export function wallpaperBackground(key: string): string {
  return WALLPAPERS.find((w) => w.key === key)?.css ?? ""
}

export const ACCENT_THEMES: { key: string; label: string; color: string }[] = [
  { key: "blue", label: "Blue", color: "#3b82f6" },
  { key: "emerald", label: "Emerald", color: "#10b981" },
  { key: "rose", label: "Rose", color: "#f43f5e" },
  { key: "violet", label: "Violet", color: "#8b5cf6" },
  { key: "amber", label: "Amber", color: "#f59e0b" },
  { key: "cyan", label: "Cyan", color: "#06b6d4" },
]

export function photoUrl(name: string): string {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined
  return base
    ? `${base.replace(/\/$/, "")}/storage/v1/object/public/YO/${name}`
    : ""
}

export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  return m ? m[1] : null
}

export interface BotAnswer {
  text: string
  suggestions?: string[]
  showMail?: boolean
  overrideKey?: string
}

const norm = (s: string) =>
  s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

const RULES: { keys: string[]; answer: BotAnswer }[] = [
  {
    keys: [
      "who is alexandra",
      "who are you",
      "about you",
      "about me",
      "tell me about",
      "introduce",
      "your profile",
    ],
    answer: {
      text: "I can tell you about me: open the About Me window to see my full profile. If you want something specific, ask about education, stack, or contact.",
      suggestions: [
        "What did you study?",
        "What certifications do you have?",
        "What is your stack?",
      ],
      overrideKey: "bio",
    },
  },
  {
    keys: [
      "stud",
      "university",
      "degree",
      "education",
      "career",
      "academic",
      "estudi",
    ],
    answer: {
      text: "I can tell you about my academic background. Open About Me → Education for the details.",
      suggestions: ["What certifications do you have?", "What languages do you speak?"],
      overrideKey: "answer.educacion",
    },
  },
  {
    keys: ["language", "languages", "speak", "hablas", "idioma"],
    answer: {
      text: "I can tell you which languages I speak. Open About Me → Languages for the details.",
      suggestions: ["What did you study?", "What is your stack?"],
      overrideKey: "answer.idiomas",
    },
  },
  {
    keys: [
      "certif",
      "course",
      "courses",
      "coursera",
      "credential",
      "diploma",
    ],
    answer: {
      text: "I can tell you about my courses and certifications. Open About Me → Courses for the details.",
      suggestions: ["What did you study?", "What is your stack?"],
      overrideKey: "answer.cursos",
    },
  },
  {
    keys: [
      "stack",
      "technolog",
      "tools",
      "skills",
      "programming",
      "react",
      "figma",
      "tecnolog",
    ],
    answer: {
      text: "I can tell you about my design and technology stack. Open About Me → Stack for the details.",
      suggestions: ["What certifications do you have?", "How can I contact you?"],
      overrideKey: "stack",
    },
  },
  {
    keys: [
      "freelance",
      "available",
      "hire",
      "work",
      "contract",
      "collaborate",
      "project",
      "trabajo",
    ],
    answer: {
      text: "Yes, I am available for selected freelance projects. I would love to hear your idea!",
      suggestions: ["How can I contact you?"],
      showMail: true,
      overrideKey: "freelance",
    },
  },
  {
    keys: [
      "contact",
      "email",
      "reach",
      "write",
      "linkedin",
      "github",
      "instagram",
      "social",
      "whatsapp",
      "correo",
    ],
    answer: {
      text: "I can give you my contact details. Check About Me → Let's connect or use the contact form.",
      suggestions: ["Are you available for freelance work?"],
      showMail: true,
      overrideKey: "contact",
    },
  },
]

export function getBotAnswer(
  q: string,
  overrides?: Record<string, string>,
): BotAnswer {
  const l = norm(q)
  for (const rule of RULES) {
    if (rule.keys.some((k) => l.includes(k))) {
      const ans = rule.answer
      if (ans.overrideKey && overrides?.[ans.overrideKey]) {
        return { ...ans, text: overrides[ans.overrideKey] }
      }
      return ans
    }
  }
  return {
    text:
      overrides?.default ??
      "I'm not sure about that 🤔. You can ask me about my **stack**, **education**, **courses**, **languages**, or how to **contact** me.",
    suggestions: [
      "Who is Alexandra?",
      "What certifications do you have?",
      "How can I contact you?",
    ],
    showMail: true,
  }
}
