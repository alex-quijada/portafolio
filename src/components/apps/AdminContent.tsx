import { useEffect, useState, type FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import { ADMIN_EMAIL } from "../../data"
import { supabase, isSupabaseConfigured } from "../../lib/supabase"
import ProjectsTab from "./admin/ProjectsTab"
import MusicTab from "./admin/MusicTab"
import PhotosTab from "./admin/PhotosTab"
import TechTab from "./admin/TechTab"
import AboutTab from "./admin/AboutTab"
import ContentTab from "./admin/ContentTab"

const TABS = [
  { id: "proyectos", label: "Proyectos", icon: "fa-solid fa-folder" },
  { id: "musica", label: "Música", icon: "fa-solid fa-music" },
  { id: "fotos", label: "Fotos", icon: "fa-solid fa-images" },
  { id: "tecnologias", label: "Tecnologías", icon: "fa-solid fa-microchip" },
  { id: "sobremi", label: "Sobre mí", icon: "fa-solid fa-address-card" },
  { id: "contenido", label: "Contenido", icon: "fa-solid fa-pen-to-square" },
] as const

type TabId = typeof TABS[number]["id"]

export default function AdminContent() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [tab, setTab] = useState<TabId>("proyectos")

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setChecking(false)
      return
    }
    supabase!.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase!.auth.onAuthStateChange((_e, s) =>
      setSession(s),
    )
    setChecking(false)
    return () => sub.subscription.unsubscribe()
  }, [])

  const doLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError("")
    const { error } = await supabase!.auth.signInWithPassword({
      email: ADMIN_EMAIL.trim(),
      password: password.trim(),
    })
    if (error) {
      const m = error.message.toLowerCase()
      setLoginError(
        m.includes("invalid login")
          ? "Correo o contraseña incorrectos: revisa el usuario en Supabase → Authentication → Users"
          : m.includes("not confirmed")
            ? "El correo no está confirmado en Supabase (confírmalo en Authentication → Users)"
            : error.message,
      )
    }
    setPassword("")
    setLoginLoading(false)
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 gap-3">
        <i className="fa-solid fa-triangle-exclamation text-3xl text-amber-400" />
        <p>
          Supabase no está configurado. Agrega VITE_SUPABASE_URL y
          VITE_SUPABASE_ANON_KEY en .env
        </p>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <i className="fa-solid fa-spinner animate-spin text-xl" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl shadow-lg mb-4">
          <i className="fa-solid fa-lock" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Panel de administración
        </h2>
        <p className="text-[11px] text-slate-500 mb-5">
          Zona privada — ingresa tu contraseña
        </p>

        <form onSubmit={doLogin} className="w-full max-w-xs space-y-3">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoFocus
              className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-100 text-sm border border-slate-200 focus:border-slate-400 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              title={show ? "Ocultar" : "Mostrar"}
            >
              <i className={`fa-solid ${show ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>

          {loginError && (
            <p className="text-[11px] text-rose-600 font-medium text-center flex items-center justify-center gap-1">
              <i className="fa-solid fa-circle-xmark" /> {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading || !password}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {loginLoading ? "Verificando…" : "Entrar"}
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Cuenta: <strong className="text-slate-500">{ADMIN_EMAIL}</strong> ·
            Si el error persiste, verifica en Supabase →{" "}
            <strong>Authentication → Users</strong> que exista ese usuario con
            la contraseña que escribes.
          </p>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <i className="fa-solid fa-shield-halved text-emerald-600" />
          Panel Admin
          <span className="text-[10px] font-normal text-slate-400">
            · {session.user.email}
          </span>
        </div>
        <button
          onClick={() => supabase!.auth.signOut()}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-200/70 text-slate-600 hover:bg-slate-300 transition-colors font-medium"
        >
          <i className="fa-solid fa-arrow-right-from-bracket mr-1" />
          Salir
        </button>
      </div>

      <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto border-b border-slate-200 flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              tab === t.id
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <i className={t.icon} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {tab === "proyectos" && <ProjectsTab />}
        {tab === "musica" && <MusicTab />}
        {tab === "fotos" && <PhotosTab />}
        {tab === "tecnologias" && <TechTab />}
        {tab === "sobremi" && <AboutTab />}
        {tab === "contenido" && <ContentTab />}
      </div>
    </div>
  )
}
